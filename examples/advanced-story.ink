// Advanced Ink Story Example
// This demonstrates various Ink features

VAR player_name = "Hero"
VAR health = 100
VAR has_key = false
VAR visited_forest = false

-> start

=== start ===
Welcome, {player_name}! Your adventure begins now.
Current health: {health}

+ [Enter the dark forest] -> forest
+ [Explore the ancient castle] -> castle
+ [Visit the mysterious shop] -> shop

=== forest ===
~ visited_forest = true
You step into the dark forest. The trees loom overhead.

{health > 50:
    You feel strong enough to continue.
- else:
    You're feeling weak but press on.
}

* [Search for herbs] 
    ~ health = health + 20
    You found healing herbs! Health increased to {health}.
    -> forest_choice
* [Fight the wolf]
    ~ health = health - 30
    You defeated the wolf but took damage. Health: {health}
    {health <= 0:
        -> death
    }
    -> forest_choice

= forest_choice
What will you do next?
+ [Return to start] -> start
+ [Go deeper into the forest] -> forest_deep
+ [Leave the area] -> END

= forest_deep
In the depths of the forest, you find a golden key!
~ has_key = true
+ [Take the key and leave] -> start

=== castle ===
You approach the massive stone castle.

{has_key:
    You have a golden key. Perhaps it opens something here?
    * [Use the key on the main gate]
        The key fits perfectly! You enter the castle treasury.
        You found incredible treasure!
        -> victory
    * [Explore the courtyard instead] -> castle_courtyard
- else:
    The main gate is locked. You'll need a key.
    * [Explore the courtyard] -> castle_courtyard
    * [Return to start] -> start
}

= castle_courtyard
The courtyard is overgrown with vines.
* [Search the area]
    You find nothing of interest.
    -> start
* [Return to entrance] -> castle

=== shop ===
An old merchant greets you.

"Welcome! I have potions for sale."

+ [Buy health potion (cost: nothing, it's free!)]
    ~ health = 100
    "Here you go! Health restored to {health}."
    -> shop_continue
+ [Just browse] -> shop_continue

= shop_continue
+ [Return to start] -> start
+ [Leave] -> END

=== victory ===
Congratulations! You've completed your adventure successfully!
Final health: {health}
{visited_forest: You explored the forest. }
-> END

=== death ===
Your health reached zero. Game over!
+ [Start again] -> start
-> END
