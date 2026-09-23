/* Needle & Groove — schema, sample data and playground exercises.
 * Plain strings so the app works when opened straight from disk (file://).
 */

window.VINYL_SCHEMA = `
CREATE TABLE artists (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  country  TEXT NOT NULL            -- ISO code: US, UK, CA ...
);

CREATE TABLE albums (
  id          INTEGER PRIMARY KEY,
  title       TEXT    NOT NULL,
  artist_id   INTEGER NOT NULL REFERENCES artists(id),
  genre       TEXT    NOT NULL,
  year        INTEGER NOT NULL,
  format      TEXT    NOT NULL,     -- LP, 2LP
  condition   TEXT    NOT NULL,     -- New, Used
  price_cents INTEGER NOT NULL,     -- money as whole cents: 2999 = $29.99
  stock       INTEGER NOT NULL,
  rating      REAL    NOT NULL,     -- average customer rating, 1-5
  staff_pick  INTEGER NOT NULL DEFAULT 0,
  hue         INTEGER NOT NULL      -- colour for the generated cover art
);

CREATE TABLE cart_items (
  album_id  INTEGER PRIMARY KEY REFERENCES albums(id),
  qty       INTEGER NOT NULL CHECK (qty > 0)
);

CREATE TABLE orders (
  id          INTEGER PRIMARY KEY,
  customer    TEXT NOT NULL,
  email       TEXT NOT NULL,
  created_at  TEXT NOT NULL,        -- ISO 8601
  status      TEXT NOT NULL
);

CREATE TABLE order_items (
  order_id    INTEGER NOT NULL REFERENCES orders(id),
  album_id    INTEGER NOT NULL REFERENCES albums(id),
  qty         INTEGER NOT NULL,
  unit_cents  INTEGER NOT NULL,     -- price at time of sale
  PRIMARY KEY (order_id, album_id)
);
`;

