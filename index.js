// vers 0.0.3b

const format = require('./format.js');

Skills = [
	67298964, // priest heal I
	67299064, // priest heal II
	67299164, // priest heal III
	67299264, // priest heal IV
	67299364, // priest heal V
	67299464, // priest heal VI
	67299564, // priest heal VII
	67299664, // priest heal VIII
	67299764, // priest heal IX

	67158964, // mystic heal I
	67159064, // mystic heal II
	67159164, // mystic heal III
	67159264, // mystic heal IV
	67159364, // mystic heal V
	67159464, // mystic heal VI
	67159564, // mystic heal VII
	67159664, // mystic heal VIII
	67159764, // mystic heal IX
	67159864, // mystic heal X
	67198964 // mystic cleanse
];

    // lockOn : auto cast
LockOnCast = {
	67298964: 67298974, // priest focus heal I
	67299064: 67299074, // priest focus heal II
	67299164: 67299174, // priest focus heal III
	67299264: 67299274, // priest focus heal IV
	67299364: 67299374, // priest focus heal V
	67299464: 67299474, // priest focus heal VI
	67299564: 67299574, // priest focus heal VII
	67299664: 67299674, // priest focus heal VIII
	67299764: 67299774, // priest focus heal IX

	67158964: 67158974, // mystic focus heal I
	//67159064: 67159074, // mystic focus heal II
	//67159164: 67159174, // mystic focus heal III
	//67159264: 67159274, // mystic focus heal IV
	//67159364: 67159374, // mystic focus heal V
	//67159464: 67159474, // mystic focus heal VI
	//67159564: 67159574, // mystic focus heal VII
	//67159664: 67159674, // mystic focus heal VIII
	//67159764: 67159774, // mystic focus heal IX
	//67159864: 67159874, // mystic focus heal X
	67198964: 67198974  // mystic cleanse
};


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

	dispatch.hook('S_PARTY_MEMBER_CHANGE_HP', 3, (event) => {

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
				targetMembers = getMembersToCleanse();
			} else {
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
					}, 60);
				}

				setTimeout(() => {
					let newEvent = event;
					newEvent.skill = LockOnCast[event.skill];
					if (newEvent.skill) {
						dispatch.toServer('C_START_SKILL', 1, newEvent);
					}
				}, 120);

			}
		}
	})


	dispatch.hook('S_PARTY_MEMBER_LIST', 5, (event) => {

		if (!enabled) return;
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
			if (partyMemberList.members.length > 5) { //in a raid
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

		return result;
	}

	function getMembersToHeal() {
		let result = [];
		// get list of players that need heals and can be healed
		for (let i in partyMemberStats) {
			if (getDistanceFromMe(partyMemberStats[i].cid) >= MAXIMUM_DISTANCE)  // too far away
				continue;
            if (partyMemberStats[i].percHp > MAXIMUM_HP || partyMemberStats[i].percHp == 0)
                continue;

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

	function trimFarAwayPlayers(arr) {
		for(let i = 0; i < arr.length; i++) {
			if (getDistanceFromMe(arr[i].cid) >= MAXIMUM_DISTANCE) {
				arr.splice(i, 1);
				break;
			}
		}
		return arr;
	}

	function trimFullHealthAndDeadPlayers(arr) {
		for(let i = 0; i < arr.length; i++) {
			if (arr[i].percHp > MAXIMUM_HP || arr[i].percHp == 0) {
				arr.splice(i, 1);
				break;
			}
		}
		return arr;
	}

	function trimDeadPlayers(arr) {
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


	function getPlayerCid(playerId) {
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
