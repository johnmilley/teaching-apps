# The Fog on the Humber

A text adventure with ASCII art, set in Corner Brook, NL. It's the last night of October, the fog
has rolled in off the Humber Arm, and your little cousin Daisy has followed a strange light into it.
You have until the paper mill's midnight whistle to bring her home.

It's written for students **learning `if` statements**. The whole game is one file with no classes
and no dependencies. Every decision is an `if`, and each one worth reading is marked with a `# IF:` comment.

```bash
python3 fog_on_the_humber.py      # Mac / Linux
py fog_on_the_humber.py           # Windows
```

It also runs in IDLE, Thonny or VS Code. Set `TEXT_SPEED = 0` at the top to turn off the typewriter effect.

## The map

```
                    Nan's kitchen (West Street)
                              |
                              v
        +------------- the crossroads -------------+
        |              |              |            |
  Glynmill Pond    Paper mill     Crow Hill     Stream Trail
  (jacky lantern)  (watchman's    (Cook's       (needs a light)
        |           guessing      Lookout,          |
   Glynmill Inn     game)         telescope)    footbridge: left / right
   (mummers'                                        |
    riddle)                                     fairy ring
```

| Item / fact | Where you get it | What it does |
| --- | --- | --- |
| bread | Nan (choice 1) or the mummers | Protects you from the jacky lantern and wins over the fairies |
| flashlight | Nan (choice 2) | Lets you walk the Stream Trail |
| lantern | The mill watchman's guessing game | Also lets you walk the trail |
| vamps (+2 nerve) | Nan (choice 3) | Enough nerve to face the fairies without bread |
| `knows_the_way` | Crow Hill telescope (1 loonie) | Tells you to go LEFT at the footbridge |

You get **6 endings**: Best (home with 30+ minutes to spare), Good, Fairy-Led, The Whistle
(out of time), Nerve Gone (nerve hits 0) and Hagged (refuse to go at all).

## Where each kind of `if` lives

| Concept | Function | Example |
| --- | --- | --- |
| `if` / `else` | `go_or_stay()` | yes or no |
| `if` / `elif` / `else` | `kitchen_choice()` | pick 1, 2 or 3, and `else` catches everything else |
| Order matters in `elif` | `show_status()` | `>= 120` has to be checked before `>= 60` |
| Comparing numbers | `mill()`, `fairy_ring()` | `guess < secret`, `nerve >= 4` |
| Comparing strings | `ask_name()` | `player_name.lower() == "daisy"` |
| `in` with a list | `go_or_stay()`, `crossroads()` | `answer in ["yes", "y", "yeah"]`, `"bread" in inventory` |
| `in` with a string | `mummers()` | `"river" in answer` |
| `and` / `or` / `not` | `pond()`, `crossroads()`, `mill()` | `"bread" in inventory and not found_mitten` |
| Nested `if` | `pond()`, `hill()`, `mummers()` | an `if` inside an `elif` |
| True/False variables | `mummers()`, `mill()` | `got_through = False` … `if got_through:` |
| A big `if`/`elif` "switch" | `main()` | picks the next scene by name |
| `match` / `case` | `main()` (commented out) | the same "switch" without `scene ==` on every line (Python 3.10+) |

The only loops are in the helpers and in `main()`, so students can ignore loops for now. Each
scene function returns the *name* of the next scene, and `main()` uses `if`/`elif` to run it.

## Challenges

**Warm-up (reading code)**
1. Play through once. Then find the exact `if` that decided your ending.
2. In `kitchen_choice()`, what happens if you type `bread` instead of `1`? Which line makes that happen?
3. In `show_status()`, imagine swapping the `if minute >= 120` and `elif minute >= 60` blocks.
   Work out by hand what the clock would show when `minute` is 125.
4. How much nerve do you need to grab Daisy and run? Find the line that decides it. Then change
   it so you need 5 or more. Can you still win that way?

**Small changes**
5. Add a secret name in `ask_name()`. If the player types your name, give them an extra loonie.
6. Make `go_or_stay()` also accept `"ok"` and `"yes b'y"`.
7. The mummers accept "river", "brook" or "humber". Add another answer that should count.
8. Add a 4th item to Nan's table (an `elif choice == "4":`). What should it do?

**Bigger changes**
9. Add a new place to the crossroads, like Marble Mountain or the Humber River. Write the
   scene function, add a menu option in `crossroads()`, then add an `elif` in `main()`.
   If you forget that last step, the game tells you.
10. Add a 7th ending. It needs a reason to happen (an `if`) and an ending function.
11. The mill repeats the "more / fewer" hint code three times. Could a helper function remove the repetition?
12. Right now you can only carry one of Nan's items. Add a way to trade an item somewhere in the world.

## Newfoundland words and folklore in the game

- **Fairies / the Little People**: in NL folklore they lead people astray. Being **fairy-led** means
  being lost and confused, sometimes for hours or days. Carrying **bread** in your pocket keeps them off.
- **Jacky lantern**: a mysterious light over bogs and water that leads travellers off the path.
- **Mummers**: people in disguise who visit houses at Christmas. You have to guess who they are.
  They talk in a funny voice, often breathing *in*: "Any mummers 'lowed in?"
- **The Old Hag**: the NL name for waking up unable to move, with something heavy on your chest.
- **Token**: a sign or ghost that warns of a death. Here it's the ghost ship on the Humber Arm.
- **Vamps**: thick wool socks. **Toutons**: fried bread dough, served with molasses. **Lassy bun**: a molasses bun.
- **B'y**: "boy", said to anyone.

The real places in the game are the Humber Arm, the paper mill, Glynmill Pond and the Glynmill Inn,
Captain Cook's Lookout on Crow Hill, the Bay of Islands and the Blow Me Down Mountains, and the
Corner Brook Stream Trail.
