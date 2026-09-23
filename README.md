# Teaching Apps

Small, self-contained apps for teaching programming. Each one runs with no install step.

| App | Topic | Runs in |
| --- | --- | --- |
| [SQL ↔ Array Methods Lab](#sql--array-methods-lab) (`vinyl-shop/`, `game-shop/`) | SQL vs JS `filter`/`map`/`sort`/`reduce` | Browser |
| [The Fog on the Humber](fog-on-the-humber/README.md) (`fog-on-the-humber/`) | Python `if` statements | Terminal (Python 3) |
| [Python Skills](python-skills/README.md) (`python-skills/`) | Strings, numbers, loops, lists, functions, dictionaries, errors, files: 8 small programs | Terminal (Python 3) |

All people's names in the sample data are made up.

---

# SQL ↔ Array Methods Lab

Two front-end storefronts built for teaching. Every piece of data on the page comes
from **two versions of the same logic**:

| SQL (SQLite in the browser via sql.js) | JavaScript array methods |
| --- | --- |
| `WHERE genre = 'Jazz'` | `.filter(al => al.genre === 'Jazz')` |
| `SELECT title, price_cents` | `.map(al => ({ title: al.title, price_cents: al.price_cents }))` |
| `ORDER BY price_cents DESC` | `.sort((a, b) => b.price_cents - a.price_cents)` |
| `SUM(qty * price_cents)` / `GROUP BY` | `.reduce((sum, c) => sum + c.qty * c.price_cents, 0)` |
| `LIMIT 4` | `.slice(0, 4)` |
| `JOIN artists ON …` | `.map(al => ({ ...al, artist: artists.find(…) }))` |
| `EXISTS (…)` / `DISTINCT` | `.some(…)` / `new Set(…)` |

Both versions always run. The **Under the hood** panel (bottom-left button, or press <kbd>`</kbd>)
shows the SQL and the JS side by side with syntax highlighting, times both, and checks that
they returned the same rows. The **SQL / JS arrays** switch picks which result the page
renders. Flip it and the store should look exactly the same.

## The apps

- **`vinyl-shop/`: Needle & Groove Records.** A record store with search, genre/condition/price
  filters, sorting, product pages with "you might also like", a cart (UPSERT, UPDATE, DELETE),
  checkout as a SQL transaction, and a back-office **Insights** dashboard (GROUP BY, SUM, AVG, LIMIT).
- **`game-shop/`: Meeple & Co. Board Games.** A "game night finder" (players + time → top 3),
  a catalog with category/complexity/mechanic filters, reviews you can post (watch the average change),
  a wishlist summary (SUM/MIN/MAX in one query), and a leaderboard (HAVING).

Both have:

- **Playground tab**: nine paired SQL/JS exercises per store. Edit and run either side.
- **Schema tab**: tables, columns, row counts, **Download .sqlite**, **Reset database**.
- **Log tab**: every query the page has run. Click one to see it again.
- `window.lab` in the DevTools console: `lab.store.albums`, `lab.db.exec("SELECT …")`.

## Running it

No build step and no install. It's static files.

```bash
# Option 1: just open it
xdg-open teaching-apps/index.html        # Fedora/KDE: opens in your default browser

# Option 2: serve it (closer to a real site)
python3 -m http.server 8000 -d teaching-apps
# then visit http://localhost:8000
```

sql.js is vendored in `shared/vendor/sql-asm.js` (the pure-JS build, so it also works from
`file://` with no network). Fonts come from Google Fonts and fall back to system fonts when offline.

Changes (cart, orders, reviews) are saved to `localStorage` as a SQLite file, so they
survive a reload. Use **Schema → Reset database** to start fresh.

To inspect the database with a real tool: **Schema → Download .sqlite**, then
`sudo dnf install sqlitebrowser` (DB Browser for SQLite) or `sqlite3 needle-and-groove.sqlite`.

## How it's built

```
teaching-apps/
├── index.html            launcher
├── shared/
│   ├── lab.js            the Lab: runs SQL + JS, compares, renders the panel
│   ├── lab.css           panel theme (same burnt-orange palette as the attendance app)
│   ├── highlight.js      tiny SQL + JS syntax highlighter (array methods get their own colours)
│   └── vendor/sql-asm.js sql.js 1.10.3 (MIT)
├── vinyl-shop/           index.html · style.css · data.js (schema + seed + exercises) · app.js
├── game-shop/            same layout
├── fog-on-the-humber/    Python text adventure (see its own README)
└── python-skills/        8 small Python programs, one skill each (see its own README)
```

Every query in `app.js` looks like this:

```js
lab.query({
  title: 'Low stock alert',
  sql: `SELECT title, stock FROM albums WHERE stock <= ? ORDER BY stock`,
  params: [2],
  js: `const result = albums
  .filter(al => al.stock <= 2)
  .sort((a, b) => a.stock - b.stock);`,
});
```

- In `js`, every table is an array variable (`albums`, `artists`, …) and `store` is the whole
  in-memory store. Reads assign `const result = …`. Writes change `store.<table>`.
- `lab.mutate({ title, sql, params, js })` runs a write on both sides. Pass `steps: [...]` for
  several statements, like the checkout transaction.
- Money is stored as **integer cents** (`2999` = $29.99). This is a deliberate lesson: floats and money don't mix.

## Classroom ideas

1. Apply one filter at a time and match each `WHERE` condition to its `.filter()` line.
2. Why does the JS catalog `.map()` in the artist name **before** filtering? (Because the search
   checks `al.artist`.) What does the SQL `JOIN` do instead?
3. `.sort()` mutates. Find the place in the playground exercises where that bites (#5) and fix it with `toSorted()`.
4. Run vinyl-shop playground exercise 9 (JS only), then flip the engine. The page now disagrees with itself.
   Talk about "one source of truth", and why real apps put the database behind an API.
5. Add a feature to either store with a SQL version and a JS version, e.g. "only show albums from the 70s",
   "games for ages 8+", or "orders over $50".

## More storefront ideas (not built yet)

- **Concert tickets**: venues, sections, seats. Seat maps are a great `GROUP BY section` / `.reduce` exercise,
  and "best available seats" is a nice `ORDER BY … LIMIT`.
- **Bike / ski rental**: bookings with start/end dates. "Available this weekend" teaches date-overlap
  `WHERE` clauses, and the JS version uses `.some()`.
- **Food truck ordering**: menu items with modifiers (extra cheese +$1). Line totals use `reduce` over nested arrays
  (`flatMap`), plus a kitchen queue sorted by time.
- **Used car marketplace**: lots of numeric range filters (year, km, price) and saved searches.
