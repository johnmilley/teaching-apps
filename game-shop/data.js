/* Meeple & Co. — schema, sample data and playground exercises.
 * Plain strings so the app works when opened straight from disk (file://).
 */

window.GAMES_SCHEMA = `
CREATE TABLE games (
  id            INTEGER PRIMARY KEY,
  name          TEXT    NOT NULL,
  category      TEXT    NOT NULL,     -- Family, Strategy, Party, Co-op, Two-Player
  min_players   INTEGER NOT NULL,
  max_players   INTEGER NOT NULL,
  play_minutes  INTEGER NOT NULL,
  weight        REAL    NOT NULL,     -- complexity, 1 (light) to 5 (heavy)
  min_age       INTEGER NOT NULL,
  price_cents   INTEGER NOT NULL,     -- money as whole cents
  stock         INTEGER NOT NULL,
  year          INTEGER NOT NULL,
  emoji         TEXT    NOT NULL,
  hue           INTEGER NOT NULL      -- colour for the generated box art
);

-- many-to-many: a game has several mechanics, a mechanic belongs to many games
CREATE TABLE game_mechanics (
  game_id   INTEGER NOT NULL REFERENCES games(id),
  mechanic  TEXT    NOT NULL,
  PRIMARY KEY (game_id, mechanic)
);

CREATE TABLE reviews (
  id          INTEGER PRIMARY KEY,
  game_id     INTEGER NOT NULL REFERENCES games(id),
  reviewer    TEXT    NOT NULL,
  stars       INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  body        TEXT    NOT NULL,
  created_at  TEXT    NOT NULL        -- ISO date
);

CREATE TABLE wishlist (
  game_id   INTEGER PRIMARY KEY REFERENCES games(id),
  added_at  TEXT NOT NULL
);
`;

