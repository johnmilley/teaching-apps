"""
THE FOG ON THE HUMBER
A text adventure set in Corner Brook, Newfoundland and Labrador.

Run it:    python3 fog_on_the_humber.py
           (on Windows: py fog_on_the_humber.py)

No extra installs needed. It only uses Python's built-in modules.

-------------------------------------------------------------------------
FOR STUDENTS: this game is built almost entirely out of IF statements.
Every comment that starts with  # IF:  points at one worth reading.
Here's where to find each kind:

  if / else ................... go_or_stay()
  if / elif / else ............ kitchen_choice(), crossroads()
  elif, and why order matters . show_status()
  comparing numbers (< > >=) .. mill(), fairy_ring()
  comparing strings (==) ...... ask_name()
  in (is it in a list?) ....... go_or_stay(), crossroads()
  in (is it inside a string?) . mummers()
  and / or / not .............. pond(), crossroads(), mill()
  nested ifs (if inside if) ... pond(), hill(), mummers()
  True / False variables ...... mummers(), mill()
  the big if/elif "switch" .... main()
  match / case ................ main(), commented out
-------------------------------------------------------------------------
"""

import random
import textwrap
import time


# =========================================================================
# SETTINGS: things you can change
# =========================================================================

TEXT_SPEED = 0.02    # seconds per letter. Set to 0 to print instantly.


# =========================================================================
# THE PLAYER: every scene reads and changes these variables.
# =========================================================================

player_name = ""
inventory = []         # what's in your pockets, like "bread" or "lantern"
nerve = 3              # how brave you feel. If it hits 0, you run home.
minutes_left = 90      # it's 10:30 PM. The mill whistle blows at midnight.
loonies = 0            # Nan gives you some before you leave
knows_the_way = False  # True once you've seen the path from Crow Hill
found_mitten = False
mummers_done = False


def reset_game():
    """Put every player variable back to how it started."""
    global player_name, inventory, nerve, minutes_left, loonies
    global knows_the_way, found_mitten, mummers_done
    player_name = ""
    inventory = []
    nerve = 3
    minutes_left = 90
    loonies = 0
    knows_the_way = False
    found_mitten = False
    mummers_done = False


# =========================================================================
# HELPERS: small tools the scenes use. You don't need to understand
# these yet. Skip down to the SCENES.
# =========================================================================

def say(text):
    """Print text one letter at a time, like someone telling a story."""
    text = textwrap.dedent(text).strip("\n")
    print()
    for letter in text:
        print(letter, end="", flush=True)
        time.sleep(TEXT_SPEED)
    print()


def ask(question):
    """Ask the player something. Returns their answer in lowercase."""
    answer = input("\n" + question + "\n> ")
    return answer.strip().lower()


def ask_number(question):
    """Ask for a whole number. Returns 0 if they type something else."""
    answer = ask(question)
    # IF: .isdigit() is True only when every character is 0-9
    if answer.isdigit():
        return int(answer)
    else:
        return 0


def pause():
    input("\n   (press Enter)")


def spend_time(minutes):
    global minutes_left
    minutes_left = minutes_left - minutes


def show_status():
    """Print the clock, your nerve and your pockets."""
    minutes_gone = 90 - minutes_left
    hour = 10
    minute = 30 + minutes_gone

    # IF: order matters in an elif chain. Python stops at the FIRST
    # condition that's True. If we checked >= 60 first, then 125 minutes
    # would match it, and we'd never get to the >= 120 check.
    if minute >= 120:
        hour = 12
        minute = minute - 120
    elif minute >= 60:
        hour = 11
        minute = minute - 60

    # IF: add a zero so 11:5 shows as 11:05
    if minute < 10:
        clock = str(hour) + ":0" + str(minute)
    else:
        clock = str(hour) + ":" + str(minute)

    if len(inventory) == 0:
        pockets = "nothing but lint"
    else:
        pockets = ", ".join(inventory)

    print()
    print("-" * 64)
    print("  " + clock + " PM   |   Nerve: " + "*" * nerve
          + "   |   Loonies: " + str(loonies))
    print("  Pockets: " + pockets)
    print("-" * 64)


