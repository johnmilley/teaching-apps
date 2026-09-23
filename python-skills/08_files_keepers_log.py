"""
08 - FILES: THE KEEPER'S LOG

You're the new lighthouse keeper at Lantern Point. Every day, you write
the weather and the ships you saw in the log. The log is a real text file
on your computer, so it's still there next time you run the program.

The last keeper left a log too. You should probably read it.

Run it:   python3 08_files_keepers_log.py

-------------------------------------------------------------------------
WHAT TO LOOK FOR  (search for  # LOOK:  in the code)

  open() and the three modes: "r" "w" "a" ... the whole program
  with open(...) as file: .................. write_entry()
  writing a line with .write() ............. write_entry()
  reading every line with a for loop ....... read_log()
  .strip() and .split() on each line ....... log_report()
  FileNotFoundError (the file isn't there) . read_log()
  "w" ERASES the file first ................ start_over(), log_report()
  "a" adds to the end ...................... write_entry(), old_log()
  reading one line at a time ............... old_log()
  checking if a file exists ................ create_old_log()

Every line in the log looks like this:
    2026-09-23 | fog | 3 | Saw a trawler heading for Bonne Bay.
    date         weather  ships  note
-------------------------------------------------------------------------
"""

import datetime
import os

# Keep the log files in the same folder as this program.
FOLDER = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(FOLDER, "keepers_log.txt")
OLD_LOG_FILE = os.path.join(FOLDER, "old_keepers_log.txt")
REPORT_FILE = os.path.join(FOLDER, "log_report.txt")

WEATHER_TYPES = ["clear", "cloud", "rain", "fog", "wind", "snow"]

OLD_ENTRIES = [
    "1923-10-01 | clear | 4 | Took up my post at Lantern Point. The lamp is in fine order.",
    "1923-10-04 | fog | 1 | Fog all day. Sounded the horn every minute until dark.",
    "1923-10-09 | wind | 0 | A gale. No ship would be out in this.",
    "1923-10-13 | fog | 1 | A small light on the water after midnight. No ship that I could see.",
    "1923-10-17 | fog | 0 | The light again, closer to the rocks. It stops moving when I look at it.",
    "1923-10-22 | fog | 0 | Wet footprints on the lamp room stairs this morning. Small ones.",
    "1923-10-29 | fog | 0 | Something tapped on the glass all night. I kept the lamp lit.",
    "1923-10-31 | fog | 0 | It knows my name now. Whoever reads this: keep the lamp lit.",
]

LIGHTHOUSE = r"""
             \  |  /
           --  (*)  --        LANTERN POINT LIGHT
             /_____\
             |[] []|
             |  _  |
            /|_| |_|\
     ~~~~~~/_________\~~~~~~~~~~~~~~~~
"""


# =========================================================================
# FILE FUNCTIONS
# =========================================================================

def create_old_log():
    """Write the old keeper's log, but only if it isn't there yet."""
    # LOOK: os.path.exists() checks if a file is already there
    if os.path.exists(OLD_LOG_FILE):
        return

    # LOOK: "w" means WRITE. It makes a new file (or erases an old one!).
    # `with` closes the file for us when the block ends.
    with open(OLD_LOG_FILE, "w", encoding="utf-8") as file:
        for entry in OLD_ENTRIES:
            file.write(entry + "\n")     # \n ends the line
    print(f"   (A dusty old log book was just created: {os.path.basename(OLD_LOG_FILE)})")