window.GAMES_SEED = `
INSERT INTO games (id, name, category, min_players, max_players, play_minutes, weight, min_age, price_cents, stock, year, emoji, hue) VALUES
  (1,  'Catan',             'Family',     3, 4,  90,  2.3, 10, 5499,  6,  1995, '🐑', 30),
  (2,  'Ticket to Ride',    'Family',     2, 5,  60,  1.8, 8,  5999,  8,  2004, '🚂', 0),
  (3,  'Pandemic',          'Co-op',      2, 4,  45,  2.4, 8,  4999,  5,  2008, '🦠', 200),
  (4,  'Wingspan',          'Strategy',   1, 5,  70,  2.5, 10, 6999,  4,  2019, '🐦', 175),
  (5,  'Azul',              'Family',     2, 4,  45,  1.8, 8,  4499,  7,  2017, '🔷', 215),
  (6,  'Carcassonne',       'Family',     2, 5,  45,  1.9, 7,  3999,  9,  2000, '🏰', 95),
  (7,  'Codenames',         'Party',      2, 8,  15,  1.3, 14, 2499,  12, 2015, '🕵️', 355),
  (8,  '7 Wonders',         'Strategy',   3, 7,  30,  2.3, 10, 5499,  3,  2010, '🏛️', 40),
  (9,  'Splendor',          'Family',     2, 4,  30,  1.8, 10, 4499,  6,  2014, '💎', 260),
  (10, 'Terraforming Mars', 'Strategy',   1, 5,  120, 3.3, 12, 6999,  2,  2016, '🪐', 15),
  (11, 'Gloomhaven',        'Co-op',      1, 4,  120, 3.9, 14, 13999, 1,  2017, '⚔️', 280),
  (12, 'Dixit',             'Party',      3, 8,  30,  1.2, 8,  3999,  5,  2008, '🎨', 320),
  (13, 'Everdell',          'Strategy',   1, 4,  80,  2.8, 13, 7499,  0,  2018, '🌳', 120),
  (14, 'Kingdomino',        'Family',     2, 4,  15,  1.2, 8,  2499,  10, 2016, '👑', 48),
  (15, 'The Crew',          'Co-op',      2, 5,  20,  2.0, 10, 1999,  8,  2019, '🚀', 235),
  (16, 'Cascadia',          'Family',     1, 4,  45,  1.9, 10, 4499,  6,  2021, '🦊', 150),
  (17, 'Root',              'Strategy',   2, 4,  90,  3.7, 10, 7499,  3,  2018, '🦝', 25),
  (18, 'Scythe',            'Strategy',   1, 5,  115, 3.4, 14, 8999,  2,  2016, '🚜', 5),
  (19, 'Brass: Birmingham', 'Strategy',   2, 4,  120, 3.9, 14, 8499,  1,  2018, '🏭', 20),
  (20, 'Spirit Island',     'Co-op',      1, 4,  120, 4.0, 13, 8999,  2,  2017, '🌋', 140),
  (21, 'Patchwork',         'Two-Player', 2, 2,  30,  1.6, 8,  2999,  6,  2014, '🧵', 300),
  (22, 'Sushi Go Party!',   'Party',      2, 8,  20,  1.3, 8,  2499,  9,  2016, '🍣', 350),
  (23, 'Just One',          'Party',      3, 7,  20,  1.0, 8,  2499,  7,  2018, '💬', 190),
  (24, 'Wavelength',        'Party',      2, 12, 45,  1.1, 14, 3999,  4,  2019, '📡', 270),
  (25, 'Jaipur',            'Two-Player', 2, 2,  30,  1.5, 12, 2499,  5,  2009, '🐪', 35),
  (26, 'Hanabi',            'Co-op',      2, 5,  25,  1.7, 8,  1499,  11, 2010, '🎆', 245),
  (27, 'King of Tokyo',     'Family',     2, 6,  30,  1.5, 8,  3999,  5,  2011, '🦖', 100),
  (28, 'Dominion',          'Strategy',   2, 4,  30,  2.4, 13, 4499,  4,  2008, '🃏', 55),
  (29, '7 Wonders Duel',    'Two-Player', 2, 2,  30,  2.2, 10, 3499,  5,  2015, '🏺', 45),
  (30, 'Photosynthesis',    'Family',     2, 4,  60,  2.3, 8,  4999,  3,  2017, '☀️', 60);

INSERT INTO game_mechanics (game_id, mechanic) VALUES
  (1, 'Trading'), (1, 'Dice Rolling'), (1, 'Route Building'),
  (2, 'Route Building'), (2, 'Set Collection'), (2, 'Hand Management'),
  (3, 'Cooperative'), (3, 'Hand Management'),
  (4, 'Engine Building'), (4, 'Hand Management'), (4, 'Dice Rolling'),
  (5, 'Drafting'), (5, 'Tile Placement'), (5, 'Set Collection'),
  (6, 'Tile Placement'), (6, 'Area Control'),
  (7, 'Deduction'), (7, 'Team Play'),
  (8, 'Drafting'), (8, 'Set Collection'), (8, 'Engine Building'),
  (9, 'Engine Building'), (9, 'Set Collection'),
  (10, 'Engine Building'), (10, 'Tile Placement'), (10, 'Drafting'),
  (11, 'Cooperative'), (11, 'Hand Management'), (11, 'Campaign'),
  (12, 'Storytelling'), (12, 'Deduction'),
  (13, 'Worker Placement'), (13, 'Engine Building'),
  (14, 'Tile Placement'), (14, 'Drafting'),
  (15, 'Cooperative'), (15, 'Trick Taking'), (15, 'Campaign'),
  (16, 'Tile Placement'), (16, 'Drafting'), (16, 'Set Collection'),
  (17, 'Area Control'), (17, 'Hand Management'),
  (18, 'Area Control'), (18, 'Engine Building'),
  (19, 'Route Building'), (19, 'Hand Management'), (19, 'Engine Building'),
  (20, 'Cooperative'), (20, 'Area Control'), (20, 'Hand Management'),
  (21, 'Tile Placement'),
  (22, 'Drafting'), (22, 'Set Collection'),
  (23, 'Cooperative'), (23, 'Deduction'),
  (24, 'Team Play'), (24, 'Deduction'),
  (25, 'Trading'), (25, 'Set Collection'), (25, 'Hand Management'),
  (26, 'Cooperative'), (26, 'Deduction'), (26, 'Hand Management'),
  (27, 'Dice Rolling'), (27, 'Area Control'),
  (28, 'Deck Building'), (28, 'Hand Management'),
  (29, 'Drafting'), (29, 'Set Collection'),
  (30, 'Area Control'), (30, 'Hand Management');

INSERT INTO reviews (id, game_id, reviewer, stars, body, created_at) VALUES
  (1, 1, 'SheepTrader', 3, 'Solid game, not a staple.', '2026-07-04'),
  (2, 1, 'PartyStarter', 3, 'Solid game, not a staple.', '2026-08-07'),
  (3, 1, 'RuleLawyer', 3, 'Fun, but a bit long for us.', '2026-09-08'),
  (4, 1, 'EngineBuilder', 4, 'Brain burner in the best way.', '2026-08-28'),
  (5, 2, 'CardShark', 4, 'Brain burner in the best way.', '2026-08-06'),
  (6, 2, 'ShelfOfShame', 3, 'Solid game, not a staple.', '2026-07-14'),
  (7, 2, 'KingmakerKid', 5, 'Brain burner in the best way.', '2026-08-03'),
  (8, 3, 'TileTosser', 5, 'A new family favourite.', '2026-09-06'),
  (9, 3, 'TableFlip', 5, 'Great with 4, still good with 2.', '2026-07-10'),
  (10, 3, 'TileTosser', 5, 'The box is stuffed with good stuff.', '2026-06-26'),
  (11, 3, 'SleeveEverything', 4, 'Great with 4, still good with 2.', '2026-08-03'),
  (12, 3, 'KingmakerKid', 3, 'Good, but depends on the group.', '2026-09-03'),
  (13, 4, 'TileTosser', 5, 'A new family favourite.', '2026-08-20'),
  (14, 5, 'SheepTrader', 5, 'Our table asks for this every week.', '2026-07-30'),
  (15, 5, 'SleeveEverything', 5, 'A new family favourite.', '2026-08-09'),
  (16, 6, 'SleeveEverything', 4, 'Our table asks for this every week.', '2026-08-19'),
  (17, 6, 'CardShark', 4, 'Our table asks for this every week.', '2026-07-18'),
  (18, 7, 'LastTurnLuck', 5, 'Gorgeous components and it plays fast.', '2026-07-22'),
  (19, 7, 'KingmakerKid', 3, 'Fun, but a bit long for us.', '2026-07-12'),
  (20, 7, 'BoxHoarder', 5, 'The box is stuffed with good stuff.', '2026-08-30'),
  (21, 7, 'SleeveEverything', 5, 'A new family favourite.', '2026-08-13'),
  (22, 8, 'CoopCaptain', 3, 'Good, but depends on the group.', '2026-07-20'),
  (23, 9, 'TableFlip', 4, 'Won me over after one game.', '2026-06-22'),
  (24, 9, 'CardShark', 4, 'Gorgeous components and it plays fast.', '2026-07-24'),
  (25, 9, 'SheepTrader', 5, 'Great with 4, still good with 2.', '2026-09-07'),
  (26, 10, 'WorkerPlacer', 4, 'Great with 4, still good with 2.', '2026-07-07'),
  (27, 11, 'MeepleMaven', 5, 'Our table asks for this every week.', '2026-08-18'),
  (28, 11, 'LastTurnLuck', 4, 'The box is stuffed with good stuff.', '2026-08-10'),
  (29, 12, 'RuleLawyer', 3, 'Good, but depends on the group.', '2026-06-28'),
  (30, 12, 'KingmakerKid', 5, 'Easy to teach, hard to put down.', '2026-07-17'),
  (31, 12, 'FirstPlayer', 5, 'Our table asks for this every week.', '2026-07-04'),
  (32, 12, 'PartyStarter', 5, 'Gorgeous components and it plays fast.', '2026-08-28'),
  (33, 12, 'CozyGamer', 5, 'Easy to teach, hard to put down.', '2026-07-17'),
  (34, 13, 'BoxHoarder', 4, 'The box is stuffed with good stuff.', '2026-07-10'),
  (35, 13, 'PartyStarter', 5, 'Brain burner in the best way.', '2026-07-06'),
  (36, 13, 'TableFlip', 4, 'Brain burner in the best way.', '2026-08-19'),
  (37, 13, 'BoxHoarder', 4, 'Easy to teach, hard to put down.', '2026-08-03'),
  (38, 13, 'WorkerPlacer', 4, 'Brain burner in the best way.', '2026-07-11'),
  (39, 14, 'MeepleMaven', 5, 'Great with 4, still good with 2.', '2026-07-09'),
  (40, 14, 'CardShark', 4, 'Our table asks for this every week.', '2026-08-27'),
  (41, 15, 'SleeveEverything', 5, 'A new family favourite.', '2026-08-26'),
  (42, 15, 'ShelfOfShame', 4, 'Gorgeous components and it plays fast.', '2026-08-05'),
  (43, 15, 'CozyGamer', 3, 'Rules took a while to click.', '2026-07-19'),
  (44, 16, 'LastTurnLuck', 4, 'Won me over after one game.', '2026-07-21'),
  (45, 16, 'FirstPlayer', 5, 'Brain burner in the best way.', '2026-08-05'),
  (46, 17, 'TableFlip', 4, 'Our table asks for this every week.', '2026-07-26'),
  (47, 17, 'SleeveEverything', 4, 'Great with 4, still good with 2.', '2026-08-17'),
  (48, 17, 'ShelfOfShame', 5, 'Great with 4, still good with 2.', '2026-07-01'),
  (49, 17, 'TableFlip', 5, 'Great with 4, still good with 2.', '2026-07-17'),
  (50, 17, 'SleeveEverything', 5, 'Our table asks for this every week.', '2026-08-21'),
  (51, 18, 'RuleLawyer', 4, 'Easy to teach, hard to put down.', '2026-08-09'),
  (52, 19, 'EngineBuilder', 4, 'Brain burner in the best way.', '2026-07-13'),
  (53, 19, 'LastTurnLuck', 5, 'The box is stuffed with good stuff.', '2026-08-19'),
  (54, 20, 'TokenQueen', 4, 'Easy to teach, hard to put down.', '2026-07-11'),
  (55, 20, 'CozyGamer', 5, 'Brain burner in the best way.', '2026-07-09'),
  (56, 20, 'CoopCaptain', 5, 'Brain burner in the best way.', '2026-08-04'),
  (57, 21, 'WorkerPlacer', 4, 'Our table asks for this every week.', '2026-07-04'),
  (58, 22, 'RuleLawyer', 4, 'Gorgeous components and it plays fast.', '2026-08-15'),
  (59, 22, 'CardShark', 4, 'A new family favourite.', '2026-07-18'),
  (60, 22, 'DiceGoblin', 3, 'Solid game, not a staple.', '2026-09-04'),
  (61, 22, 'SleeveEverything', 4, 'Gorgeous components and it plays fast.', '2026-06-28'),
  (62, 22, 'WorkerPlacer', 5, 'Brain burner in the best way.', '2026-09-03'),
  (63, 23, 'CoopCaptain', 3, 'Solid game, not a staple.', '2026-08-28'),
  (64, 24, 'TokenQueen', 5, 'Our table asks for this every week.', '2026-08-16'),
  (65, 24, 'CoopCaptain', 3, 'Solid game, not a staple.', '2026-07-13'),
  (66, 25, 'PartyStarter', 3, 'Good, but depends on the group.', '2026-09-08'),
  (67, 26, 'MeepleMaven', 3, 'Good, but depends on the group.', '2026-07-04'),
  (68, 26, 'RuleLawyer', 4, 'Our table asks for this every week.', '2026-07-22'),
  (69, 26, 'FirstPlayer', 4, 'Brain burner in the best way.', '2026-08-31'),
  (70, 27, 'DiceGoblin', 5, 'Easy to teach, hard to put down.', '2026-08-16'),
  (71, 27, 'KingmakerKid', 3, 'Solid game, not a staple.', '2026-07-26'),
  (72, 27, 'ShelfOfShame', 3, 'Good, but depends on the group.', '2026-08-24'),
  (73, 27, 'RuleLawyer', 3, 'Rules took a while to click.', '2026-08-31'),
  (74, 28, 'EngineBuilder', 2, 'Not for us — too random.', '2026-07-08'),
  (75, 28, 'EngineBuilder', 5, 'Easy to teach, hard to put down.', '2026-07-21'),
  (76, 28, 'CardShark', 5, 'Easy to teach, hard to put down.', '2026-07-18'),
  (77, 28, 'CoopCaptain', 4, 'Gorgeous components and it plays fast.', '2026-08-06'),
  (78, 28, 'KingmakerKid', 2, 'Not for us — too random.', '2026-07-08'),
  (79, 29, 'TokenQueen', 5, 'The box is stuffed with good stuff.', '2026-08-22'),
  (80, 29, 'EngineBuilder', 5, 'Won me over after one game.', '2026-07-11'),
  (81, 29, 'SleeveEverything', 5, 'The box is stuffed with good stuff.', '2026-07-16');

INSERT INTO wishlist (game_id, added_at) VALUES (4, '2026-09-10T18:22:00'), (16, '2026-09-18T20:05:00');
`;

