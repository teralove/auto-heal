const Command = require('command');
const config = require('./config.js');
    
module.exports = function AutoHeal(dispatch) {
    const command = Command(dispatch);
    
    let enabled = false, // gets enabled when you log in as a healer
        debug = false,
        playerId = 0,
        gameId = 0,
        playerLocation = {},
        partyMembers = [],
        job = -1,
        glyphs = null;
    
    command.add('autoheal', (p1)=> {
        if (p1 == null) {
            config.autoHeal = !config.autoHeal;
        } else if (p1.toLowerCase() === 'off') {
            config.autoHeal = false;
        } else if (p1.toLowerCase() === 'on') {
            config.autoHeal = true;
        } else if (p1.toLowerCase() === 'debug') {
            debug = !debug;
            command.message('Debug ' + (debug ? 'enabled' : 'disabled'));
            return;
        } else if (!isNaN(p1)) {
            config.autoHeal = true;
            config.hpCutoff = (p1 < 0 ? 0 : p1 > 100 ? 100 : p1);
        } else {
            command.message(p1 +' is an invalid argument');
            return;
        }        
        command.message('Healing ' + (config.autoHeal ? 'enabled (' + config.hpCutoff + '%)' : 'disabled'));
    });
    
    command.add('autocleanse', (p1) => {
        if (p1 == null) {
            config.autoCleanse = !config.autoCleanse;
        } else if (p1.toLowerCase() === 'off') {
            config.autoCleanse = false;
        } else if (p1.toLowerCase() === 'on') {
            config.autoCleanse = true;
        } else {
            command.message(p1 +' is an invalid argument for cleanse command');
            return;
        }
        command.message('Cleansing ' + (config.autoCleanse ? 'enabled' : 'disabled'));
    });
    
    command.add('autocast', (p1)=> {
        if (p1 == null) {
            config.autoCast = !config.autoCast;
        } else if (p1.toLowerCase() === 'off') {
            config.autoCast = false;
        } else if (p1.toLowerCase() === 'on') {
            config.autoCast = true;
        } else {
            command.message(p1 +' is an invalid argument for cast command');
            return;
        }        
        command.message('Casting ' + (config.autoCast ? 'enabled' : 'disabled'));
    });
    
    dispatch.hook('S_LOGIN', 10, (event) => {
        playerId = event.playerId;
        gameId = event.gameId;
        job = (event.templateId - 10101) % 100;
        enabled = (config.Skills[job]) ? true : false;
    })
       
    dispatch.hook('S_PARTY_MEMBER_LIST', 7, (event) => {
        if (!enabled) return;
        // refresh locations of existing party members.
        for (let i = 0; i < event.members.length; i++) {
            for (let j = 0; j < partyMembers.length; j++) {
                if (partyMembers[j]) {
                    if (event.members[i].gameId.equals(partyMembers[j].gameId)) {
                        event.members[i].loc = partyMembers[j].loc;
                        event.members[i].hpP = partyMembers[j].hpP;
                    }
                }
            }
        }
        partyMembers = event.members;
        // remove self from targets
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].gameId.equals(gameId)) {
                partyMembers.splice(i, 1);
                return;
            }
        }
    })
    
    dispatch.hook('S_LEAVE_PARTY', 1, (event) => {
        partyMembers = [];
    })
    
    dispatch.hook('C_PLAYER_LOCATION', 5, (event) => {
        if (!enabled) return;
        playerLocation = event;
    })
    
    dispatch.hook('S_SPAWN_ME', 3, (event) => {
        playerLocation.gameId = event.gameId;
        playerLocation.loc = event.loc;
        playerLocation.w = event.w;
    })
    
    dispatch.hook('S_SPAWN_USER', 13, (event) => {
        if (!enabled) return;
        if (partyMembers.length != 0) {
            for (let i = 0; i < partyMembers.length; i++) {
                if (partyMembers[i].gameId.equals(event.gameId)) {
                    partyMembers[i].loc = event.loc;
                    partyMembers[i].hpP = (event.alive ? 100 : 0);
                    return;
                }
            }
        }
    })
    
    dispatch.hook('S_USER_LOCATION', 5, (event) => {
        if (!enabled) return;
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].gameId.equals(event.gameId)) {
                partyMembers[i].loc = event.loc;
                return;
            }
        }
    })
    
    dispatch.hook('S_USER_LOCATION_IN_ACTION', 2, (event) => {
        if (!enabled) return;
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].gameId.equals(event.gameId)) {
                partyMembers[i].loc = event.loc;
                return;
            }
        }
    })
    
    dispatch.hook('S_INSTANT_DASH', 3, (event) => {
        if (!enabled) return;
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].gameId.equals(event.gameId)) {
                partyMembers[i].loc = event.loc;
                return;
            }
        }
    })
    
    dispatch.hook('S_PARTY_MEMBER_CHANGE_HP', 4, (event) => {
        if (!enabled) return;
        if (playerId == event.playerId) return;
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].playerId === event.playerId) {
                partyMembers[i].hpP = (event.currentHp / event.maxHp) * 100;
                return;
            }
        }
    })
    
    dispatch.hook('S_PARTY_MEMBER_STAT_UPDATE', 3, (event) => {
        if (!enabled) return;
        if (playerId == event.playerId) return;
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].playerId === event.playerId) {
                partyMembers[i].hpP = (event.curHp / event.maxHp) * 100;
                return;
            }
        }
    })
    
    dispatch.hook('S_DEAD_LOCATION', 2, (event) => {
        if (!enabled) return;
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].gameId.equals(event.gameId)) {
                partyMembers[i].loc = event.loc;
                partyMembers[i].hpP = 0;
                return;
            }
        }
    })
    
    dispatch.hook('S_LEAVE_PARTY_MEMBER', 2, (event) => {
        if (!enabled) return;
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].playerId === event.playerId) {
                partyMembers.splice(i, 1);
                return;
            }
        }
    });
     
    dispatch.hook('S_LOGOUT_PARTY_MEMBER', 1, (event) => {
        if (!enabled) return;
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].playerId === event.playerId) {
                partyMembers[i].online = false;
                return;
            }
        }
    });
    
    dispatch.hook('S_BAN_PARTY_MEMBER', 1, (event) => {
        if (!enabled) return;
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].playerId === event.playerId) {
                partyMembers.splice(i, 1);
                return;
            }
        }
    });    
    
    dispatch.hook('C_START_SKILL', 7, (event) => {
        if (!enabled) return;
        if (partyMembers.length == 0) return; // be in a party
        if (event.skill.id / 10 & 1 != 0) { // is casting (opposed to locking on)
            playerLocation.w = event.w;
            return; 
        }
        let skill = Math.floor(event.skill.id / 10000);
        
        if(config.Skills[job] && config.Skills[job].includes(skill)) {
            if (skill != 9 && !config.autoHeal) return; // skip heal if disabled
            if (skill == 9 && !config.autoCleanse) return; // skip cleanse if disabled
            if (skill == 9 && partyMembers.length > 4) return; // skip cleanse if in a raid
            
            let targetMembers = [];
            let maxTargetCount = getMaxTargets(skill);
            if (skill != 9) sortHp();
            for (let i = 0; i < partyMembers.length; i++) {
                if (partyMembers[i].online &&
                    partyMembers[i].hpP != undefined &&
                    partyMembers[i].hpP != 0 &&
                    ((skill == 9) ? true : partyMembers[i].hpP <= config.hpCutoff) && // (cleanse) ignore max hp
                    partyMembers[i].loc != undefined &&
                    (partyMembers[i].loc.dist3D(playerLocation.loc) / 25) <= config.maxDistance && 
                    (Math.abs(partyMembers[i].loc.z - playerLocation.loc.z) / 25) <= config.maxVertical)
                    {
                        targetMembers.push(partyMembers[i]);
                        if (targetMembers.length == maxTargetCount) break;
                    }
            }
            
            if (targetMembers.length > 0) {
                if (debug) outputDebug(event.skill);
                for (let i = 0; i < targetMembers.length; i++) {
                    setTimeout(() => {
                        dispatch.toServer('C_CAN_LOCKON_TARGET', 3, {target: targetMembers[i].gameId, skill: event.skill.id});
                    }, 5);
                }
                
                if (config.autoCast) {
                    setTimeout(() => {
                        dispatch.toServer('C_START_SKILL', 7, Object.assign({}, event, {w: playerLocation.w, skill: (event.skill.id + 10)}));
                    }, 10);
                }
            }
        }
        
    })

    dispatch.hook('S_CREST_INFO', 2, (event) => {
        if (!enabled) return;
        glyphs = event.crests;
    })
    
    dispatch.hook('S_CREST_APPLY', 2, (event) => {
        if (!enabled) return;
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
        
    function outputDebug(skill) {
        let out = '\nAutoheal Debug... Skill: ' + skill.id + '\tpartyMemebers.length: ' + partyMembers.length;
        for (let i = 0; i < partyMembers.length; i++) {
            out += '\n' + i + '\t';
            let name = partyMembers[i].name;
            name += ' '.repeat(21-name.length);
            let hp = '\tHP: ' + partyMembers[i].hpP.toFixed(2);
            let dist = '\tDist: ' + (partyMembers[i].loc.dist3D(playerLocation.loc) / 25).toFixed(2);
            let vert = '\tVert: ' + (Math.abs(partyMembers[i].loc.z - playerLocation.loc.z) / 25).toFixed(2);
            let online = '\tOnline: ' + partyMembers[i].online;
            out += name + hp + dist + vert + online;
        }
        console.log(out)
    }
}