def write_entry():
    today = datetime.date.today().isoformat()     # like "2026-09-23"
    print(f"\n   Log entry for {today}")
    print("   Weather: " + ", ".join(WEATHER_TYPES))

    weather = input("   What's the weather? ").strip().lower()
    while weather not in WEATHER_TYPES:
        weather = input("   Pick one from the list: ").strip().lower()

    ships = input("   How many ships did you see? ").strip()
    while not ships.isdigit():
        ships = input("   A whole number, please: ").strip()

    note = input("   Anything else to write down? ").strip()
    # A "|" in the note would mess up our format, so swap it out
    note = note.replace("|", "/")
    if note == "":
        note = "Nothing to report."

    line = f"{today} | {weather} | {ships} | {note}"

    # LOOK: "a" means APPEND. It adds to the END of the file and keeps
    # everything that's already there. If the file doesn't exist yet,
    # "a" makes it.
    with open(LOG_FILE, "a", encoding="utf-8") as file:
        file.write(line + "\n")

    print(f"\n   Written to the log:\n   {line}")


def read_log(filename):
    """Print every line of a log file."""
    # LOOK: "r" means READ. It's the default, so open(filename) works too.
    # If the file doesn't exist, Python raises FileNotFoundError.
    try:
        with open(filename, "r", encoding="utf-8") as file:
            number = 0
            # LOOK: a for loop over a file gives you one line at a time
            for line in file:
                number += 1
                # Each line ends with "\n". .strip() takes it off.
                print(f"   {number:>3}  {line.strip()}")
        if number == 0:
            print("   The log is empty.")
    except FileNotFoundError:
        print("   There's no log yet! Write your first entry.")


def log_report():
    """Read the log, add up the numbers and save a report to a new file."""
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as file:
            # LOOK: .readlines() gives you ALL the lines as a list
            lines = file.readlines()
    except FileNotFoundError:
        print("   No log yet. Nothing to report!")
        return

    days = 0
    total_ships = 0
    busiest_day = ""
    most_ships = -1
    weather_count = {}      # a dictionary, like {"fog": 3, "clear": 1}
    bad_lines = 0

    for line in lines:
        # LOOK: .split(" | ") cuts the line into its four parts
        parts = line.strip().split(" | ")
        if len(parts) != 4:
            bad_lines += 1           # someone edited the file by hand!
            continue

        date = parts[0]
        weather = parts[1]
        try:
            ships = int(parts[2])
        except ValueError:
            bad_lines += 1
            continue

        days += 1
        total_ships += ships
        weather_count[weather] = weather_count.get(weather, 0) + 1
        if ships > most_ships:
            most_ships = ships
            busiest_day = date

    # Build the report as a list of lines
    report = []
    report.append("LANTERN POINT LIGHT: LOG REPORT")
    report.append(f"Made on {datetime.date.today().isoformat()}")
    report.append("")
    report.append(f"Days logged ........ {days}")
    report.append(f"Ships seen ......... {total_ships}")
    if days > 0:
        report.append(f"Ships per day ...... {total_ships / days:.1f}")
        report.append(f"Busiest day ........ {busiest_day} ({most_ships} ships)")
    report.append("")
    report.append("Weather:")
    for weather, count in weather_count.items():
        report.append(f"  {weather:<8} {'#' * count} {count}")
    if bad_lines > 0:
        report.append("")
        report.append(f"({bad_lines} lines didn't make sense and were skipped)")

    print()
    for line in report:
        print("   " + line)

    # LOOK: "w" makes a brand new report every time, replacing the old one.
    with open(REPORT_FILE, "w", encoding="utf-8") as file:
        for line in report:
            file.write(line + "\n")
    print(f"\n   Report saved to {os.path.basename(REPORT_FILE)}. Open it in any text editor!")


def search_log():
    word = input("\n   Search the log for: ").strip().lower()
    found = 0
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as file:
            for line in file:
                if word in line.lower():
                    print("   " + line.strip())
                    found += 1
    except FileNotFoundError:
        print("   No log yet!")
        return
    print(f"\n   Found {found} line(s) with '{word}'.")


