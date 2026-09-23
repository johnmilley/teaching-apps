"""
01 - STRINGS: SINK THE DORY

Guess the Newfoundland word one letter at a time. Every wrong guess, your
dory takes on more water. Six wrong guesses and she's gone to the bottom.

After each round, the "String X-ray" takes the word apart and shows you
the Python that did it.

Run it:   python3 01_strings_sink_the_dory.py

-------------------------------------------------------------------------
WHAT TO LOOK FOR  (search for  # LOOK:  in the code)

  strings are text in quotes ......... WORDS
  .split() cuts a string in pieces ... picking a word
  .upper() .lower() .strip() ......... reading a guess
  len() .............................. checking a guess
  in (is this letter in the word?) ... checking a guess
  += to build a string bit by bit .... drawing the blanks
  * to repeat a string ............... the water
  indexing  word[0]  word[-1] ........ hints, String X-ray
  slicing   word[1:4]  word[::-1] .... String X-ray
  f-strings  f"Hi {name}" ............ everywhere!

There's one while loop to keep the game going. Loops are in program 03.
-------------------------------------------------------------------------
"""

import random

# LOOK: each word and its meaning are in ONE string, split by a colon.
# We'll use .split(":") to pull them apart.
WORDS = [
    "TOUTON:fried bread dough, best with molasses",
    "BAKEAPPLE:an orange berry that grows in bogs",
    "PARTRIDGEBERRY:a small, tart red berry",
    "DORY:a small, flat-bottomed fishing boat",
    "GANSEY:a thick wool sweater",
    "BARACHOIS:a pond behind a gravel beach",
    "OUTPORT:a small fishing village on the coast",
    "SCRUNCHIONS:crispy fried bits of pork fat",
    "BERGY BIT:a small chunk of floating ice",
    "FLAKE:a wooden platform for drying salt fish",
    "TICKLE:a narrow channel of water",
    "DUCKISH:twilight, between sunset and dark",
    "MAUZY:foggy, damp and mild weather",
    "MUMMER:someone in disguise who visits at Christmas",
    "SCUFF:a dance",
    "LASSY:molasses",
    "PUFFIN:a seabird with a bright orange beak",
    "ICEBERG:a huge piece of floating ice",
]

MAX_WRONG = 6

BOAT = r"""
                 |\
                 | \
                 |  \
                 |___\
            _____|_______
            \   D O R Y  /
             \__________/
"""


print(r"""
   ___ _      _         _   _          ___
  / __(_)_ _ | |__  ___| |_| |_  ___  |   \ ___ _ _ _  _
  \__ \ | ' \| / / |___|  _| ' \/ -_) | |) / _ \ '_| || |
  |___/_|_||_|_\_\       \__|_||_\___| |___/\___/_|  \_, |
                                                     |__/
""")

name = input("What's your name, skipper? ").strip()

# LOOK: .strip() removes spaces from the ends. .title() capitalizes words.
# If they typed nothing, the empty string "" counts as False.
if not name:
    name = "Skipper"
name = name.title()

print(f"\nWelcome aboard, {name}!")   # LOOK: an f-string. {name} is filled in.
print(f"Guess the word before your dory sinks. You can get {MAX_WRONG} wrong.")
print("Type  hint  for a clue (costs one bucket of water).")