/* Playground exercises: each pairs a SQL query with the equivalent JS. */
window.GAMES_EXAMPLES = [
  {
    label: '1 · filter — games for exactly 2 players',
    hint: 'Two conditions in WHERE = two checks joined with && in .filter().',
    sql: `SELECT name, min_players, max_players
FROM games
WHERE min_players <= 2 AND max_players >= 2
ORDER BY name;`,
    js: `games
  .filter(g => g.min_players <= 2 && g.max_players >= 2)
  .map(g => ({ name: g.name, min_players: g.min_players, max_players: g.max_players }))
  .sort((a, b) => a.name.localeCompare(b.name))`,
  },
  {
    label: '2 · map — a price tag for every game',
    hint: 'SQL can build strings too (|| joins text). In JS, .map() + a template literal.',
    sql: `SELECT name || ' — $' || printf('%.2f', price_cents / 100.0) AS label
FROM games;`,
    js: `games.map(g => \`\${g.name} — $\${(g.price_cents / 100).toFixed(2)}\`)`,
  },
  {
    label: '3 · reduce — average play time',
    hint: 'AVG() = reduce to a sum, then divide by .length.',
    sql: `SELECT ROUND(AVG(play_minutes), 1) AS avg_minutes FROM games;`,
    js: `const total = games.reduce((sum, g) => sum + g.play_minutes, 0);
const result = Math.round((total / games.length) * 10) / 10;`,
  },
  {
    label: '4 · reduce — cheapest and priciest (MIN / MAX)',
    hint: 'One reduce can track several things at once.',
    sql: `SELECT MIN(price_cents) AS cheapest, MAX(price_cents) AS priciest FROM games;`,
    js: `games.reduce(
  (acc, g) => ({
    cheapest: Math.min(acc.cheapest, g.price_cents),
    priciest: Math.max(acc.priciest, g.price_cents),
  }),
  { cheapest: Infinity, priciest: -Infinity }
)`,
  },
  {
    label: '5 · LEFT JOIN — games with NO reviews',
    hint: 'LEFT JOIN keeps games even when no review matches; the review columns come back NULL. In JS: .filter() with .some().',
    sql: `SELECT g.name
FROM games g
LEFT JOIN reviews r ON r.game_id = g.id
WHERE r.id IS NULL;`,
    js: `games
  .filter(g => !reviews.some(r => r.game_id === g.id))
  .map(g => ({ name: g.name }))`,
  },
  {
    label: '6 · flatMap + Set — every mechanic, once (DISTINCT)',
    hint: 'DISTINCT ≈ new Set(). flatMap flattens "list of lists" into one list.',
    sql: `SELECT DISTINCT mechanic
FROM game_mechanics
ORDER BY mechanic;`,
    js: `const perGame = games.map(g =>
  game_mechanics.filter(m => m.game_id === g.id).map(m => m.mechanic));   // [[...], [...], ...]

const result = [...new Set(perGame.flat())].sort();`,
  },
  {
    label: '7 · GROUP BY + HAVING — busiest reviewers',
    hint: 'Group with reduce, then .filter() the groups — that is HAVING.',
    sql: `SELECT reviewer, COUNT(*) AS reviews, ROUND(AVG(stars), 1) AS avg_given
FROM reviews
GROUP BY reviewer
HAVING COUNT(*) >= 5
ORDER BY reviews DESC, reviewer;`,
    js: `const groups = reviews.reduce((acc, r) => {
  (acc[r.reviewer] ??= []).push(r.stars);
  return acc;
}, {});

const result = Object.entries(groups)
  .filter(([, stars]) => stars.length >= 5)
  .map(([reviewer, stars]) => ({
    reviewer,
    reviews: stars.length,
    avg_given: Math.round(stars.reduce((a, b) => a + b, 0) / stars.length * 10) / 10,
  }))
  .sort((a, b) => b.reviews - a.reviews || a.reviewer.localeCompare(b.reviewer));`,
  },
  {
    label: '8 · CASE WHEN — label games Light / Medium / Heavy',
    hint: "CASE is SQL's if/else. In JS it's a ternary inside .map().",
    sql: `SELECT name,
       CASE WHEN weight < 2 THEN 'Light'
            WHEN weight < 3 THEN 'Medium'
            ELSE 'Heavy' END AS weight_class
FROM games
ORDER BY weight;`,
    js: `[...games]
  .sort((a, b) => a.weight - b.weight)
  .map(g => ({
    name: g.name,
    weight_class: g.weight < 2 ? 'Light' : g.weight < 3 ? 'Medium' : 'Heavy',
  }))`,
  },
  {
    label: '9 · every — is every game in stock?',
    hint: 'NOT EXISTS (... stock = 0) ≈ .every(g => g.stock > 0).',
    sql: `SELECT NOT EXISTS (SELECT 1 FROM games WHERE stock = 0) AS all_in_stock;`,
    js: `games.every(g => g.stock > 0)`,
  },
];
