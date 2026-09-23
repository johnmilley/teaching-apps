"""
03 - LOOPS: JIGGIN' COD

It's the recreational food fishery. You've got one week, a boat and a
jigger. Each day you can keep up to 5 cod. Jig as long as you like... but
watch the weather, and watch your arms.

Run it:   python3 03_loops_jiggin_cod.py

-------------------------------------------------------------------------
WHAT TO LOOK FOR  (search for  # LOOK:  in the code)

  for loop with range() ............... the countdown, the waves, the week
  range(start, stop, step) ............ the countdown
  while loop (repeat until...) ........ jigging each day
  while True + break .................. the "are you sure?" question
  break (leave a loop early) .......... squalls, going home
  continue (skip to the next lap) ..... storm days
  for loop over a list ................ the end-of-week report
  loop inside a loop .................. drawing the catch
  counting and totals in a loop ....... the end-of-week report
-------------------------------------------------------------------------

A NOTE ON HISTORY: in 1992 the northern cod fishery was shut down because
the cod were nearly gone. Now most people can only jig cod during the
recreational food fishery, a few weeks each year with a daily limit.
"""

import random
import time

DAYS = 7
DAILY_LIMIT = 5
ARM_STRENGTH = 12      # how many jigs your arms can take in one day

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday",
             "Friday", "Saturday", "Sunday"]

BOAT = r"""
                   |
                   |\
         __________|_\______
         \  ><>            /      ~ jig ~
    ~~~~~~\_______________/~~~~~~~~~ | ~~~~~~~~~~
                                     |
                                     J
"""

print(r"""
       _ _             _       ___         _
    _ | (_)__ _ __ _(_)_ _ ( ) / __|___  __| |
   | || | / _` / _` | | ' \|/ | (__/ _ \/ _` |
    \__/|_\__, \__, |_|_||_|   \___\___/\__,_|
          |___/|___/
""")
print(BOAT)
print(f"  You've got {DAYS} days. You can keep {DAILY_LIMIT} cod a day.")
print("  Sculpins go back. So do boots.\n")

# ---------------------------------------------------------------
# COUNTDOWN
# LOOK: range(3, 0, -1) counts 3, 2, 1. It stops BEFORE 0.
# The third number is the step: -1 means count backwards.
# ---------------------------------------------------------------
input("Press Enter to cast off...")
for number in range(3, 0, -1):
    print(f"  {number}...")
    time.sleep(0.5)
print("  Cast off!\n")

# These lists grow as the week goes on
all_fish = []           # the weight of every cod you keep, in kg
daily_catch = []        # how many cod you kept each day

