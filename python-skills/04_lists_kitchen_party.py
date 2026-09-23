"""
04 - LISTS: KITCHEN PARTY

You're running the music for a kitchen party. Build the playlist, shuffle
it, sort it, cut it down, and then PLAY THE PARTY.

After every change, the program shows you the exact line of Python it
just ran, so you can see how each list tool works.

Run it:   python3 04_lists_kitchen_party.py

-------------------------------------------------------------------------
WHAT TO LOOK FOR  (search for  # LOOK:  in the code)

  making a list  [ ... ] ............. playlist = [...]
  len() .............................. show the playlist
  indexes: [0] is first, [-1] last ... show the playlist, option 8
  .append()  .insert() ............... options 2, 3
  .remove()  .pop() .................. options 4, 5
  in  (is it in the list?) ........... option 4
  swapping two items ................. option 6
  .sort()  .reverse()  shuffle ....... option 7
  slicing  [:3]  [-2:] ............... option 8
  .index()  .count() ................. option 9
  looping over a list ................ show the playlist, PLAY
-------------------------------------------------------------------------
"""

import random
import time

# LOOK: a list is a bunch of values in square brackets, separated by commas.
# These are all traditional Newfoundland folk songs.
playlist = [
    "I's the B'y",
    "Lukey's Boat",
    "Jack Was Every Inch a Sailor",
    "The Ryans and the Pittmans",
    "Squid Jiggin' Ground",
    "Kelligrew's Soiree",
]

# Frames for the dancing animation. Also a list!
DANCERS = [
    r"  \o/   o/    \o    o   \o/  ",
    r"   |   /|     |\   /|\   |   ",
    r"  / \  / \   / \   / \  / \  ",
]
DANCERS_2 = [
    r"   o   \o/   o/   \o/   \o   ",
    r"  /|\   |   /|     |     |\  ",
    r"  / \  / \  / \   / \   / \  ",
]


print(r"""
   _  ___ _      _                 ___          _
  | |/ (_) |_ __| |_  ___ _ _     | _ \__ _ _ _| |_ _  _
  | ' <| |  _/ _| ' \/ -_) ' \    |  _/ _` | '_|  _| || |
  |_|\_\_|\__\__|_||_\___|_||_|   |_| \__,_|_|  \__|\_, |
                                                    |__/
""")
print("  Everybody ends up in the kitchen. Somebody has to run the music.")