def old_log(keeper_name):
    """Read the old log one line at a time. Then... something writes back."""
    print("\n   You open the old log book. The pages are damp.")
    print("   (Press Enter to turn each page.)\n")

    with open(OLD_LOG_FILE, "r", encoding="utf-8") as file:
        # LOOK: .readline() reads just ONE line. When there are no more
        # lines, it gives back an empty string "".
        pages = 0
        line = file.readline()
        while line != "":
            input("   " + line.strip())
            pages += 1
            line = file.readline()

    print("\n   You close the book. Behind you, the lamp flickers.")
    print("   When you open it again, there's a new line at the bottom,")
    print("   in wet ink...\n")

    # The more times you read it, the more it has to say.
    replies = [
        f"{keeper_name} read this log tonight. I watched from the stairs.",
        f"{keeper_name} came back to read it again. I knew they would.",
        f"{keeper_name}, the lamp is flickering. Did you notice?",
        f"Stop reading, {keeper_name}. Go and check on the lamp.",
        f"I'm in the lamp room now, {keeper_name}. It's warm up here.",
    ]
    times_read = pages - len(OLD_ENTRIES)          # one new line per visit
    reply = replies[min(times_read, len(replies) - 1)]

    today = datetime.date.today().isoformat()
    new_line = f"{today} | fog | 0 | {reply}"

    # LOOK: "a" adds this line to the end of the old log. It's really in
    # the file now. Open old_keepers_log.txt in a text editor and see!
    with open(OLD_LOG_FILE, "a", encoding="utf-8") as file:
        file.write(new_line + "\n")

    print("   " + new_line)


def start_over():
    sure = input("\n   This ERASES your whole log. Type ERASE to be sure: ").strip()
    if sure == "ERASE":
        # LOOK: opening with "w" and writing nothing leaves an empty file.
        with open(LOG_FILE, "w", encoding="utf-8") as file:
            pass
        print("   The log is empty. A fresh start.")
    else:
        print("   Phew. Nothing erased.")


def where_are_my_files():
    print(f"\n   Your files are in this folder:\n   {FOLDER}\n")
    # LOOK: os.listdir() lists every file in a folder
    for name in sorted(os.listdir(FOLDER)):
        if name.endswith(".txt"):
            size = os.path.getsize(os.path.join(FOLDER, name))
            print(f"   {name:<28} {size:>6} bytes")


# =========================================================================
# THE MENU
# =========================================================================

print(LIGHTHOUSE)
create_old_log()
keeper = input("\n   Keeper, what's your name? ").strip().title() or "Keeper"
print(f"\n   Welcome to Lantern Point, {keeper}. The last keeper left in a hurry.")

running = True
while running:
    print("""
   1) Write today's log entry      5) Read the OLD keeper's log
   2) Read your log                6) Start your log over
   3) Make a log report            7) Where are my files?
   4) Search your log              0) Quit""")
    choice = input("\n   Pick one: ").strip()

    if choice == "1":
        write_entry()
    elif choice == "2":
        print()
        read_log(LOG_FILE)
    elif choice == "3":
        log_report()
    elif choice == "4":
        search_log()
    elif choice == "5":
        old_log(keeper)
    elif choice == "6":
        start_over()
    elif choice == "7":
        where_are_my_files()
    elif choice == "0":
        running = False

print(f"\n   Keep the lamp lit, {keeper}.\n")


# =========================================================================
# CHALLENGES
#
# 1. Write three log entries, then quit. Open keepers_log.txt in a text
#    editor (Notepad, TextEdit, VS Code). Is it all there? Run the
#    program again. Is it still there?
#
# 2. In write_entry(), change "a" to "w". Write two entries. What
#    happened to the first one? Change it back!
#
# 3. Add a line to keepers_log.txt BY HAND that breaks the format, like
#    "hello". What does the log report do with it?
#
# 4. Add "iceberg" to WEATHER_TYPES. Why does nothing else need to change?
#
# 5. Add a menu option that counts how many lines are in the old log.
#    Read it a few times. What's happening to that number?
#
# 6. Make the report also say which weather was most common.
#
# 7. BIGGER: Add a "ships.txt" file where each line is a ship's name.
#    When you log an entry, pick a random ship from that file to put in
#    the note. (Hint: .readlines() and random.choice())
# =========================================================================
