interface PatchNote {
   version: string;
   content: string[][];
}

export const PatchNotes: PatchNote[] = [
   {
      version: "0.1.91",
      content: [["Bugfix", "Fix Cannon Workshop typo"]],
   },
   {
      version: "0.1.90",
      content: [
         ["Content", "Renaissance Age is here!"],
         [
            "Content",
            "12 New Renaissance Tech: Optics, Banking, University, Chemistry, Exploration, Printing Press, Enlightenment, Firearm, Colonialism, Private Ownership, Constitution, Revolution",
         ],
         [
            "Content",
            "12 New Renaissance Buildings: Lens Workshop, Bank, University, Coal Mine, Canon Workshop, Printing House, Museum, Gunpowder Mill, Frigate Builder, Bond Market, Courthouse, Dynamic Workshop",
         ],
         [
            "Content",
            "4 New Buildings: Sandpit (Bronze Age), Painter's Guild (Iron Age), Glassworks (Classical Age), Coin Mint (Classical Age)",
         ],
         [
            "Content",
            "5 New Wonders: Oxford University, Forbidden City, St. Peter's Basilica, Himeji Castle, Taj Mahal",
         ],
         [
            "Content",
            "5 New Great People: Leonardo da Vinci, Martin Luther, William Shakespeare, René Descartes, Zheng He, Cosimo de' Medici",
         ],
         ["Bugfix", "Fix a bug where science are included in total empire value"],
         ["Bugfix", "Fix a bug where Parthenon did not give correct multipliers"],
      ],
   },
   {
      version: "0.1.89",
      content: [["Bugfix", "Fix a rare bug where reborn might causes game to stuck"]],
   },
   {
      version: "0.1.88",
      content: [["Bugfix", "Fix shortcut sometimes are registered incorrectly (4th fix)"]],
   },
   {
      version: "0.1.87",
      content: [["QoL", "Improve Reborn UI and remove useless buttons"]],
   },
   {
      version: "0.1.86",
      content: [
         [
            "Content",
            "Reborn is here! Now you can reborn with a new empire, keep all your great people and collect more great people based on your empire value",
         ],
         ["QoL", "Add tooltip to resource bar"],
      ],
   },
   {
      version: "0.1.85",
      content: [
         ["QoL", "Censor's Office shows percentage of transportation workers"],
         ["Bugfix", "Fix shortcut sometimes are registered incorrectly (3rd fix)"],
         ["Bugfix", "Fix a bug where offline production consumes Warp (it should not)"],
      ],
   },
   {
      version: "0.1.84",
      content: [
         ["Content", "Allow cap offline production time in Petra"],
         ["Bugfix", "Fix building upgrade cost amount is incorrect"],
      ],
   },
   {
      version: "0.1.83",
      content: [
         [
            "Content",
            "New Wonder: Petra - Generate time warp when you are offline, which you can use to accelerate your empire",
         ],
         [
            "Content",
            "Time Warp: cost 1 warp for each cycle and accelerate your empire to run at 2x speed (controlled by Petra)",
         ],
         ["Content", "New Great Person: Empress Wu Zetian - +1 Transport Capacity Multiplier"],
         ["Content", "New Great Person: Rurik - +2 Happiness"],
         ["Balance", "Tang Of Shang: +0.5 Science from Idle Workers"],
         ["Balance", "Restore default offline production time to 4 hours"],
         ["QoL", "Transport lines will update in real-time"],
         ["Bugfix", "Fix warehouse autopilot mode will result in storage overflow"],
         ["Bugfix", "Fix building upgrade progress bar is incorrect"],
      ],
   },
   {
      version: "0.1.82",
      content: [
         ["Balance", "Architecture now provides +1 Builder Capacity Multiplier"],
         [
            "Content",
            "New Wonder: Terracotta Army - All Iron Mining Camps get +1 Production Multiplier, Worker Capacity Multiplier and Storage Multiplier. Iron Forges get +1 Production Multiplier for each adjacent Iron Mining Camp",
         ],
         [
            "Content",
            "New Wonder: Hanging Garden - +1 Builder Capacity Multiplier. Adjacent aqueducts get +1 Production, Storage and Worker Capacity multiplier",
         ],
         [
            "Content",
            "New Wonder: Persepolis - All Copper Mining Camps, Logging Camps and Stone Quarries get +1 Production Multiplier, Worker Capacity Multiplier and Storage Multiplier",
         ],
         ["Bugfix", "Fix sometimes games does not load for new players"],
      ],
   },
   {
      version: "0.1.81",
      content: [
         ["Balance", "Optimize offline production and increase the cap to 8 hours (from 4 hours)"],
         [
            "Balance",
            "When science is produced in buildings, it will appear in Headquarter (Roman Forum) - thus not taking storage space in the building",
         ],
         [
            "Bugfix",
            "Schools change to: 1 Faith + 1 Poem -> 88 Science (Previously it requires Pizza, which does not exists yet",
         ],
         ["Bugfix", "Fix moving camera does not work after resizing the window"],
         ["Bugfix", "Fix building cost is not calculated correctly"],
         [
            "Content",
            "New Wonder: Angkor Wat - All adjacent buildings get +1 Worker Capacity Multiplier. Provide 1000 Workers",
         ],
         ["Bugfix", "Fix building upgrade not showing the correct percentage"],
      ],
   },
   {
      version: "0.1.80",
      content: [
         [
            "Content",
            "New Wonder: Hagia Sophia - Buildings with 0% Production Capacity are exempt from -1 happiness. Consumes 10 Faith and produce 10 happiness",
         ],
         [
            "Content",
            "New Wonder: Angkor Wat - All adjacent buildings get +1 Worker Capacity Multiplier. Provide 1000 Workers",
         ],
         ["Bugfix", "Fix building upgrade not showing the correct percentage"],
      ],
   },
   {
      version: "0.1.79",
      content: [
         ["Balance", "Apartments change to: 1 Cheese + 2 Meat + 1 Bread -> 84 Worker"],
         ["Balance", "Houses change to: 1 Wheat + 1 Water -> 6 Worker"],
         ["Balance", "Bakery change to: 1 Wheat + 1 Water -> 1 Bread"],
         ["Balance", "Marbleworks is now unlocked by Construction"],
         ["Balance", "Mausoleum At Halicarnassus is now unlocked by City State"],
         ["Balance", "Bakery is now unlocked by City State"],
         ["Balance", "Cheese Maker is now unlocked by Literature"],
         ["Balance", "Sword Forge is now unlocked by Architecture"],
         ["Balance", "Apartment is now unlocked by Democracy"],
         ["Content", "Add Warehouse building (unlocked by Road & Wheel)"],
         ["Content", "Add Warehouse autopilot mode (unlocked by Machinery)"],
         ["Content", "Add total empire value in the resource panel"],
         ["Bugfix", "Fix building level sometimes disappears"],
         ["Bugfix", "Fix new players get stuck at the loading screen"],
         ["QoL", "Add an option enables market to clear all trades after market update"],
      ],
   },
   {
      version: "0.1.78",
      content: [
         ["Bugfix", "Fix transports are sometimes made from incorrect buildings"],
         ["Bugfix", "Fix building status icon showing up on buildings that are being upgraded"],
         ["QoL", "When selecting a tile, show all incoming transports on map"],
      ],
   },
   {
      version: "0.1.77",
      content: [
         ["Bugfix", "Fix builder capacity when constructing wonders are not calculated correctly"],
         ["Bugfix", "Fix transport multiplier not being applied correctly"],
         ["QoL", "If a building is not producing, an icon will show on the top left indicating the reason"],
         ["QoL", "Show transport multiplier in worker section in building page"],
         ["QoL", "Building color will now apply to spinner"],
         ["QoL", "For progress for each transportation in building page"],
         ["QoL", "In building list, show how many buildings are currently on the map"],
         ["QoL", "When a wonder affect adjacent buildings, the relevant tiles will be highlighted"],
      ],
   },
   {
      version: "0.1.76",
      content: [
         ["Content", "New Wonder: Mausoleum At Halicarnassus - free transportation within 2 tile range"],
         [
            "Balance",
            "Add Transport Capacity Multiplier. Road & Wheel technology now provides +1 Transport Capacity Multiplier",
         ],
         ["Balance", "Construction cost for wonders has been increased"],
         ["QoL", "Show Builder/Transport Capacity Multiplier in Headquarter"],
         [
            "Bugfix",
            "Make transport more consistent: transports now take 1 second to travel for 1 tile. Previously it is inconsistent",
         ],
         ["Bugfix", "Fix buildings sometimes showing 0 amount 0 cost transports"],
         ["Bugfix", "Fix buildings not showing correct transport sources"],
      ],
   },
   {
      version: "0.1.75",
      content: [
         [
            "QoL",
            "Add a progress in loading screen when calculating offline production (this will make the overall calculation a bit slower but the game will not appear stuck)",
         ],
         ["QoL", "Revert certain optimizations in 0.1.74 that cause transportation issues"],
         ["QoL", "Temporarily cap the offline production time to 4h to avoid game taking forever to load"],
      ],
   },
   {
      version: "0.1.74",
      content: [
         [
            "QoL",
            "Improve offline earning speed by 2x. But it is still not fast enough when offline time gets very long",
         ],
      ],
   },
   {
      version: "0.1.73",
      content: [
         ["Bugfix", "Fix transport amount is incorrect when a building does not have enough resources"],
         ["QoL", "Redesign building list page: now showing building input and output"],
         ["Content", "New Wonder: Lighthouse Of Alexandria"],
      ],
   },
   {
      version: "0.1.72",
      content: [
         ["Bugfix", "Fix Temple of Heaven not providing boost"],
         ["QoL", "Rewrite shortcut manager to prevent ghost shortcut"],
         ["QoL", "Loading page now shows more detailed loading stages"],
         [
            "Balance",
            "Happiness from each working building type now becomes happiness from each well-stocked building type" +
               " - if a building stopped production because of full storage, it will count when calculating happiness",
         ],
         ["Balance", "Decrease base science generation from idle workers from 1 to 0"],
         ["Balance", "Worker capacity multipliers will applied to builders as well"],
         ["Balance", "Increase base storage from ~15 min of production to 1 hour of production"],
         ["Balance", "Base storage calculation now counts production after multipliers"],
         ["Balance", "Storage of Market and Caravansary is increased. Storage multipliers now apply to both"],
         ["Content", "New Wonder: Colossus Of Rhodes"],
      ],
   },
   {
      version: "0.1.71",
      content: [
         [
            "Feature",
            "Offline production is here: now your production will fully simulate while you are offline. " +
               "Offline production will start to count after you are offline for more than 1 minute. " +
               "You need to be able to connect to the server to claim offline production",
         ],
         ["QoL", "Market now allows setting production capacity"],
         ["QoL", "Market now shows the actual amount per cycle, instead of just exchange rate"],
         ["Bugfix", "Fix market not showing stockpile sliders"],
      ],
   },
   {
      version: "0.1.67",
      content: [
         [
            "Balance",
            "Market exchange rate will now fluctuate every market refresh. Different markets will have different fluctuations",
         ],
         ["Bugfix", "Fix tech page shows blank after clicking on unreleased tech item"],
         ["Bugfix", "Fix resource bar sometimes shows incorrect layout"],
         ["Bugfix", "Fix long chat text can cause layout overflow"],
      ],
   },
   {
      version: "0.1.66",
      content: [
         [
            "Balance",
            "Your highest tier working building will provide corresponding happiness (Tier 3 building will provide 3 happiness)",
         ],
         [
            "QoL",
            "Add a resource bar showing happiness, available workers, busy workers, science and non-working buildings",
         ],
         ["QoL", "Add a shortcut to repeat last build buildings"],
         [
            "QoL",
            "Builder Capacity Multiplier now shows where the multipliers come from like everywhere else",
         ],
      ],
   },
   {
      version: "0.1.65",
      content: [
         ["Bugfix", "Fix shortcuts sometimes not correctly executed"],
         ["Bugfix", "Fix shortcuts sometimes in conflict with input"],
         ["Bugfix", "Fix deposit tile sometimes shows wrong layout"],
         ["QoL", "Allow claiming unclaimed great people in Manage Great People page"],
         ["QoL", "Add a shortcut binding for going back to city when viewing tech tree"],
      ],
   },
   {
      version: "0.1.64",
      content: [["Bugfix", "Fix multiple wonders can be built"]],
   },
   {
      version: "0.1.63",
      content: [
         ["Bugfix", "Fix happiness from wonders are generated before the wonder is completed"],
         ["Bugfix", "Fix Tech Tree sometimes showing the wrong tech"],
      ],
   },
   {
      version: "0.1.62",
      content: [
         ["Balance", "Add Happiness System"],
         ["QoL", "Add keyboard shortcut support: you can assign keys in Options > Shortcut"],
         ["QoL", "Resource color will apply to deposits on the map"],
      ],
   },
   {
      version: "0.1.61",
      content: [
         ["QoL", "Add more theme color customizations, go wild!"],
         ["QoL", "Add custom color support for resources"],
      ],
   },
   {
      version: "0.1.60",
      content: [
         ["QoL", "Add Theme page to manage building colors"],
         ["QoL", "Allow customizing background colors in Theme page"],
         ["QoL", "Move Patch Notes to Help menu"],
         ["Bugfix", "Fix custom color of buildings are not applied until completed"],
         ["Bugfix", "Fix Socrates has wrong multiplier applied"],
         ["Bugfix", "Fix switching Eye Protection UI does not work"],
         ["Bugfix", "Allow setting custom color for Caravansary"],
         ["Bugfix", "Do not show natural wonders in Censor's Office before it is discovered"],
         ["Bugfix", "Actually make chat text selectable"],
      ],
   },
   {
      version: "0.1.59",
      content: [
         ["QoL", "Custom building colors!"],
         ["QoL", "Show a different icon when a building is full in Censor's Office"],
         ["QoL", "Make chat text selectable"],
         ["QoL", "You can click on building names in Censor's Office to move camera to that building"],
         ["QoL", "Add a timer in Market showing countdown to the next market update"],
         ["Bugfix", "Cleanup unused file in the final package"],
         ["Bugfix", "Fix a producing building occasionally shows not producing"],
         ["Bugfix", "Fix production amount floater text not correctly rounded"],
      ],
   },
   {
      version: "0.1.58",
      content: [
         ["Bugfix", "Fix unlimited max stockpile is not correctly applied"],
         ["Bugfix", "Disable initial scroll animation when opening chat window"],
         ["QoL", "Add an error message when trade cannot be filled because of lack of a valid route"],
      ],
   },
   {
      version: "0.1.57",
      content: [
         ["Bugfix", "Disable claiming an ocean tile: you have to be on land to trade"],
         ["Bugfix", "Fix Stonehenge failing to provide production multiplier"],
         ["QoL", "Add a patch notes page and start to write patch notes :-)"],
         [
            "QoL",
            "You can click the name in the chat to mention someone, and the player mentioned will be notified",
         ],
      ],
   },
];
