// OP Required
// - S_LOGIN
// - S_SPAWN_ME
// - S_PARTY_MEMBER_LIST
// - S_LEAVE_PARTY
// - C_PLAYER_LOCATION
// - S_SPAWN_USER
// - S_USER_LOCATION
// - S_PARTY_MEMBER_CHANGE_HP
// - C_START_SKILL
const Command = require('command');

module.exports = function AutoHeal(dispatch) {
    
    const Skills = {
        6: [ // Priest
            19 // Focus Heal
        ],
        7: [ // Mystic
            5, // Titanic Favor
            9  // Arun's Cleansing Touch
        ]
    };
    
    const MaxDistance = 900;  //~35 meters
    const MaxHp = 0.97;       //(healing) ignore members that have more HP% than this
    
    let enabled = true,
        autoCleanse = true,
        playerId = 0,
        playerLocation = null,
        partyMembers = [],
        job;
        
    const command = Command(dispatch);
    
    command.add('autoheal', ()=> {
        enabled = !enabled;
        command.message('(auto-heal) ' + (enabled ? 'enabled' : 'disabled'));
    });
    
    command.add('autocleanse', ()=> {
        autoCleanse = !autoCleanse;
        command.message('(auto-heal) Cleansing ' + (enabled ? 'enabled' : 'disabled'));
    });
    
    dispatch.hook('S_LOGIN', 9, (event) => {
        playerId = event.playerId;
        job = (event.templateId - 10101) % 100;
        (job == 6 || job == 7) ? enabled = true : enabled = false; 
    })
        
    dispatch.hook('S_SPAWN_ME', 2, (event) => {
        playerLocation = event.loc;
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
        playerLocation = event.loc;
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
    
    dispatch.hook('C_START_SKILL', 4, (event) => {
        if (!enabled) return;
        if (partyMembers.length == 0) return; // be in a party
        if ((event.skill - 0x4000000) / 10 & 1 != 0) return; // is casting (opposed to locking on)
            
        let skill = Math.floor((event.skill - 0x4000000) / 10000);
        if(Skills[job] && Skills[job].includes(skill)) {
            
            let targetMembers = [];
            if (job == 7 && skill == 9 && autoCleanse) {
                targetMembers = getMembersToCleanse();
            } else {
                targetMembers = getMembersToHeal();
            }
            
            if (targetMembers.length > 0) {
                for (let i = 0; i < targetMembers.length; i++) {
                    setTimeout(() => {
                        dispatch.toServer('C_CAN_LOCKON_TARGET', 1, {target: targetMembers[i].gameId, skill: event.skill});
                    }, 5);
                    setTimeout(() => {
                        dispatch.toClient('S_CAN_LOCKON_TARGET', 1, {target: targetMembers[i].gameId, skill: event.skill, ok: true})
                    }, 60);
                }
                
                setTimeout(() => {
                    dispatch.toServer('C_START_SKILL', 4, Object.assign({}, event, {skill: (event.skill + 10)}));
                }, 120);
            }
        }
    })
    
    function getMembersToCleanse() {
        let result = [];
        
        if (partyMembers.length > 4) { 
            // in a raid
        } else { 
            // not in a raid
            for (let i = 0; i < partyMembers.length; i++) {
                if (partyMembers[i].online &&
                    partyMembers[i].hpP != undefined &&
                    partyMembers[i].hpP > 0 &&
                    partyMembers[i].loc != undefined &&
                    partyMembers[i].loc.dist3D(playerLocation) < MaxDistance) {
                        result.push(partyMembers[i]);
                    }
            }
        }
        return result;
    }
    
    function sortHp() {
        partyMembers.sort(function (a, b) {
            return parseFloat(a.hpP) - parseFloat(b.hpP);
        });
    }
    
    function getMembersToHeal() {
        let result = [];
        
        sortHp();
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].online &&
                partyMembers[i].hpP != undefined &&
                partyMembers[i].hpP > 0 && 
                partyMembers[i].hpP < MaxHp && 
                partyMembers[i].loc != undefined &&
                partyMembers[i].loc.dist3D(playerLocation) < MaxDistance) {
                    result.push(partyMembers[i]);
                    if (result.length == 4) break;
                }
        }
        return result;
    }
    
}
