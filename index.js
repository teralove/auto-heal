// vers 0.0.0b

const format = require('./format.js');

	Skills = [
		67299764,	// priest heal
		67159764,	// mystic heal
		67198964	// mystic cleanse
	];
	
	// lockOn : cast
	LockOnCast = {
		67159764: 67159774,//  mystic focus heal
		67299764: 67299774, // priest focus heal
		67198964: 67198974 // mystic cleanse
	};
	
	
	//
	// Abnormality checks never fully worked properly, so there are ignored atm. Left the id codes just in case I did figure out a way.
	//
	PveAbnormals = [
		801650, // ???
		99000030, // VHHM 1st boss stun?
		
//		700802, //??
		
		980102, // ???
		980202,  // VHHM Last boss debuff?
		980203  // VHHM Last boss debuff?
	];
	
	PvpAbnormals = [
		701330, 701332, 701101, // mystic sleep?
		701331, // mystic stunball
		701320, // mystic fear
		700501, // mystic zenobia
		701421, // mystic mire
//		701202, // mystic exhaustion
//		701202, //Mystic Knock down?
//		700829, //Mystic Volley (poison)
//		27160, //Mystic Volley (endruance)

		801202, //Priest sleep
//		800800, //Priest Fiery SLow
//		10153093, // Priest Fiery slow???
//		801920, //Priest Vortex Knock up
//		801901, //Priest Vortex Knock up
		28070, //Priest Final Reprisal slow (glyph)

		600800, //Archer CQ Kick
		601201, //Archer Stun Trap (ranged)
		600702, //Archer Web Shot
//		601001, //Archer Restraining 			- Uncleansable
		600300, //Archer Stun Trap (ground)
		600400, //Archer Slow Trap (ground)
		26210, //Archer Breakaway Bolt (Slow Glyph)	

		10154021, //Ninja Chakra Thrus (Stab Stun)

		303, //Sorc Lightning Trap (Ground)
		500802, //Sorc Sleep
		501400, //Sorc Hailstorm slow
		500500, //Sorc Frost Sphere slow
		500200, //Sorc Glacial Retreat slow
		501323, //Sorc Time Gyre (Root)
		500900, //Sorc Nerve Exhaustion (Silence)
		500728, //Sorc Pain Blast (ground poison)

		400200, //Zerk Staggering Strike
//		400623, //Zerk Fearsome Shout (Fear)

		300700, //Slayer Stunning Backhand
		300900, //Slayer Exhausting Blow
		300201, //Slayer Backstab root
		300400, //Slayer Startling Kick

		101001, //Warr Backstab stun
		101400, //Warr Poison Blade
		100527, //Warr Pounce
		101220, //Warr Combative (endurance?)
		88128200, //Warr Combative ???
		101900, //Warr Binding Sword (Pull)
		100300, //Warr Battle Cry stun
		100901, //Warr Cascade stun
		900200, //Warr Auto slow?

//		200302, //Lanc Debilitate one of these is auto slow
///		200352, //Lanc Debilitate
		200400, //Lanc Shield Bash (Stun)
//		200100, //Lanc Leash pull
//		201400, //Lanc Chained Leash
//		201103, //Lancer Lockdown Blow (slow)
//		201200, //Lancer Menacing Wave 			-- Uncleansable


		10151080, //Reaper Smite (stun)
//		10151160, //Reaper whipsaw (heal reduction)
		10151032, //Reaper Soul Reversal (mark)
		10151033, //Reaper Soul Reversal (stun)
		10151060, //Reaper Cable Step (stun)

		10153140, //Brawler Hammered (endurance reduction)
		10153030, //Brawler Flipkick (stun)

		10152021, //Gunner Arc Bomb (stun)
		10152033, //Gunner Time Bomb (movement speed?)
//		10152030, //Time bomb lift
//		10152034, //Time bomb lift
		10152052, //Rapid Fire (slow)
		10152230 //HB Self Destruct (stun)
	];
	
	
	
