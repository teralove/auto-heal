# auto-heal
Skip lockons and instantly heals/cleanses party members.

## Info
- Skills will instantly lockon and heal/cleanse party members. Heals prioritize the lowest HP.
- Mystic's cleanse only works in parties of 5 members or less. Disabled in raids.
- Auto-casting can be disabled (Skills will pre-lockon onto targets and need to be manually pressed again to cast).

| Skills affected                 |
| ------------------------------- |
| Priest - Focus Heal             |
| Priest - Healing Immersion      |
| Mystic - Titanic Favor          |
| Mystic - Arun's Cleansing Touch |

## Usage
### `autoheal`
- Toggle on/off
- Default is on
### `autoheal [on/off]`
- Enables/disables auto-heals
### `autoheal [HP]`
- Set cutoff for healing. ('autoheal 50' = ignore members with >50% HP. Set to 100 to always heal)
- Default cutoff is 97%
### `autocleanse`
- Toggle on/off
- Default is on
### `autocleanse [on/off]`
- Enables/disables auto-cleansing
### `autocast`
- Toggle on/off
- Default is on
### `autocast [on/off]`
- Enables/disables auto-casting

## Issues
- Skills can ghost if proxy is also using Skill-Prediction (You see animation but nothing happens). Workaround is to disable the skills in SP. [Click here to see how](https://i.imgur.com/bS4VkbX.png)

## Changelog
<details>

    1.65
    - Next Gen update
    1.64
    - BigInt fix
    1.63
    - Update for patch version 74.03
    - Removed redundant text in command messages 
    1.62
    - Updated S_PARTY_MEMBER_CHANGE_HP hook version to 4
    1.61
    - Fix: Misspelled config.js in manifest
    1.60
    - New: autocast command and feature
    - New: Configs stored in separate file
    - New: Debug command
    1.52
    - Fix: Lockons ignoring berserkers with negative health
    - Fix: Locking onto kicked party members
    1.51
    - New: Added support for Caali auto-update.
    1.50
    - New: autoheal and autocleanse commands toggle only their respectable behaviours. 
    - New: autoheal command has argument to set HP cutoff.
    - New: autoheal command has argument to toggle on/off explicitly ('autoheal on/off')
    - New: autocleanse command has argument to toggle on/off explicitly ('autocleanse on/off')
    - New: Vertical distance check.
    - Fixed: Locking onto players that left the party.
    - Fixed: Mod would only start working on players when they had moved.
    - Fixed: Mod would briefly stop working when a dead party member resses.
    - Fixed: Mod would briefly stop working after toggling via command toggle.
    1.42
    - Added S_USER_LOCATION_IN_ACTION hook.
    1.41
    - Updated protocol versions.
    - Set max distance to 32m
    1.40
    - Faster response
    - Added: Priest's Immersion skill.
    - Added: Glyphs affect number of lockon targets.
    - Fixed bug: Casting skills would reset player rotation
    - Reduced max distance to 30m
    1.30
    - Code update and aesthetics
    - Fixed bug: Locking and casting onto dead targets
    - Added Command dependency
    - Added autocleanse command
    - Removed slash support
    1.20
    - Added heal skills for low level characters.
    - Fix hp choosing bug, now targets with full hp will not receive heal.
    1.12
    - Added mystic's focus heal X
    1.11
    - Code aesthetics
    1.10
    - Disabled raid cleanse

</details>

---