# =========================================================================
# ASCII ART
# =========================================================================

TITLE_ART = r"""
   .      *       ~ ~ ~   THE FOG ON THE HUMBER   ~ ~ ~       *      .

  ___   ___   ___  _  _  ___  ___     ___  ___   ___    ___   _  __
 / __| / _ \ | _ \| \| || __|| _ \   | _ )| _ \ / _ \  / _ \ | |/ /
| (__ | (_) ||   /| .` || _| |   /   | _ \|   /| (_) || (_) || ' <
 \___| \___/ |_|_\|_|\_||___||_|_\   |___/|_|_\ \___/  \___/ |_|\_\

 ~~~~~ ~~~~~~~~ ~~~~~~~ ~~~~~~~~~ ~~~~~~~~ ~~~~~~~~~ ~~~~~~ ~~~~~~~~
    ~~~~~~ ~~~~~~~~~ ~~~~~ ~~~~~~~~~~ ~~~~~~ ~~~~~~~~~~ ~~~~~~ ~~~
       a text adventure in Corner Brook, Newfoundland and Labrador
"""

TEACUP_ART = r"""
              (   )  (   )
               ) (    ) (
              (   )  (   )
            _________________
           |                 |___
           |    N A N ' S    |   \
           |                 |   |
           |                 |___/
            \_______________/
       ______\_____________/______
       \_________________________/
"""

STREET_ART = r"""
      ~   ~    ~   ~    ~   ~    ~    ~   ~    ~   ~
    ~    .-------------------.    ~     ~    ~
  ~      |    WEST  STREET   |       ~      ~     ~
     ~   '---------+---------'   ~     ~      ~
   ~      ~        |        ~     ~      ~       ~
      ~      ~     |     ~     ~     ~      ~
   ~     ~       __|__      ~     ~      ~     ~
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
"""

POND_ART = r"""
             /\            /\
            /  \    /\    /  \                  .
           /____\  /  \  /____\               ( * )
           | [] | /____\ | [] |                 '
           |    | | [] | |    |
    _______|____|_|____|_|____|_________________________
     ~    ~    ~    ~    ~    ~    ~    ~    ~    ~    ~
        ~    ~    ~    Glynmill  Pond    ~    ~    ~
     ~    ~    ~    ~    ~    ~    ~    ~    ~    ~    ~
"""

MUMMER_ART = r"""
               .--------------.
              /   .--.  .--.   \
             |   ( () )( () )   |
             |    '--'  '--'    |
             |     /\/\/\/\     |       "Any mummers
              \    \/\/\/\/    /          'lowed in?"
          .----'-.__________.-'----.
         /  )(  )(  )(  )(  )(  )(  \
        |   lace curtain   oilskins  |
        |    ||                ||    |
            _||_              _||_
           (____)            (____)
"""

MILL_ART = r"""
                  (    )      (     )
                 (      )    (       )
                  )    (      )     (
             ___   |==|        |==|
            |   |  |  |        |  |    ____
       _____|   |__|  |________|  |___|    |_______
      |  [] [] [] [] [] [] [] [] [] [] [] [] []    |
      |  [] [] [] [] [] [] [] [] [] [] [] [] []    |
  ~~~~|____________________________________________|~~~~
    ~     ~     ~     ~    Humber  Arm   ~     ~     ~
"""

HILL_ART = r"""
                                          _
                                         |=|  <-- coin telescope
              _______                    /|\
             |       |                  / | \
             | COOK  |
         ____|_______|____
        /                 \          Captain Cook's Lookout
   ____/                   \______________
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     ~     _/\_     ~    Bay of Islands   ~    _/\__   ~
"""

GHOST_SHIP_ART = r"""
                    |     |     |
                   )_)   )_)   )_)
                  )___) )___) )___)\
                 )____)_)____)_)____)\\
               ______|_____|_____|____\\\__
     ~~~~~~~~~ \                          / ~~~~~~~~~
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
"""

