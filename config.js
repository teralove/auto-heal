module.exports = {
     Skills: {
        6: [ // Priest
            19, // Focus Heal
            37  // Immersion
        ],
        7: [ // Mystic
            5, // Titanic Favor
            9  // Arun's Cleansing Touch
        ]
    },
    
    autoCast: true,     // true = skills auto lockon and cast. false = pre-lockon onto targets and casting is done manually
    autoCleanse: true,  // enable mystic cleanse
    autoHeal: true,     // enable healing skills
    hpCutoff: 97,       // (healing only) ignore members that have more HP% than this
    maxDistance: 35,    // in-game meters. can work up to 35m
    maxVertical: 25     // (ignore targets at top of CS ladders, etc). can also be 35m
}