running = True
while running:

    # ---------------------------------------------------------------
    # SHOW THE PLAYLIST
    # LOOK: len() tells you how many items are in a list.
    # ---------------------------------------------------------------
    print("\n" + "-" * 54)
    print(f"  PLAYLIST ({len(playlist)} songs)")
    print("-" * 54)

    if len(playlist) == 0:
        print("  (empty. It's gone awful quiet in here.)")

    # LOOK: looping over a list. `number` counts up while `song` gives
    # each item. Humans count from 1, but Python counts from 0!
    number = 1
    for song in playlist:
        print(f"  {number:>2}. {song:<34} <- playlist[{number - 1}]")
        number += 1

    print("-" * 54)
    print("""
   1) PLAY THE PARTY!          6) Move a song up one spot
   2) Add a song to the end    7) Sort / reverse / shuffle
   3) Add a song to the top    8) Show the first 3 and last 2
   4) Remove a song by name    9) Find a song
   5) Remove a song by number  0) Quit""")

    choice = input("\n  Pick one: ").strip()

    # ---------------------------------------------------------------
    if choice == "1":
        if len(playlist) == 0:
            print("\n  You can't have a party with no music, b'y!")
            continue

        print("\n  The accordion comes out. The spoons come out. Here we go!\n")
        # LOOK: loop through the list, playing each song.
        # enumerate() gives you the position AND the item together.
        for position, song in enumerate(playlist):
            print(f"  NOW PLAYING ({position + 1}/{len(playlist)}): {song}")
            for beat in range(4):
                # Swap between two dance frames on every beat.
                # LOOK: beat % 2 is 0, 1, 0, 1... so we pick one list or the other.
                if beat % 2 == 0:
                    frame = DANCERS
                else:
                    frame = DANCERS_2
                for line in frame:
                    print("     " + line)
                print()
                time.sleep(0.4)
        print("  The party's over. Somebody's asleep on the daybed.")

    # ---------------------------------------------------------------
    elif choice == "2":
        song = input("  Song name: ").strip()
        if song:
            playlist.append(song)       # LOOK: .append() adds to the END
            print(f'\n   Python ran:  playlist.append("{song}")')

    # ---------------------------------------------------------------
    elif choice == "3":
        song = input("  Song name: ").strip()
        if song:
            playlist.insert(0, song)    # LOOK: .insert(position, item)
            print(f'\n   Python ran:  playlist.insert(0, "{song}")')

    # ---------------------------------------------------------------
    elif choice == "4":
        song = input("  Exact name of the song to remove: ").strip()
        # LOOK: check with `in` first! .remove() crashes if the item isn't there.
        if song in playlist:
            playlist.remove(song)
            print(f'\n   Python ran:  playlist.remove("{song}")')
        else:
            print(f"\n  '{song}' isn't on the list. (Capitals and spelling count!)")
            print(f'\n   Python ran:  "{song}" in playlist   ->  False')

    # ---------------------------------------------------------------
    elif choice == "5":
        number = input("  Number of the song to remove: ").strip()
        if number.isdigit() and 1 <= int(number) <= len(playlist):
            index = int(number) - 1          # humans count from 1, Python from 0
            removed = playlist.pop(index)    # LOOK: .pop() removes AND gives it back
            print(f"\n  Gone: {removed}")
            print(f"\n   Python ran:  playlist.pop({index})")
        else:
            print("\n  That's not a number on the list.")

    # ---------------------------------------------------------------
    elif choice == "6":
        number = input("  Number of the song to move up: ").strip()
        if number.isdigit() and 2 <= int(number) <= len(playlist):
            i = int(number) - 1
            # LOOK: swapping two items. Python lets you do it in one line!
            playlist[i - 1], playlist[i] = playlist[i], playlist[i - 1]
            print(f"\n   Python ran:  playlist[{i - 1}], playlist[{i}] = playlist[{i}], playlist[{i - 1}]")
        else:
            print("\n  Pick a song from number 2 down. Number 1 is already at the top!")

    # ---------------------------------------------------------------
    elif choice == "7":
        how = input("  (s)ort A-Z, (r)everse, or sh(u)ffle? ").strip().lower()
        if how == "s":
            playlist.sort()              # LOOK: .sort() changes the list itself
            print("\n   Python ran:  playlist.sort()")
        elif how == "r":
            playlist.reverse()
            print("\n   Python ran:  playlist.reverse()")
        elif how == "u":
            random.shuffle(playlist)
            print("\n   Python ran:  random.shuffle(playlist)")

    # ---------------------------------------------------------------
    elif choice == "8":
        # LOOK: slicing makes a NEW list from part of the old one.
        # [:3] means "from the start, up to (not including) index 3".
        # [-2:] means "from the second-last item to the end".
        print(f"\n  playlist[:3]  -> {playlist[:3]}")
        print(f"  playlist[-2:] -> {playlist[-2:]}")
        if len(playlist) > 0:
            print(f'  playlist[0]   -> "{playlist[0]}"   (first)')
            print(f'  playlist[-1]  -> "{playlist[-1]}"   (last)')

    # ---------------------------------------------------------------
    elif choice == "9":
        word = input("  Type part of a song name: ").strip().lower()
        # LOOK: building a new list from the songs that match
        matches = []
        for song in playlist:
            if word in song.lower():
                matches.append(song)

        if len(matches) == 0:
            print(f"\n  No songs with '{word}' in them.")
        else:
            print(f"\n  Found {len(matches)}: {matches}")
            first = matches[0]
            # LOOK: .index() tells you WHERE an item is
            print(f'  playlist.index("{first}") -> {playlist.index(first)}')
            # LOOK: .count() tells you how many times it appears
            print(f'  playlist.count("{first}") -> {playlist.count(first)}')

    # ---------------------------------------------------------------
    elif choice == "0":
        running = False
    else:
        print("\n  Pick a number from the menu.")

    if running:
        input("\n  (press Enter)")

print("\n  Night, b'y. Don't forget your coat.\n")


# =========================================================================
# CHALLENGES
#
# 1. Add two more songs to the starting playlist.
#
# 2. What's the difference between .pop() and .remove()? Try both from
#    the menu, then explain it to a partner.
#
# 3. Add a menu option that shows the LONGEST song title.
#    (Hint: loop through and keep track, or try max(playlist, key=len))
#
# 4. Add a menu option to clear the whole playlist. (Hint: .clear())
#
# 5. Add the same song twice, then use option 9 to find it. What does
#    .count() say now? What does .index() say?
#
# 6. Make a second list called  requests . Add a menu option that moves
#    the first request onto the end of the playlist.
#    (Hint: requests.pop(0) and playlist.append(...))
#
# 7. BIGGER: When the party plays, count how many songs have the word
#    "the" in them, and print the total at the end.
# =========================================================================
