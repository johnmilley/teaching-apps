/* Meeple & Co. — a board game shop front end.
 *
 * Every piece of data on the page comes from lab.query() / lab.mutate(),
 * which run a SQL version AND a JavaScript-array version of the same logic.
 * Open "Under the hood" (bottom left, or press `) to watch them.
 */
(async function () {
  'use strict';

  const lab = await Lab.create({
    app: 'game-shop',
    title: 'Meeple and Co',
    schema: GAMES_SCHEMA,
    seed: GAMES_SEED,
    tables: ['games', 'game_mechanics', 'reviews', 'wishlist'],
    examples: GAMES_EXAMPLES,
  });

  window.lab = lab; // explore from the DevTools console: lab.store.games, lab.db.exec('...')

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = Highlight.esc;
  const money = lab.money;
  const js = JSON.stringify;

  const CATEGORIES = ['All', 'Family', 'Strategy', 'Party', 'Co-op', 'Two-Player'];
  const WEIGHTS = {
    Light: { sql: 'g.weight < 2', js: 'g.weight < 2' },
    Medium: { sql: 'g.weight >= 2 AND g.weight < 3', js: 'g.weight >= 2 && g.weight < 3' },
    Heavy: { sql: 'g.weight >= 3', js: 'g.weight >= 3' },
  };
  const SORTS = {
    rating: {
      label: 'Top rated',
      sql: 'avg_stars DESC, reviews DESC, g.name COLLATE NOCASE',
      js: '(b.avg_stars ?? -1) - (a.avg_stars ?? -1) || b.reviews - a.reviews || a.name.localeCompare(b.name)',
    },
    reviews: { label: 'Most reviewed', sql: 'reviews DESC, g.name COLLATE NOCASE', js: 'b.reviews - a.reviews || a.name.localeCompare(b.name)' },
    price_asc: { label: 'Price: low to high', sql: 'g.price_cents, g.id', js: 'a.price_cents - b.price_cents || a.id - b.id' },
    price_desc: { label: 'Price: high to low', sql: 'g.price_cents DESC, g.id', js: 'b.price_cents - a.price_cents || a.id - b.id' },
    quick: { label: 'Quickest to play', sql: 'g.play_minutes, g.id', js: 'a.play_minutes - b.play_minutes || a.id - b.id' },
    name: { label: 'Name A–Z', sql: 'g.name COLLATE NOCASE', js: 'a.name.localeCompare(b.name)' },
  };

  const state = {
    view: 'shop',
    finder: { players: 4, minutes: 60 },
    filters: { category: 'All', mechanic: '', weight: '', sort: 'rating' },
  };

  // Shared snippets: "average stars + review count" appears in several queries.
  const SQL_RATING_COLS = 'ROUND(AVG(r.stars), 1) AS avg_stars,\n       COUNT(r.id) AS reviews';
  const JS_WITH_RATING = `.map(g => {
    const rs = reviews.filter(r => r.game_id === g.id);
    const total = rs.reduce((sum, r) => sum + r.stars, 0);
    return { ...g, reviews: rs.length,
             avg_stars: rs.length ? Math.round((total / rs.length) * 10) / 10 : null };
  })`;

  // ================================================================ queries

  function queryFinder() {
    const { players, minutes } = state.finder;
    return lab.query({
      title: `Game night finder: ${players} players, ${minutes} min`,
      sql: `SELECT g.id, g.name, g.category, g.min_players, g.max_players, g.play_minutes,
       g.price_cents, g.emoji, g.hue,
       ${SQL_RATING_COLS}
FROM games g
LEFT JOIN reviews r ON r.game_id = g.id
WHERE g.min_players <= ? AND g.max_players >= ?
  AND g.play_minutes <= ?
GROUP BY g.id
ORDER BY avg_stars DESC, reviews DESC, g.name COLLATE NOCASE
LIMIT 3;`,
      params: [players, players, minutes],
      js: `const result = games
  .filter(g => g.min_players <= ${players} && g.max_players >= ${players})
  .filter(g => g.play_minutes <= ${minutes})
  ${JS_WITH_RATING}
  .sort((a, b) => (b.avg_stars ?? -1) - (a.avg_stars ?? -1) || b.reviews - a.reviews
                  || a.name.localeCompare(b.name))
  .slice(0, 3);`,
    });
  }

  function queryMechanics() {
    return lab.query({
      title: 'Mechanic dropdown',
      quiet: true,
      sql: `SELECT mechanic, COUNT(*) AS games
FROM game_mechanics
GROUP BY mechanic
ORDER BY mechanic;`,
      js: `const counts = game_mechanics.reduce((acc, m) => {
  acc[m.mechanic] = (acc[m.mechanic] || 0) + 1;
  return acc;
}, {});

const result = Object.keys(counts)
  .sort()
  .map(mechanic => ({ mechanic, games: counts[mechanic] }));`,
    });
  }

  function queryCatalog() {
    const f = state.filters;
    const where = [];
    const params = [];
    const filters = [];
    if (f.category !== 'All') {
      where.push('g.category = ?');
      params.push(f.category);
      filters.push(`.filter(g => g.category === ${js(f.category)})`);
    }
    if (f.weight) {
      where.push(`(${WEIGHTS[f.weight].sql})`);
      filters.push(`.filter(g => ${WEIGHTS[f.weight].js})   // ${f.weight}`);
    }
    if (f.mechanic) {
      where.push(`EXISTS (SELECT 1 FROM game_mechanics m
               WHERE m.game_id = g.id AND m.mechanic = ?)`);
      params.push(f.mechanic);
      filters.push(`.filter(g => game_mechanics.some(m => m.game_id === g.id && m.mechanic === ${js(f.mechanic)}))`);
    }
    const sort = SORTS[f.sort];
    return lab.query({
      title: 'Browse games',
      sql: `SELECT g.id, g.name, g.category, g.min_players, g.max_players, g.play_minutes,
       g.weight, g.price_cents, g.stock, g.emoji, g.hue,
       ${SQL_RATING_COLS}
FROM games g
LEFT JOIN reviews r ON r.game_id = g.id${where.length ? '\nWHERE ' + where.join('\n  AND ') : ''}
GROUP BY g.id
ORDER BY ${sort.sql};`,
      params,
      js: `const result = games${filters.map((l) => '\n  ' + l).join('')}
  ${JS_WITH_RATING}
  .sort((a, b) => ${sort.js});`,
    });
  }

  function queryWishlistIds() {
    return lab.query({
      title: 'Wishlist ids (heart icons)',
      quiet: true,
      sql: 'SELECT game_id FROM wishlist;',
      js: 'const result = wishlist.map(w => ({ game_id: w.game_id }));',
    }).map((r) => r.game_id);
  }

  function queryGame(id) {
    return lab.query({
      title: `Game details (id ${id})`,
      sql: `SELECT g.*, ${SQL_RATING_COLS}
FROM games g
LEFT JOIN reviews r ON r.game_id = g.id
WHERE g.id = ?
GROUP BY g.id;`,
      params: [id],
      js: `const result = games
  .filter(g => g.id === ${id})
  ${JS_WITH_RATING};`,
    })[0];
  }

  function queryGameMechanics(id) {
    return lab.query({
      title: 'Mechanics for this game',
      quiet: true,
      sql: 'SELECT mechanic FROM game_mechanics WHERE game_id = ? ORDER BY mechanic;',
      params: [id],
      js: `const result = game_mechanics
  .filter(m => m.game_id === ${id})
  .map(m => ({ mechanic: m.mechanic }))
  .sort((a, b) => a.mechanic.localeCompare(b.mechanic));`,
    }).map((r) => r.mechanic);
  }

  function queryHistogram(id) {
    return lab.query({
      title: 'Star histogram',
      sql: `SELECT stars, COUNT(*) AS n
FROM reviews
WHERE game_id = ?
GROUP BY stars
ORDER BY stars DESC;`,
      params: [id],
      js: `const counts = reviews
  .filter(r => r.game_id === ${id})
  .reduce((acc, r) => {
    acc[r.stars] = (acc[r.stars] || 0) + 1;
    return acc;
  }, {});

const result = Object.entries(counts)
  .map(([stars, n]) => ({ stars: Number(stars), n }))
  .sort((a, b) => b.stars - a.stars);`,
    });
  }

  function queryReviews(id) {
    return lab.query({
      title: 'Reviews for this game',
      sql: `SELECT id, reviewer, stars, body, created_at
FROM reviews
WHERE game_id = ?
ORDER BY created_at DESC, id DESC;`,
      params: [id],
      js: `const result = reviews
  .filter(r => r.game_id === ${id})
  .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id);`,
    });
  }

  function queryWishlist() {
    return lab.query({
      title: 'Wishlist',
      sql: `SELECT g.id, g.name, g.category, g.min_players, g.max_players, g.play_minutes,
       g.price_cents, g.stock, g.emoji, g.hue, w.added_at
FROM wishlist w
JOIN games g ON g.id = w.game_id
ORDER BY w.added_at DESC;`,
      js: `const result = wishlist
  .map(w => ({ ...games.find(g => g.id === w.game_id), added_at: w.added_at }))
  .sort((a, b) => b.added_at.localeCompare(a.added_at));`,
    });
  }

  function queryWishlistSummary() {
    return lab.query({
      title: 'Wishlist summary',
      sql: `SELECT COUNT(*) AS games,
       COALESCE(SUM(g.price_cents), 0) AS total_cents,
       MAX(g.min_players) AS players_from,
       MIN(g.max_players) AS players_to,
       COALESCE(SUM(g.play_minutes), 0) AS total_minutes
FROM wishlist w
JOIN games g ON g.id = w.game_id;`,
      js: `const listed = wishlist.map(w => games.find(g => g.id === w.game_id));

const result = [listed.reduce((acc, g) => ({
  games: acc.games + 1,
  total_cents: acc.total_cents + g.price_cents,
  players_from: Math.max(acc.players_from ?? 0, g.min_players),
  players_to: Math.min(acc.players_to ?? Infinity, g.max_players),
  total_minutes: acc.total_minutes + g.play_minutes,
}), { games: 0, total_cents: 0, players_from: null, players_to: null, total_minutes: 0 })];`,
    })[0];
  }

  function queryWishlistMechanics() {
    return lab.query({
      title: 'Mechanics you seem to like',
      sql: `SELECT DISTINCT m.mechanic
FROM wishlist w
JOIN game_mechanics m ON m.game_id = w.game_id
ORDER BY m.mechanic;`,
      js: `const all = wishlist.flatMap(w =>
  game_mechanics.filter(m => m.game_id === w.game_id).map(m => m.mechanic));

const result = [...new Set(all)]   // DISTINCT
  .sort()
  .map(mechanic => ({ mechanic }));`,
    }).map((r) => r.mechanic);
  }

  function queryLeaderboard() {
    return lab.query({
      title: 'Leaderboard (3+ reviews)',
      sql: `SELECT g.id, g.name, g.category, g.emoji, g.hue,
       COUNT(r.id) AS reviews,
       ROUND(AVG(r.stars), 2) AS avg_stars
FROM games g
JOIN reviews r ON r.game_id = g.id
GROUP BY g.id
HAVING COUNT(r.id) >= 3
ORDER BY avg_stars DESC, reviews DESC, g.name COLLATE NOCASE
LIMIT 10;`,
      js: `const result = games
  .map(g => {
    const stars = reviews.filter(r => r.game_id === g.id).map(r => r.stars);
    const avg = stars.reduce((a, b) => a + b, 0) / stars.length;
    return { ...g, reviews: stars.length, avg_stars: Math.round(avg * 100) / 100 };
  })
  .filter(g => g.reviews >= 3)                       // HAVING
  .sort((a, b) => b.avg_stars - a.avg_stars || b.reviews - a.reviews
                  || a.name.localeCompare(b.name))
  .slice(0, 10);`,
    });
  }

  function queryCategoryStats() {
    return lab.query({
      title: 'Category breakdown',
      sql: `SELECT g.category,
       COUNT(DISTINCT g.id) AS games,
       COUNT(r.id) AS reviews,
       ROUND(AVG(r.stars), 1) AS avg_stars
FROM games g
LEFT JOIN reviews r ON r.game_id = g.id
GROUP BY g.category
ORDER BY avg_stars DESC, g.category;`,
      js: `const groups = games.reduce((acc, g) => {
  acc[g.category] ??= { category: g.category, games: 0, stars: [] };
  acc[g.category].games += 1;
  acc[g.category].stars.push(...reviews.filter(r => r.game_id === g.id).map(r => r.stars));
  return acc;
}, {});

const result = Object.values(groups)
  .map(c => ({
    category: c.category,
    games: c.games,
    reviews: c.stars.length,
    avg_stars: Math.round(c.stars.reduce((a, b) => a + b, 0) / c.stars.length * 10) / 10,
  }))
  .sort((a, b) => b.avg_stars - a.avg_stars || a.category.localeCompare(b.category));`,
    });
  }

  function queryTopReviewers() {
    return lab.query({
      title: 'Most active reviewers',
      sql: `SELECT reviewer, COUNT(*) AS reviews, ROUND(AVG(stars), 1) AS avg_given
FROM reviews
GROUP BY reviewer
ORDER BY reviews DESC, reviewer
LIMIT 5;`,
      js: `const byReviewer = reviews.reduce((acc, r) => {
  (acc[r.reviewer] ??= []).push(r.stars);
  return acc;
}, {});

const result = Object.entries(byReviewer)
  .map(([reviewer, stars]) => ({
    reviewer,
    reviews: stars.length,
    avg_given: Math.round(stars.reduce((a, b) => a + b, 0) / stars.length * 10) / 10,
  }))
  .sort((a, b) => b.reviews - a.reviews || a.reviewer.localeCompare(b.reviewer))
  .slice(0, 5);`,
    });
  }

  // ================================================================ writes

  function toggleWishlist(game) {
    const on = lab.store.wishlist.some((w) => w.game_id === game.id);
    if (on) {
      lab.mutate({
        title: `Remove ${game.name} from wishlist`,
        sql: 'DELETE FROM wishlist WHERE game_id = ?',
        params: [game.id],
        js: `store.wishlist = store.wishlist.filter(w => w.game_id !== ${game.id});`,
      });
      toast(`Removed <strong>${esc(game.name)}</strong> from your wishlist.`);
    } else {
      const at = new Date().toISOString().slice(0, 19);
      lab.mutate({
        title: `Add ${game.name} to wishlist`,
        sql: 'INSERT INTO wishlist (game_id, added_at) VALUES (?, ?)',
        params: [game.id, at],
        js: `store.wishlist.push({ game_id: ${game.id}, added_at: ${js(at)} });`,
      });
      toast(`♥ Saved <strong>${esc(game.name)}</strong> to your wishlist.`);
    }
  }

  function addReview(game, reviewer, stars, body) {
    const today = new Date().toISOString().slice(0, 10);
    return lab.mutate({
      title: `New ${stars}★ review of ${game.name}`,
      sql: `INSERT INTO reviews (id, game_id, reviewer, stars, body, created_at)
VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM reviews), ?, ?, ?, ?, ?)`,
      params: [game.id, reviewer, stars, body, today],
      js: `const nextId = reviews.reduce((max, r) => Math.max(max, r.id), 0) + 1;

store.reviews.push({
  id: nextId, game_id: ${game.id}, reviewer: ${js(reviewer)},
  stars: ${stars}, body: ${js(body)}, created_at: ${js(today)},
});`,
    });
  }

  // ================================================================ rendering

  function box(g, size = '') {
    return `<div class="box ${size}" style="--h:${g.hue}" aria-hidden="true">
      <span class="box-emoji">${g.emoji}</span>
      <span class="box-name">${esc(g.name)}</span>
    </div>`;
  }

  function stars(avg, count) {
    if (avg == null) return '<span class="no-reviews">No reviews yet</span>';
    const pct = (avg / 5) * 100;
    return `<span class="stars" title="${avg} out of 5"><span class="stars-fill" style="width:${pct}%">★★★★★</span>★★★★★</span>
      <span class="stars-num">${avg.toFixed(1)}</span>${count != null ? ` <span class="stars-count">(${count})</span>` : ''}`;
  }

  const players = (g) => (g.min_players === g.max_players ? `${g.min_players}` : `${g.min_players}–${g.max_players}`);
  const weightLabel = (w) => (w < 2 ? 'Light' : w < 3 ? 'Medium' : 'Heavy');

  function renderFinder() {
    const picks = queryFinder();
    const { players: p, minutes } = state.finder;
    $('#finder-out').innerHTML = picks.length
      ? picks.map((g, i) => `
        <button class="pick" data-open="${g.id}">
          <span class="pick-rank">${i === 0 ? 'Best match' : '#' + (i + 1)}</span>
          ${box(g, 'box-md')}
          <span class="pick-name">${esc(g.name)}</span>
          <span class="pick-meta">👥 ${players(g)} · ⏱ ${g.play_minutes} min</span>
          <span class="pick-rating">${stars(g.avg_stars, g.reviews)}</span>
        </button>`).join('')
      : `<p class="finder-empty">Nothing fits ${p} players in ${minutes} minutes — try a longer night!</p>`;
    $('#players-out').textContent = p;
    $('#minutes-out').textContent = minutes >= 180 ? '3 h+' : `${minutes} min`;
  }

  function renderCatalog() {
    const rows = queryCatalog();
    const hearts = new Set(queryWishlistIds());
    $('#result-count').textContent = `${rows.length} game${rows.length === 1 ? '' : 's'}`;
    $('#grid').innerHTML = rows.length ? rows.map((g) => `
      <article class="card" data-open="${g.id}">
        <div class="card-art">
          ${box(g)}
          <button class="heart ${hearts.has(g.id) ? 'on' : ''}" data-heart="${g.id}" aria-label="Toggle wishlist">♥</button>
          <span class="tag tag-${g.category.toLowerCase().replace(/\W/g, '')}">${esc(g.category)}</span>
        </div>
        <div class="card-body">
          <h3>${esc(g.name)}</h3>
          <p class="card-rating">${stars(g.avg_stars, g.reviews)}</p>
          <ul class="facts">
            <li title="Players">👥 ${players(g)}</li>
            <li title="Play time">⏱ ${g.play_minutes}m</li>
            <li title="Complexity">🧠 ${weightLabel(g.weight)}</li>
          </ul>
          <div class="card-foot">
            <span class="price">${money(g.price_cents)}</span>
            ${g.stock === 0 ? '<span class="out">Out of stock</span>' : g.stock <= 2 ? `<span class="low">Only ${g.stock} left</span>` : '<span class="in">In stock</span>'}
          </div>
        </div>
      </article>`).join('') : '<div class="empty">No games match. <button class="link" id="reset-filters">Reset filters</button></div>';
    const reset = $('#reset-filters');
    if (reset) reset.addEventListener('click', () => {
      Object.assign(state.filters, { category: 'All', mechanic: '', weight: '' });
      syncInputs();
      renderCatalog();
    });
  }

  function renderMechanics() {
    const ms = queryMechanics();
    $('#mechanic').innerHTML = '<option value="">Any mechanic</option>' +
      ms.map((m) => `<option value="${esc(m.mechanic)}">${esc(m.mechanic)} (${m.games})</option>`).join('');
    $('#mechanic').value = state.filters.mechanic;
  }

  function renderWishlistBadge() {
    const n = lab.store.wishlist.length; // tiny helper: plain JS, not a lesson
    $('#wish-count').textContent = n;
    $('#wish-count').hidden = n === 0;
  }

  function renderWishlist() {
    const list = queryWishlist();
    const sum = queryWishlistSummary();
    const mechs = queryWishlistMechanics();
    $('#wishlist').innerHTML = `
      <div class="page-head">
        <h1>Your wishlist</h1>
        <p class="muted">Saved games live in the <code>wishlist</code> table. The summary is one query with <code>SUM</code>, <code>MIN</code> and <code>MAX</code> — or one <code>reduce()</code>.</p>
      </div>
      ${list.length ? `
      <div class="wish-layout">
        <ul class="wish-list">${list.map((g) => `
          <li>
            ${box(g, 'box-sm')}
            <div class="wish-info">
              <button class="link-plain" data-open="${g.id}">${esc(g.name)}</button>
              <span>${esc(g.category)} · 👥 ${players(g)} · ⏱ ${g.play_minutes} min</span>
              <span class="muted">Saved ${new Date(g.added_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
            <span class="price">${money(g.price_cents)}</span>
            <button class="icon-btn" data-heart="${g.id}" aria-label="Remove">✕</button>
          </li>`).join('')}
        </ul>
        <aside class="wish-sum">
          <h3>Summary</h3>
          <dl>
            <dt>Games</dt><dd>${sum.games}</dd>
            <dt>Buy them all</dt><dd>${money(sum.total_cents)}</dd>
            <dt>Play them all</dt><dd>${Math.floor(sum.total_minutes / 60)} h ${sum.total_minutes % 60} min</dd>
            <dt>Works for</dt><dd>${sum.players_from <= sum.players_to ? `${sum.players_from}–${sum.players_to} players` : 'no single group size 😅'}</dd>
          </dl>
          <h4>Mechanics you seem to like</h4>
          <div class="mech-tags">${mechs.map((m) => `<span>${esc(m)}</span>`).join('')}</div>
          <button class="btn btn-primary btn-block" id="buy-all">Add all to cart</button>
        </aside>
      </div>` : '<div class="empty"><p>Nothing saved yet.</p><button class="btn" data-view="shop">Browse games</button></div>'}`;
    const buy = $('#buy-all');
    if (buy) buy.addEventListener('click', () => toast('Checkout is left as an exercise 😉 — see the vinyl shop for a full cart.'));
  }

  function renderLeaderboard() {
    const top = queryLeaderboard();
    const cats = queryCategoryStats();
    const people = queryTopReviewers();
    $('#leaderboard').innerHTML = `
      <div class="page-head">
        <h1>Leaderboard</h1>
        <p class="muted">Only games with 3+ reviews qualify — that's a <code>HAVING</code> clause, or a <code>.filter()</code> after the <code>reduce</code>.</p>
      </div>
      <div class="board-layout">
        <section class="board">
          ${top.map((g, i) => `
            <button class="row" data-open="${g.id}">
              <span class="rank rank-${i + 1}">${i + 1}</span>
              ${box(g, 'box-xs')}
              <span class="row-name"><strong>${esc(g.name)}</strong><small>${esc(g.category)}</small></span>
              <span class="row-score">${g.avg_stars.toFixed(2)}<small>${g.reviews} reviews</small></span>
            </button>`).join('')}
        </section>
        <div class="board-side">
          <section class="panel">
            <h3>By category</h3>
            <table class="mini">
              <thead><tr><th>Category</th><th>Games</th><th>Reviews</th><th>Avg</th></tr></thead>
              <tbody>${cats.map((c) => `<tr><td>${esc(c.category)}</td><td>${c.games}</td><td>${c.reviews}</td><td>${c.avg_stars == null ? '—' : c.avg_stars.toFixed(1)}</td></tr>`).join('')}</tbody>
            </table>
          </section>
          <section class="panel">
            <h3>Most active reviewers</h3>
            <ol class="people">${people.map((p) => `<li><span class="avatar" style="--h:${(p.reviewer.charCodeAt(0) * 37) % 360}">${esc(p.reviewer[0])}</span><strong>${esc(p.reviewer)}</strong><span>${p.reviews} reviews · gives ${p.avg_given.toFixed(1)}★</span></li>`).join('')}</ol>
          </section>
        </div>
      </div>`;
  }

  function renderAll() {
    renderWishlistBadge();
    if (state.view === 'shop') {
      renderMechanics();
      renderFinder();
      renderCatalog();
    } else if (state.view === 'wishlist') {
      renderWishlist();
    } else {
      renderLeaderboard();
    }
    if (openGameId != null) renderGame(openGameId);
  }

  // ================================================================ game modal

  let openGameId = null;

  function renderGame(id) {
    const g = queryGame(id);
    const mechs = queryGameMechanics(id);
    const reviews = queryReviews(id);
    const hist = queryHistogram(id);
    const onList = lab.store.wishlist.some((w) => w.game_id === id);
    const maxN = Math.max(1, ...hist.map((h) => h.n));
    const bars = [5, 4, 3, 2, 1].map((s) => {
      const n = (hist.find((h) => h.stars === s) || { n: 0 }).n;
      return `<li><span>${s}★</span><span class="hbar"><span style="width:${(n / maxN) * 100}%"></span></span><span>${n}</span></li>`;
    }).join('');

    $('#modal-body').innerHTML = `
      <div class="detail">
        <div class="detail-art">${box(g, 'box-lg')}</div>
        <div class="detail-info">
          <span class="tag tag-${g.category.toLowerCase().replace(/\W/g, '')}">${esc(g.category)}</span>
          <h2>${esc(g.name)} <small>(${g.year})</small></h2>
          <p>${stars(g.avg_stars, g.reviews)}</p>
          <ul class="facts facts-lg">
            <li><strong>${players(g)}</strong><span>players</span></li>
            <li><strong>${g.play_minutes}</strong><span>minutes</span></li>
            <li><strong>${g.weight.toFixed(1)}</strong><span>${weightLabel(g.weight)}</span></li>
            <li><strong>${g.min_age}+</strong><span>ages</span></li>
          </ul>
          <div class="mech-tags">${mechs.map((m) => `<span>${esc(m)}</span>`).join('')}</div>
          <div class="detail-buy">
            <span class="price price-lg">${money(g.price_cents)}</span>
            <button class="btn ${onList ? '' : 'btn-primary'}" data-heart="${g.id}">${onList ? '♥ On your wishlist' : '♡ Add to wishlist'}</button>
          </div>
          <p class="muted small">${g.stock === 0 ? 'Out of stock — restock expected in 2 weeks.' : `${g.stock} in stock at the shop.`}</p>
        </div>
      </div>
      <div class="reviews-layout">
        <div>
          <h3>Ratings</h3>
          <ul class="hist">${bars}</ul>
          <form class="review-form" id="review-form">
            <h4>Write a review</h4>
            <div class="star-input" role="radiogroup" aria-label="Stars">
              ${[5, 4, 3, 2, 1].map((s) => `<input type="radio" name="stars" id="s${s}" value="${s}" ${s === 5 ? 'checked' : ''}><label for="s${s}" title="${s} stars">★</label>`).join('')}
            </div>
            <input name="reviewer" required maxlength="30" placeholder="Your first name">
            <textarea name="body" required maxlength="200" rows="3" placeholder="What did your table think?"></textarea>
            <button class="btn btn-primary">Post review</button>
          </form>
        </div>
        <div>
          <h3>${reviews.length} review${reviews.length === 1 ? '' : 's'}</h3>
          <ul class="review-list">${reviews.length ? reviews.map((r) => `
            <li>
              <div class="review-head"><span class="avatar" style="--h:${(r.reviewer.charCodeAt(0) * 37) % 360}">${esc(r.reviewer[0])}</span>
              <strong>${esc(r.reviewer)}</strong><span class="stars-small">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span>
              <span class="muted">${new Date(r.created_at + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
              <p>${esc(r.body)}</p>
            </li>`).join('') : '<li class="muted">Be the first to review this game.</li>'}
          </ul>
        </div>
      </div>`;

    $('#review-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(e.target);
      if (addReview(g, String(d.get('reviewer')).trim(), Number(d.get('stars')), String(d.get('body')).trim())) {
        toast('Thanks! Your review is live — watch the average change.');
      }
    });
  }

  function openGame(id) {
    openGameId = id;
    renderGame(id);
    $('#modal').hidden = false;
    document.body.classList.add('no-scroll');
  }

  function closeModal() {
    openGameId = null;
    $('#modal').hidden = true;
    document.body.classList.remove('no-scroll');
  }

  let toastTimer;
  function toast(html) {
    const t = $('#toast');
    t.innerHTML = html;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  // ================================================================ events

  function syncInputs() {
    $$('#cats button').forEach((b) => b.classList.toggle('on', b.dataset.cat === state.filters.category));
    $$('#weights button').forEach((b) => b.classList.toggle('on', b.dataset.weight === state.filters.weight));
    $('#mechanic').value = state.filters.mechanic;
    $('#sort').value = state.filters.sort;
    $('#players').value = state.finder.players;
    $('#minutes').value = state.finder.minutes;
  }

  function setView(view) {
    state.view = view;
    ['shop', 'wishlist', 'leaderboard'].forEach((v) => { $('#' + v).hidden = v !== view; });
    $$('.main-nav [data-view]').forEach((a) => a.classList.toggle('on', a.dataset.view === view));
    renderAll();
    window.scrollTo(0, 0);
  }

  $('#cats').innerHTML = CATEGORIES.map((c) => `<button type="button" data-cat="${c}">${c}</button>`).join('');
  $('#weights').innerHTML = ['', ...Object.keys(WEIGHTS)].map((w) => `<button type="button" data-weight="${w}">${w || 'Any'}</button>`).join('');
  $('#sort').innerHTML = Object.entries(SORTS).map(([k, s]) => `<option value="${k}">${s.label}</option>`).join('');

  $('#cats').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    state.filters.category = b.dataset.cat;
    syncInputs();
    renderCatalog();
  });
  $('#weights').addEventListener('click', (e) => {
    const b = e.target.closest('[data-weight]');
    if (!b) return;
    state.filters.weight = b.dataset.weight;
    syncInputs();
    renderCatalog();
  });
  $('#mechanic').addEventListener('change', (e) => { state.filters.mechanic = e.target.value; renderCatalog(); });
  $('#sort').addEventListener('change', (e) => { state.filters.sort = e.target.value; renderCatalog(); });
  $('#players').addEventListener('input', (e) => { state.finder.players = Number(e.target.value); renderFinder(); });
  $('#minutes').addEventListener('input', (e) => { state.finder.minutes = Number(e.target.value); renderFinder(); });

  document.addEventListener('click', (e) => {
    const heart = e.target.closest('[data-heart]');
    if (heart) {
      e.preventDefault();
      e.stopPropagation();
      const id = Number(heart.dataset.heart);
      toggleWishlist(lab.store.games.find((g) => g.id === id));
      return;
    }
    const open = e.target.closest('[data-open]');
    if (open) { e.preventDefault(); openGame(Number(open.dataset.open)); return; }
    const view = e.target.closest('[data-view]');
    if (view) { e.preventDefault(); closeModal(); setView(view.dataset.view); }
  });
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' || e.target.closest('.modal-close')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  lab.onChange(renderAll);

  syncInputs();
  setView('shop');
  document.body.classList.remove('loading');
})().catch((err) => {
  console.error(err);
  document.body.classList.remove('loading');
  document.body.insertAdjacentHTML('afterbegin', `<pre style="padding:1rem;color:#b00">Could not start: ${err.message}</pre>`);
});
