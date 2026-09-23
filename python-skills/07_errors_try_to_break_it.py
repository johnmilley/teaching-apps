"""
07 - ERRORS: TRY TO BREAK IT!

Your job: CRASH THIS PROGRAM.

Every level asks you a question, and there's a way to answer that would
normally crash Python. But every level is protected by try / except, so
instead of crashing, you win a trophy. Collect all 6.

Run it:   python3 07_errors_try_to_break_it.py

-------------------------------------------------------------------------
WHAT TO LOOK FOR  (search for  # LOOK:  in the code)

  try / except ................. level_1_toutons()
  raise (making your own error)  level_1_toutons()
  more than one except ......... level_2_pizza()
  a surprise: no error! ........ level_3_ferry()
  except ... as error .......... level_4_words()
  finally (always runs) ........ level_5_files()
  else (runs if NO error) ...... level_5_files()
  a bug that's always there .... level_6_buggy()

The error names you'll meet: ValueError, ZeroDivisionError, IndexError,
KeyError, FileNotFoundError, TypeError
-------------------------------------------------------------------------
"""

import traceback

# The trophies you've won. Keys are error names, values are the level.
trophies = {}

ALL_ERRORS = ["ValueError", "ZeroDivisionError", "IndexError",
              "KeyError", "FileNotFoundError", "TypeError"]


def crashed(error, level):
    """Show what Python WOULD have said, and give a trophy."""
    name = type(error).__name__
    # This is the last line of the red crash message you'd normally see
    message = traceback.format_exception_only(type(error), error)[-1].strip()

    print("\n   +------------------------------------------------------+")
    print("   |  CRASH BLOCKED!  Without try/except, Python would     |")
    print("   |  have stopped the whole program and shown:            |")
    print("   +------------------------------------------------------+")
    print(f"     {message}")

    if name in trophies:
        print(f"\n   You already have the {name} trophy.")
    else:
        trophies[name] = level
        print(f"\n   *** NEW TROPHY: {name}! ***   ({len(trophies)}/{len(ALL_ERRORS)})")


# =========================================================================
# LEVEL 1: ValueError
# =========================================================================

def level_1_toutons():
    print("\n   LEVEL 1: The Touton Counter")
    answer = input("   How many toutons can you eat in one sitting? ")

    # LOOK: the risky code goes in the `try` block. If anything in there
    # fails, Python jumps straight to the matching `except`.
    try:
        toutons = int(answer)
        if toutons < 0:
            # LOOK: raise makes an error on purpose. Negative toutons
            # aren't a real answer, so we treat it just like bad input.
            raise ValueError("you can't eat negative toutons")
        print(f"   {toutons} toutons. With molasses? Respect.")
    except ValueError as error:
        crashed(error, 1)
        print("\n   int() only understands digits. 'twelve' and '4.5' both fail.")


# =========================================================================
# LEVEL 2: ZeroDivisionError
# =========================================================================

def level_2_pizza():
    print("\n   LEVEL 2: The Pizza Splitter")
    print("   A pizza has 8 slices.")
    answer = input("   How many friends are sharing it? ")

    # LOOK: one try can have several excepts, one for each kind of error.
    try:
        friends = int(answer)
        slices_each = 8 / friends
        print(f"   Everybody gets {slices_each:.2f} slices.")
    except ZeroDivisionError as error:
        crashed(error, 2)
        print("\n   Dividing by zero breaks maths. Also, eating alone is sad.")
    except ValueError as error:
        crashed(error, 2)
        print("\n   (That's a ValueError, not the one this level is about. Try a number!)")


# =========================================================================
# LEVEL 3: IndexError
# =========================================================================

def level_3_ferry():
    print("\n   LEVEL 3: The Ferry Seat Picker")
    seats = ["Window", "Aisle", "By the canteen",
             "Next to the crying baby", "Out on the deck in the fog"]
    for number in range(len(seats)):
        print(f"     {number + 1}) {seats[number]}")
    answer = input("   Pick a seat number: ")

    try:
        index = int(answer) - 1
        seat = seats[index]
        print(f"   You got: {seat}.")
        # LOOK: here's the surprise. If you type 0, index is -1, and
        # seats[-1] is the LAST seat. No error! Python counts backwards
        # from the end with negative numbers. It isn't a crash, it's a bug.
        if index < 0:
            print("   ...wait, you typed 0 or less and it still worked?! Negative")
            print("   indexes count from the END of the list. Sneaky. No trophy.")
    except IndexError as error:
        crashed(error, 3)
        print(f"\n   There are only {len(seats)} seats. seats[{index}] doesn't exist.")
    except ValueError as error:
        crashed(error, 3)


# =========================================================================
# LEVEL 4: KeyError
# =========================================================================