TRAIL_ART = r"""
        /\         /\    /\          /\         /\
       /  \   /\  /  \  /  \   /\   /  \   /\  /  \
      /    \ /  \/    \/    \ /  \ /    \ /  \/    \
        ||     ||     ||     ||     ||     ||     ||
    ____||_____||_____||_____||_____||_____||_____||____
           \    ~    ~    ~    ~    ~    ~    /
      LEFT  \       the old footbridge       /  RIGHT
"""

FAIRY_RING_ART = r"""
          *     .      o      .     *      .
      o      _      _      _      _      o
            ( )    ( )    ( )    ( )
       _    '|'    '|'    '|'    '|'    _
      ( )            .---.             ( )
      '|'           ( o o )            '|'
       _             \ - /              _
      ( )          /|DAISY|\           ( )
      '|'    _       |___|       _     '|'
            ( )     _/   \_     ( )
       o    '|'    ( )   ( )    '|'   o
          *     .  '|'   '|'  .     *
"""

HAG_ART = r"""
               .-~~~~~~~~-.
             .'   _    _   '.
            /    (o)  (o)    \
           |    ,   /\   ,    |
           |     \  ''  /     |
            \     \/\/\/     /
         ____'.____________.'____
        /       z  z  Z  Z       \
       |   ...you can't move...   |
"""

WHISTLE_ART = r"""
        W H E E E E E E E E E E E E E E E ! ! !
                      _||_       ~~~~~~
                     |    |    ~~~~~~~~~~
                     |____|   ~~~~~~~~~~~~
                 ____|____|__________________
"""

HOME_ART = r"""
                  )
                 (       ___________
                  )     /\          \
               __|__   /  \  [] []   \
              /     \ /    \__________\
              | [] |  | [] |   __    |
              |    |  |    |  |  |   |
      ~~~~~~~~|____|__|____|__|__|___|~~~~~~~~
"""


# =========================================================================
# SCENES
# Each scene is a function. It prints some story, asks a question,
# uses IF statements to decide what happens, and then RETURNS the name
# of the next scene as a string, like "crossroads".
# =========================================================================

def title_screen():
    print(TITLE_ART)
    pause()
    return "intro"


def intro():
    print(TEACUP_ART)
    say("""
        It's the last night of October in Corner Brook.

        The fog came in off the Humber Arm at supper time, thick as
        porridge, and it hasn't moved since. You're at Nan's house on
        West Street. The kettle is on. The wind is not.
        """)
    return "ask_name"


def ask_name():
    global player_name
    player_name = input("\nNan squints at you over her glasses. "
                        "'Now which one are you again?'\n> ").strip()

    # IF: == checks if two things are exactly equal.
    # An empty string "" means they just pressed Enter.
    if player_name == "":
        player_name = "my ducky"
        say("'Can't remember your own name? I'll call you my ducky, so.'")

    # IF: .lower() makes the comparison ignore capitals,
    # so "Daisy", "DAISY" and "daisy" all match.
    elif player_name.lower() == "daisy":
        say("""
            Nan's teacup rattles in its saucer.
            'Don't joke about that, my love. Not tonight.'
            """)
    else:
        say("'" + player_name + ". Right. Of course. I knew that.'")

    say("""
        The phone rings. Nan listens, and her face goes white as flour.

        'That was your aunt. Little Daisy wandered off after the
        trick-or-treating. Someone saw her go into the fog by Glynmill
        Pond... following a little light.'

        Nan grips your wrist. Her hand is cold.

        'A light in the fog on a night like this. That's the fairies,
        that is. If she's not home by the mill whistle at midnight,
        she won't come home at all.'
        """)
    return "go_or_stay"


def go_or_stay():
    answer = ask("Will you go out into the fog to find Daisy? (yes / no)")

    # IF: `in` checks whether a value is somewhere in a list.
    # This is shorter than: answer == "yes" or answer == "y" or ...
    if answer in ["yes", "y", "yeah", "yup", "sure"]:
        say("Nan nods slowly. 'Good. Then you'll need something.'")
        return "kitchen_choice"
    elif answer in ["no", "n", "nope"]:
        return "ending_hag"
    else:
        say("'That's not a yes or a no, " + player_name + ".'")
        return "go_or_stay"


