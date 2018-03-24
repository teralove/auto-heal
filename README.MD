# auto-heal
tera-proxy module that skips lockons and automatically heals and cleanses party members.

## Dependency
- `Command` module

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
| Mystic - Titanic Favor          |
| Mystic - Arun's Cleansing Touch |
- Heal will auto-lockon and immediately heal up to 4 party members with the lowest HP.
- Mystic's cleanse works only in parties of 5 members or less. Disabled in raids!
- Skills work up to 35m. You can remove the distance glyph and spend the points elsewhere.

## Changelog
<details>

    2.01
    - Renamed module from auto-lockon to auto-heal
    2.00
    - Rewrote module
    - Fixed bug: Casting skills would rotate the player towards north.
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
