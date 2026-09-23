"""
02 - NUMBERS: ACROSS THE ROCK

Drive the Trans-Canada Highway from the ferry in Port aux Basques all the
way to St. John's. You choose the car and the speed. Python works out the
fuel, the cost and the time, and it watches for moose.

Run it:   python3 02_numbers_across_the_rock.py

-------------------------------------------------------------------------
WHAT TO LOOK FOR  (search for  # LOOK:  in the code)

  int (whole numbers) and float (decimals) .. setting up the car
  turning text into numbers: int() float() .. setting up the car
  + - * / ................................... each leg of the trip
  // (whole division) and % (remainder) ..... hours and minutes
  round() and :.2f for money ................ each leg of the trip
  += to keep a running total ................ each leg of the trip
  random numbers ............................ moose!
  max() min() abs() ......................... the trip report
  weird number facts ........................ NUMBER ODDITIES at the end

There's a for loop to go through each leg of the trip. Loops are in 03.
-------------------------------------------------------------------------
"""

import random

# Distances along the highway, in kilometres (rounded).
# LOOK: these are ints. No decimal point.
LEGS = [
    ["Port aux Basques", "Corner Brook", 219],
    ["Corner Brook", "Deer Lake", 50],
    ["Deer Lake", "Grand Falls-Windsor", 210],
    ["Grand Falls-Windsor", "Gander", 95],
    ["Gander", "Clarenville", 150],
    ["Clarenville", "St. John's", 190],
]

CAR = r"""
          ______
         /|_||_\`.__
        (   _    _ _\
        =`-(_)--(_)-'   ~ ~ ~
"""

MOOSE = r"""
        \_\_    _/_/
            \__/
            (oo)\_______
            (__)\       )\/
                ||----w |
                ||     ||      MOOSE!
"""

print(r"""
     _                              _   _          ___         _
    /_\  __ _ _ ___ ______  __ _ | |_| |_  ___  | _ \___  __| |__
   / _ \/ _| '_/ _ (_-<_-< / _` ||  _| ' \/ -_) |   / _ \/ _| / /
  /_/ \_\__|_| \___/__/__/ \__,_| \__|_||_\___| |_|_\___/\__|_\_\
""")
print(CAR)
print("  Port aux Basques to St. John's on the Trans-Canada Highway.\n")

# ---------------------------------------------------------------
# SET UP THE CAR
# ---------------------------------------------------------------

# LOOK: input() ALWAYS gives you a string, even if you type 90.
# "90" + "10" would be "9010"! int() turns "90" into the number 90.
speed = int(input("How fast will you drive, in km/h? (try 90 to 110) "))

# LOOK: float() is for numbers with decimals, like 7.5
litres_per_100km = float(input("How many litres does your car burn per 100 km? (try 7.5) "))
gas_price = float(input("What's gas cost per litre? (try 1.65) "))

# LOOK: a float and an int can be used together. The answer is a float.
tank_size = 50       # int: litres
print(f"\nYour tank holds {tank_size} litres.")

if speed > 110:
    print("Whoa, the speed limit is 100 on most of the highway. Mind the Mounties.")
elif speed < 60:
    print("You'll be passed by every truck on the island. That's fine.")

input("\nPress Enter to leave the ferry...")

# ---------------------------------------------------------------
# DRIVE EACH LEG
# ---------------------------------------------------------------

total_km = 0          # LOOK: running totals start at 0
total_minutes = 0
total_litres = 0.0
total_cost = 0.0
moose_seen = 0
longest_leg = 0
shortest_leg = 99999