def kitchen_choice():
    global nerve, loonies
    say("""
        Nan lays three things on the kitchen table.

        'Take one. Only one, mind. The fog don't like greedy people.'

          1) A heel of Nan's homemade bread
          2) Grandad's old flashlight
          3) A pair of Nan's thick wool vamps (socks)
        """)
    choice = ask("Which one? (1, 2 or 3)")

    # IF: an if / elif / else chain. Exactly ONE of these blocks runs.
    if choice == "1":
        inventory.append("bread")
        say("""
            You tuck the bread in your pocket. It's still warm.
            'Good,' says Nan. 'The Little People can't abide bread.'
            """)
    elif choice == "2":
        inventory.append("flashlight")
        say("""
            You click it on. The beam flickers, then holds.
            'Your grandad walked the tracks with that,' says Nan.
            """)
    elif choice == "3":
        inventory.append("vamps")
        nerve = nerve + 2
        say("""
            You pull the vamps on over your socks. Warm feet, brave heart.
            (Your nerve goes up by 2!)
            """)
    else:
        # The else catches everything we didn't expect: "4", "bread", "".
        say("Nan taps the table. 'One, two or three, my love.'")
        return "kitchen_choice"

    loonies = 2
    say("""
        Nan presses two loonies into your hand. 'For emergencies.'

        You step out the door and the fog closes behind you like a
        curtain.
        """)
    return "crossroads"


def crossroads():
    print(STREET_ART)
    say("""
        You're at the foot of West Street. The streetlights are yellow
        smudges in the fog. Down by the water, the paper mill hums and
        hisses like a sleeping dragon.

        Where will you go?

          1) Glynmill Pond and the old Inn .......... 15 min
          2) The paper mill ........................ 15 min
          3) Captain Cook's Lookout on Crow Hill ... 20 min
          4) The Corner Brook Stream Trail ......... 15 min
        """)
    choice = ask("Pick 1, 2, 3 or 4")

    if choice == "1":
        spend_time(15)
        return "pond"
    elif choice == "2":
        spend_time(15)
        return "mill"
    elif choice == "3":
        spend_time(20)
        return "hill"
    elif choice == "4":
        # IF: `or` means only ONE of the two needs to be True.
        # Any light will do.
        if "flashlight" in inventory or "lantern" in inventory:
            spend_time(15)
            return "trail"
        else:
            lose_nerve_on_dark_trail()
            return "crossroads"
    else:
        say("You turn in a slow circle. Every direction looks the same.")
        spend_time(5)
        return "crossroads"


def lose_nerve_on_dark_trail():
    global nerve
    nerve = nerve - 1
    say("""
        You take three steps onto the trail and the dark swallows you
        whole. You can't see your own hands. Somewhere close by,
        something breathes... slow... and wet.

        You back out onto the street, heart hammering. You need a light.
        (Your nerve drops by 1.)
        """)


def pond():
    global nerve, found_mitten
    print(POND_ART)
    say("""
        Glynmill Pond is black and still. The old Tudor-style Inn looms
        over it, every window dark. Out over the water, a small light
        bobs in the fog, like someone swinging a lantern.

        But there's no one there.

          1) Knock on the door of the Glynmill Inn
          2) Follow the little light over the water
          3) Go back to West Street
        """)
    choice = ask("Pick 1, 2 or 3")

    if choice == "1":
        if mummers_done:
            say("""
                The Inn is quiet now. Far away, you can still hear an
                accordion playing a slow, sad tune.
                """)
            return "pond"
        else:
            return "mummers"

    elif choice == "2":
        # IF: nested ifs. We only get here if they chose 2.
        # Then we check what's in their pockets.
        # `and not` means: they have bread AND they have NOT found the mitten.
        if "bread" in inventory and not found_mitten:
            found_mitten = True
            nerve = nerve + 1
            say("""
                The light swoops close, sniffing, then smells the bread in
                your pocket. It HISSES and zips away across the pond.

                Where it was hovering, something small lies on the shore.
                A purple mitten. Daisy's. She was here.
                (Your nerve goes up by 1!)
                """)
        elif "bread" in inventory:
            say("The light keeps well away from you now. Smart light.")
        else:
            spend_time(30)
            nerve = nerve - 1
            say("""
                You follow the light. It's always just a little ahead.
                Just a little further. Just a little...

                Your feet are cold. Very cold.

                You come to your senses standing up to your knees in the
                middle of Glynmill Pond. The light is gone. So is half an
                hour.

                You've been fairy-led. Nan warned you about this.
                (You lose 30 minutes and 1 nerve.)
                """)
        return "pond"

    elif choice == "3":
        return "crossroads"
    else:
        say("You hesitate. The light over the pond seems to laugh at you.")
        spend_time(5)
        return "pond"


