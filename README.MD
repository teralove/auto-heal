# Auto Lockon

- Instantly Focus Heal and cleanse party members without needing to lockon.

## Commands:
* **!autolockon**    - Toggles on/off

## Notes
* Only works for Focus Heal (Priest + Mystic) and Mystic's Cleanse. Never bothered adding support for immersion, arrow volley, TN, VoC, etc.
* Focus Heal(Priest and Mystic), will auto-lockon and immediately heal 4 party members with the lowest HP. Works up to 35m. Can remove the distance glyph and spend the points elsewhere.
* Mystic Cleanse, auto cleanses everyone in a party, also works up to 35m. Disabled if you're in a raid. Had some trouble prioritizing abnormalities and ignoring uncleansable debuffs. Didn't spend enough time figuring it out, so I just disabled while in raids.
* Been casually tinkering with this module for a few months now. The code is messy and unoptimized, it was something I was playing around with and never intended to release. I was hesitant on a release since I felt it broke the game too much, especially in 3v3's. But since another developer released their own version, I guess it doesn't matter anymore.
* Probably won't spend more time on this, feel free to pull request, bug fix, optimize, etc.