window.VINYL_SEED = `
INSERT INTO artists (id, name, country) VALUES
  (1, 'Miles Davis', 'US'), (2, 'John Coltrane', 'US'), (3, 'Nina Simone', 'US'),
  (4, 'Fleetwood Mac', 'UK'), (5, 'Pink Floyd', 'UK'), (6, 'Radiohead', 'UK'),
  (7, 'Kendrick Lamar', 'US'), (8, 'Daft Punk', 'FR'), (9, 'Joni Mitchell', 'CA'),
  (10, 'Marvin Gaye', 'US'), (11, 'Aretha Franklin', 'US'), (12, 'The Beatles', 'UK'),
  (13, 'Bob Dylan', 'US'), (14, 'Stevie Wonder', 'US'), (15, 'Lauryn Hill', 'US'),
  (16, 'Portishead', 'UK'), (17, 'Kraftwerk', 'DE'), (18, 'Led Zeppelin', 'UK'),
  (19, 'Black Sabbath', 'UK'), (20, 'Leonard Cohen', 'CA'), (21, 'Tame Impala', 'AU'),
  (22, 'Amy Winehouse', 'UK'), (23, 'A Tribe Called Quest', 'US'), (24, 'Herbie Hancock', 'US'),
  (25, 'Massive Attack', 'UK'), (26, 'Neil Young', 'CA'), (27, 'Taylor Swift', 'US'),
  (28, 'Arcade Fire', 'CA'), (29, 'The Tragically Hip', 'CA'), (30, 'Great Big Sea', 'CA');

INSERT INTO albums (id, title, artist_id, genre, year, format, condition, price_cents, stock, rating, staff_pick, hue) VALUES
  (1,  'Kind of Blue',                    1,  'Jazz',       1959, 'LP',  'New',  2999, 8,  4.9, 1, 212),
  (2,  'A Love Supreme',                  2,  'Jazz',       1965, 'LP',  'New',  2799, 5,  4.8, 0, 28),
  (3,  'Blue Train',                      2,  'Jazz',       1957, 'LP',  'Used', 1899, 2,  4.6, 0, 198),
  (4,  'I Put a Spell on You',            3,  'Soul',       1965, 'LP',  'Used', 2199, 1,  4.5, 0, 330),
  (5,  'Rumours',                         4,  'Rock',       1977, 'LP',  'New',  2899, 12, 4.8, 0, 36),
  (6,  'The Dark Side of the Moon',       5,  'Rock',       1973, 'LP',  'New',  3499, 6,  4.9, 1, 265),
  (7,  'Wish You Were Here',              5,  'Rock',       1975, 'LP',  'Used', 2299, 0,  4.7, 0, 15),
  (8,  'OK Computer',                     6,  'Rock',       1997, '2LP', 'New',  3899, 4,  4.8, 0, 190),
  (9,  'In Rainbows',                     6,  'Rock',       2007, 'LP',  'New',  2699, 7,  4.7, 0, 300),
  (10, 'To Pimp a Butterfly',             7,  'Hip-Hop',    2015, '2LP', 'New',  3999, 3,  4.8, 1, 45),
  (11, 'DAMN.',                           7,  'Hip-Hop',    2017, 'LP',  'New',  2999, 5,  4.5, 0, 0),
  (12, 'Random Access Memories',          8,  'Electronic', 2013, '2LP', 'New',  4299, 2,  4.6, 0, 50),
  (13, 'Discovery',                       8,  'Electronic', 2001, '2LP', 'Used', 3199, 1,  4.7, 0, 280),
  (14, 'Blue',                            9,  'Folk',       1971, 'LP',  'New',  2599, 6,  4.9, 1, 205),
  (15, 'Court and Spark',                 9,  'Folk',       1974, 'LP',  'Used', 1599, 3,  4.5, 0, 150),
  (16, 'What''s Going On',                10, 'Soul',       1971, 'LP',  'New',  2799, 9,  4.9, 0, 175),
  (17, 'Lady Soul',                       11, 'Soul',       1968, 'LP',  'Used', 1799, 2,  4.6, 0, 350),
  (18, 'Abbey Road',                      12, 'Rock',       1969, 'LP',  'New',  3199, 10, 4.8, 0, 120),
  (19, 'Revolver',                        12, 'Rock',       1966, 'LP',  'Used', 2499, 0,  4.7, 0, 0),
  (20, 'Blood on the Tracks',             13, 'Folk',       1975, 'LP',  'New',  2699, 4,  4.7, 0, 20),
  (21, 'Songs in the Key of Life',        14, 'Soul',       1976, '2LP', 'New',  4499, 3,  4.9, 0, 40),
  (22, 'The Miseducation of Lauryn Hill', 15, 'Hip-Hop',    1998, '2LP', 'New',  3599, 5,  4.8, 0, 32),
  (23, 'Dummy',                           16, 'Electronic', 1994, 'LP',  'New',  2899, 4,  4.6, 0, 185),
  (24, 'Computer World',                  17, 'Electronic', 1981, 'LP',  'Used', 2099, 2,  4.4, 0, 60),
  (25, 'Led Zeppelin IV',                 18, 'Rock',       1971, 'LP',  'Used', 2699, 3,  4.8, 0, 30),
  (26, 'Paranoid',                        19, 'Metal',      1970, 'LP',  'New',  2599, 6,  4.6, 0, 290),
  (27, 'Songs of Love and Hate',          20, 'Folk',       1971, 'LP',  'Used', 1699, 1,  4.4, 0, 25),
  (28, 'Currents',                        21, 'Rock',       2015, '2LP', 'New',  3799, 5,  4.5, 0, 320),
  (29, 'Back to Black',                   22, 'Soul',       2006, 'LP',  'New',  2799, 11, 4.7, 0, 0),
  (30, 'The Low End Theory',              23, 'Hip-Hop',    1991, 'LP',  'Used', 2399, 2,  4.7, 0, 140),
  (31, 'Head Hunters',                    24, 'Jazz',       1973, 'LP',  'New',  2699, 3,  4.6, 0, 55),
  (32, 'Mezzanine',                       25, 'Electronic', 1998, '2LP', 'New',  3299, 0,  4.7, 0, 230),
  (33, 'Harvest',                         26, 'Folk',       1972, 'LP',  'New',  2799, 7,  4.7, 0, 42),
  (34, 'Folklore',                        27, 'Pop',        2020, '2LP', 'New',  3999, 9,  4.4, 0, 90),
  (35, 'Funeral',                         28, 'Rock',       2004, 'LP',  'Used', 1999, 2,  4.6, 0, 10),
  (36, 'Fully Completely',                29, 'Rock',       1992, 'LP',  'Used', 1899, 3,  4.5, 0, 160),
  (37, 'Up',                              30, 'Folk',       1995, 'LP',  'Used', 1499, 4,  4.3, 1, 195),
  (38, '1989',                            27, 'Pop',        2014, 'LP',  'New',  3299, 6,  4.3, 0, 200),
  (39, 'Master of Reality',               19, 'Metal',      1971, 'LP',  'Used', 2199, 1,  4.5, 0, 270);

INSERT INTO orders (id, customer, email, created_at, status) VALUES
  (1001, 'Marlow Finch',      'marlow@example.com',  '2026-08-02T14:21:00', 'shipped'),
  (1002, 'Tobias Wren',       'tobias@example.com',  '2026-08-05T09:03:00', 'shipped'),
  (1003, 'Juniper Hale',      'juniper@example.com', '2026-08-11T19:47:00', 'shipped'),
  (1004, 'Odette Marsh',      'odette@example.com',  '2026-08-18T12:30:00', 'shipped'),
  (1005, 'Casper Lindqvist',  'casper@example.com',  '2026-08-24T16:10:00', 'shipped'),
  (1006, 'Hazel Quinlan',     'hazel@example.com',   '2026-09-01T10:55:00', 'shipped'),
  (1007, 'Rowan Beckett',     'rowan@example.com',   '2026-09-06T21:14:00', 'shipped'),
  (1008, 'Idris Fairweather', 'idris@example.com',   '2026-09-12T13:02:00', 'paid'),
  (1009, 'Ada Calloway',      'ada@example.com',     '2026-09-17T08:40:00', 'paid'),
  (1010, 'Soren Achebe-Ward', 'soren@example.com',   '2026-09-20T17:25:00', 'paid');

INSERT INTO order_items (order_id, album_id, qty, unit_cents) VALUES
  (1001, 1, 1, 2999), (1001, 14, 1, 2599),
  (1002, 6, 2, 3499),
  (1003, 10, 1, 3999), (1003, 22, 1, 3599), (1003, 30, 1, 2399),
  (1004, 37, 3, 1499), (1004, 36, 1, 1899),
  (1005, 5, 1, 2899), (1005, 18, 1, 3199),
  (1006, 29, 2, 2799), (1006, 16, 1, 2799),
  (1007, 12, 1, 4299), (1007, 23, 1, 2899), (1007, 6, 1, 3499),
  (1008, 1, 1, 2999), (1008, 2, 1, 2799), (1008, 31, 1, 2699),
  (1009, 34, 1, 3999), (1009, 38, 1, 3299),
  (1010, 26, 1, 2599), (1010, 5, 1, 2899), (1010, 37, 1, 1499);

INSERT INTO cart_items (album_id, qty) VALUES (14, 1);
`;