def mummers():
    global nerve, loonies, mummers_done
    print(MUMMER_ART)
    say("""
        The door creaks open before you can knock. Inside, a fire
        crackles in the lobby. In front of it stand three MUMMERS.
        Their faces are hidden under lace curtains and pillowcases. One
        wears a lampshade. One wears oilskins inside out. The third
        squeezes a sad little tune out of an accordion.

        They stomp their rubber boots, all together. The tallest speaks
        in a squeaky voice, breathing IN instead of out:

        'Nobody passes the mummers without answering the riddle...
         ...or paying the toll. One loonie.'

        'I have a mouth but never speak.
         I have a bed but never sleep.
         I run all night but never tire.
         What am I?'
        """)
    answer = ask("Type your answer, or type  pay  to pay a loonie")

    got_through = False   # a True/False variable. We'll change it below.

    # IF: `in` also works on strings! "river" in "a river" is True.
    # So "river", "a river" and "the humber river" all count as correct.
    if "river" in answer or "brook" in answer or "humber" in answer:
        say("""
            The mummers freeze. Then they cheer and stomp and the
            accordion wheezes a happy jig. 'Right on, b'y!'
            """)
        got_through = True

    elif answer == "pay":
        if loonies >= 1:
            loonies = loonies - 1
            say("""
                You hand over a loonie. The tallest mummer bites it,
                checks it's real, and grumbles 'fair enough.'
                """)
            got_through = True
        else:
            nerve = nerve - 1
            say("""
                You turn out your pockets. No loonies. The three masked
                heads tilt at the same time, like birds. You back out
                the door very slowly.
                (Your nerve drops by 1.)
                """)

    else:
        nerve = nerve - 2
        say("""
            The mummers go silent. Then all three laugh at once, a sound
            like ice cracking on the pond. The fire goes out.

            When your eyes adjust, the lobby is empty. But you can feel
            breath on the back of your neck.

            You run. (Your nerve drops by 2. You could come back and try
            again... if you dare.)
            """)

    # IF: a True/False variable can be the whole condition.
    if got_through:
        mummers_done = True
        if "bread" not in inventory:
            inventory.append("bread")
            say("""
                The accordion player hands you a heel of bread wrapped in
                wax paper. 'Mummers always carry a bit of bread on a night
                like this. You'll want it, where you're going.'
                """)
        else:
            nerve = nerve + 1
            say("""
                They hand you a warm lassy bun. You eat it in two bites
                and feel braver. (Your nerve goes up by 1!)
                """)

    pause()
    return "pond"


def mill():
    global nerve
    print(MILL_ART)
    say("""
        Down by the water, the paper mill never sleeps. Steam rolls out
        of it in great white clouds and mixes with the fog. Under one
        buzzing light, an old night watchman sits on an upturned bucket
        with a lantern at his feet.
        """)

    if "lantern" in inventory:
        say("'Still out, are ya? Mind my lantern. Off you go, now.'")
        pause()
        return "crossroads"

    say("""
        'Lookin' for the little one? Saw a light go up the Stream Trail
        a while back. You'll want more than moonlight in there.'

        He taps the lantern with his boot.

        'I'll lend you this. But first... I count the ghosts in this
        mill every night. Guess how many are workin' the night shift
        tonight. One to ten. Three guesses.'
        """)

    secret = random.randint(1, 10)
    won = False

    # IF: three guesses, written out one after another.
    # `if not won` means "only do this if they haven't won yet".
    guess = ask_number("Guess 1 of 3:")
    if guess == secret:
        won = True
    elif guess < secret:
        say("'More than that.'")
    else:
        say("'Fewer than that.'")

    if not won:
        guess = ask_number("Guess 2 of 3:")
        if guess == secret:
            won = True
        elif guess < secret:
            say("'More than that. Last chance, now.'")
        else:
            say("'Fewer than that. Last chance, now.'")

    if not won:
        guess = ask_number("Guess 3 of 3:")
        if guess == secret:
            won = True

    if won:
        inventory.append("lantern")
        say("""
            The watchman slaps his knee. 'Ha! Sharp as a tack, you are.'

            He hands you the lantern. It's heavy and warm and it smells
            like kerosene. 'Bring it back, mind. I'll need it for the
            ghosts.'
            """)
    else:
        nerve = nerve - 1
        say("""
            'It was """ + str(secret) + """.' The watchman shakes his head.

            A shape moves behind the steam, too tall to be a person.
            Something cold pats you on the shoulder. When you turn,
            nobody's there.

            'Come back and try again if you've the nerve,' he says.
            (Your nerve drops by 1.)
            """)
    pause()
    return "crossroads"


