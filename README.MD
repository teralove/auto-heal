# Auto Lockon

- Instantly Focus Heal and cleanse party members without needing to lockon.

## Commands:
* **!autolockon**    - Toggles on/off

## [Issues](https://github.com/teralove/auto-lockon/issues)
* incompatible with skill-prediction
* ghosting, does not compensate for lag. Try different values.
* Healing targetting is unreliable in raids. No cleansing targetting in raids. Works better in parties only.

## Notes
* Focus Heal(Priest and Mystic), will auto-lockon and immediately heal 4 party members with the lowest HP. Works up to 35m. Can remove the distance glyph and spend the points elsewhere.
* Mystic Cleanse, will auto-cleanse everyone in a party. Also works up to 35m. Disabled while in raid because there were some problems prioritizing abnormalities and ignoring uncleansable debuffs. 
* Been casually tinkering with this module for a few months. The code is a bit messy and unoptimized. I never intended to release it because I felt it broke the game too much, especially in 3v3's. But since other auto-lockon modules have been released, I guess this doesn't matter anymore.
* Feel free to pull request, bug fix, optimize, etc.