module.exports = function AutoLockon(dispatch) {
	
	const MAXIMUM_DISTANCE = 900;  //~35 meters, ignore members further than this
	const MAXIMUM_HP = 0.97;       //(healing) ignore members that have more HP% than this
	
	let enabled = false,
	userId;
	
	let playerLocation = {x: 0, y: 0, z: 0};
	let locations = [];
	
	let partyMemberList = [];
	let partyMemberStats = [];
	let playerBuffs = [];
	
	dispatch.hook('S_LOGIN', 2, (event) => {
		userId = event.playerId;
		let job = event.model % 100;
		(job != 7 && job != 8) ? enabled = false : enabled = true;
	})	
	
	dispatch.hook('S_LEAVE_PARTY', 1, (event) => {
		if (!enabled) return;
		
		//playerLocation = {x: 0, y: 0, z: 0};
		locations = [];
		partyMemberList = [];
		partyMemberStats = [];
		playerBuffs = [];
	})
		
	dispatch.hook('C_PLAYER_LOCATION', 1, (event) => {
		if (!enabled) return;
		
		playerLocation.x = event.x1;
		playerLocation.y = event.y1;
		playerLocation.z = event.z1;
	})	 
	
	dispatch.hook('S_PARTY_MEMBER_INTERVAL_POS_UPDATE', 2, (event) => {
		if (!enabled) return;
		if (!partyMemberList || !partyMemberList.members) return;

		let playerIsInParty = false;
		for (let i in partyMemberList.members) {
			if (partyMemberList.members[i].cid - event.target == 0) {
				playerIsInParty = true;
			}
		}
		if (!playerIsInParty) return;
		
		for (let i in locations) {
			if (locations[i].target - event.target == 0) {
				locations[i].x = event.x;
				locations[i].y = event.y;
				locations[i].z = event.z;
				return;
			}
		}
		
		locations.push({
			target: event.target,
			x: event.x,
			y: event.y,
			z: event.z
		});	
	})
	
	
	dispatch.hook('S_USER_LOCATION', 1, (event) => {
		if (!enabled) return;

		if (!partyMemberList || !partyMemberList.members) return;
		
		let playerIsInParty = false;
		for (let i in partyMemberList.members) {
			if (partyMemberList.members[i].cid - event.target == 0) {
				playerIsInParty = true;
			}
		}
		if (!playerIsInParty) return;
		
		for (let i in locations) {
			if (locations[i].target - event.target == 0) {
				locations[i].x = event.x1;
				locations[i].y = event.y1;
				locations[i].z = event.z1;
				return;
			}
		}
		
		locations.push({
			target: event.target,
			x: event.x1,
			y: event.y1,
			z: event.z1
		});
	})	 

	dispatch.hook('S_PARTY_MEMBER_CHANGE_HP', 2, (event) => {
		
		if (!enabled || event.playerId == userId) return;
		
		for (let i in partyMemberStats) {
			if (partyMemberStats[i].playerId == event.playerId) {
				partyMemberStats[i].percHp = (event.currentHp / event.maxHp);
				return;
			}
		}
		
		partyMemberStats.push({
			cid: getPlayerCid(event.playerId),
			playerId: event.playerId,
			percHp: (event.currentHp / event.maxHp)
		});	
		
	})
	
	
	dispatch.hook('C_START_SKILL', 1, (event) => {
		if (!enabled) return;

		if (Skills.includes(event.skill)) {

			let targetMembers;
			if (event.skill == 67198964 || event.skill == 67198974) {
				//console.log('cleansing');
				targetMembers = getMembersToCleanse();
			} else {
				//console.log('healing');
				targetMembers = getMembersToHeal();
				
			}
			
			if (targetMembers && targetMembers.length > 0) {
				for (let i in targetMembers) {
					setTimeout(() => {
						dispatch.toServer('C_CAN_LOCKON_TARGET', 1, {
							target: targetMembers[i].cid,
							unk: 0,
							skill: event.skill
						})
					}, 5);
					
					setTimeout(() => {
						dispatch.toClient('S_CAN_LOCKON_TARGET', 1, {
							target: targetMembers[i].cid,
							unk: 0,
							skill: event.skill,
							ok: 1
						})
					}, 10);
				}
				
				setTimeout(() => {
					let newEvent = event;
					newEvent.skill = LockOnCast[event.skill];
					if (newEvent.skill) {
						dispatch.toServer('C_START_SKILL', 1, newEvent);
					}
				}, 50);
				
			}
		}
	})	
	
	dispatch.hook('S_PARTY_MEMBER_ABNORMAL_ADD', 3, (event) => {
		if (!enabled || !partyMemberList || !partyMemberList.members) return;
		if (partyMemberList.members.length <= 5) return;
				
		for (let i in playerBuffs) {
			if (playerBuffs[i].playerId == event.playerId) {
				if (!playerBuffs[i].abnormals.includes(event.id)) {
					playerBuffs[i].abnormals.push(event.id);
				}
				return;
			}
		}
		
		playerBuffs.push({
			cid: getPlayerCid(event.playerId),
			playerId: event.playerId,
			abnormals: [event.id]
		});		
	})
	
	dispatch.hook('S_PARTY_MEMBER_ABNORMAL_REFRESH', 3, (event) => {
		if (!enabled || !partyMemberList || !partyMemberList.members) return;
		if (partyMemberList.members.length <= 5) return;
		
		for (let i in playerBuffs) {
			if (playerBuffs[i].playerId == event.playerId) {
				if (!playerBuffs[i].abnormals.includes(event.id)) {
					playerBuffs[i].abnormals.push(event.id);
				}
				return;
			}
		}
		
		playerBuffs.push({
			cid: getPlayerCid(event.playerId),
			playerId: event.playerId,
			abnormals: [event.id]
		});		
	})
		
	dispatch.hook('S_PARTY_MEMBER_ABNORMAL_DEL', 2, (event) => {
		if (!enabled || !partyMemberList || !partyMemberList.members) return;
		if (partyMemberList.members.length <= 5) return;
		
		for (let i in playerBuffs) {
			if (playerBuffs[i].playerId == event.playerId) {
				if (!playerBuffs[i].abnormals.includes(event.id)) {
					let index = playerBuffs[i].abnormals.indexOf(event.id);
					playerBuffs.splice(index, 1);
				}
				return;
			}
		}
	})		
	
	dispatch.hook('S_PARTY_MEMBER_ABNORMAL_CLEAR', 1, (event) => {
		if (!enabled || !partyMemberList || !partyMemberList.members) return;
		if (partyMemberList.members.length <= 5) return;
		
		for (let i in playerBuffs) {
			if (playerBuffs[i].playerId == event.playerId) {
				playerBuffs[i].abnormals = [];
				return;
			}
		}
	})
	
	

	dispatch.hook('S_PARTY_MEMBER_LIST', 5, (event) => {
		
		if (!enabled) return;
		//playerLocation = {x: 0, y: 0, z: 0};
		locations = [];
		partyMemberList = event;
		partyMemberStats = [];
		playerBuffs = [];
    })
	
	function getMembersToCleanse()
	{
		let result = [];
		if (!partyMemberList) {
			return result;
		}
		
		if (partyMemberList.members) {
			if (partyMemberList.members.length > 5) {
				
				for (let i in playerBuffs) {
					if (getDistanceFromMe(playerBuffs[i].cid) >= MAXIMUM_DISTANCE) continue; // too far away
					if (isPlayerDead(playerBuffs[i].cid)) continue; // is dead
					
					if (playerHasAbnormality(playerBuffs[i].abnormals)) {
						result.push({cid: playerBuffs[i].cid});
					} else {
					}
					
					if (result.length >= 4)  {
						break;
					}
				}
			}
			else // not in a raid
			{
				for (let i in partyMemberList.members) {
					if (partyMemberList.members[i].playerId != userId) {
						if (getDistanceFromMe(partyMemberList.members[i].cid) > MAXIMUM_DISTANCE) continue;
						if (isPlayerDead(partyMemberList.members[i].cid)) continue;

						// TODO: Check if player has abnormality?
						
						result.push({cid: partyMemberList.members[i].cid});
					}
				}
			}
		}

		
/* 		if (partyMemberList.members.length > 5) {
			for (let i in playerBuffs) {
				if (playerBuffs[i].playerId == event.playerId) {
					if (!playerBuffs[i].abnormals.includes(event.id)) {
						let index = playerBuffs[i].abnormals.indexOf(event.id);
						playerBuffs.splice(index, 1);
					}
					break;
				}
			}
		} */
		
		
		return result;
	}
	
	function playerHasAbnormality(memberAbnormals) {
		if (memberAbnormals) {
			for (let i = 0; i < memberAbnormals.length; i++) {				
				if (PveAbnormals.includes(memberAbnormals[i]) || PvpAbnormals.includes(memberAbnormals[i]) ) {
					
					let index = -1;
					index = PveAbnormals.indexOf(memberAbnormals[i]);
					if (index >= 0)
						PveAbnormals.splice(index, 1);
					
					index = -1;
					index = PvpAbnormals.indexOf(memberAbnormals[i]);
					if (index >= 0)
						PvpAbnormals.splice(index, 1);
					
					return true;
				}
			}
		}
		return false;
	}
	
	function getMembersToHeal()
	{
		let result = [];
		// get list of players that need heals and can be healed
		for (let i in partyMemberStats) {
			if (getDistanceFromMe(partyMemberStats[i].cid) >= MAXIMUM_DISTANCE) { // too far away
				continue;
			} else if (partyMemberStats[i].percHp > MAXIMUM_HP || partyMemberStats[i].percHp == 0) { // is full or dead
				continue;
			}
			result.push(partyMemberStats[i]);
		}
		
		// if in a raid, make sure only 4 maximum is locked on
		if (partyMemberStats.length > 4) {			
			// trim out the strongest ones
			while (result.length > 4) {
				let highestHp = 0;
				let foundIndex = -1;
				for (let i in result) {
					if (highestHp <= result[i].percHp) { // remove healthiest player
						highestHp = result[i].percHp;
						foundIndex = i;
					}
					result.splice(foundIndex, 1);
				}
			}
		}
		
		return result;
	}
	
	function trimFarAwayPlayers(arr) 
	{
		for(let i = 0; i < arr.length; i++) {
			if (getDistanceFromMe(arr[i].cid) >= MAXIMUM_DISTANCE) {
				arr.splice(i, 1);
				break;
			}
		}
		return arr;	
	}
	
	function trimFullHealthAndDeadPlayers(arr)
	{
		for(let i = 0; i < arr.length; i++) {
			if (arr[i].percHp > MAXIMUM_HP || arr[i].percHp == 0) {
				arr.splice(i, 1);
				break;
			}
		}
		return arr;
	}
	
	function trimDeadPlayers(arr)
	{
		for(let i = 0; i < arr.length; i++) {
			if (arr[i].percHp == 0) {
				arr.splice(i, 1);
				break;
			}
		}
		return arr;
	}
	
	function isPlayerDead(cid) {
		for(let i = 0; i < partyMemberStats.length; i++) {
			if (partyMemberStats[i].cid - cid == 0) {
				if (partyMemberStats[i].percHp == 0) {
					return true;
				}
			}
		}
		return false;
	}
	
	function getDistanceFromMe(target) {
		
		let result = 999999;
		let difference = {x: 0, y: 0, z: 0};
		
		let targetLocation;
		for (let i in locations) {
			if (locations[i].target - target == 0) {
				targetLocation = locations[i];
			}
		}		
		
		if (playerLocation && targetLocation) {
			difference.x = playerLocation.x - targetLocation.x;
			difference.y = playerLocation.y - targetLocation.y;
			difference.z = playerLocation.z - targetLocation.z;
			
			result = Math.sqrt(
				Math.pow(difference.x, 2) +
				Math.pow(difference.y, 2) +
				Math.pow(difference.z, 2));
				
		}		
		return result;
	}
	
	
	function getPlayerCid(playerId)
	{
		let result;
		for(let i in partyMemberList.members) {
			if (partyMemberList.members[i].playerId == playerId)
				return partyMemberList.members[i].cid;
		}
		return result;
	}
	
    const chatHook = event => {		
		let command = format.stripTags(event.message).split(' ');
		
		if (['!autolockon'].includes(command[0].toLowerCase())) {
			toggleModule();
			return false;
		}
	}
	dispatch.hook('C_CHAT', 1, chatHook)	
	dispatch.hook('C_WHISPER', 1, chatHook)
  	
	// slash support
	try {
		const Slash = require('slash')
		const slash = new Slash(dispatch)
		slash.on('autolockon', args => toggleModule())
	} catch (e) {
		// do nothing because slash is optional
	}
	
	function toggleModule() {
		enabled = !enabled;
		systemMessage((enabled ? 'enabled' : 'disabled'));
	}
	
	function systemMessage(msg) {
		dispatch.toClient('S_CHAT', 1, {
			channel: 1,//24,
			authorID: 0,
			unk1: 0,
			gm: 0,
			unk2: 0,
			authorName: '',
			message: ' (auto-lockon) ' + msg
		});
	}

}