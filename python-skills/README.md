# Python Skills

Eight small Python programs, one skill each. Every program is a game or toy students will want to
play, and its code is written to be read. Most are set somewhere on the Rock.

No installs. Python 3.8 or newer. Each file runs on its own:

```bash
python3 03_loops_jiggin_cod.py       # Mac / Linux
py 03_loops_jiggin_cod.py            # Windows
```

They also run in IDLE, Thonny and VS Code.

| # | Skill | Program | What happens |
| --- | --- | --- | --- |
| 01 | Strings | `01_strings_sink_the_dory.py` | Guess the Newfoundland word before your dory sinks. A **String X-ray** then takes the word apart with slicing and string methods. |
| 02 | Numbers | `02_numbers_across_the_rock.py` | Drive the TCH from Port aux Basques to St. John's: fuel, cost, time, gas stops and moose. Ends with **Number Oddities** like `0.1 + 0.2` and `round(2.5)`. |
| 03 | Loops | `03_loops_jiggin_cod.py` | A week in the recreational food fishery. `for` runs the days, `while` runs the jigging, `break` for squalls, `continue` for storm days. |
| 04 | Lists | `04_lists_kitchen_party.py` | Run the playlist for a kitchen party. Every change prints the exact list code it ran. Then play the party. |
| 05 | Functions | `05_functions_postcard.py` | Build an ASCII postcard out of small functions. Includes print vs `return` and local variables. |
| 06 | Dictionaries | `06_dictionaries_folklore_faceoff.py` | A Top Trumps-style card game. Every card is a dictionary. Look things up in the bestiary or make your own creature. |
| 07 | Errors | `07_errors_try_to_break_it.py` | Students **try to crash it**. Each error type caught by `try`/`except` earns a trophy. |
| 08 | Files | `08_files_keepers_log.py` | Keep a lighthouse log in a real text file. The old keeper's log writes back… |

## How each file is laid out

- **Header**: what the program does, and a **WHAT TO LOOK FOR** list that maps each idea to where it is in the code.
- **`# LOOK:` comments** mark the lines worth reading. Students can search for `LOOK:`.
- **Challenges** at the bottom, from "change one number" up to "build a new feature".

## Order and overlap

The numbers are a suggested order, but every file stands alone. Programs 01–04 have no functions
(`def`), so they read top to bottom. A few early programs use a loop before 03 teaches it, and each one
says so in its header. From 05 on, programs use functions, and 07–08 use `try`/`except`.

Ideas also carry between programs: 02 shows `int("ninety")` crashing and 07 shows how to catch it.
05's last challenge saves a postcard to a file, which is what 08 teaches.

## Files that 08 creates

`08_files_keepers_log.py` makes `keepers_log.txt`, `old_keepers_log.txt` and `log_report.txt` in this
folder. Delete them to reset. (`old_keepers_log.txt` gets a new line every time someone reads it.
Challenge 5 asks students to work out why.) They're listed in `.gitignore`.
