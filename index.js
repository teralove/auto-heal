// OP Required
// - S_LOGIN
// - S_PARTY_MEMBER_LIST
// - S_LEAVE_PARTY
// - C_PLAYER_LOCATION
// - S_SPAWN_USER
// - S_USER_LOCATION
// - S_USER_LOCATION_IN_ACTION
// - S_PARTY_MEMBER_CHANGE_HP
// - C_START_SKILL
// - S_CREST_INFO
// - S_CREST_APPLY
const Command = require('command');

module.exports = function AutoHeal(dispatch) {
    
    const Skills = {
        6: [ // Priest
            19, // Focus Heal
            37 // Immersion
        ],
        7: [ // Mystic
            5, // Titanic Favor
            9  // Arun's Cleansing Touch
        ]
    };
    
    const MaxDistance = 32; // in-game meters. can work up to 35m
    const MaxHp = 0.97;     //(healing) ignore members that have more HP% than this
    
    let enabled = true,
        autoCleanse = true,
        playerId = 0,
        playerLocation,
        partyMembers = [],
        job,
        glyphs;
        
    const command = Command(dispatch);
    
    command.add('autoheal', ()=> {
        enabled = !enabled;
        command.message('(auto-heal) ' + (enabled ? 'enabled' : 'disabled'));
    });
    
    command.add('autocleanse', ()=> {
        autoCleanse = !autoCleanse;
        command.message('(auto-heal) Cleansing ' + (enabled ? 'enabled' : 'disabled'));
    });
    
    dispatch.hook('S_LOGIN', 10, (event) => {
        playerId = event.playerId;
        job = (event.templateId - 10101) % 100;
        (Skills[job]) ? enabled = true : enabled = false; 
    })
    
    dispatch.hook('S_PARTY_MEMBER_LIST', 6, (event) => {
        partyMembers = event.members;
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].playerId == playerId) {
                partyMembers.splice(i, 1);
                return;
            }
        }
    })
    
    dispatch.hook('S_LEAVE_PARTY', 1, (event) => {
        partyMembers = [];
    })
    
    dispatch.hook('C_PLAYER_LOCATION', 3, (event) => {
        playerLocation = event;
    })
    
    dispatch.hook('S_USER_LOCATION', 3, (event) => {
        if (partyMembers.length != 0) {
            for (let i = 0; i < partyMembers.length; i++) {
                if (partyMembers[i].gameId.equals(event.gameId)) {
                    partyMembers[i].loc = event.loc;
                    return;
                }
            }
        }
    })
    
    dispatch.hook('S_USER_LOCATION_IN_ACTION', 2, (event) => {
        if (partyMembers.length != 0) {
            for (let i = 0; i < partyMembers.length; i++) {
                if (partyMembers[i].gameId.equals(event.gameId)) {
                    partyMembers[i].loc = event.loc;
                    return;
                }
            }
        }
    })
    
    dispatch.hook('S_SPAWN_USER', 13, (event) => {
        if (partyMembers.length != 0) {
            for (let i = 0; i < partyMembers.length; i++) {
                if (partyMembers[i].gameId.equals(event.gameId)) {
                    partyMembers[i].loc = event.loc;
                    partyMembers[i].hpP = (event.alive ? 1 : 0);
                    return;
                }
            }
        }
    })
    
    dispatch.hook('S_PARTY_MEMBER_CHANGE_HP', 3, (event) => {
        if (playerId == event.playerId) return;
        
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].playerId == event.playerId) {
                partyMembers[i].hpP = event.currentHp / event.maxHp;
                return;
            }
        }
    })
    
    dispatch.hook('C_START_SKILL', 5, (event) => {
        if (!enabled) return;
        if (partyMembers.length == 0) return; // be in a party
        if ((event.skill - 0x4000000) / 10 & 1 != 0) { // is casting (opposed to locking on)
            playerLocation.w = event.w;
            return; 
        }
        
        let skill = Math.floor((event.skill - 0x4000000) / 10000);
        if(Skills[job] && Skills[job].includes(skill)) {
            if(skill == 9 && !autoCleanse) return; // skip cleanse if disabled
            if(skill == 9 && partyMembers.length > 4) return;  // skip cleanse if in a raid

            let targetMembers = [];
            let maxTargetCount = getMaxTargets(skill);
            if (skill != 9) sortHp();
            for (let i = 0; i < partyMembers.length; i++) {
                if (partyMembers[i].online &&
                    partyMembers[i].hpP != undefined &&
                    partyMembers[i].hpP > 0 &&
                    ((skill == 9) ? true : partyMembers[i].hpP < MaxHp) && // (cleanse) ignore max hp
                    partyMembers[i].loc != undefined &&
                    (partyMembers[i].loc.dist3D(playerLocation.loc) / 25) <= MaxDistance)
                    {
                        targetMembers.push(partyMembers[i]);
                        if (targetMembers.length == maxTargetCount) break;
                    }
            }
            
            if (targetMembers.length > 0) {
                for (let i = 0; i < targetMembers.length; i++) {
                    setTimeout(() => {
                        dispatch.toServer('C_CAN_LOCKON_TARGET', 1, {target: targetMembers[i].gameId, skill: event.skill});
                    }, 5);
                }
                
                setTimeout(() => {
                    dispatch.toServer('C_START_SKILL', 5, Object.assign({}, event, {w: playerLocation.w, skill: (event.skill + 10)}));
                }, 10);
            }
        }
        
    })
    
    dispatch.hook('S_CREST_INFO', 2, (event) => {
        glyphs = event.crests;
    })
    
    dispatch.hook('S_CREST_APPLY', 2, (event) => {
        for (let i = 0; i < glyphs.length; i++) {
            if (glyphs[i].id == event.id) {
                glyphs[i].enable = event.enable;
                return;
            }
        }
    })
    
    function getMaxTargets (skill) {
        switch(skill) {
            case 19: return isGlyphEnabled(28003) ? 4 : 2;
            case 37: return 1;
            case 5: return isGlyphEnabled(27000) ? 4 : 2;
            case 9: return (isGlyphEnabled(27063) || isGlyphEnabled(27003)) ? 5 : 3;
        }
        return 1;
    }
    
    function isGlyphEnabled(glyphId) {
        for(let i = 0; i < glyphs.length; i++) {
            if (glyphs[i].id == glyphId && glyphs[i].enable) {
                return true;
            }
        }
        return false;
    }
    
    function sortHp() {
        partyMembers.sort(function (a, b) {
            return parseFloat(a.hpP) - parseFloat(b.hpP);
        });
    }
    
}