for leg in LEGS:
    start = leg[0]
    end = leg[1]
    km = leg[2]

    # LOOK: time = distance / speed. / always gives a float.
    hours = km / speed
    minutes = round(hours * 60)          # round() to a whole number

    # LOOK: fuel for this leg. Divide by 100 because it's "per 100 km".
    litres = km * litres_per_100km / 100
    cost = litres * gas_price

    # Moose! A random whole number from 1 to 100.
    # LOOK: a 20% chance means "the number is 20 or less".
    moose_roll = random.randint(1, 100)
    if moose_roll <= 20:
        moose_seen += 1
        delay = random.randint(5, 30)
        minutes += delay
        print(MOOSE)
        print(f"   A moose is standing in the road. It stares. You wait {delay} minutes.")

    # LOOK: // tells us how many FULL tanks we've used so far.
    # If that number goes up during this leg, we must have stopped for gas.
    tanks_before = total_litres // tank_size
    tanks_after = (total_litres + litres) // tank_size
    if tanks_after > tanks_before:
        print("\n   GAS STOP! You fill the tank and grab a coffee.")

    # LOOK: += adds to what's already there.
    total_km += km
    total_minutes += minutes
    total_litres += litres
    total_cost += cost
    longest_leg = max(longest_leg, km)    # LOOK: max() keeps the bigger one
    shortest_leg = min(shortest_leg, km)

    # LOOK: // is whole division and % is the remainder.
    # 135 minutes // 60 = 2 hours.  135 % 60 = 15 minutes left over.
    leg_h = minutes // 60
    leg_m = minutes % 60

    print(f"\n  {start} -> {end}")
    print(f"     {km} km   |   {leg_h} h {leg_m} min   |   "
          f"{litres:.1f} L of gas   |   ${cost:.2f}")
    # LOOK: {cost:.2f} shows exactly 2 decimals: 12.3 becomes 12.30

    fuel_left = tank_size - (total_litres % tank_size)
    percent = fuel_left / tank_size * 100
    bar = "#" * int(percent // 10)       # one # for every 10%
    print(f"     Tank: [{bar:<10}] {percent:.0f}%")

    input("     (Enter to keep driving)")

# ---------------------------------------------------------------
# TRIP REPORT
# ---------------------------------------------------------------

hours = total_minutes // 60
mins = total_minutes % 60
days = total_minutes / (24 * 60)
fill_ups = total_litres / tank_size
average_speed = total_km / (total_minutes / 60)

print(r"""
      _____ _         _       ___                   _
     |_   _| |_  ___ | |_    | _ \___ _ __  ___ _ _| |_
       | | | ' \/ -_)|  _|   |   / -_) '_ \/ _ \ '_|  _|
       |_| |_||_\___| \__|   |_|_\___| .__/\___/_|  \__|
                                     |_|
""")
print(f"  You made it to St. John's! Go stand on Signal Hill.")
print(f"")
print(f"  Distance ............ {total_km} km")
print(f"  Time on the road .... {hours} h {mins} min  ({days:.2f} of a day)")
print(f"  Gas used ............ {total_litres:.1f} L  (about {fill_ups:.1f} tanks)")
print(f"  Gas cost ............ ${total_cost:.2f}")
print(f"  Average speed ....... {average_speed:.1f} km/h")
print(f"  Longest leg ......... {longest_leg} km")
print(f"  Shortest leg ........ {shortest_leg} km")
print(f"  Moose encounters .... {moose_seen}")

# LOOK: abs() gives the distance from zero, so it's never negative.
# It's handy for "how far off was I?"
guess = int(input("\nQuick! Guess how many litres of gas that was: "))
off_by = abs(guess - round(total_litres))
if off_by == 0:
    print("Exactly right! Are you a gas pump?")
elif off_by <= 5:
    print(f"So close! Only off by {off_by}.")
else:
    print(f"You were off by {off_by} litres.")

# ---------------------------------------------------------------
# NUMBER ODDITIES: things about numbers that surprise everyone
# ---------------------------------------------------------------
input("\nPress Enter for some NUMBER ODDITIES...")

print("\n  7 / 2        =", 7 / 2, "     (/ always gives a float)")
print("  7 // 2       =", 7 // 2, "       (// drops the decimal)")
print("  7 % 2        =", 7 % 2, "       (% is the remainder. Odd numbers give 1!)")
print("  -7 // 2      =", -7 // 2, "      (// rounds DOWN, even for negatives)")
print("  2 ** 10      =", 2 ** 10, "    (** means 'to the power of')")
print("  2 ** 100     =", 2 ** 100)
print("                 (Python ints can be as big as you want)")
print("  0.1 + 0.2    =", 0.1 + 0.2)
print("                 (Computers store decimals in binary, so some are a tiny bit off.")
print("                  That's why banks count money in whole cents.)")
print("  round(2.5)   =", round(2.5), "       (Surprise! Python rounds .5 to the EVEN number)")
print("  round(3.5)   =", round(3.5))
print("  int(9.99)    =", int(9.99), "       (int() chops off the decimal. It doesn't round.)")
print("  type(5)      =", type(5))
print("  type(5.0)    =", type(5.0))

print("\nSafe travels, b'y.\n")


# =========================================================================
# CHALLENGES
#
# 1. Type "ninety" when it asks for your speed. What happens? Why?
#    (You'll learn how to catch that in program 07.)
#
# 2. Change the moose chance from 20% to 50%. Which line do you change?
#
# 3. Add a leg from St. John's to Cape Spear (about 15 km), the most
#    easterly point in North America.
#
# 4. The report shows the total time. Also show how many SECONDS that is.
#
# 5. Gas prices change! Add 13% tax to the total cost and show both.
#    (Hint: total_cost * 1.13)
#
# 6. Use % to tell the player if their total km is even or odd.
#
# 7. BIGGER: Ask how many people are in the car. Show how much each
#    person owes for gas, rounded to the cent.
# =========================================================================