# ---------------------------------------------------------------
# THE WEEK
# LOOK: a for loop runs once for each day. We know exactly how many
# times it will run (7), so for is the right choice.
# ---------------------------------------------------------------
for day in range(DAYS):
    day_name = DAY_NAMES[day]

    # LOOK: a for loop that builds a string of waves.
    # The rougher the weather, the more waves.
    wind = random.randint(0, 10)
    waves = ""
    for i in range(wind):
        waves += "~^"

    print("\n" + "=" * 50)
    print(f"  {day_name.upper()}    wind: {wind}/10    {waves}")
    print("=" * 50)

    # LOOK: continue skips the REST of this lap and jumps to the next day.
    if wind >= 9:
        print("  Storm! Too rough to go out. You stay home and mend nets.")
        daily_catch.append(0)
        continue

    fish_today = 0
    jigs = 0

    # -----------------------------------------------------------
    # ONE DAY OF JIGGING
    # LOOK: a while loop keeps going as long as its condition is True.
    # We DON'T know how many jigs it'll take, so while is the right choice.
    # -----------------------------------------------------------
    while fish_today < DAILY_LIMIT and jigs < ARM_STRENGTH:

        action = input(f"\n  [{fish_today}/{DAILY_LIMIT} cod] Press Enter to jig, "
                       "or type  home : ").strip().lower()

        if action == "home":
            # LOOK: while True keeps asking until we get a real answer.
            # break is the only way out.
            while True:
                sure = input("  Head in already? (y/n) ").strip().lower()
                if sure == "y" or sure == "n":
                    break
                print("  Just y or n, b'y.")
            if sure == "y":
                break          # LOOK: this break leaves the jigging loop
            else:
                continue       # LOOK: skip the rest and jig again

        jigs += 1

        # Jig the line: up, down, up, down...
        for i in range(3):
            print("    jig...", end="", flush=True)
            time.sleep(0.2)
        print()

        # What's on the hook? Windy days are harder.
        roll = random.randint(1, 100) - wind * 3

        if roll > 55:
            weight = round(random.uniform(1.0, 6.0), 1)
            fish_today += 1
            all_fish.append(weight)
            print(f"    A COD! {weight} kg. Into the box she goes.  ><>")
            if weight >= 5:
                print("    That's a big one! A real fish-and-brewis fish.")
        elif roll > 40:
            print("    A sculpin. Ugly as sin. Back you go.")
        elif roll > 30:
            print("    ...an old rubber boot. You toss it back.")
        elif roll < -5:
            # LOOK: break leaves the while loop right away, even if you
            # haven't hit your limit.
            print("    A squall comes up out of nowhere! You race for shore.")
            break
        else:
            print("    Nothing. Not a nibble.")

    # LOOK: after the while loop ends, check WHY it ended.
    if fish_today == DAILY_LIMIT:
        print(f"\n  That's your {DAILY_LIMIT}! Limit reached. Home for supper.")
    elif jigs >= ARM_STRENGTH:
        print("\n  Your arms are like cooked spaghetti. That's enough for today.")

    daily_catch.append(fish_today)

    # LOOK: a loop inside a loop. The outer loop goes fish by fish, and
    # the inner loop draws a bigger fish for a heavier cod.
    if fish_today > 0:
        print("\n  Today's catch:")
        todays_fish = all_fish[-fish_today:]
        for weight in todays_fish:
            body = ""
            for kg in range(int(weight)):
                body += "="
            print(f"    ><{body}>   {weight} kg")

# ---------------------------------------------------------------
# END OF THE WEEK
# ---------------------------------------------------------------
print("\n" + "#" * 50)
print("  END OF THE WEEK")
print("#" * 50)

# LOOK: looping over two lists at once with an index number
for i in range(DAYS):
    bar = "><> " * daily_catch[i]
    if daily_catch[i] == 0:
        bar = "-"
    print(f"  {DAY_NAMES[i]:<10} {bar}")

# LOOK: adding things up with a loop. (Python has sum() too. See the
# challenges.)
total_weight = 0
biggest = 0
for weight in all_fish:
    total_weight += weight
    if weight > biggest:
        biggest = weight

print(f"\n  Cod kept ......... {len(all_fish)}")
print(f"  Total weight ..... {total_weight:.1f} kg")
if len(all_fish) > 0:
    print(f"  Biggest cod ...... {biggest} kg")
    print(f"  Average cod ...... {total_weight / len(all_fish):.1f} kg")

# LOOK: counting only the days that match a condition
perfect_days = 0
for count in daily_catch:
    if count == DAILY_LIMIT:
        perfect_days += 1
print(f"  Days at limit .... {perfect_days}")

if len(all_fish) >= 25:
    print("\n  Highliner! Your freezer is full for the winter.")
elif len(all_fish) >= 10:
    print("\n  A good week. Fish and brewis on Sunday!")
else:
    print("\n  A slow week. There's always next year.")
print()


# =========================================================================
# CHALLENGES
#
# 1. Change the countdown to go from 10 down to 1.
#    Then make it count by 2s: 10, 8, 6, 4, 2.
#
# 2. The storm check uses `continue`. What would happen if you changed
#    it to `break`? Try it, then explain it to a partner.
#
# 3. Replace the total_weight loop with Python's built-in sum(all_fish).
#    Do the same for biggest, using max(all_fish).
#
# 4. Add a "mackerel" to the things you can catch. Mackerel don't count
#    toward the cod limit.
#
# 5. Make an infinite loop by accident: change  jigs += 1  to  jigs += 0
#    and set DAILY_LIMIT to 1000. How do you stop it? (Ctrl + C!)
#
# 6. Use a for loop to print a triangle of fish:
#        ><>
#        ><> ><>
#        ><> ><> ><>
#
# 7. BIGGER: Add a "bait" count that starts at 20. Each jig uses one.
#    When bait runs out, the day ends. When it's gone for good, the
#    week ends. (Which loop does each one need to break out of?)
# =========================================================================