def hill():
    global nerve, loonies, knows_the_way
    print(HILL_ART)
    say("""
        You climb Crow Hill, past the last houses, up to Captain Cook's
        Lookout. Up here you're above the fog. It covers the whole city
        like a white sea. Only the tops of the Blow Me Down mountains
        poke out across the Bay of Islands.

        A coin-operated telescope stands at the railing.

          1) Put a loonie in the telescope
          2) Go back down to West Street
        """)
    choice = ask("Pick 1 or 2")

    if choice == "1":
        # IF: nested if / elif / else inside the bigger if
        if knows_the_way:
            say("You've already seen what you needed to see.")
        elif loonies >= 1:
            loonies = loonies - 1
            knows_the_way = True
            nerve = nerve - 1
            say("""
                CLUNK. The telescope whirs and swings around on its own,
                down toward the Stream Trail.

                Through the fog you see a tiny light, deep in the woods.
                At the old footbridge, the trail splits in two. The light
                goes LEFT. Beside it walks a small figure in a pumpkin
                costume. Daisy!

                Then the telescope swings again, out to the Humber Arm.
                A ship with rag sails drifts there with no lights on. A
                pale face on the deck turns and looks straight at you.

                You stumble back from the telescope.
                (Your nerve drops by 1, but now you know: LEFT.)
                """)
            print(GHOST_SHIP_ART)
        else:
            say("You've got no loonies left. The telescope stares at you.")
        pause()
        return "hill"

    elif choice == "2":
        return "crossroads"
    else:
        say("The wind up here steals your words away.")
        spend_time(5)
        return "hill"


def trail():
    global nerve
    print(TRAIL_ART)
    say("""
        The Stream Trail winds into the trees beside the rushing brook.
        Your light makes a small, shaky circle. Outside it there's only
        fog and the sound of water.

        You reach the old footbridge. The trail splits: LEFT and RIGHT.
        """)

    if knows_the_way:
        say("You remember what you saw through the telescope. LEFT.")
    else:
        say("You have no idea which way she went.")

    choice = ask("Which way? (left / right)")

    if choice == "left" or choice == "l":
        spend_time(10)
        return "fairy_ring"
    elif choice == "right" or choice == "r":
        spend_time(15)
        nerve = nerve - 1
        say("""
            The right path sinks into a bog. Cold mud grabs your boots.
            Something grabs your ankle too. A root, you tell yourself.
            Just a root.

            You pull free and stagger back to the footbridge.
            (You lose 15 minutes and 1 nerve.)
            """)
        return "trail"
    else:
        say("You stand there too long. The fog creeps closer.")
        spend_time(5)
        return "trail"