playing = True
while playing:

    # ---------------------------------------------------------------
    # Pick a word
    # ---------------------------------------------------------------
    entry = random.choice(WORDS)

    # LOOK: split("TOUTON:fried bread...") gives ["TOUTON", "fried bread..."]
    pieces = entry.split(":")
    word = pieces[0]
    meaning = pieces[1]

    guessed = ""          # LOOK: every letter they've tried, in one string
    wrong = 0
    hints_used = 0

    # ---------------------------------------------------------------
    # One round
    # ---------------------------------------------------------------
    while wrong < MAX_WRONG:

        # Draw the boat, with water rising from the bottom.
        # LOOK: .split("\n") turns the picture into separate lines.
        boat_lines = BOAT.strip("\n").split("\n")
        dry_lines = len(boat_lines) - wrong
        for line in boat_lines[:dry_lines]:
            print(line)
        for i in range(wrong):
            print("  ~~~~~~~~~~~~~" + "~" * 20)   # LOOK: * repeats a string

        # Build the blanks, like  T _ _ T _ N
        # LOOK: += adds to the end of a string.
        display = ""
        for letter in word:
            if letter == " ":
                display += "   "
            elif letter in guessed:
                display += letter + " "
            else:
                display += "_ "

        print(f"\n   {display}")
        print(f"\n   Water: {wrong}/{MAX_WRONG}    Tried: {' '.join(guessed)}")

        # Did they get every letter?
        if "_" not in display:
            print(f"\n   You got it, {name}! {word} = {meaning}")
            break

        guess = input("\nGuess a letter (or the whole word): ").strip().upper()

        # LOOK: checking the guess with string tools
        if guess == "HINT":
            if hints_used == 0:
                print(f"   HINT: it starts with {word[0]} and ends with {word[-1]}.")
                hints_used += 1
                wrong += 1
            elif hints_used == 1:
                print(f"   HINT: it means '{meaning}'.")
                hints_used += 1
                wrong += 1
            else:
                print("   No more hints! Just bail faster.")
        elif len(guess) == 0:
            print("   You have to type something!")
        elif guess == word:
            print(f"\n   WOW, the whole word! {word} = {meaning}")
            guessed += word
            break
        elif len(guess) > 1:
            print(f"   Nope, it's not {guess}. Water pours in!")
            wrong += 1
        elif not guess.isalpha():
            print("   Letters only, please. (.isalpha() said no.)")
        elif guess in guessed:
            print(f"   You already tried {guess}.")
        elif guess in word:
            count = word.count(guess)       # LOOK: .count() counts letters
            if count == 1:
                print(f"   Yes! There's one {guess}.")
            else:
                print(f"   Yes! There are {count} {guess}'s.")
            guessed += guess
        else:
            print(f"   No {guess}. Water pours in!")
            guessed += guess
            wrong += 1

    if wrong >= MAX_WRONG:
        print("\n  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
        print("  ~~~~~~~~~~~~~ glub glub ~~~~~~~~~~~")
        print("  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
        print(f"\n   She's gone down, {name}. The word was {word}: {meaning}.")

    # ---------------------------------------------------------------
    # STRING X-RAY: take the word apart and show the code for each part
    # ---------------------------------------------------------------
    input("\n(press Enter for the String X-ray)")
    w = word
    print("\n   === STRING X-RAY ===")
    print(f"   word            = '{w}'")
    print(f"   len(word)       = {len(w)}")
    print(f"   word.lower()    = '{w.lower()}'")
    print(f"   word.title()    = '{w.title()}'")
    print(f"   word[0]         = '{w[0]}'        (first letter)")
    print(f"   word[-1]        = '{w[-1]}'        (last letter)")
    print(f"   word[1:4]       = '{w[1:4]}'      (letters 1, 2 and 3)")
    print(f"   word[::-1]      = '{w[::-1]}'     (backwards!)")
    print(f"   word.count('A') = {w.count('A')}")
    print(f"   word.find('O')  = {w.find('O')}        (-1 means not found)")
    print(f"   word.replace('A', '@') = '{w.replace('A', '@')}'")
    print(f"   '-'.join(word)  = '{'-'.join(w)}'")

    # LOOK: a palindrome reads the same backwards. We compare the word
    # to its reverse with ==.
    if w == w[::-1]:
        print(f"   {w} is a palindrome!")
    else:
        print(f"   {w} is not a palindrome. (Try 'KAYAK' in the challenges!)")

    again = input("\nPlay again? (y/n) ").strip().lower()
    # LOOK: .startswith() checks the beginning of a string
    if not again.startswith("y"):
        playing = False

print(f"\nSafe home, {name}. Mind the tickles.\n")


# =========================================================================
# CHALLENGES
#
# 1. Add three more words to WORDS. Keep the  WORD:meaning  pattern.
#
# 2. Add a third hint that tells how many letters are in the word.
#    (Hint: len())
#
# 3. The String X-ray always counts 'A'. Make it count the first letter
#    of the word instead:  w.count(w[0])
#
# 4. Add a line to the X-ray that shows the word with its vowels removed.
#    (Hint: .replace() five times, or a for loop and +=.)
#
# 5. What happens if you add the word "Scuff:a dance" in lowercase?
#    Guesses are made .upper(), so they'll never match! Fix it by calling
#    .upper() on the word when you pick it.
#
# 6. BIGGER: Before the game, ask the player to type a sentence. Print it
#    backwards, in UPPERCASE, and tell them how many words it has.
#    (Hint: len(sentence.split()))
# =========================================================================