/* Playground exercises: each pairs a SQL query with the equivalent JS. */
window.VINYL_EXAMPLES = [
  {
    label: '1 · filter + sort + map — Jazz under $28',
    hint: 'WHERE is .filter(), ORDER BY is .sort(), picking columns is .map().',
    sql: `SELECT title, price_cents
FROM albums
WHERE genre = 'Jazz' AND price_cents < 2800
ORDER BY price_cents;`,
    js: `albums
  .filter(a => a.genre === 'Jazz' && a.price_cents < 2800)
  .sort((a, b) => a.price_cents - b.price_cents)
  .map(a => ({ title: a.title, price_cents: a.price_cents }))`,
  },
  {
    label: '2 · map — just the titles',
    hint: 'SQL always gives rows back; .map() can give you a plain array of strings.',
    sql: `SELECT title FROM albums;`,
    js: `albums.map(a => a.title)`,
  },
  {
    label: '3 · reduce — total inventory value',
    hint: 'SUM() is a reduce that starts at 0 and adds each row.',
    sql: `SELECT SUM(price_cents * stock) AS value_cents
FROM albums;`,
    js: `albums.reduce((sum, a) => sum + a.price_cents * a.stock, 0)`,
  },
  {
    label: '4 · reduce — count per genre (GROUP BY)',
    hint: 'GROUP BY is a reduce into an object keyed by the group.',
    sql: `SELECT genre, COUNT(*) AS n
FROM albums
GROUP BY genre
ORDER BY n DESC, genre;`,
    js: `const counts = albums.reduce((acc, a) => {
  acc[a.genre] = (acc[a.genre] || 0) + 1;
  return acc;
}, {});

const result = Object.entries(counts)
  .map(([genre, n]) => ({ genre, n }))
  .sort((a, b) => b.n - a.n || a.genre.localeCompare(b.genre));`,
  },
  {
    label: '5 · sort + slice — three oldest records (LIMIT)',
    hint: 'Careful: .sort() changes the original array! Copy first with [...albums] or use .toSorted().',
    sql: `SELECT title, year
FROM albums
ORDER BY year
LIMIT 3;`,
    js: `[...albums]
  .sort((a, b) => a.year - b.year)
  .slice(0, 3)
  .map(a => ({ title: a.title, year: a.year }))`,
  },
  {
    label: '6 · JOIN — albums by Canadian artists',
    hint: 'A JOIN in JS is usually .map() + .find() (or build a lookup object first).',
    sql: `SELECT al.title, ar.name AS artist
FROM albums al
JOIN artists ar ON ar.id = al.artist_id
WHERE ar.country = 'CA'
ORDER BY ar.name;`,
    js: `albums
  .map(al => ({ title: al.title, artist: artists.find(ar => ar.id === al.artist_id) }))
  .filter(row => row.artist.country === 'CA')
  .map(row => ({ title: row.title, artist: row.artist.name }))
  .sort((a, b) => a.artist.localeCompare(b.artist))`,
  },
  {
    label: '7 · some / every — anything out of stock?',
    hint: 'EXISTS ≈ .some(). Try changing it to .every(a => a.stock > 0).',
    sql: `SELECT EXISTS (SELECT 1 FROM albums WHERE stock = 0) AS any_out;`,
    js: `albums.some(a => a.stock === 0)`,
  },
  {
    label: '8 · HAVING — artists with 2+ albums',
    hint: 'HAVING filters groups after GROUP BY: reduce first, then filter.',
    sql: `SELECT ar.name, COUNT(*) AS albums
FROM albums al
JOIN artists ar ON ar.id = al.artist_id
GROUP BY ar.id
HAVING COUNT(*) >= 2
ORDER BY albums DESC, ar.name;`,
    js: `const byArtist = albums.reduce((acc, al) => {
  acc[al.artist_id] = (acc[al.artist_id] || 0) + 1;
  return acc;
}, {});

const result = Object.entries(byArtist)
  .filter(([, n]) => n >= 2)
  .map(([id, n]) => ({ name: artists.find(ar => ar.id === Number(id)).name, albums: n }))
  .sort((a, b) => b.albums - a.albums || a.name.localeCompare(b.name));`,
  },
  {
    label: '9 · UPDATE — 10% off every used record',
    hint: 'Run ONLY the JS, then flip the engine switch: the page disagrees with itself. Run the SQL and the arrays reload from the DB. One source of truth!',
    sql: `UPDATE albums
SET price_cents = ROUND(price_cents * 0.9)
WHERE condition = 'Used';`,
    js: `albums
  .filter(a => a.condition === 'Used')
  .forEach(a => { a.price_cents = Math.round(a.price_cents * 0.9); });

const result = 'updated in memory only';`,
  },
];
