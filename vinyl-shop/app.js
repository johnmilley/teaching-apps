/* Needle & Groove — a record-store front end.
 *
 * Every piece of data on the page comes from lab.query() / lab.mutate(),
 * which run a SQL version AND a JavaScript-array version of the same logic.
 * Open "Under the hood" (bottom left, or press `) to watch them.
 */
(async function () {
  'use strict';

  const lab = await Lab.create({
    app: 'vinyl-shop',
    title: 'Needle and Groove',
    schema: VINYL_SCHEMA,
    seed: VINYL_SEED,
    tables: ['artists', 'albums', 'cart_items', 'orders', 'order_items'],
    examples: VINYL_EXAMPLES,
  });

  window.lab = lab; // explore from the DevTools console: lab.store.albums, lab.db.exec('...')

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = Highlight.esc;
  const money = lab.money;
  const js = JSON.stringify; // literal values inside generated JS

  const FREE_SHIPPING_CENTS = 5000;
  const SHIPPING_CENTS = 699;
  const TAX_RATE = 0.15; // HST

  const state = {
    view: 'shop',
    filters: { q: '', genres: [], condition: 'all', maxPrice: 50, inStock: false, sort: 'featured' },
  };

  // ================================================================ queries
  // Each function returns rows from whichever engine is switched on.

  function queryStaffPicks() {
    return lab.query({
      title: 'Staff picks (hero banner)',
      quiet: true,
      sql: `SELECT al.id, al.title, ar.name AS artist, al.year, al.price_cents, al.hue
FROM albums al
JOIN artists ar ON ar.id = al.artist_id
WHERE al.staff_pick = 1
ORDER BY al.rating DESC, al.id;`,
      js: `const result = albums
  .filter(al => al.staff_pick === 1)
  .map(al => ({ ...al, artist: artists.find(ar => ar.id === al.artist_id).name }))
  .sort((a, b) => b.rating - a.rating || a.id - b.id);`,
    });
  }

  function queryGenreCounts() {
    return lab.query({
      title: 'Genre list with counts (sidebar)',
      quiet: true,
      sql: `SELECT genre, COUNT(*) AS albums
FROM albums
GROUP BY genre
ORDER BY genre;`,
      js: `const counts = albums.reduce((acc, al) => {
  acc[al.genre] = (acc[al.genre] || 0) + 1;
  return acc;
}, {});

const result = Object.entries(counts)
  .map(([genre, n]) => ({ genre, albums: n }))
  .sort((a, b) => a.genre.localeCompare(b.genre));`,
    });
  }

  const SORTS = {
    featured: {
      label: 'Featured',
      sql: 'al.staff_pick DESC, al.rating DESC, al.id',
      js: 'b.staff_pick - a.staff_pick || b.rating - a.rating || a.id - b.id',
    },
    price_asc: { label: 'Price: low to high', sql: 'al.price_cents ASC, al.id', js: 'a.price_cents - b.price_cents || a.id - b.id' },
    price_desc: { label: 'Price: high to low', sql: 'al.price_cents DESC, al.id', js: 'b.price_cents - a.price_cents || a.id - b.id' },
    newest: { label: 'Release year: newest', sql: 'al.year DESC, al.id', js: 'b.year - a.year || a.id - b.id' },
    oldest: { label: 'Release year: oldest', sql: 'al.year ASC, al.id', js: 'a.year - b.year || a.id - b.id' },
    title: { label: 'Title A–Z', sql: 'al.title COLLATE NOCASE, al.id', js: 'a.title.localeCompare(b.title) || a.id - b.id' },
    rating: { label: 'Top rated', sql: 'al.rating DESC, al.id', js: 'b.rating - a.rating || a.id - b.id' },
  };

  /* The catalog query is built from the filter state — the SQL gets a WHERE
     condition and the JS gets a .filter() line for each active filter. */
  function queryCatalog() {
    const f = state.filters;
    const where = [];
    const params = [];
    const filters = [];

    if (f.q.trim()) {
      const q = f.q.trim();
      where.push('(al.title LIKE ? OR ar.name LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
      filters.push(`.filter(al => al.title.toLowerCase().includes(${js(q.toLowerCase())}) ||
               al.artist.toLowerCase().includes(${js(q.toLowerCase())}))`);
    }
    if (f.genres.length) {
      where.push(`al.genre IN (${f.genres.map(() => '?').join(', ')})`);
      params.push(...f.genres);
      filters.push(`.filter(al => ${js(f.genres)}.includes(al.genre))`);
    }
    if (f.condition !== 'all') {
      where.push('al.condition = ?');
      params.push(f.condition);
      filters.push(`.filter(al => al.condition === ${js(f.condition)})`);
    }
    if (f.maxPrice < 50) {
      where.push('al.price_cents <= ?');
      params.push(f.maxPrice * 100);
      filters.push(`.filter(al => al.price_cents <= ${f.maxPrice * 100})`);
    }
    if (f.inStock) {
      where.push('al.stock > 0');
      filters.push('.filter(al => al.stock > 0)');
    }

    const sort = SORTS[f.sort];
    const sql = `SELECT al.id, al.title, ar.name AS artist, al.genre, al.year, al.format,
       al.condition, al.price_cents, al.stock, al.rating, al.staff_pick, al.hue
FROM albums al
JOIN artists ar ON ar.id = al.artist_id${where.length ? '\nWHERE ' + where.join('\n  AND ') : ''}
ORDER BY ${sort.sql};`;

    const jsCode = `const result = albums
  .map(al => ({ ...al, artist: artists.find(ar => ar.id === al.artist_id).name }))${filters.map((l) => '\n  ' + l).join('')}
  .sort((a, b) => ${sort.js});`;

    return lab.query({ title: 'Browse catalog', sql, params, js: jsCode });
  }

  function queryAlbum(id) {
    return lab.query({
      title: `Album details (id ${id})`,
      sql: `SELECT al.*, ar.name AS artist, ar.country
FROM albums al
JOIN artists ar ON ar.id = al.artist_id
WHERE al.id = ?;`,
      params: [id],
      js: `const album = albums.find(al => al.id === ${id});
const artist = artists.find(ar => ar.id === album.artist_id);

const result = [{ ...album, artist: artist.name, country: artist.country }];`,
    })[0];
  }

  function queryRecommendations(album) {
    return lab.query({
      title: `"You might also like" for ${album.title}`,
      sql: `SELECT al.id, al.title, ar.name AS artist, al.price_cents, al.rating, al.hue
FROM albums al
JOIN artists ar ON ar.id = al.artist_id
WHERE al.genre = ? AND al.id != ?
ORDER BY al.rating DESC, al.id
LIMIT 4;`,
      params: [album.genre, album.id],
      js: `const result = albums
  .filter(al => al.genre === ${js(album.genre)} && al.id !== ${album.id})
  .sort((a, b) => b.rating - a.rating || a.id - b.id)
  .slice(0, 4)   // LIMIT 4
  .map(al => ({ ...al, artist: artists.find(ar => ar.id === al.artist_id).name }));`,
    });
  }

  function queryCart(quiet = true) {
    return lab.query({
      title: 'Cart contents',
      quiet,
      sql: `SELECT c.album_id, al.title, ar.name AS artist, al.price_cents, c.qty,
       al.price_cents * c.qty AS line_cents, al.stock, al.hue
FROM cart_items c
JOIN albums al ON al.id = c.album_id
JOIN artists ar ON ar.id = al.artist_id
ORDER BY al.title COLLATE NOCASE;`,
      js: `const result = cart_items
  .map(c => {
    const al = albums.find(a => a.id === c.album_id);
    const ar = artists.find(a => a.id === al.artist_id);
    return { ...c, title: al.title, artist: ar.name, price_cents: al.price_cents,
             line_cents: al.price_cents * c.qty, stock: al.stock, hue: al.hue };
  })
  .sort((a, b) => a.title.localeCompare(b.title));`,
    });
  }

  function queryCartTotals(quiet = true) {
    return lab.query({
      title: 'Cart totals',
      quiet,
      sql: `SELECT COUNT(*)                      AS lines,
       COALESCE(SUM(c.qty), 0)                AS items,
       COALESCE(SUM(c.qty * al.price_cents), 0) AS subtotal_cents
FROM cart_items c
JOIN albums al ON al.id = c.album_id;`,
      js: `const totals = cart_items.reduce((t, c) => {
  const al = albums.find(a => a.id === c.album_id);
  return {
    lines: t.lines + 1,
    items: t.items + c.qty,
    subtotal_cents: t.subtotal_cents + c.qty * al.price_cents,
  };
}, { lines: 0, items: 0, subtotal_cents: 0 });

const result = [totals];`,
    })[0];
  }

  // ---- insights (store owner dashboard)
  const INSIGHTS = {
    kpis: () => lab.query({
      title: 'Sales KPIs',
      sql: `SELECT COUNT(DISTINCT o.id) AS orders,
       SUM(oi.qty) AS units,
       SUM(oi.qty * oi.unit_cents) AS revenue_cents,
       ROUND(SUM(oi.qty * oi.unit_cents) * 1.0 / COUNT(DISTINCT o.id)) AS avg_order_cents
FROM orders o
JOIN order_items oi ON oi.order_id = o.id;`,
      js: `const revenue = order_items.reduce((sum, oi) => sum + oi.qty * oi.unit_cents, 0);
const units = order_items.reduce((sum, oi) => sum + oi.qty, 0);
const orderCount = new Set(order_items.map(oi => oi.order_id)).size;

const result = [{
  orders: orderCount,
  units,
  revenue_cents: revenue,
  avg_order_cents: Math.round(revenue / orderCount),
}];`,
    })[0],

    byGenre: () => lab.query({
      title: 'Revenue by genre',
      sql: `SELECT al.genre,
       SUM(oi.qty) AS units,
       SUM(oi.qty * oi.unit_cents) AS revenue_cents
FROM order_items oi
JOIN albums al ON al.id = oi.album_id
GROUP BY al.genre
ORDER BY revenue_cents DESC, al.genre;`,
      js: `const groups = order_items.reduce((acc, oi) => {
  const genre = albums.find(al => al.id === oi.album_id).genre;
  acc[genre] ??= { genre, units: 0, revenue_cents: 0 };
  acc[genre].units += oi.qty;
  acc[genre].revenue_cents += oi.qty * oi.unit_cents;
  return acc;
}, {});

const result = Object.values(groups)
  .sort((a, b) => b.revenue_cents - a.revenue_cents || a.genre.localeCompare(b.genre));`,
    }),

    bestSellers: () => lab.query({
      title: 'Top 5 best sellers',
      sql: `SELECT al.id, al.title, ar.name AS artist, SUM(oi.qty) AS units, al.hue
FROM order_items oi
JOIN albums al  ON al.id = oi.album_id
JOIN artists ar ON ar.id = al.artist_id
GROUP BY al.id
ORDER BY units DESC, al.title COLLATE NOCASE
LIMIT 5;`,
      js: `const unitsById = order_items.reduce((acc, oi) => {
  acc[oi.album_id] = (acc[oi.album_id] || 0) + oi.qty;
  return acc;
}, {});

const result = Object.entries(unitsById)
  .map(([id, units]) => {
    const al = albums.find(a => a.id === Number(id));
    const ar = artists.find(a => a.id === al.artist_id);
    return { id: al.id, title: al.title, artist: ar.name, units, hue: al.hue };
  })
  .sort((a, b) => b.units - a.units || a.title.localeCompare(b.title))
  .slice(0, 5);`,
    }),

    lowStock: () => lab.query({
      title: 'Low stock alert (2 or fewer)',
      sql: `SELECT al.id, al.title, ar.name AS artist, al.stock
FROM albums al
JOIN artists ar ON ar.id = al.artist_id
WHERE al.stock <= 2
ORDER BY al.stock, al.title COLLATE NOCASE;`,
      js: `const result = albums
  .filter(al => al.stock <= 2)
  .map(al => ({ id: al.id, title: al.title,
                artist: artists.find(ar => ar.id === al.artist_id).name, stock: al.stock }))
  .sort((a, b) => a.stock - b.stock || a.title.localeCompare(b.title));`,
    }),

    byDecade: () => lab.query({
      title: 'Catalog by decade',
      sql: `SELECT (year / 10) * 10 AS decade,
       COUNT(*) AS albums,
       ROUND(AVG(price_cents)) AS avg_price_cents
FROM albums
GROUP BY decade
ORDER BY decade;`,
      js: `const groups = albums.reduce((acc, al) => {
  const decade = Math.floor(al.year / 10) * 10;
  (acc[decade] ??= []).push(al);
  return acc;
}, {});

const result = Object.entries(groups)
  .map(([decade, list]) => ({
    decade: Number(decade),
    albums: list.length,
    avg_price_cents: Math.round(list.reduce((s, al) => s + al.price_cents, 0) / list.length),
  }))
  .sort((a, b) => a.decade - b.decade);`,
    }),

    recentOrders: () => lab.query({
      title: 'Recent orders',
      sql: `SELECT o.id, o.customer, o.created_at, o.status,
       SUM(oi.qty) AS items,
       SUM(oi.qty * oi.unit_cents) AS total_cents
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id
ORDER BY o.created_at DESC, o.id DESC
LIMIT 8;`,
      js: `const result = orders
  .map(o => {
    const items = order_items.filter(oi => oi.order_id === o.id);
    return {
      ...o,
      items: items.reduce((n, oi) => n + oi.qty, 0),
      total_cents: items.reduce((sum, oi) => sum + oi.qty * oi.unit_cents, 0),
    };
  })
  .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id)
  .slice(0, 8);`,
    }),
  };

  // ================================================================ writes

  function addToCart(album, qty = 1) {
    const inCart = lab.store.cart_items.find((c) => c.album_id === album.id);
    if ((inCart ? inCart.qty : 0) + qty > album.stock) {
      toast(`Sorry — only ${album.stock} in stock.`);
      return;
    }
    lab.mutate({
      title: `Add "${album.title}" to cart`,
      sql: `INSERT INTO cart_items (album_id, qty)
VALUES (?, ?)
ON CONFLICT (album_id) DO UPDATE SET qty = qty + excluded.qty`,
      params: [album.id, qty],
      js: `const existing = store.cart_items.find(c => c.album_id === ${album.id});

if (existing) existing.qty += ${qty};
else store.cart_items.push({ album_id: ${album.id}, qty: ${qty} });`,
    });
    toast(`Added <strong>${esc(album.title)}</strong> to your cart.`);
  }

  function setQty(item, qty) {
    if (qty <= 0) return removeFromCart(item);
    if (qty > item.stock) { toast(`Only ${item.stock} in stock.`); return; }
    lab.mutate({
      title: `Change quantity of "${item.title}" to ${qty}`,
      sql: 'UPDATE cart_items SET qty = ? WHERE album_id = ?',
      params: [qty, item.album_id],
      js: `store.cart_items.find(c => c.album_id === ${item.album_id}).qty = ${qty};`,
    });
  }

  function removeFromCart(item) {
    lab.mutate({
      title: `Remove "${item.title}" from cart`,
      sql: 'DELETE FROM cart_items WHERE album_id = ?',
      params: [item.album_id],
      js: `// filter() builds a new array without that item
store.cart_items = store.cart_items.filter(c => c.album_id !== ${item.album_id});`,
    });
  }

  function checkout(customer, email) {
    const createdAt = new Date().toISOString().slice(0, 19);
    const ok = lab.mutate({
      title: `Checkout for ${customer}`,
      steps: [
        { sql: 'BEGIN' },
        {
          sql: `INSERT INTO orders (id, customer, email, created_at, status)
VALUES ((SELECT MAX(id) + 1 FROM orders), ?, ?, ?, 'paid')`,
          params: [customer, email, createdAt],
        },
        {
          sql: `INSERT INTO order_items (order_id, album_id, qty, unit_cents)
SELECT (SELECT MAX(id) FROM orders), c.album_id, c.qty, al.price_cents
FROM cart_items c
JOIN albums al ON al.id = c.album_id`,
        },
        {
          sql: `UPDATE albums
SET stock = stock - (SELECT qty FROM cart_items WHERE album_id = albums.id)
WHERE id IN (SELECT album_id FROM cart_items)`,
        },
        { sql: 'DELETE FROM cart_items' },
        { sql: 'COMMIT' },
      ],
      js: `const orderId = Math.max(...orders.map(o => o.id)) + 1;

store.orders.push({ id: orderId, customer: ${js(customer)}, email: ${js(email)},
                    created_at: ${js(createdAt)}, status: 'paid' });

store.order_items.push(...cart_items.map(c => ({
  order_id: orderId,
  album_id: c.album_id,
  qty: c.qty,
  unit_cents: albums.find(al => al.id === c.album_id).price_cents,
})));

cart_items.forEach(c => { albums.find(al => al.id === c.album_id).stock -= c.qty; });

store.cart_items = [];`,
    });
    return ok ? lab.store.orders.reduce((max, o) => Math.max(max, o.id), 0) : null;
  }

  // ================================================================ rendering

  function cover(al, size = '') {
    const pattern = al.id % 5;
    return `<div class="cover cover-p${pattern} ${size}" style="--h:${al.hue}" aria-hidden="true">
      <span class="cover-artist">${esc(al.artist || '')}</span>
      <span class="cover-title">${esc(al.title)}</span>
    </div>`;
  }

  function stars(r) {
    const full = Math.round(r);
    return `<span class="stars" title="${r} out of 5">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span> <span class="rating-num">${r.toFixed(1)}</span>`;
  }

  function renderHero() {
    const picks = queryStaffPicks();
    const main = picks[0];
    if (!main) { $('#hero').innerHTML = ''; return; }
    $('#hero').innerHTML = `
      <div class="hero-copy">
        <p class="eyebrow">Staff pick of the week</p>
        <h1>${esc(main.title)}</h1>
        <p class="hero-artist">${esc(main.artist)} · ${main.year}</p>
        <p class="hero-blurb">Five minutes into side one and you'll know why this one never leaves the counter. Freshly pressed, 180&nbsp;g, and a steal at ${money(main.price_cents)}.</p>
        <div class="hero-actions">
          <button class="btn btn-primary" data-open="${main.id}">View record</button>
          <span class="hero-others">Also picked by staff: ${picks.slice(1).map((p) => `<a href="#" data-open="${p.id}">${esc(p.title)}</a>`).join(', ')}</span>
        </div>
      </div>
      <div class="hero-art">
        <div class="hero-record"></div>
        ${cover(main, 'cover-xl')}
      </div>`;
  }

  function renderFilters() {
    const genres = queryGenreCounts();
    const f = state.filters;
    $('#genre-list').innerHTML = genres.map((g) => `
      <label class="check">
        <input type="checkbox" value="${esc(g.genre)}" ${f.genres.includes(g.genre) ? 'checked' : ''}>
        <span>${esc(g.genre)}</span><span class="count">${g.albums}</span>
      </label>`).join('');
  }

  function renderCatalog() {
    const rows = queryCatalog();
    const f = state.filters;
    $('#result-count').textContent = `${rows.length} record${rows.length === 1 ? '' : 's'}`;
    const chips = [
      ...f.genres.map((g) => ({ label: g, clear: () => { f.genres = f.genres.filter((x) => x !== g); } })),
      ...(f.q.trim() ? [{ label: `“${f.q.trim()}”`, clear: () => { f.q = ''; $('#search').value = ''; } }] : []),
      ...(f.condition !== 'all' ? [{ label: f.condition, clear: () => { f.condition = 'all'; } }] : []),
      ...(f.maxPrice < 50 ? [{ label: `≤ $${f.maxPrice}`, clear: () => { f.maxPrice = 50; } }] : []),
      ...(f.inStock ? [{ label: 'In stock', clear: () => { f.inStock = false; } }] : []),
    ];
    $('#active-filters').innerHTML = chips.map((c, i) => `<button class="chip" data-chip="${i}">${esc(c.label)} ✕</button>`).join('');
    $$('#active-filters .chip').forEach((b) => b.addEventListener('click', () => { chips[b.dataset.chip].clear(); syncFilterInputs(); renderShop(); }));

    if (!rows.length) {
      $('#grid').innerHTML = `<div class="empty"><p>No records match those filters.</p><button class="btn" id="clear-all">Clear filters</button></div>`;
      $('#clear-all').addEventListener('click', clearFilters);
      return;
    }
    $('#grid').innerHTML = rows.map((al) => `
      <article class="card" data-open="${al.id}">
        <div class="card-art">
          ${cover(al)}
          ${al.staff_pick ? '<span class="badge badge-pick">Staff pick</span>' : ''}
          ${al.condition === 'Used' ? '<span class="badge badge-used">Used · VG+</span>' : ''}
        </div>
        <div class="card-body">
          <h3 class="card-title">${esc(al.title)}</h3>
          <p class="card-artist">${esc(al.artist)}</p>
          <p class="card-meta">${al.year} · ${esc(al.format)} · ${esc(al.genre)}</p>
          <p class="card-rating">${stars(al.rating)}</p>
          <div class="card-foot">
            <span class="price">${money(al.price_cents)}</span>
            ${al.stock > 0
              ? `<button class="btn btn-small btn-primary" data-add="${al.id}">Add to cart</button>`
              : '<span class="sold-out">Sold out</span>'}
          </div>
          ${al.stock > 0 && al.stock <= 2 ? `<p class="low">Only ${al.stock} left</p>` : ''}
        </div>
      </article>`).join('');
    catalogById = Object.fromEntries(rows.map((r) => [r.id, r]));
  }
  let catalogById = {};

  function renderCartBadge() {
    const t = queryCartTotals(true);
    $('#cart-count').textContent = t.items;
    $('#cart-count').hidden = t.items === 0;
  }

  function renderCart(headline = false) {
    const items = queryCart(true);
    const t = queryCartTotals(!headline);
    const shipping = t.subtotal_cents >= FREE_SHIPPING_CENTS || t.items === 0 ? 0 : SHIPPING_CENTS;
    const tax = Math.round((t.subtotal_cents + shipping) * TAX_RATE);
    const total = t.subtotal_cents + shipping + tax;
    const toFree = FREE_SHIPPING_CENTS - t.subtotal_cents;

    $('#cart-body').innerHTML = items.length ? `
      ${toFree > 0 ? `<div class="ship-meter"><p>You're <strong>${money(toFree)}</strong> away from free shipping.</p><div class="bar"><span style="width:${Math.min(100, (t.subtotal_cents / FREE_SHIPPING_CENTS) * 100)}%"></span></div></div>`
        : '<div class="ship-meter ok"><p>🎉 You\'ve unlocked <strong>free shipping</strong>.</p></div>'}
      <ul class="cart-list">
        ${items.map((it) => `
          <li class="cart-item" data-id="${it.album_id}">
            ${cover({ ...it, id: it.album_id }, 'cover-sm')}
            <div class="cart-info">
              <strong>${esc(it.title)}</strong>
              <span>${esc(it.artist)}</span>
              <div class="qty">
                <button data-qty="-1" aria-label="Decrease">−</button>
                <span>${it.qty}</span>
                <button data-qty="1" aria-label="Increase">+</button>
                <button class="link" data-remove>Remove</button>
              </div>
            </div>
            <span class="line">${money(it.line_cents)}</span>
          </li>`).join('')}
      </ul>` : '<div class="cart-empty"><p>Your cart is empty.</p><p class="muted">Nothing spins like a fresh record. Go dig.</p></div>';

    $('#cart-foot').innerHTML = items.length ? `
      <dl class="totals">
        <dt>Subtotal (${t.items} item${t.items === 1 ? '' : 's'})</dt><dd>${money(t.subtotal_cents)}</dd>
        <dt>Shipping</dt><dd>${shipping ? money(shipping) : 'Free'}</dd>
        <dt>HST (15%)</dt><dd>${money(tax)}</dd>
        <dt class="grand">Total</dt><dd class="grand">${money(total)}</dd>
      </dl>
      <button class="btn btn-primary btn-block" id="to-checkout">Checkout</button>` : '';

    $$('#cart-body .cart-item').forEach((li) => {
      const item = items.find((i) => i.album_id === Number(li.dataset.id));
      $$('[data-qty]', li).forEach((b) => b.addEventListener('click', () => setQty(item, item.qty + Number(b.dataset.qty))));
      $('[data-remove]', li).addEventListener('click', () => removeFromCart(item));
    });
    const btn = $('#to-checkout');
    if (btn) btn.addEventListener('click', () => openCheckout(total));
  }

  function renderInsights() {
    const k = INSIGHTS.kpis();
    const genres = INSIGHTS.byGenre();
    const best = INSIGHTS.bestSellers();
    const low = INSIGHTS.lowStock();
    const decades = INSIGHTS.byDecade();
    const recent = INSIGHTS.recentOrders();
    const maxRev = Math.max(1, ...genres.map((g) => g.revenue_cents));
    const maxDec = Math.max(1, ...decades.map((d) => d.albums));

    const card = (key, title, body, extra = '') => `
      <section class="panel ${extra}">
        <header><h3>${title}</h3><button class="peek" data-peek="${key}" title="Show the SQL and JS behind this card">&lt;/&gt;</button></header>
        ${body}
      </section>`;

    $('#insights').innerHTML = `
      <div class="insights-head">
        <div><p class="eyebrow">Back office</p><h1>Store insights</h1></div>
        <p class="muted">Every number here is a GROUP BY / SUM in SQL — or a <code>reduce()</code> in JavaScript. Click <code>&lt;/&gt;</code> on any card.</p>
      </div>
      ${card('kpis', 'At a glance', `
        <div class="kpis">
          <div><span>Revenue</span><strong>${money(k.revenue_cents)}</strong></div>
          <div><span>Orders</span><strong>${k.orders}</strong></div>
          <div><span>Records sold</span><strong>${k.units}</strong></div>
          <div><span>Avg. order</span><strong>${money(k.avg_order_cents)}</strong></div>
        </div>`, 'span-2')}
      ${card('byGenre', 'Revenue by genre', `
        <ul class="bars">${genres.map((g) => `
          <li><span class="bar-label">${esc(g.genre)}</span>
          <span class="bar"><span style="width:${(g.revenue_cents / maxRev) * 100}%"></span></span>
          <span class="bar-val">${money(g.revenue_cents)}</span></li>`).join('')}</ul>`)}
      ${card('bestSellers', 'Best sellers', `
        <ol class="best">${best.map((b) => `
          <li>${cover(b, 'cover-xs')}<div><strong>${esc(b.title)}</strong><span>${esc(b.artist)}</span></div><em>${b.units} sold</em></li>`).join('')}</ol>`)}
      ${card('lowStock', 'Low stock', low.length ? `
        <ul class="low-list">${low.map((l) => `
          <li><span>${esc(l.title)} <small>${esc(l.artist)}</small></span><span class="pill ${l.stock === 0 ? 'pill-red' : 'pill-amber'}">${l.stock === 0 ? 'Sold out' : l.stock + ' left'}</span></li>`).join('')}</ul>` : '<p class="muted">All good.</p>')}
      ${card('byDecade', 'Catalog by decade', `
        <div class="cols">${decades.map((d) => `
          <div class="col"><span class="col-bar" style="height:${(d.albums / maxDec) * 100}%"><em>${d.albums}</em></span><span class="col-label">${d.decade}s</span><span class="col-sub">avg ${money(d.avg_price_cents)}</span></div>`).join('')}</div>`)}
      ${card('recentOrders', 'Recent orders', `
        <div class="table-wrap"><table class="orders">
          <thead><tr><th>#</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>${recent.map((o) => `
            <tr><td>${o.id}</td><td>${esc(o.customer)}</td><td>${new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
            <td>${o.items}</td><td>${money(o.total_cents)}</td><td><span class="pill ${o.status === 'paid' ? 'pill-amber' : 'pill-green'}">${esc(o.status)}</span></td></tr>`).join('')}
          </tbody></table></div>`, 'span-2')}`;

    $$('#insights [data-peek]').forEach((b) => b.addEventListener('click', () => {
      INSIGHTS[b.dataset.peek]();
      lab.openPanel();
    }));
  }

  function renderShop() {
    renderCatalog();
  }

  function renderAll() {
    renderCartBadge();
    if (state.view === 'shop') {
      renderHero();
      renderFilters();
      renderShop();
    } else {
      renderInsights();
    }
    if (!$('#cart').hidden) renderCart();
  }

  // ================================================================ modal / drawer

  function openAlbum(id) {
    const al = queryAlbum(id);
    if (!al) return;
    const recs = queryRecommendations(al);
    $('#modal-body').innerHTML = `
      <div class="detail">
        <div class="detail-art">${cover(al, 'cover-lg')}</div>
        <div class="detail-info">
          <p class="eyebrow">${esc(al.genre)} · ${al.year}</p>
          <h2>${esc(al.title)}</h2>
          <p class="detail-artist">${esc(al.artist)} <span class="muted">(${esc(al.country)})</span></p>
          <p>${stars(al.rating)}</p>
          <dl class="specs">
            <dt>Format</dt><dd>${esc(al.format)}, 33⅓ RPM</dd>
            <dt>Condition</dt><dd>${al.condition === 'Used' ? 'Used — Very Good Plus (VG+), cleaned & sleeved' : 'New, factory sealed'}</dd>
            <dt>Availability</dt><dd>${al.stock > 0 ? `${al.stock} in stock — ships in 1–2 business days` : 'Sold out — check back soon'}</dd>
          </dl>
          <div class="detail-buy">
            <span class="price price-lg">${money(al.price_cents)}</span>
            ${al.stock > 0 ? `<button class="btn btn-primary" data-add="${al.id}">Add to cart</button>` : '<button class="btn" disabled>Sold out</button>'}
          </div>
        </div>
      </div>
      ${recs.length ? `<h3 class="recs-title">You might also like</h3>
      <div class="recs">${recs.map((r) => `
        <button class="rec" data-open="${r.id}">${cover(r, 'cover-sm')}<strong>${esc(r.title)}</strong><span>${esc(r.artist)}</span><span class="price">${money(r.price_cents)}</span></button>`).join('')}</div>` : ''}`;
    catalogById[al.id] = al;
    $('#modal').hidden = false;
    document.body.classList.add('no-scroll');
  }

  function closeModal() {
    $('#modal').hidden = true;
    document.body.classList.remove('no-scroll');
  }

  function openCart() {
    $('#cart').hidden = false;
    $('#scrim').hidden = false;
    renderCart(true);
  }

  function closeCart() {
    $('#cart').hidden = true;
    $('#scrim').hidden = true;
  }

  function openCheckout(total) {
    $('#cart-foot').innerHTML = `
      <form class="checkout" id="checkout-form">
        <h3>Checkout</h3>
        <label>Full name<input name="name" required autocomplete="name" placeholder="Jane Doe"></label>
        <label>Email<input name="email" type="email" required autocomplete="email" placeholder="jane@example.com"></label>
        <label>Card number<input name="card" inputmode="numeric" placeholder="4242 4242 4242 4242 (demo — not stored)"></label>
        <button class="btn btn-primary btn-block">Pay ${money(total)}</button>
        <button type="button" class="link" id="cancel-checkout">Back to cart</button>
      </form>`;
    $('#cancel-checkout').addEventListener('click', () => renderCart());
    $('#checkout-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      const id = checkout(String(data.get('name')).trim(), String(data.get('email')).trim());
      if (!id) { toast('Something went wrong — see the Under the Hood panel.'); return; }
      $('#cart-body').innerHTML = `<div class="cart-empty"><p class="big">Thanks, ${esc(String(data.get('name')).split(' ')[0])}! 🎶</p><p>Order <strong>#${id}</strong> is confirmed.</p><p class="muted">Peek at the Insights page — your order is already in the numbers.</p></div>`;
      $('#cart-foot').innerHTML = '';
    });
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

  function syncFilterInputs() {
    const f = state.filters;
    $$('#genre-list input').forEach((i) => { i.checked = f.genres.includes(i.value); });
    $$('input[name="condition"]').forEach((i) => { i.checked = i.value === f.condition; });
    $('#price').value = f.maxPrice;
    $('#price-out').textContent = f.maxPrice >= 50 ? 'Any' : `$${f.maxPrice}`;
    $('#in-stock').checked = f.inStock;
    $('#sort').value = f.sort;
  }

  function clearFilters() {
    Object.assign(state.filters, { q: '', genres: [], condition: 'all', maxPrice: 50, inStock: false });
    $('#search').value = '';
    syncFilterInputs();
    renderShop();
  }

  function setView(view) {
    state.view = view;
    $('#shop').hidden = view !== 'shop';
    $('#insights').hidden = view !== 'insights';
    $$('[data-view]').forEach((a) => a.classList.toggle('on', a.dataset.view === view));
    renderAll();
    window.scrollTo(0, 0);
  }

  $('#sort').innerHTML = Object.entries(SORTS).map(([k, s]) => `<option value="${k}">${s.label}</option>`).join('');

  let searchTimer;
  $('#search').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.filters.q = e.target.value;
      if (state.view !== 'shop') setView('shop');
      else renderShop();
    }, 200);
  });
  $('#search-form').addEventListener('submit', (e) => e.preventDefault());

  $('#genre-list').addEventListener('change', () => {
    state.filters.genres = $$('#genre-list input:checked').map((i) => i.value);
    renderShop();
  });
  $$('input[name="condition"]').forEach((i) => i.addEventListener('change', () => { state.filters.condition = i.value; renderShop(); }));
  $('#price').addEventListener('input', (e) => {
    state.filters.maxPrice = Number(e.target.value);
    $('#price-out').textContent = state.filters.maxPrice >= 50 ? 'Any' : `$${state.filters.maxPrice}`;
    renderShop();
  });
  $('#in-stock').addEventListener('change', (e) => { state.filters.inStock = e.target.checked; renderShop(); });
  $('#sort').addEventListener('change', (e) => { state.filters.sort = e.target.value; renderShop(); });
  $('#clear-filters').addEventListener('click', clearFilters);

  // One delegated click handler for "open album" and "add to cart" buttons.
  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      e.stopPropagation();
      const id = Number(add.dataset.add);
      const al = catalogById[id] || queryAlbum(id);
      addToCart(al);
      return;
    }
    const open = e.target.closest('[data-open]');
    if (open) { e.preventDefault(); openAlbum(Number(open.dataset.open)); return; }
    const view = e.target.closest('[data-view]');
    if (view) { e.preventDefault(); setView(view.dataset.view); }
  });

  $('#cart-btn').addEventListener('click', openCart);
  $('#cart-close').addEventListener('click', closeCart);
  $('#scrim').addEventListener('click', closeCart);
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' || e.target.closest('.modal-close')) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); closeCart(); }
  });

  // Re-render whenever data changes or the engine switch flips.
  lab.onChange(renderAll);

  syncFilterInputs();
  setView('shop');
  document.body.classList.remove('loading');
})().catch((err) => {
  console.error(err);
  document.body.classList.remove('loading');
  document.body.insertAdjacentHTML('afterbegin', `<pre style="padding:1rem;color:#b00">Could not start: ${err.message}</pre>`);
});
