"""
05 - FUNCTIONS: POSTCARD FROM THE ROCK

Make an ASCII-art postcard to send home. Pick a picture and a size, write
a message, and Python puts it together.

Every part of the postcard is made by its own small FUNCTION. Big
functions are made by calling small ones.

Run it:   python3 05_functions_postcard.py

-------------------------------------------------------------------------
WHAT TO LOOK FOR  (search for  # LOOK:  in the code)

  def: making a function .............. line()
  parameters (the inputs) ............. line(), pad()
  default values  char="-" ............ line(), box()
  return (the output) ................. every picture function
  functions calling functions ......... box(), make_postcard()
  a function that asks until valid .... ask_number(), ask_choice()
  print vs return (a common mix-up) ... the menu, option 2
  local variables stay inside ......... the menu, option 3
-------------------------------------------------------------------------
"""

import textwrap


# =========================================================================
# SMALL BUILDING-BLOCK FUNCTIONS
# =========================================================================

# LOOK: `def` makes a function. `length` and `char` are PARAMETERS:
# the inputs. char="-" is a DEFAULT: if you don't give a char, it uses "-".
def line(length, char="-"):
    """Return a line of characters, like -------"""
    return char * length


# LOOK: `return` hands a value back to whoever called the function.
def pad(text, width):
    """Add spaces to the end of text until it's `width` characters long."""
    spaces_needed = width - len(text)
    return text + " " * spaces_needed


def centre(text, width):
    """Put text in the middle of a space `width` characters wide."""
    left = (width - len(text)) // 2
    return pad(" " * left + text, width)


# LOOK: a function that calls other functions (line and centre).
def box(text, border="*"):
    """Return text inside a box made of the border character."""
    width = len(text) + 4
    top = line(width, border)
    middle = border + centre(text, width - 2) + border
    return top + "\n" + middle + "\n" + top


# =========================================================================
# PICTURE FUNCTIONS: each one RETURNS a picture as a string
# =========================================================================

def lighthouse(height):
    """A lighthouse. The bigger the height, the taller the tower."""
    art = "     \\ | /\n"
    art += "    -- * --\n"
    art += "      /^\\\n"
    art += "     |[_]|\n"
    for floor in range(height):
        if floor % 2 == 0:
            art += "     |###|\n"
        else:
            art += "     |   |\n"
    art += "    /_____\\\n"
    art += "  ~~~~~~~~~~~~~"
    return art


