"""
06 - DICTIONARIES: FOLKLORE FACE-OFF

A card game with creatures from Newfoundland folklore (and one moose).
Each card has stats: scare, sneak, power and fame. Pick a stat, and the
higher number wins both cards. Win the whole deck to win the game.

Every card is a DICTIONARY: a set of keys ("name", "scare", ...) with a
value for each one.

Run it:   python3 06_dictionaries_folklore_faceoff.py

-------------------------------------------------------------------------
WHAT TO LOOK FOR  (search for  # LOOK:  in the code)

  making a dictionary  { key: value } ...... the DECK
  getting a value  card["scare"] ........... show_card(), play_game()
  is this key in it?  "scare" in card ...... play_game()
  looping  for key, value in card.items() .. show_card(), best_stat()
  .get() with a backup value ............... show_card()
  adding / changing a key .................. make_creature(), wins tally
  counting things with a dictionary ........ the wins tally
  a dictionary as a lookup table ........... STAT_NAMES, the bestiary
  a list OF dictionaries ................... the DECK
-------------------------------------------------------------------------
"""

import random

# LOOK: each card is a dictionary. The part before the colon is the KEY,
# the part after is the VALUE. The whole deck is a list of dictionaries.
DECK = [
    {"name": "The Old Hag", "scare": 9, "sneak": 8, "power": 6, "fame": 8,
     "story": "Sits on your chest while you sleep. You can't move a muscle."},
    {"name": "Jacky Lantern", "scare": 5, "sneak": 9, "power": 3, "fame": 6,
     "story": "A bobbing light over the bog that leads travellers astray."},
    {"name": "The Fairies", "scare": 6, "sneak": 10, "power": 8, "fame": 9,
     "story": "The Little People. Keep bread in your pocket or they'll lead you off."},
    {"name": "The Mummers", "scare": 4, "sneak": 7, "power": 2, "fame": 10,
     "story": "Visitors in disguise at Christmas. Harmless... probably."},
    {"name": "The Phantom Ship", "scare": 8, "sneak": 4, "power": 5, "fame": 6,
     "story": "A ghostly ship seen out in the bay before a bad storm."},
    {"name": "Cressie", "scare": 6, "sneak": 7, "power": 9, "fame": 5,
     "story": "A giant eel-like creature said to live in Crescent Lake, Robert's Arm."},
    {"name": "The Giant Squid", "scare": 7, "sneak": 5, "power": 10, "fame": 7,
     "story": "Real! Giant squid have washed ashore in Newfoundland, like at Thimble Tickle in 1878."},
    {"name": "The Token", "scare": 8, "sneak": 6, "power": 4, "fame": 4,
     "story": "A vision of someone far away, a sign that something's happened to them."},
    {"name": "The Moose", "scare": 5, "sneak": 2, "power": 9, "fame": 10,
     "story": "Not a legend. Scarier than all of them on the highway at night."},
    {"name": "The Mill Ghost", "scare": 7, "sneak": 8, "power": 5, "fame": 1},
    # ^ No "story" key on this one! Watch how .get() handles it.
]

# LOOK: a dictionary used as a lookup table: short key -> long label
STAT_NAMES = {
    "scare": "Scare factor",
    "sneak": "Sneakiness",
    "power": "Raw power",
    "fame": "Fame",
}

# LOOK: an empty dictionary. We'll count wins in it: {"The Moose": 3, ...}
wins = {}


# =========================================================================
# FUNCTIONS
# =========================================================================

def show_card(card, owner):
    """Print a card, stat by stat."""
    print(f"\n   +{'-' * 40}+")
    print(f"   | {owner + ': ' + card['name'].upper():<39}|")
    print(f"   +{'-' * 40}+")

    # LOOK: .items() gives you each key AND its value.
    for key, value in card.items():
        if key in STAT_NAMES:                     # only the number stats
            bar = "#" * value
            print(f"   | {key:<6} {value:>2}  {bar:<29}|")

    # LOOK: .get("story", backup) gives the backup if the key is missing.
    # card["story"] would CRASH on The Mill Ghost, because it has no story.
    story = card.get("story", "Nobody knows where this one came from...")
    print(f"   +{'-' * 40}+")
    print(f"     {story}")


def best_stat(card):
    """Return the key of the card's highest stat. The computer uses this."""
    best_key = "scare"
    for key, value in card.items():
        if key in STAT_NAMES and value > card[best_key]:
            best_key = key
    return best_key


def add_win(name):
    """Count one win for this creature in the wins dictionary."""
    # LOOK: counting with a dictionary. If the name isn't there yet,
    # .get() gives 0, so the first win makes it 1.
    wins[name] = wins.get(name, 0) + 1


