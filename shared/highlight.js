/* Tiny syntax highlighters for SQL and JavaScript.
 *
 * No libraries: each highlighter is one regex that walks the source and
 * wraps every token in a <span class="tok-..."> so CSS can colour it.
 * Array methods (filter, map, sort, reduce, ...) get their own classes so
 * students can spot them at a glance.
 */
(function (global) {
  'use strict';

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const span = (cls, text) => `<span class="${cls}">${esc(text)}</span>`;

  // ---------------------------------------------------------------- SQL
  const SQL_CLAUSES = new Set([
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'BEGIN', 'COMMIT', 'ROLLBACK', 'WITH',
  ]);
  const SQL_KEYWORDS = new Set((
    'AND OR NOT IN IS NULL LIKE BETWEEN LEFT RIGHT INNER OUTER CROSS ON AS BY ASC DESC ' +
    'CREATE TABLE PRIMARY KEY REFERENCES FOREIGN INTEGER TEXT REAL DEFAULT DISTINCT CASE WHEN ' +
    'THEN ELSE END COLLATE NOCASE UNIQUE CHECK IF EXISTS UNION ALL REPLACE CONFLICT DO NOTHING ' +
    'RETURNING TRANSACTION AUTOINCREMENT INDEX VIEW TRUE FALSE'
  ).split(' '));
  const SQL_FUNCS = new Set((
    'COUNT SUM AVG MIN MAX ROUND LOWER UPPER LENGTH COALESCE IFNULL SUBSTR DATE DATETIME ' +
    'STRFTIME PRINTF TOTAL GROUP_CONCAT ABS CAST INSTR TRIM JULIANDAY'
  ).split(' '));

  const SQL_RE =
    /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|(\?|:[A-Za-z_]\w*)|([A-Za-z_]\w*)|(\s+)|([\s\S])/g;

  function highlightSQL(src) {
    let out = '';
    let m;
    SQL_RE.lastIndex = 0;
    while ((m = SQL_RE.exec(src))) {
      const [tok, com, str, num, param, word, ws] = m;
      if (com) out += span('tok-com', tok);
      else if (str) out += span('tok-str', tok);
      else if (num) out += span('tok-num', tok);
      else if (param) out += span('tok-param', tok);
      else if (word) {
        const up = word.toUpperCase();
        if (SQL_CLAUSES.has(up)) out += span('tok-clause', tok);
        else if (SQL_KEYWORDS.has(up)) out += span('tok-kw', tok);
        else if (SQL_FUNCS.has(up)) out += span('tok-fn', tok);
        else out += span('tok-ident', tok);
      } else if (ws) out += tok;
      else out += span('tok-punct', tok);
    }
    return out;
  }

  // ---------------------------------------------------------------- JS
  const JS_KEYWORDS = new Set((
    'const let var function return if else for of in while new typeof instanceof ' +
    'true false null undefined this class extends await async break continue'
  ).split(' '));

  // The big four get individual colours; the rest share one.
  const STAR_METHODS = new Set(['filter', 'map', 'sort', 'reduce']);
  const ARRAY_METHODS = new Set([
    'filter', 'map', 'sort', 'reduce', 'find', 'findIndex', 'some', 'every', 'includes',
    'slice', 'splice', 'forEach', 'push', 'flatMap', 'toSorted', 'join', 'indexOf', 'at',
    'concat', 'reverse', 'fill', 'keys', 'values', 'entries', 'from',
  ]);

  const JS_RE =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\[\s\S]|[^`])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|(\b\d+(?:\.\d+)?\b)|(=>)|([A-Za-z_$][\w$]*)|(\s+)|([\s\S])/g;

  function highlightJS(src) {
    let out = '';
    let m;
    let prev = ''; // previous non-whitespace token
    JS_RE.lastIndex = 0;
    while ((m = JS_RE.exec(src))) {
      const [tok, com, str, num, arrow, word, ws] = m;
      if (com) out += span('tok-com', tok);
      else if (str) out += span('tok-str', tok);
      else if (num) out += span('tok-num', tok);
      else if (arrow) out += span('tok-arrow', tok);
      else if (word) {
        const next = src.slice(JS_RE.lastIndex).match(/^\s*\(/);
        if (prev === '.' && next && ARRAY_METHODS.has(word)) {
          const cls = STAR_METHODS.has(word) ? `tok-am tok-am-${word}` : 'tok-am tok-am-other';
          out += span(cls, tok);
        } else if (JS_KEYWORDS.has(word)) out += span('tok-kw', tok);
        else if (prev === '.') out += span('tok-prop', tok);
        else if (next) out += span('tok-fn', tok);
        else out += span('tok-ident', tok);
      } else if (ws) out += tok;
      else out += span('tok-punct', tok);
      if (!ws) prev = tok;
    }
    return out;
  }

  // ---------------------------------------------------------------- helpers
  /** Which array methods does this JS source call? e.g. ['filter','sort'] */
  function arrayMethodsUsed(src) {
    const found = new Set();
    const re = /\.\s*([A-Za-z]+)\s*\(/g;
    let m;
    while ((m = re.exec(src))) if (ARRAY_METHODS.has(m[1])) found.add(m[1]);
    return [...found];
  }

  /** Which SQL clauses appear in this statement? e.g. ['SELECT','WHERE','ORDER BY'] */
  function sqlClausesUsed(src) {
    const clean = src.replace(/'(?:[^']|'')*'/g, "''").replace(/--[^\n]*/g, '').toUpperCase();
    const checks = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'JOIN', 'WHERE', 'GROUP BY', 'HAVING',
      'ORDER BY', 'LIMIT', 'BEGIN', 'CASE',
    ];
    return checks.filter((c) => new RegExp('\\b' + c.replace(' ', '\\s+') + '\\b').test(clean));
  }

  global.Highlight = { sql: highlightSQL, js: highlightJS, esc, arrayMethodsUsed, sqlClausesUsed };
})(window);