def level_4_words():
    print("\n   LEVEL 4: The Newfoundland Dictionary")
    glossary = {
        "b'y": "boy (said to anyone at all)",
        "mauzy": "foggy, damp and mild",
        "scoff": "a big meal",
        "gansey": "a wool sweater",
        "stunned": "not very clever",
    }
    print("   I know these words: " + ", ".join(glossary))
    word = input("   Look up a word: ").strip().lower()

    # LOOK: `as error` saves the error in a variable, so you can look at it.
    try:
        meaning = glossary[word]
        print(f"   {word}: {meaning}")
    except KeyError as error:
        crashed(error, 4)
        print(f"\n   The error holds the missing key: {error}")
        print("   (glossary.get(word) would give None instead of crashing.)")


# =========================================================================
# LEVEL 5: FileNotFoundError
# =========================================================================

def level_5_files():
    print("\n   LEVEL 5: The File Opener")
    print("   This program is in a file called  07_errors_try_to_break_it.py")
    filename = input("   Type a file name to open: ").strip()

    # LOOK: try / except / else / finally, all four together!
    try:
        file = open(filename)
        first_line = file.readline()
        file.close()
    except FileNotFoundError as error:
        crashed(error, 5)
    except (IsADirectoryError, PermissionError, UnicodeDecodeError) as error:
        print(f"   That's a {type(error).__name__}. Close, but not this level's error!")
    else:
        # `else` runs only if the try worked with NO error.
        print(f"   It opened! The first line is: {first_line.strip()}")
    finally:
        # `finally` runs no matter what: error or no error.
        print("   (The finally block ran. It always does.)")


# =========================================================================
# LEVEL 6: TypeError
# =========================================================================

def level_6_buggy():
    print("\n   LEVEL 6: The Birthday Calculator")
    print("   Uh oh. The person who wrote this level made a mistake.")
    age = input("   How old are you? ")

    try:
        # LOOK: the bug. input() gives a STRING, and you can't add a
        # string and a number. "14" + 1 makes no sense to Python.
        next_year = age + 1
        print(f"   Next year you'll be {next_year}.")
    except TypeError as error:
        crashed(error, 6)
        print("\n   This one crashes for EVERYBODY. That's a bug, not bad input.")
        print("   The fix is:   next_year = int(age) + 1")
        print("   try/except can hide bugs, so don't use it instead of fixing them!")


# =========================================================================
# THE MENU
# =========================================================================

print(r"""
   _____            _         ___              _     ___ _   _
  |_   _| _ _  _   | |_ ___  | _ )_ _ ___ __ _| |__ |_ _| |_| |
    | || '_| || |  |  _/ _ \ | _ \ '_/ -_) _` | / /  | ||  _|_|
    |_||_|  \_, |   \__\___/ |___/_| \___\__,_|_\_\ |___|\__(_)
            |__/
""")
print("   Every level can be crashed. Find the answer that does it!")

LEVELS = [level_1_toutons, level_2_pizza, level_3_ferry,
          level_4_words, level_5_files, level_6_buggy]

while len(trophies) < len(ALL_ERRORS):
    print("\n   TROPHY CASE: ", end="")
    for name in ALL_ERRORS:
        if name in trophies:
            print(f"[{name}] ", end="")
        else:
            print("[ ? ] ", end="")
    print()

    choice = input("\n   Pick a level (1-6), or q to quit: ").strip().lower()
    if choice == "q":
        break

    try:
        level = LEVELS[int(choice) - 1]
        if int(choice) < 1:
            raise IndexError("no level 0")
        level()
    except (ValueError, IndexError):
        # Yes, the menu protects itself too!
        print("   That's not a level. (Nice try. The menu is crash-proof too.)")

if len(trophies) == len(ALL_ERRORS):
    print(r"""
          ___________
         '._==_==_=_.'
         .-\:      /-.
        | (|:.     |) |
         '-|:.     |-'
           \::.    /
            '::. .'
              ) (
            _.' '._
           `"""""""`
    ALL SIX TROPHIES! You broke everything, and nothing broke.
""")
print("   See you later, b'y.\n")


# =========================================================================
# CHALLENGES
#
# 1. Take the try/except out of level 1 (keep the code inside it). Run it
#    and type "moose". Read the whole red error message. What line number
#    does it point to?
#
# 2. Level 2 catches ZeroDivisionError. What if you only had
#    `except ValueError`? Try dividing by zero then.
#
# 3. Fix the bug in level 6 so it works for everyone.
#
# 4. Add a 7th level that causes an AttributeError. (Hint: numbers don't
#    have string methods:  (5).upper()  )
#
# 5. Write a  get_number(question)  function that keeps asking until the
#    user types a real whole number, using try/except inside a while loop.
#    This is one of the most useful functions you'll ever write!
#
# 6. `except Exception:` catches almost EVERY error. Why might that be
#    a bad idea? Talk it over with a partner.
# =========================================================================
