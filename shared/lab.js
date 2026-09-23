/* Teaching Lab — the "Under the Hood" panel shared by every demo store.
 *
 * Every time a store needs data it calls lab.query() or lab.mutate() with
 * TWO versions of the same idea:
 *
 *   sql : a real SQL statement, run against SQLite (sql.js, in the browser)
 *   js  : the same logic written with plain JavaScript array methods
 *         (filter / map / sort / reduce / find ...) over in-memory arrays
 *
 * Both versions always run. The panel shows both, times both, and checks
 * that they produced the same rows. The "engine" switch decides which
 * result the store actually renders — flip it and the page should look
 * identical. That is the whole lesson.
 *
 * JS snippets see each table as a variable (albums, artists, ...) and the
 * whole store as `store`. Read snippets must assign `const result = ...`.
 * Write snippets mutate `store.<table>` directly.
 */
(function (global) {
  'use strict';

  const H = global.Highlight;
  const esc = H.esc;

  // ------------------------------------------------------------ storage
  // localStorage can be missing or throw (private windows etc.) — never crash.
  const storage = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
  };

  const toBase64 = (bytes) => {
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  // ------------------------------------------------------------ comparing results
  function sameValue(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 0.051; // ROUND() vs Math.round() wiggle
    if (a === null || a === undefined) return b === null || b === undefined;
    return a === b;
  }

  /** Compare on the columns SQL returned. Extra keys on JS objects are ignored. */
  function compareRows(sqlRows, jsRows) {
    if (!Array.isArray(jsRows)) return { ok: false, why: 'JS result is not an array' };
    if (sqlRows.length !== jsRows.length) return { ok: false, why: `SQL returned ${sqlRows.length} rows, JS returned ${jsRows.length}` };
    for (let i = 0; i < sqlRows.length; i++) {
      for (const key of Object.keys(sqlRows[i])) {
        if (!sameValue(sqlRows[i][key], jsRows[i] ? jsRows[i][key] : undefined)) {
          return { ok: false, why: `row ${i + 1}, column "${key}": SQL=${JSON.stringify(sqlRows[i][key])} JS=${JSON.stringify(jsRows[i] && jsRows[i][key])}` };
        }
      }
    }
    return { ok: true };
  }

  // Render a list of row objects as a small HTML table.
  function rowsTable(rows, max = 8) {
    if (!rows || !rows.length) return '<p class="lab-muted">No rows.</p>';
    const cols = Object.keys(rows[0]).slice(0, 8);
    const fmt = (v) => {
      if (v === null || v === undefined) return '<span class="lab-null">NULL</span>';
      if (typeof v === 'object') v = JSON.stringify(v);
      v = String(v);
      return esc(v.length > 40 ? v.slice(0, 39) + '…' : v);
    };
    const body = rows.slice(0, max).map((r) => `<tr>${cols.map((c) => `<td>${fmt(r[c])}</td>`).join('')}</tr>`).join('');
    const more = rows.length > max ? `<p class="lab-muted">…and ${rows.length - max} more row(s)</p>` : '';
    return `<div class="lab-table-wrap"><table class="lab-table"><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>${more}`;
  }

  const ms = (t) => (t < 1 ? t.toFixed(2) : t.toFixed(1)) + ' ms';
  const now = () => performance.now();

  // ------------------------------------------------------------ the Lab
  async function create(opts) {
    const { app, schema, seed, tables, examples = [], title = 'Store' } = opts;
    const DB_KEY = `teachlab:${app}:db`;
    const ENGINE_KEY = `teachlab:${app}:engine`;

    const SQL = await global.initSqlJs();
    let db;
    const saved = storage.get(DB_KEY);
    if (saved) {
      try { db = new SQL.Database(fromBase64(saved)); } catch { db = null; }
    }
    if (!db) {
      db = new SQL.Database();
      db.run(schema);
      db.run(seed);
    }
    db.run('PRAGMA foreign_keys = ON;');

    // The JS side: plain arrays of plain objects, "fetched" from the DB once.
    const store = {};
    function selectAll(sql, params = []) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    }
    function hydrate() {
      for (const t of tables) store[t] = selectAll(`SELECT * FROM ${t}`);
    }
    hydrate();

    function persist() {
      storage.set(DB_KEY, toBase64(db.export()));
    }

    function runJS(code, isRead) {
      const body = isRead ? `${code}\nreturn result;` : code;
      // eslint-disable-next-line no-new-func
      const fn = new Function('store', ...tables, body);
      return fn(store, ...tables.map((t) => store[t]));
    }

    let holdUntil = 0;
    let seq = 0;
    const lab = {
      db,
      store,
      engine: storage.get(ENGINE_KEY) === 'js' ? 'js' : 'sql',
      log: [],
      listeners: [],
      onChange(fn) { this.listeners.push(fn); },
      emit() { this.listeners.forEach((fn) => fn()); },

      /** Run a read. Returns rows from the active engine. */
      query({ title, sql, params = [], js, quiet = false }) {
        const entry = { id: ++seq, kind: 'read', title, sql, params, js, at: new Date() };
        let sqlRows = [];
        let jsRows = [];
        try {
          const t0 = now();
          sqlRows = selectAll(sql, params);
          entry.sqlMs = now() - t0;
        } catch (e) { entry.sqlError = e.message; }
        try {
          const t0 = now();
          jsRows = runJS(js, true);
          entry.jsMs = now() - t0;
        } catch (e) { entry.jsError = e.message; }
        entry.sqlRows = sqlRows;
        entry.jsRows = jsRows;
        entry.match = entry.sqlError || entry.jsError ? { ok: false, why: entry.sqlError || entry.jsError } : compareRows(sqlRows, jsRows);
        this.record(entry, quiet);
        return this.engine === 'js' && !entry.jsError ? jsRows : sqlRows;
      },

      /** Run a write. `sql` may be one statement (with params) or a list of steps. */
      mutate({ title, sql, params = [], steps, js }) {
        steps = steps || [{ sql, params }];
        const entry = {
          id: ++seq, kind: 'write', title, js, at: new Date(),
          sql: steps.map((s) => s.sql.trim().replace(/;?$/, ';')).join('\n'),
          params: steps.flatMap((s) => s.params || []),
        };
        try {
          const t0 = now();
          entry.changes = 0;
          for (const s of steps) {
            db.run(s.sql, s.params || []);
            if (!/^\s*(BEGIN|COMMIT)/i.test(s.sql)) entry.changes += db.getRowsModified();
          }
          entry.sqlMs = now() - t0;
        } catch (e) {
          entry.sqlError = e.message;
          try { db.run('ROLLBACK'); } catch { /* not in a transaction */ }
        }
        try {
          const t0 = now();
          runJS(js, false);
          entry.jsMs = now() - t0;
        } catch (e) { entry.jsError = e.message; }
        entry.match = entry.sqlError || entry.jsError ? { ok: false, why: entry.sqlError || entry.jsError } : { ok: true, write: true };
        if (entry.sqlError) hydrate(); // keep the arrays honest if SQL refused the change
        persist();
        this.record(entry);
        this.emit();
        return !entry.sqlError;
      },

      // Every query is logged. Only "headline" ones take over the Last query tab:
      // quiet reads (badge counts etc.) don't, and neither do the re-render
      // reads that fire right after a write — the write is the interesting part.
      record(entry, quiet = false) {
        this.log.push(entry);
        if (this.log.length > 200) this.log.shift();
        const t = now();
        if (entry.kind === 'write') holdUntil = t + 400;
        const display = !quiet && (entry.kind === 'write' || t > holdUntil);
        panel.show(entry, display);
      },

      setEngine(e) {
        this.engine = e;
        storage.set(ENGINE_KEY, e);
        panel.syncEngine();
        this.emit();
      },

      reset() {
        storage.del(DB_KEY);
        location.reload();
      },

      openPanel() { panel.open(); },

      /** Format integer cents as dollars. Money lives in the DB as INTEGER cents. */
      money(cents) { return '$' + (cents / 100).toFixed(2); },
    };

    const panel = buildPanel(lab, { title, examples, tables, selectAll, hydrate, persist, runJS });
    return lab;
  }

  // ------------------------------------------------------------ panel UI
  function buildPanel(lab, ctx) {
    const root = document.createElement('div');
    root.innerHTML = `
      <button class="lab-fab" type="button" title="Toggle the Under the Hood panel (\` key)">
        <span class="lab-fab-icon">&lt;/&gt;</span> Under the hood <span class="lab-fab-count">0</span>
      </button>
      <aside class="lab-panel" aria-label="Under the hood" hidden>
        <header class="lab-head">
          <div class="lab-brand"><span class="lab-dot"></span> Under the Hood</div>
          <div class="lab-engine" role="group" aria-label="Data engine">
            <button type="button" data-engine="sql">SQL</button>
            <button type="button" data-engine="js">JS arrays</button>
          </div>
          <button type="button" class="lab-icon-btn" data-act="wide" title="Wide mode (for the projector)">⇔</button>
          <button type="button" class="lab-icon-btn" data-act="close" title="Close">✕</button>
        </header>
        <nav class="lab-tabs">
          <button type="button" data-tab="query" class="on">Last query</button>
          <button type="button" data-tab="log">Log <span class="lab-log-count">0</span></button>
          <button type="button" data-tab="play">Playground</button>
          <button type="button" data-tab="schema">Schema</button>
        </nav>
        <section class="lab-body" data-pane="query"><p class="lab-muted lab-empty">Click around the store — every query the page runs shows up here, as SQL and as JavaScript array methods.</p></section>
        <section class="lab-body" data-pane="log" hidden></section>
        <section class="lab-body" data-pane="play" hidden></section>
        <section class="lab-body" data-pane="schema" hidden></section>
      </aside>`;
    document.body.appendChild(root);

    const $ = (s) => root.querySelector(s);
    const fab = $('.lab-fab');
    const aside = $('.lab-panel');
    const panes = {
      query: $('[data-pane="query"]'),
      log: $('[data-pane="log"]'),
      play: $('[data-pane="play"]'),
      schema: $('[data-pane="schema"]'),
    };
    let current = 'query';

    const openKey = 'teachlab:panel-open';
    const setOpen = (open) => {
      aside.hidden = !open;
      document.body.classList.toggle('lab-open', open);
      storage.set(openKey, open ? '1' : '0');
    };
    setOpen(storage.get(openKey) === '1');

    fab.addEventListener('click', () => setOpen(aside.hidden));
    $('[data-act="close"]').addEventListener('click', () => setOpen(false));
    $('[data-act="wide"]').addEventListener('click', () => aside.classList.toggle('lab-wide'));
    document.addEventListener('keydown', (e) => {
      if (e.key === '`' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) setOpen(aside.hidden);
    });

    root.querySelectorAll('[data-engine]').forEach((b) =>
      b.addEventListener('click', () => lab.setEngine(b.dataset.engine)));

    root.querySelectorAll('[data-tab]').forEach((b) =>
      b.addEventListener('click', () => switchTab(b.dataset.tab)));

    function switchTab(tab) {
      current = tab;
      root.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
      Object.entries(panes).forEach(([k, el]) => { el.hidden = k !== tab; });
      if (tab === 'log') renderLog();
      if (tab === 'schema') renderSchema();
      if (tab === 'play' && !panes.play.dataset.built) buildPlayground();
    }

    function syncEngine() {
      root.querySelectorAll('[data-engine]').forEach((b) => b.classList.toggle('on', b.dataset.engine === lab.engine));
      document.body.dataset.engine = lab.engine;
    }
    syncEngine();

    // ---- one query, SQL and JS side by side
    function chips(entry) {
      const clauses = H.sqlClausesUsed(entry.sql);
      const methods = H.arrayMethodsUsed(entry.js);
      const star = ['filter', 'map', 'sort', 'reduce'];
      const others = methods.filter((m) => !star.includes(m));
      return `
        <div class="lab-chips">
          ${clauses.map((c) => `<span class="lab-chip lab-chip-sql">${c}</span>`).join('')}
        </div>
        <div class="lab-chips">
          ${star.map((m) => `<span class="lab-chip lab-chip-${m} ${methods.includes(m) ? 'on' : ''}">.${m}()</span>`).join('')}
          ${others.map((m) => `<span class="lab-chip lab-chip-other on">.${m}()</span>`).join('')}
        </div>`;
    }

    function renderEntry(entry) {
      const params = entry.params && entry.params.length
        ? `<div class="lab-params">params → ${entry.params.map((p) => `<code>${esc(JSON.stringify(p))}</code>`).join(' ')}</div>` : '';
      const status = entry.match.ok
        ? `<span class="lab-ok">✓ ${entry.kind === 'write' ? 'both stores updated' : 'SQL and JS results match'}</span>`
        : `<span class="lab-bad">✗ ${esc(entry.match.why)}</span>`;
      const count = entry.kind === 'read'
        ? `${(lab.engine === 'js' ? entry.jsRows : entry.sqlRows).length} row(s) · ` : `${entry.changes ?? 0} row(s) changed · `;
      const result = entry.kind === 'read'
        ? `<h4>Result <small>(from ${lab.engine === 'js' ? 'JS arrays' : 'SQL'}, rendered on the page)</small></h4>${rowsTable(lab.engine === 'js' ? entry.jsRows : entry.sqlRows)}`
        : '';
      return `
        <div class="lab-entry">
          <div class="lab-entry-head">
            <span class="lab-kind lab-kind-${entry.kind}">${entry.kind === 'read' ? 'READ' : 'WRITE'}</span>
            <strong>${esc(entry.title)}</strong>
            <span class="lab-muted">#${entry.id} · ${entry.at.toLocaleTimeString()}</span>
          </div>
          ${chips(entry)}
          <div class="lab-split">
            <div class="lab-code-block ${lab.engine === 'sql' ? 'active' : ''}">
              <div class="lab-code-title"><span>SQL · SQLite</span><span>${entry.sqlMs != null ? ms(entry.sqlMs) : ''}</span></div>
              <pre class="lab-code"><code>${H.sql(entry.sql)}</code></pre>
              ${params}
              ${entry.sqlError ? `<div class="lab-bad">SQL error: ${esc(entry.sqlError)}</div>` : ''}
            </div>
            <div class="lab-code-block ${lab.engine === 'js' ? 'active' : ''}">
              <div class="lab-code-title"><span>JavaScript · array methods</span><span>${entry.jsMs != null ? ms(entry.jsMs) : ''}</span></div>
              <pre class="lab-code"><code>${H.js(entry.js)}</code></pre>
              ${entry.jsError ? `<div class="lab-bad">JS error: ${esc(entry.jsError)}</div>` : ''}
            </div>
          </div>
          <div class="lab-status">${count}${status}</div>
          ${result}
        </div>`;
    }

    let shown = null;
    let total = 0;
    function show(entry, display) {
      total++;
      $('.lab-fab-count').textContent = total;
      $('.lab-log-count').textContent = lab.log.length;
      if (current === 'log') renderLog();
      if (!display) return;
      shown = entry;
      fab.classList.remove('pulse');
      void fab.offsetWidth; // restart the animation
      fab.classList.add('pulse');
      panes.query.innerHTML = renderEntry(entry);
    }

    function renderLog() {
      if (!lab.log.length) { panes.log.innerHTML = '<p class="lab-muted">Nothing yet.</p>'; return; }
      panes.log.innerHTML = `<ol class="lab-log">${lab.log.slice().reverse().map((e) => `
        <li data-id="${e.id}">
          <span class="lab-kind lab-kind-${e.kind}">${e.kind === 'read' ? 'R' : 'W'}</span>
          <span class="lab-log-title">${esc(e.title)}</span>
          <span class="${e.match.ok ? 'lab-ok' : 'lab-bad'}">${e.match.ok ? '✓' : '✗'}</span>
          <span class="lab-muted">${e.at.toLocaleTimeString()}</span>
        </li>`).join('')}</ol>`;
      panes.log.querySelectorAll('li').forEach((li) => li.addEventListener('click', () => {
        const e = lab.log.find((x) => x.id === Number(li.dataset.id));
        panes.query.innerHTML = renderEntry(e);
        switchTab('query');
      }));
    }

    // ---- schema + DB tools
    function renderSchema() {
      const html = ctx.tables.map((t) => {
        const cols = ctx.selectAll(`PRAGMA table_info(${t})`);
        const n = ctx.selectAll(`SELECT COUNT(*) AS n FROM ${t}`)[0].n;
        return `<div class="lab-schema-table">
          <div class="lab-schema-name">${t} <span class="lab-muted">${n} rows · JS <code>${t}.length</code> = ${lab.store[t].length}</span></div>
          <ul>${cols.map((c) => `<li><span class="${c.pk ? 'lab-pk' : ''}">${esc(c.name)}</span> <span class="lab-muted">${esc(c.type)}${c.pk ? ' · PK' : ''}${c.notnull ? ' · NOT NULL' : ''}</span></li>`).join('')}</ul>
        </div>`;
      }).join('');
      panes.schema.innerHTML = `
        <p class="lab-muted">Money is stored as INTEGER cents (e.g. 2499 = $24.99) — floats and money don't mix.</p>
        <div class="lab-schema">${html}</div>
        <div class="lab-actions">
          <button type="button" class="lab-btn" data-act="download">Download .sqlite</button>
          <button type="button" class="lab-btn lab-btn-danger" data-act="reset">Reset database</button>
        </div>
        <p class="lab-muted">Tip: open the downloaded file in <em>DB Browser for SQLite</em> (<code>sudo dnf install sqlitebrowser</code>) or <code>sqlite3</code>.</p>`;
      panes.schema.querySelector('[data-act="reset"]').addEventListener('click', () => {
        if (confirm('Reset the database to the original sample data? Cart, orders and edits will be lost.')) lab.reset();
      });
      panes.schema.querySelector('[data-act="download"]').addEventListener('click', () => {
        const blob = new Blob([lab.db.export()], { type: 'application/vnd.sqlite3' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${ctx.title.toLowerCase().replace(/\W+/g, '-')}.sqlite`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      });
    }

    // ---- playground: try your own SQL and JS
    function buildPlayground() {
      panes.play.dataset.built = '1';
      panes.play.innerHTML = `
        <label class="lab-label">Exercise
          <select class="lab-select" data-el="ex">
            <option value="">— pick an example —</option>
            ${ctx.examples.map((e, i) => `<option value="${i}">${esc(e.label)}</option>`).join('')}
          </select>
        </label>
        <p class="lab-muted" data-el="hint"></p>
        <div class="lab-play-grid">
          <div>
            <div class="lab-code-title"><span>SQL</span><button type="button" class="lab-btn" data-act="run-sql">Run SQL ▸</button></div>
            <textarea class="lab-editor" data-el="sql" spellcheck="false" placeholder="SELECT * FROM ${ctx.tables[0]} LIMIT 5;"></textarea>
            <div data-el="sql-out"></div>
          </div>
          <div>
            <div class="lab-code-title"><span>JavaScript</span><button type="button" class="lab-btn" data-act="run-js">Run JS ▸</button></div>
            <textarea class="lab-editor" data-el="js" spellcheck="false" placeholder="${ctx.tables[0]}.slice(0, 5)"></textarea>
            <div data-el="js-out"></div>
          </div>
        </div>
        <p class="lab-muted">Tables are available in JS as arrays: ${ctx.tables.map((t) => `<code>${t}</code>`).join(', ')}. Write an expression, or statements that set <code>const result = …</code>. Ctrl+Enter runs.</p>`;
      const el = (n) => panes.play.querySelector(`[data-el="${n}"]`);

      el('ex').addEventListener('change', (e) => {
        const ex = ctx.examples[e.target.value];
        if (!ex) return;
        el('sql').value = ex.sql;
        el('js').value = ex.js;
        el('hint').textContent = ex.hint || '';
        el('sql-out').innerHTML = '';
        el('js-out').innerHTML = '';
      });

      const runSql = () => {
        const out = el('sql-out');
        try {
          const t0 = now();
          const res = lab.db.exec(el('sql').value);
          const t = now() - t0;
          const changed = lab.db.getRowsModified();
          if (!/^\s*(SELECT|WITH|PRAGMA|EXPLAIN)/i.test(el('sql').value)) {
            ctx.persist(); ctx.hydrate(); lab.emit();
          }
          const last = res[res.length - 1];
          const rows = last ? last.values.map((v) => Object.fromEntries(last.columns.map((c, i) => [c, v[i]]))) : [];
          out.innerHTML = `<div class="lab-status">${ms(t)} · ${last ? rows.length + ' row(s)' : changed + ' row(s) changed'}</div>${last ? rowsTable(rows, 20) : ''}`;
        } catch (e) {
          out.innerHTML = `<div class="lab-bad">${esc(e.message)}</div>`;
        }
      };

      const runJs = () => {
        const out = el('js-out');
        const code = el('js').value;
        try {
          const t0 = now();
          let result;
          try {
            // eslint-disable-next-line no-new-func
            result = new Function('store', ...ctx.tables, `return (${code}\n);`)(lab.store, ...ctx.tables.map((t) => lab.store[t]));
          } catch (e) {
            if (!(e instanceof SyntaxError)) throw e;
            // eslint-disable-next-line no-new-func
            result = new Function('store', ...ctx.tables, `${code}\n;return typeof result === 'undefined' ? undefined : result;`)(lab.store, ...ctx.tables.map((t) => lab.store[t]));
          }
          const t = now() - t0;
          let body;
          if (Array.isArray(result) && result.length && typeof result[0] === 'object') body = rowsTable(result, 20);
          else body = `<pre class="lab-code"><code>${H.js(JSON.stringify(result, null, 2) ?? 'undefined')}</code></pre>`;
          out.innerHTML = `<div class="lab-status">${ms(t)}${Array.isArray(result) ? ' · ' + result.length + ' item(s)' : ''}</div>${body}`;
        } catch (e) {
          out.innerHTML = `<div class="lab-bad">${esc(e.message)}</div>`;
        }
      };

      panes.play.querySelector('[data-act="run-sql"]').addEventListener('click', runSql);
      panes.play.querySelector('[data-act="run-js"]').addEventListener('click', runJs);
      el('sql').addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.ctrlKey) runSql(); });
      el('js').addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.ctrlKey) runJs(); });
    }

    // Re-render the current entry when the engine flips so "active" moves.
    lab.onChange(() => { if (shown && current === 'query') panes.query.innerHTML = renderEntry(shown); });

    return { show, syncEngine, open: () => { setOpen(true); switchTab('query'); } };
  }

  global.Lab = { create };
})(window);