def fairy_ring():
    global nerve
    print(FAIRY_RING_ART)
    say("""
        In a clearing, a perfect ring of pale mushrooms glows like
        moonlight. In the middle sits Daisy in her pumpkin costume,
        giggling and staring at nothing.

        All around the ring, tiny lights bob in the air. Look closer and
        they're little people, no taller than your boot, with faces like
        old dried apples. They turn to look at you. All at the same time.

        'She's ours now,' they whisper. 'Unless you've something better.'

          1) Offer them something from your pockets
          2) Grab Daisy and run
          3) Back away slowly
        """)
    choice = ask("Pick 1, 2 or 3")

    if choice == "1":
        if "bread" in inventory:
            inventory.remove("bread")
            say("""
                You pull out the bread and hold it high. The whispering
                stops. You throw it as far as you can into the dark, and
                the little lights swarm after it, squabbling like gulls.

                You scoop Daisy up and don't look back.
                """)
            return "ending_found"
        elif len(inventory) > 0:
            nerve = nerve - 2
            say("""
                You hold out your """ + inventory[0] + """. The little people
                hiss like a kettle. That's not what they want. Not at all.
                (Your nerve drops by 2.)
                """)
            return "fairy_ring"
        else:
            say("Your pockets are empty. The fairies giggle.")
            return "fairy_ring"

    elif choice == "2":
        # IF: comparing a number. Are you brave enough?
        if nerve >= 4:
            say("""
                You step right into the ring and say, as loud as you can,
                'She's coming home with ME.'

                The little people stare. Then, one by one, they step
                aside. You've got more nerve than they bargained for.
                You grab Daisy's hand and RUN.
                """)
            return "ending_found"
        else:
            say("""
                You lunge for Daisy, but your legs are shaking. The little
                lights swirl around you, faster and faster, and the
                clearing tips sideways...
                """)
            return "ending_fairy_led"

    elif choice == "3":
        say("You take one step back... and stop. You can't leave her.")
        spend_time(5)
        return "fairy_ring"
    else:
        say("The fairies giggle. They like it when you hesitate.")
        spend_time(5)
        return "fairy_ring"


# =========================================================================
# ENDINGS
# =========================================================================

def ending_found():
    print(HOME_ART)
    # IF: a comparison decides which ending you get
    if minutes_left >= 30:
        say("""
            You're back at Nan's with time to spare. The kitchen is warm
            and there's a plate of toutons and molasses on the table.
            Daisy eats three and falls asleep with her face on the table.

            Down by the water, the midnight whistle blows. The fog lifts
            all at once, like someone pulled off a sheet.

            Nan squeezes your hand. 'You did good, """ + player_name + """.
            Better than good.'

                  *** BEST ENDING: Toutons Before Midnight ***
            """)
    else:
        say("""
            You stumble up Nan's front step just as the mill whistle
            screams midnight across the city. Daisy's asleep on your
            shoulder, a bit of mushroom stuck in her hair.

            Nan pulls you both inside and locks the door. Then she
            unlocks it, puts a slice of bread on the step, and locks it
            again. Just in case.

                  *** GOOD ENDING: Just in Time ***
            """)
    return "play_again"


def ending_hag():
    print(HAG_ART)
    say("""
        You tell Nan you're not going. She looks at you for a long time,
        then goes to phone the neighbours.

        You go up to bed. At three in the morning you wake up and you
        CAN'T MOVE. Something heavy is sitting on your chest. Something
        with long grey hair that smells like the bottom of a well.

        It's the Old Hag. She's heard you were feeling lazy.

                  *** ENDING: Hagged ***
        """)
    return "play_again"


def ending_nerve():
    say("""
        Your legs make the decision for you. You run. You run all the
        way back up West Street and don't stop until you're under Nan's
        kitchen table with a blanket over your head.

        Out in the fog, something small laughs, and a light goes out.

                  *** ENDING: Nerve Gone ***
        """)
    return "play_again"


def ending_midnight():
    print(WHISTLE_ART)
    say("""
        The mill whistle screams across the city. MIDNIGHT.

        The fog turns thick as wool. Every streetlight goes out at once.
        When they flicker back on, the fog is gone... and so is every
        trace of Daisy.

        Every October after that, on the foggiest night, people say you
        can see a small light bobbing on the Stream Trail.

                  *** ENDING: The Whistle ***
        """)
    return "play_again"


def ending_fairy_led():
    say("""
        You wake up three days later in a ditch outside Deer Lake. Daisy
        is snoring beside you. Both of your pockets are full of
        blueberries, and neither of you can say where you've been.

        You're home safe. But people do say you've both been a bit
        different since. You hum tunes nobody's ever heard, and you
        never, ever leave the house without bread.

                  *** ENDING: Fairy-Led ***
        """)
    return "play_again"