def iceberg(size):
    """An iceberg. Most of it is hidden under the water!"""
    art = ""
    for row in range(1, size + 1):
        spaces = " " * (size * 2 - row)
        art += spaces + "/" + " " * (row * 2 - 2) + "\\\n"
    art += "~" * (size * 4) + "\n"
    under = size * 2
    for row in range(under):
        width = size * 2 + min(row, under - row)
        spaces = " " * (size * 2 - width // 2)
        art += spaces + ":" * width + "\n"
    art += "(only the tip is above the water!)"
    return art


def puffin(size):
    """A puffin. size is ignored, because puffins are all puffin-sized."""
    return r"""
       .---.
      / o   \___
      \     ___(>
       | \  \
       |  \  \
      (____\__)
        ^^  ^^"""


def whale(size):
    """A humpback whale. Bigger size, bigger spout."""
    spout = ""
    for i in range(size):
        spout += "            : \n"
    return spout + r"""         ___:____     |"\/"|
       ,'        `.    \  /
       |  O        \___/  |
     ~^~^~^~^~^~^~^~^~^~^~^~^~"""


# =========================================================================
# ASKING FUNCTIONS: they keep asking until the answer is good
# =========================================================================

def ask_number(question, low, high):
    """Ask for a whole number between low and high. Keep asking until we get one."""
    while True:
        answer = input(f"{question} ({low}-{high}): ").strip()
        if answer.isdigit() and low <= int(answer) <= high:
            return int(answer)      # LOOK: return ends the function right away
        print(f"   Please type a number from {low} to {high}.")


def ask_choice(question, options):
    """Ask the player to pick one of the options."""
    while True:
        answer = input(f"{question} {options}: ").strip().lower()
        if answer in options:
            return answer
        print("   Pick one from the list.")


# =========================================================================
# THE BIG FUNCTION: it calls lots of the small ones
# =========================================================================

def make_postcard(picture, size, message, to_name, from_name, width=46):
    """Build the whole postcard and return it as one string."""

    # LOOK: choosing which picture function to call
    if picture == "lighthouse":
        art = lighthouse(size)
    elif picture == "iceberg":
        art = iceberg(size)
    elif picture == "puffin":
        art = puffin(size)
    else:
        art = whale(size)

    card = "+" + line(width) + "+\n"
    card += "|" + centre("GREETINGS FROM THE ROCK", width) + "|\n"
    card += "|" + line(width, "=") + "|\n"

    for art_line in art.strip("\n").split("\n"):
        card += "| " + pad(art_line, width - 1) + "|\n"

    card += "|" + line(width, " ") + "|\n"

    # textwrap.wrap splits a long message into lines that fit
    for message_line in textwrap.wrap(message, width - 4):
        card += "|  " + pad(message_line, width - 2) + "|\n"

    card += "|" + line(width, " ") + "|\n"
    card += "|  " + pad("To: " + to_name, width - 2) + "|\n"
    card += "|  " + pad("From: " + from_name, width - 2) + "|\n"
    card += "+" + line(width) + "+"
    return card


# =========================================================================
# PRINT vs RETURN: the mix-up everybody makes at least once
# =========================================================================

def shout_and_print(text):
    print(text.upper() + "!!!")


def shout_and_return(text):
    return text.upper() + "!!!"


# =========================================================================
# THE MENU: this is where the program actually starts running
# =========================================================================

print(box("POSTCARD FROM THE ROCK", "#"))
print("Everything above was made by calling  box('POSTCARD FROM THE ROCK', '#')")

running = True
while running:
    print("""
  1) Make a postcard
  2) See the difference between print and return
  3) See what "local variable" means
  4) Quit""")
    choice = ask_number("\nPick one", 1, 4)

    if choice == 1:
        picture = ask_choice("\nWhat picture?", ["lighthouse", "iceberg", "puffin", "whale"])
        size = ask_number("How big?", 1, 6)
        message = input("Write your message: ").strip()
        if message == "":
            message = "Wish you were here! It's foggy."
        # `or "Nan"` means: if they typed nothing, use "Nan" instead
        to_name = input("Who's it to? ").strip() or "Nan"
        from_name = input("Who's it from? ").strip() or "Me"

        # LOOK: calling a function with ARGUMENTS. The values go into the
        # parameters in order: picture -> picture, size -> size, ...
        postcard = make_postcard(picture, size, message, to_name, from_name)
        print()
        print(postcard)
        print(f'\nThat was made by:  make_postcard("{picture}", {size}, "{message}", '
              f'"{to_name}", "{from_name}")')

    elif choice == 2:
        print("\n  shout_and_print('hello') PRINTS the answer:")
        result = shout_and_print("hello")
        print(f"  ...and it gives back: {result}")

        print("\n  shout_and_return('hello') GIVES BACK the answer:")
        result = shout_and_return("hello")
        print(f"  ...and it gives back: {result}")

        print("""
  A function without `return` gives back None, which means "nothing".
  If you want to USE the answer later (store it, add to it, put it on a
  postcard), the function has to RETURN it.""")

    elif choice == 3:
        # LOOK: `spaces_needed` only exists INSIDE pad(). Out here, Python
        # has never heard of it.
        print("\n  pad() makes a variable called  spaces_needed  inside itself.")
        print("  Can we see it from out here?")
        # globals() holds every variable made OUTSIDE of functions
        print(f"  'spaces_needed' in globals()  ->  {'spaces_needed' in globals()}")
        print("""
  No! Variables made inside a function are LOCAL. They disappear when the
  function ends. That's a good thing: two functions can both use a
  variable called  width  without messing each other up.""")

    else:
        running = False

print("\n" + box("See you later, b'y", "~") + "\n")


# =========================================================================
# CHALLENGES
#
# 1. Call  line(20, "*")  and  line(20) . Why do they look different?
#
# 2. Change the default in box() from "*" to "#". Which boxes change?
#
# 3. Write a function  moose()  that returns a moose picture, and add it
#    to the postcard menu. (You'll need to change make_postcard too.)
#
# 4. Write a function  frame_width(text)  that returns len(text) + 4.
#    Use it inside box() instead of doing the maths there.
#
# 5. The picture functions all take `size`, but puffin() ignores it.
#    Make it draw more puffins when the size is bigger.
#
# 6. Write a function  stamp(price)  that returns a little stamp like
#        +------+
#        | 1.25 |
#        +------+
#    and add it to the top corner of the postcard.
#
# 7. BIGGER: Write  save_postcard(card, filename)  that saves the postcard
#    to a text file. (Peek at program 08 for how files work!)
# =========================================================================
