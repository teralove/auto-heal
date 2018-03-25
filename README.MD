# auto-heal
tera-proxy module that skips lockons and instantly heals and cleanses party members.

## Usage
### `autoheal`
- Toggle on/off
- Default is on
### `autocleanse`
- Toggle on/off
- Default is on

## Info
| Skills affected                 |
| ------------------------------- |
| Priest - Focus Heal             |
| Priest - Healing Immersion      |
| Mystic - Titanic Favor          |
} Mystic - Arun's Cleansing Touch |
- Heals will instantly auto-lockon and heal party members. Prioritizing the lowest HP.
- Mystic's cleanse only works in parties of 5 members or less. Disabled in raids.

## Changelog
<details>

    1.40
    - Faster response
    - Added Priest's Immersion skill.
    - Glyphs affect number of lockon targets.
    - Fixed bug: Casting skills would ignore player rotation
    - Reduced max distance to 30m
    1.30
    - Code update and aesthetics
    - Fixed bug: Locking and casting onto dead targets
    - Added Command dependency
    - Added autocleanse command
    - Removed slash support
    1.20
    - Added heal skills for or lvl characters. You can use it even if u have lowlvl char.
    - Fix hp choosing bug, now targets with full hp will not receive heal.
    1.12
    - Added mystic's focus heal X
    1.11
    - Code aesthetics
    1.10
    - Disabled raid cleanse

</details>

---