def play_game():
    cards = DECK.copy()
    random.shuffle(cards)
    half = len(cards) // 2
    you = cards[:half]
    computer = cards[half:]
    your_turn = True
    rounds = 0

    print(f"\n   You get {len(you)} cards. The computer gets {len(computer)}.")
    print("   Pick the stat you think will beat the computer's card.")

    while len(you) > 0 and len(computer) > 0 and rounds < 30:
        rounds += 1
        your_card = you.pop(0)
        their_card = computer.pop(0)

        print(f"\n=========== ROUND {rounds}   (you: {len(you) + 1} cards, "
              f"computer: {len(computer) + 1}) ===========")
        show_card(your_card, "YOU")

        if your_turn:
            print("\n   Stats:  " + "   ".join(STAT_NAMES.keys()))
            stat = input("   Pick a stat: ").strip().lower()
            # LOOK: `in` checks if a KEY is in a dictionary
            while stat not in STAT_NAMES:
                stat = input(f"   That's not a stat. Try: {', '.join(STAT_NAMES)}: ").strip().lower()
        else:
            stat = best_stat(their_card)
            input(f"\n   The computer picks {stat.upper()}!  (press Enter)")

        show_card(their_card, "COMPUTER")

        # LOOK: using a variable as the key. If stat is "power",
        # your_card[stat] is the same as your_card["power"].
        mine = your_card[stat]
        theirs = their_card[stat]
        print(f"\n   {STAT_NAMES[stat]}: {your_card['name']} {mine}  vs  "
              f"{their_card['name']} {theirs}")

        if mine > theirs:
            print("   YOU WIN THE ROUND! Both cards go to the bottom of your pile.")
            you.append(your_card)
            you.append(their_card)
            add_win(your_card["name"])
            your_turn = True
        elif theirs > mine:
            print("   The computer wins the round.")
            computer.append(their_card)
            computer.append(your_card)
            add_win(their_card["name"])
            your_turn = False
        else:
            print("   A tie! Everybody keeps their own card.")
            you.append(your_card)
            computer.append(their_card)

        input("   (press Enter)")

    print("\n" + "*" * 50)
    if len(computer) == 0:
        print("   YOU WIN! Every creature on the Rock answers to you now.")
    elif len(you) == 0:
        print("   The computer wins. The Old Hag will be by tonight.")
    elif len(you) > len(computer):
        print(f"   Time's up! You win, {len(you)} cards to {len(computer)}.")
    elif len(computer) > len(you):
        print(f"   Time's up! The computer wins, {len(computer)} cards to {len(you)}.")
    else:
        print("   Time's up! It's a draw.")
    print("*" * 50)


def bestiary():
    # LOOK: building a dictionary from a list, so we can look things up by
    # name. The key is the lowercase name and the value is the whole card.
    by_name = {}
    for card in DECK:
        by_name[card["name"].lower()] = card

    names = []
    for card in DECK:
        names.append(card["name"])
    print("\n   Creatures: " + ", ".join(names))
    name = input("\n   Look up which creature? ").strip().lower()

    # People might leave out "the", so try it both ways.
    if name in by_name:
        show_card(by_name[name], "BESTIARY")
    elif "the " + name in by_name:
        show_card(by_name["the " + name], "BESTIARY")
    else:
        print(f"   No creature called '{name}' in the book.")


def make_creature():
    # LOOK: start with an empty dictionary and add keys one at a time
    creature = {}
    creature["name"] = input("\n   Name your creature: ").strip().title() or "The Nameless Thing"

    for key in STAT_NAMES:
        while True:
            number = input(f"   {STAT_NAMES[key]} (1-10): ").strip()
            if number.isdigit() and 1 <= int(number) <= 10:
                creature[key] = int(number)
                break
            print("   A number from 1 to 10, please.")

    story = input("   What's its story? (Enter to skip) ").strip()
    if story:
        creature["story"] = story

    # A fair creature: total stats can't be more than 28
    total = creature["scare"] + creature["sneak"] + creature["power"] + creature["fame"]
    if total > 28:
        print(f"\n   Whoa, that's {total} points! The limit is 28. Everything gets knocked down a bit.")
        for key in STAT_NAMES:
            creature[key] = max(1, creature[key] * 28 // total)

    DECK.append(creature)
    show_card(creature, "NEW")
    print(f"\n   Here's the dictionary you just made:\n   {creature}")
    print("\n   It's in the deck now. The next game will have it!")


def show_wins():
    if len(wins) == 0:
        print("\n   No wins yet. Play a game first!")
        return
    print("\n   ROUND WINS SO FAR")
    # LOOK: sorting a dictionary's items by value, biggest first.
    # (lambda is a tiny one-line function. It says "sort by the count".)
    for name, count in sorted(wins.items(), key=lambda pair: pair[1], reverse=True):
        print(f"   {name:<22} {'*' * count} {count}")
    print(f"\n   The whole dictionary:  {wins}")


# =========================================================================
# MENU
# =========================================================================

print(r"""
   ___     _ _   _              ___                     __  __
  | __|__ | | |_| |___ _ _ ___ | __|_ _ __ ___   ___  / _|/ _|
  | _/ _ \| | / / / _ \ '_/ -_)| _/ _` / _/ -_) / _ \|  _|  _|
  |_|\___/|_|_\_\_\___/_| \___||_|\__,_\__\___| \___/|_| |_|
""")

running = True
while running:
    print("""
   1) Play Folklore Face-off
   2) Read the bestiary
   3) Make your own creature
   4) Who's winning the most rounds?
   0) Quit""")
    choice = input("\n   Pick one: ").strip()

    if choice == "1":
        play_game()
    elif choice == "2":
        bestiary()
    elif choice == "3":
        make_creature()
    elif choice == "4":
        show_wins()
    elif choice == "0":
        running = False

print("\n   Mind the fairies on your way home.\n")


# =========================================================================
# CHALLENGES
#
# 1. Print  DECK[0]  and  DECK[0]["name"] . What's the difference?
#
# 2. Add a new stat called "smell" to every card and to STAT_NAMES.
#    Does the game still work? What breaks if you forget one card?
#
# 3. Change The Moose's power to 10:  DECK[8]["power"] = 10
#
# 4. Give The Mill Ghost a story. Then check that the .get() backup
#    doesn't show any more.
#
# 5. In show_wins(), also print the creature with the MOST wins using
#    max(wins, key=wins.get)
#
# 6. Make a dictionary called  weaknesses  like {"The Fairies": "bread"}.
#    Show a creature's weakness on its card, if it has one.
#
# 7. BIGGER: Add "trump cards". If you play The Moose on a "power" round,
#    you win no matter what.
# =========================================================================