def play_again():
    answer = ask("Play again? (yes / no)")
    if answer in ["yes", "y"]:
        reset_game()
        return "title"
    else:
        say("Mind the fog on your way home.")
        return "the end"


# =========================================================================
# MAIN: the game loop
# =========================================================================

def main():
    scene = "title"

    while scene != "the end":
        # IF: one big if / elif chain picks which scene function to run.
        # Each scene returns the name of the NEXT scene.
        # To add your own scene: write a function, then add an elif here.
        if scene == "title":
            scene = title_screen()
        elif scene == "intro":
            scene = intro()
        elif scene == "ask_name":
            scene = ask_name()
        elif scene == "go_or_stay":
            scene = go_or_stay()
        elif scene == "kitchen_choice":
            scene = kitchen_choice()
        elif scene == "crossroads":
            show_status()
            scene = crossroads()
        elif scene == "pond":
            show_status()
            scene = pond()
        elif scene == "mummers":
            scene = mummers()
        elif scene == "mill":
            show_status()
            scene = mill()
        elif scene == "hill":
            show_status()
            scene = hill()
        elif scene == "trail":
            show_status()
            scene = trail()
        elif scene == "fairy_ring":
            show_status()
            scene = fairy_ring()
        elif scene == "ending_found":
            scene = ending_found()
        elif scene == "ending_hag":
            scene = ending_hag()
        elif scene == "ending_nerve":
            scene = ending_nerve()
        elif scene == "ending_midnight":
            scene = ending_midnight()
        elif scene == "ending_fairy_led":
            scene = ending_fairy_led()
        elif scene == "play_again":
            scene = play_again()
        else:
            # This helps when you add a scene and forget the elif above.
            print("Uh oh! There's no scene called '" + scene + "'.")
            scene = "the end"

        # MATCH / CASE: the same thing as the if / elif chain above, written
        # another way (Python 3.10 or newer). When you're checking ONE
        # variable against lots of possible values, match is easier to read:
        # no more `scene ==` on every line.
        #
        # To try it: comment out the whole if / elif / else chain above,
        # then remove the "# " from the start of each line below.
        # Keep the indentation, because it still matters!
        #
        # match scene:
        #     case "title":
        #         scene = title_screen()
        #     case "intro":
        #         scene = intro()
        #     case "ask_name":
        #         scene = ask_name()
        #     case "go_or_stay":
        #         scene = go_or_stay()
        #     case "kitchen_choice":
        #         scene = kitchen_choice()
        #     case "crossroads":
        #         show_status()
        #         scene = crossroads()
        #     case "pond":
        #         show_status()
        #         scene = pond()
        #     case "mummers":
        #         scene = mummers()
        #     case "mill":
        #         show_status()
        #         scene = mill()
        #     case "hill":
        #         show_status()
        #         scene = hill()
        #     case "trail":
        #         show_status()
        #         scene = trail()
        #     case "fairy_ring":
        #         show_status()
        #         scene = fairy_ring()
        #     case "ending_found":
        #         scene = ending_found()
        #     case "ending_hag":
        #         scene = ending_hag()
        #     case "ending_nerve":
        #         scene = ending_nerve()
        #     case "ending_midnight":
        #         scene = ending_midnight()
        #     case "ending_fairy_led":
        #         scene = ending_fairy_led()
        #     case "play_again":
        #         scene = play_again()
        #     case _:
        #         # The _ case is like `else`: it matches anything left over.
        #         print("Uh oh! There's no scene called '" + scene + "'.")
        #         scene = "the end"

        # IF: these checks run after EVERY scene. Out of time or out of
        # nerve sends you straight to an ending. (Endings return
        # "play_again", so they skip these checks.)
        if scene != "play_again" and scene != "the end":
            if minutes_left <= 0:
                scene = "ending_midnight"
            elif nerve <= 0:
                scene = "ending_nerve"


# IF: this one is special. It's True when you RUN this file, and False
# when another Python file imports it. You'll see it in lots of programs.
if __name__ == "__main__":
    main()
