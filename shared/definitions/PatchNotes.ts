interface PatchNote {
   version: string;
   content: string[][];
   link?: string;
}

export const PatchNotes: PatchNote[] = [
   {
      version: "0.21.0",
      content: [],
      link: "https://github.com/fishpondstudio/CivIdle/issues/389",
   },
   {
      version: "0.20.1",
      content: [["Bugfix", "Fix a bug where Year of the Snake is not effective when being upgraded"]],
   },
   {
      version: "0.20.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/546723866324501220",
   },
   {
      version: "0.19.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4485117301459257316",
   },
   {
      version: "0.18.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4485116032403374366",
   },
   {
      version: "0.17.1",
      content: [
         ["Bugfix", "Fix a bug where in Athens and Beijing, the festival effect is always on"],
         ["QoL", "Clarify the wordings of festival in Beijing"],
         [
            "QoL",
            "Clarify the wordings of production priority: priority determines the order that buildings transport and produce - a bigger number means a building transports and produces before other buildings. However, a higher priority does not guarantee that the building will transport the resource first. For example, given the following priority order: Coal Power Plan > Coal Mine > Steel Mill, the steel mill will get all the coal produced in the same cycle because it transports and produces immediately after the coal mine",
         ],
      ],
   },
   {
      version: "0.17.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/7371918503948242251",
   },
   {
      version: "0.16.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4614588176986892437",
   },
   {
      version: "0.15.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4359006996153605202",
   },
   {
      version: "0.14.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4359005727097496042",
   },
   {
      version: "0.13.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4243035499723993449",
   },
   {
      version: "0.12.1",
      content: [
         [
            "Content",
            "Add Steam achievement - Lion of Babylon: Rebirth with at least 1 Extra Great Person in Babylon (Reach 64M Empire Value when rebirth)",
         ],
      ],
   },
   {
      version: "0.12.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4179984470689067680",
   },
   {
      version: "0.11.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4164220603451558112",
   },
   {
      version: "0.10.1",
      content: [
         ["Bugfix", "Fix a bug where weekly free city shows incorrect information"],
         ["QoL", "Change the font of tech tree to improve readability when the font size is small"],
         ["QoL", "Update language files for Chinese, Korean and French"],
      ],
   },
   {
      version: "0.10.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4175478335193911579",
   },
   {
      version: "0.9.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4211505869005171933",
   },
   {
      version: "0.8.2",
      content: [
         ["Balance", "Condo no longer requires Power"],
         ["QoL", "Add more tooltip in Building Power/Electrification"],
         ["Bugfix", "Fix a bug where Atomium is missing 2 tile highlight"],
      ],
   },
   {
      version: "0.8.1",
      content: [
         ["Bugfix", "Fix a bug where Production Multipliers causes market to have incorrect transport"],
         ["Bugfix", "Fix a bug where there's an empty tooltip on Add Trade button in Caravansary"],
         ["Content", "Add Cold War Steam achievement"],
         ["QoL", "Censor's Office in Rome is renamed as Statistics Office (aligned with other maps)"],
         ["QoL", "Censor is renamed to Moderator"],
         ["QoL", "Update tech unlock and age unlock sound effects"],
         ["QoL", "Add a unique icon indicating a building is turned off"],
         [
            "Bugfix",
            "Fix a bug where buildings that are turned off still provide adjacent bonus (this affects Terracotta Army, Colossus Of Rhodes, Great Wall, Eiffel Tower, Sagrada Familia, Manhattan Project, Statue Of Liberty, Apollo Program and Great Sphinx)",
         ],
      ],
   },
   {
      version: "0.8.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4213756394578624475",
   },
   {
      version: "0.7.3",
      content: [
         [
            "Bugfix",
            "Fix a bug where setting managed import as default will prevent new warehouses being built/upgraded",
         ],
         [
            "Bugfix",
            "Fix a bug where construction priority ranged-apply does not work for buildings being constructed",
         ],
         ["Bugfix", "Reduce the glibc version dependency (from 2.33 to 2.31) for Linux build"],
         ["QoL", "Add Total Empire Value Per Cycle Per Great People Level in Home Building -> Rebirth"],
      ],
   },
   {
      version: "0.7.2",
      content: [
         ["Bugfix", "Fix a fog and deposit visual glitch introduced in 0.7.1"],
         [
            "QoL",
            "Backup folder has been moved to make it work in Linux. You can access the latest path in Help -> About",
         ],
      ],
   },
   {
      version: "0.7.1",
      content: [
         [
            "Bugfix",
            "Managed import will no longer modify the max input distance of a building - instead, the max input distance will simply be ignored. This allows the max input distance to take effect when upgrading",
         ],
         ["Bugfix", "Fix a bug where sometimes managed import cause certain import to be set to 0"],
         ["QoL", "Highlight 2-tile range when managed import is activated"],
         ["Bugfix", "Throttle sound effect to one instance per sound"],
         ["QoL", "Improve the graphics performance of large maps"],
      ],
   },
   {
      version: "0.7.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/6292166527284545655",
   },
   {
      version: "0.6.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4193488293618751981",
   },
   {
      version: "0.5.2",
      content: [["Bugfix", "Fix a bug where Permanent Great Person UI sometimes shows incorrect choices"]],
   },
   {
      version: "0.5.1",
      content: [
         ["QoL", "Show wonder build cost in building list"],
         ["Bugfix", "Fix a bug where certain trade tiles does not show up correctly"],
         ["Bugfix", "Fix a bug where natural wonders' highlight shows up before it is discovered"],
         ["Bugfix", "Fix a bug where United Nation's vote are not correctly tabulated"],
         ["Balance", "Each level of permanent great people provides 1 worker (reduced from 5)"],
      ],
   },
   {
      version: "0.5.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4115799931702229087",
   },
   {
      version: "0.4.3",
      content: [["Bugfix", "This version contains code that prepares for version 0.5.0"]],
   },
   {
      version: "0.4.2",
      content: [
         ["Bugfix", "Fix a bug where upgrade shortcut key is incorrectly applied for Wonder"],
         ["QoL", "Grand Bazaar now shows all active market trades"],
         ["QoL", "Allow partially claiming a trade in Caravansary (up to available storage)"],
         ["QoL", "Allowing setting custom font size scale in Options -> Theme (Experimental)"],
         ["Bugfix", "Fix a bug where Caravansary resource selection jumps around"],
      ],
   },
   {
      version: "0.4.1",
      content: [
         ["QoL", "Support multiple chat windows"],
         ["QoL", "Save selected tab in Grand Bazaar and Statistics Building"],
         [
            "Bugfix",
            "Fix rounding issues causing Warehouse/Caravansary's distribute equally feature to function incorrectly",
         ],
      ],
   },
   {
      version: "0.4.0",
      content: [],
      link: "https://steamcommunity.com/games/2181940/announcements/detail/5923994639393729778",
   },
   {
      version: "0.3.1",
      content: [
         ["Bugfix", "Fix a bug where Warehouse Autopilot does not take production multiplier into account"],
         ["Bugfix", "Fix a bug where player trades fail to find a path even if there's a valid one"],
         [
            "Bugfix",
            "Fix a bug where default stockpile settings are incorrectly applied to Warehouse/Caravansary",
         ],
         ["QoL", "Add an option to use mirror server in case you have trouble connecting to the main server"],
      ],
   },
   {
      version: "0.3.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4130435365845781807",
   },
   {
      version: "0.2.1",
      content: [
         [
            "Bugfix",
            "Fix a bug where transport preference / max transport distance are carried over after rebirth before the relevant tech is unlocked",
         ],
         ["Bugfix", "Always show transport preference for Warehouse/Caravansary"],
         [
            "Bugfix",
            "Fix a bug where Hagia Sophia, Summer Palace and Mogao Caves causes double counting of happiness from Shrines",
         ],
         ["Bugfix", "Fix a bug where sometimes building have extra resources after construction / upgrade"],
         ["Bugfix", "Fix a bug where Statistics does not include market output"],
         ["Bugfix", "Fix a bug where happiness fractions are not correctly rounded"],
         [
            "QoL",
            "Add keyboard shortcut for Toggle Building Production and Toggle Building Production and Apply To All (@sextondb)",
         ],
         ["QoL", "Progress towards the next great person will now starts at 0%"],
         [
            "QoL",
            "Rebirth section in Home building now shows the total empire value required for the next 3 extra great people",
         ],
      ],
   },
   {
      version: "0.2.0",
      content: [],
      link: "https://store.steampowered.com/news/app/2181940/view/4194610392083731932",
   },
   {
      version: "0.1.149",
      content: [["Bugfix", "Fix a bug where rebirth is only effective after restarting the game"]],
   },
   {
      version: "0.1.148",
      content: [
         ["QoL", "Add Max Transport Distance in Transport Preference"],
         ["QoL", "Add Save And Exit in Help menu"],
         ["Bugfix", "Fix a bug where buildings that are turned off no longer count in Total Empire Value"],
      ],
   },
   {
      version: "0.1.147",
      content: [
         ["Bugfix", "Fix Apply All does not work for Building Transport Preference"],
         [
            "Content",
            "Added Portuguese BR (@ifeellovevenus), Turkish (@RiftGameDev), and Traditional Chinese (@HarchuN)",
         ],
      ],
   },
   {
      version: "0.1.146",
      content: [["Bugfix", "Fix erroneous Trial Run flag caused by server crash"]],
   },
   {
      version: "0.1.145",
      content: [
         [
            "QoL",
            "Add Transport Preference to buildings (unlocked by Housing tech) - you can specify how a building transports resources needed for its production. This is also available when constructing/upgrading a building. For Warehouse and Caravansary, you can also override the preference for individual resource",
         ],
         ["Content", "Limit Tribune's chat message to 200 characters, Quaestor or above to 800 characters"],
         ["Bugfix", "Fix a longer player name will break Caravansary UI"],
      ],
   },
   {
      version: "0.1.144",
      content: [
         [
            "QoL",
            "Favorite buildings - you can add a building to your favorite and access it in the favorite menu in the resource bar",
         ],
      ],
   },
   {
      version: "0.1.143",
      content: [
         [
            "QoL",
            "Now if you construct or upgrade a building, all the resources will be transported in parallel by default. Builder Capacity will be equally shared among them. If a resource has been fully transported, transportation will be turned off and its capacity allocated to other resources. You can also manually turn off specific resource transportation",
         ],
         ["QoL", "Streamline wonder UI in Home building"],
         ["Content", "Update French and Russian translation"],
         ["Content", "Add German translation (@KaterKarlo)"],
         ["Content", "Add Korean translation (@dmamdmamdm)"],
         ["Content", "Update English language file (@Shane)"],
      ],
   },
   {
      version: "0.1.142",
      content: [
         ["QoL", "A more streamlined great people UI in Home building and Manage Great People page"],
         ["QoL", "Show uncapped happiness value in Happiness breakdown in Home building"],
         ["QoL", "Add default stockpile settings in gameplay options"],
         ["QoL", "Allow copying the building color to its resources in building page"],
         [
            "QoL",
            "Add a button to copy resource color from the building that produce this resource in theme page",
         ],
         ["Bugfix", "Fix a bug where building priorities are displayed before unlocked in tech tree"],
         ["Content", "Update French and Russian translation"],
      ],
   },
   {
      version: "0.1.141",
      content: [
         [
            "QoL",
            "The game will open full screen on Steam Deck (I don't own a Steam Deck so no idea if it works or not)",
         ],
         ["QoL", "Add announcement feature in the chat"],
         ["QoL", "Add total time and total empire value per cycle in Reborn section"],
         ["Content", "Update Russian and Simplified Chinese translation"],
      ],
   },
   {
      version: "0.1.140",
      content: [
         [
            "Bugfix",
            "Total Empire Value now includes buildings that are being upgraded (Thanks @Kuki42 for reporting)",
         ],
         [
            "Bugfix",
            "Fix a bug where sometimes chat still scrolls even if your mouse cursor is on chat message",
         ],
         ["Bugfix", "Fix a bug where picking a building color causes the game to drop frames"],
         ["QoL", "Support clearing warehouse import/cap in batch mode"],
         ["QoL", "Typing a chat command will add a dark background to input"],
         ["QoL", "Add Total Empire Value change in resource bar"],
         ["Content", "Add French localization (@Théo Protche)"],
         ["Bugfix", "Total Empire Value now counts resources in transit"],
      ],
   },
   {
      version: "0.1.139",
      content: [
         [
            "Bugfix",
            "Fix a bug where stockpile input capacity incorrectly affects max stockpile (Thanks @Valeria and @GudKnight for reporting)",
         ],
         ["Bugfix", "Fix a bug where unlock tech shortcut key allows unlocking already unlocked tech"],
         ["Bugfix", "Fix Petra does not generate time warp when offline time is set to 0%"],
         ["QoL", "Chat mentions is now case insensitive"],
         ["QoL", "Add a new option to hide the latest chat content (avoid spoiler)"],
         ["QoL", "The list of wonders are now sorted alphabetically"],
      ],
   },
   {
      version: "0.1.138",
      content: [
         ["QoL", "Improve Statistics Building (Censor's Office) resource UI (@Vethon)"],
         ["QoL", "Chat will not scroll when your cursor is on a chat message"],
         ["Bugfix", "Fix Chinese characters not showing up in Tech Tree"],
         ["Content", "Add Simplified Chinese translation (@Shallowsing)"],
      ],
   },
   {
      version: "0.1.137",
      content: [
         ["QoL", "Add back the ability to claim individual trade"],
         ["Bugfix", "Fix a bug where chat is not turned on for new players"],
      ],
   },
   {
      version: "0.1.136",
      content: [["Bugfix", "Fix a bug introduced in 0.1.135 that causes incorrect empire value"]],
   },
   {
      version: "0.1.135",
      content: [
         [
            "QoL",
            "This version adds a local backup that is NOT synced with Steam Cloud. In case Steam Cloud fails to migrate from Demo to EA, you can manually migrate your progress",
         ],
      ],
   },
   {
      version: "0.1.134",
      content: [
         ["QoL", "Add Claim All to Caravansary"],
         ["QoL", "Show whether a pending claim is from trade tariff or not"],
         ["QoL", "Add a column indicate trade value compared to average price in Caravansary"],
         [
            "Content",
            "You can evict a player and claim his/her tile after reservation period ends (they are greyed out on map)",
         ],
         ["Balance", "Claim tile cooldown has been changed to 4 hours"],
         ["Bugfix", "Rebirth will cancel your active/pending trades"],
         ["Bugfix", "Rebirth will also release your player trade tile"],
         ["Bugfix", "Fix a bug where sometimes pending claims appear for no reason"],
      ],
   },
   {
      version: "0.1.133",
      content: [
         ["Content", "Show player flag on trade map"],
         ["Bugfix", "Fix game does not load on some systems"],
         ["QoL", "Update Simplified Chinese translation (@Shallowsing)"],
         ["QoL", "Sort storage by amount (@Vethon)"],
         ["Bugfix", "Player handle duplication check is now case-insensitive"],
      ],
   },
   {
      version: "0.1.132",
      content: [["Bugfix", "Fix chat sometimes does not scroll"]],
   },
   {
      version: "0.1.131",
      content: [
         ["Bugfix", "Fix a bug where sound does not play when the window is not focused"],
         ["QoL", "Add batch operations in Caravansary and Warehouse to manage resource transports"],
      ],
   },
   {
      version: "0.1.130",
      content: [
         ["QoL", "Improve chat performance, especially when typing chat message"],
         [
            "QoL",
            "Disallow upgrading account rank when there's great people in the current run (you should reborn first in this case)",
         ],
      ],
   },
   {
      version: "0.1.129",
      content: [
         [
            "Bugfix",
            "This version will migrate your progress to prepare for carrying your progress from Demo to Release",
         ],
      ],
   },
   {
      version: "0.1.128",
      content: [
         ["QoL", "Show progress towards next great person at reborn in resource panel"],
         ["QoL", "Market now shows average value compared to average price (@Vethon)"],
         ["Bugfix", "Tariff is now implemented on the server (previously tariff is not implemented)"],
      ],
   },
   {
      version: "0.1.127",
      content: [
         [
            "Bugfix",
            "Trade value per minute limit has been implemented on the server (previously Tribune's trade value per minute limit was not implemented)",
         ],
         ["QoL", "Highlight trades that can be filled immediately in Caravansary"],
         ["QoL", "Add descriptions to Market, Warehouse and Caravansary"],
         ["QoL", "Add shortcut for adjusting building upgrade levels (@Vethon)"],
         ["QoL", "Add shortcut for unlocking select technology (@Vethon)"],
      ],
   },
   {
      version: "0.1.126",
      content: [
         ["Bugfix", "Fix Offline production calculation is incorrect (@Vethon)"],
         ["Bugfix", "Fix new map sometimes missing resource buildings"],
         ["QoL", "Optimize in-game chat performance"],
         ["QoL", "Make Market, Caravansary and Warehouse sortable"],
         [
            "QoL",
            "Now when you click on happiness on resource panel, the game will highlight happiness in Headquarter",
         ],
      ],
   },
   {
      version: "0.1.125",
      content: [
         ["QoL", "Rework player trade UI, add player flag and level"],
         ["Bugfix", "Fix a bug where open/close chat causes lag"],
         ["Bugfix", "Rename Account Level to Account Rank"],
         ["QoL", "/playercount command now returns total/online players"],
         ["QoL", "Fix missing tutorial. Allow redoing tutorial in Help -> Tutorial"],
         ["Bugfix", "Fix St. Peter's Basilica has incorrect storage amount (@Vethon)"],
         ["QoL", "Allow resetting building/resource colors (@Vethon)"],
         ["QoL", "Support press [D] key during the boot screen to report issues on Discord"],
      ],
   },
   {
      version: "0.1.124",
      content: [
         ["Bugfix", "Fix a bug where muting player does not work"],
         ["Bugfix", "Steam will not automatically install necessary VCRedist packages"],
         ["Bugfix", "Fix a bug where Space key does not show up in the shortcut manager"],
         ["QoL", "Improve Building Level/Tier UI"],
         ["QoL", "Add a shortcut to go back from player trade map to city (@Hanz)"],
         [
            "QoL",
            "Click not producing building count in title bar to highlight all buildings that are producing (@Vethon)",
         ],
      ],
   },
   {
      version: "0.1.123",
      content: [
         [
            "QoL",
            "Support showing image in Chat (the poster has to have account level above Tribune, otherwise the image will show as text)",
         ],
         ["QoL", "Add a back button on tech tree page"],
         ["QoL", "Add language select on the first tutorial page"],
         ["QoL", "Add a new chat command /playercount that will show currently online players"],
      ],
   },
   {
      version: "0.1.122",
      content: [["Bugfix", "Prepare for Steam Next Demo"]],
   },
   {
      version: "0.1.121",
      content: [
         ["Content", "Support cancelling player trades"],
         ["QoL", "Allow highlight buildings/deposits on map"],
         ["QoL", "Allow clicking on building tier on building page to highlight all buildings of that type"],
         ["QoL", "Allow clicking on Science in resource panel to go to tech tree (@Vethon)"],
         ["QoL", "Allow sorting by column in Censor's Office (@Vethon)"],
         ["Content", "Implement trade limit for different account levels"],
         ["Content", "Add support for upgrading from Tribune to Quaestor"],
      ],
   },
   {
      version: "0.1.120",
      content: [
         ["QoL", "Add /randomcolor chat command that will assign a random color to all buildings/resources"],
         ["Bugfix", "Fix first time tutorial does not work when there's no Internet connection"],
      ],
   },
   {
      version: "0.1.119",
      content: [
         ["QoL", "You can middle click an empty tile to copy the building from the selected tile"],
         ["Bugfix", "Fix transportation indicators are sometimes not shown"],
      ],
   },
   {
      version: "0.1.118",
      content: [["QoL", "Update Account Level"]],
   },
   {
      version: "0.1.117",
      content: [["Bugfix", "Fix wonders stopped working after upgrading to 0.1.116"]],
   },
   {
      version: "0.1.116",
      content: [["Bugfix", "Fix happiness from well-stocked buildings are not calculated correctly"]],
   },
   {
      version: "0.1.115",
      content: [
         [
            "QoL",
            "Server will now track active play time. You can query the time by using /playtime chat command",
         ],
      ],
   },
   {
      version: "0.1.114",
      content: [["QoL", "Improve chat command"]],
   },
   {
      version: "0.1.113",
      content: [
         ["QoL", "Added chat command support"],
         ["Bugfix", "Natural wonders will not be spawned on initial tiles"],
         ["Bugfix", "New deposits will not be spawned on tiles with Wonders"],
      ],
   },
   {
      version: "0.1.112",
      content: [["Bugfix", "Fix wonders can be built several times"]],
   },
   {
      version: "0.1.111",
      content: [
         [
            "QoL",
            "This patch contains a significant performance improvement. The save data will be automatically migrated but you might want to take a backup first",
         ],
         ["Bugfix", "Fix Not Producing Buildings on the resource panel does not work"],
      ],
   },
   {
      version: "0.1.110",
      content: [
         ["QoL", "Now the map will show the trade route when you click on a player's tile"],
         ["QoL", "Shows each message's channel when receiving from multiple channels"],
         ["Bugfix", "Fix Statue Of Liberty not working correctly"],
         ["Bugfix", "Fix sometimes a building with full storage shows not enough resources icon"],
         ["Bugfix", "Fix player trade world map sometimes shows unnecessary detours"],
         ["Bugfix", "Fix chat not filtering the latest message correctly"],
      ],
   },
   {
      version: "0.1.109",
      content: [
         ["QoL", "Allow destroying partial resources in a building"],
         [
            "QoL",
            "Add support for different language channels in chat. You can subscribe to multiple channels",
         ],
         ["QoL", "Add a simple tutorial for first-time players"],
      ],
   },
   {
      version: "0.1.108",
      content: [
         ["Bugfix", "Fix player trade routes are incorrectly drawn"],
         ["QoL", "Allow type in player trade fill amount manually"],
         ["QoL", "Add a button to set fill amount to the max available in the Caravansary"],
         ["QoL", "Show player flag on the world map page"],
         ["QoL", "Improve performance of offline production calculation"],
      ],
   },
   {
      version: "0.1.107",
      content: [
         ["Bugfix", "Grotta Azzurra will only upgrade buildings that are not being constructed/upgraded"],
      ],
   },
   {
      version: "0.1.106",
      content: [["Bugfix", "Fix production priority slider resets after restart the game"]],
   },
   {
      version: "0.1.105",
      content: [
         ["Balance", "Balance wonder cost based on resource value"],
         [
            "QoL",
            "Improve general performance, especially when calculating offline production and using Petra to accelerate",
         ],
      ],
   },
   {
      version: "0.1.104",
      content: [
         ["Content", "Allow setting default construction, upgrade and production priority"],
         ["Content", "Petra now allows you to accelerate your empire up to 8x"],
         ["Balance", "Increase School's science output: 88 -> 172"],
         ["Balance", "Increase Library's science output: 8 -> 16"],
         ["Balance", "University now produces 100 Science"],
         ["Balance", "Publishing House now produces 200 Science"],
         [
            "Balance",
            "Geography Technology now provides +10 Consumption and Production Multiplier to Library",
         ],
         ["Balance", "Optics now provides +10 Consumption and Production Multiplier to Library and School"],
         ["Balance", "Each new tech age now provides +10 happiness (instead of +5)"],
         [
            "Bugfix",
            "Fix a bug where wonder construction cost fail to take resource value into consideration",
         ],
      ],
   },
   {
      version: "0.1.103",
      content: [
         ["QoL", "Allow choosing player flag"],
         ["QoL", "Improve server performance"],
         ["Bugfix", "Fix Poseidon wonder is not functioning correctly"],
      ],
   },
   {
      version: "0.1.102",
      content: [
         ["Bugfix", "Fix a bug where wonders built at the map edge causes production to halt"],
         [
            "Bugfix",
            "Fix a bug where Turning on autopilot mode on a warehouse with full import causes glitch",
         ],
      ],
   },
   {
      version: "0.1.101",
      content: [["Bugfix", "Fix a bug where electrification cost is incorrect"]],
   },
   {
      version: "0.1.100",
      content: [
         ["Bugfix", "Fix a bug where camera position is wrong after switching scenes"],
         ["Bugfix", "Fix a bug where St. Peter's Basilica causes offline earning calculation stuck"],
         ["QoL", "Add Timestamp in Chat. Add a special styling for your own messages"],
      ],
   },
   {
      version: "0.1.99",
      content: [
         ["Content", "Industrial Age is here!"],
         [
            "Content",
            "17 New Industrial Age Tech: Rifling, Alloy, Steam Engine, Capitalism, Rapid Fire, Railway, Drilling, Journalism, Imperialism, Electricity, Stock Market, Olympics, Combustion, Electrolysis, Refinery, Gas Pipeline, Urbanization",
         ],
         [
            "Content",
            "18 New Industrial Age Buildings: Rifle Factory, Gatling Gun Factory, Ironclad Builder, Tank Factory, Steel Mill, Locomotive Factory, Coal Power Plant, Aluminum Smelter, Steamworks, Oil Well, Stock Exchange, Oil Refinery, Parliament, Publishing House, Stadium, Natural Gas Well, Pizzeria, Magazine Publisher",
         ],
         ["Content", "3 New Industrial Age Deposits: Oil, Aluminum, Natural Gas"],
         [
            "Content",
            "6 New Industrial Age Wonders: Neuschwanstein, Summer Palace, Eiffel Tower, Brandenburg Gate, Statue of Liberty, Rijksmuseum",
         ],
         [
            "Content",
            "6 New Industrial Age Great People: James Watt, Karl Marx, Ada Lovelace, Napoleon Bonaparte, Charles Darwin,Florence Nightingale",
         ],
      ],
   },
   {
      version: "0.1.98",
      content: [
         ["Content", "Allow destroying resources in a building's storage"],
         ["QoL", "Allow set building options as default"],
      ],
   },
   {
      version: "0.1.97",
      content: [
         [
            "Bugfix",
            "Reverted: Add an option to automatically remove residual construction resources (enabled by default)",
         ],
      ],
   },
   {
      version: "0.1.96",
      content: [
         ["QoL", "Show permanent great people amount when choosing a great person"],
         ["QoL", "Allow turn off game sound effects"],
         [
            "QoL",
            "Add an option to automatically remove residual construction resources (enabled by default)",
         ],
         ["Bugfix", "Fix a bug where production priority is not shown on mines"],
      ],
   },
   {
      version: "0.1.95",
      content: [
         ["Bugfix", "Fix construction cost of wonders are incorrect"],
         ["Bugfix", "Fix Grotta Azzurra can be explored repeatedly"],
      ],
   },
   {
      version: "0.1.94",
      content: [
         ["Bugfix", "Fix unlocking a tech causes camera jitter"],
         ["Bugfix", "Fix total empire value is incorrect when upgrading a building"],
         ["Bugfix", "Fix wonders that require resources does not show the priority slider"],
      ],
   },
   {
      version: "0.1.93",
      content: [
         ["Content", "New Map: Athens"],
         [
            "Content",
            "New Wonder: Statue Of Zeus (Athens Unique) - Spawn random deposits that have been revealed on adjacent empty tiles. All adjacent Tier I buildings get +5 Production and Storage Multiplier",
         ],
         [
            "Content",
            "New Natural Wonder: Aphrodite (Athens Unique) - +1 Builder Capacity Multiplier for each level when upgrading buildings over Level 20",
         ],
         [
            "Content",
            "New Natural Wonder: Poseidon (Athens Unique) - All adjacent buildings get free upgrades to Level 20",
         ],
         ["Balance", "Parthenon is now an Athens unique wonder"],
         [
            "Content",
            "New Wonder: Colosseum (Rome Unique) - Chariot Workshops are exempt from -1 happiness. Consumes 10 chariots and produce 10 happiness",
         ],
         [
            "Content",
            "New Wonder: Circus Maximus (Rome Unique) - +5 Happiness. All Actor's Guilds, Writer's Guilds and Painter's Guilds get +1 Production and Storage Multiplier",
         ],
         [
            "Content",
            "New Natural Wonder: Grotta Azzurra (Rome Unique) - When discovered, all your Tier I buildings get +5 Level",
         ],
         [
            "Content",
            "New Wonder: Temple Of Artemis - All Sword Forges and Armories get +5 Level when completed. All Sword Forges and Armories get +1 Production Multiplier, Worker Capacity Multiplier and Storage Multiplier",
         ],
         ["QoL", "Port the camera control from Industry Idle (for much better performance)"],
         ["QoL", "When searching in building list, the input/output resources will also be searched"],
         ["Bugfix", "Fix a bug where Coal tile texture is missing"],
      ],
   },
   {
      version: "0.1.92",
      content: [
         [
            "Balance",
            "Great Person: Qin Shi Huang changed to +1 Production Multiplier, Storage Multiplier for Chariot Workshop, Armory",
         ],
         ["QoL", "Show estimated time left when constructing/upgrading buildings"],
         ["Bugfix", "Fix St. Peter's Basilica shows incorrect storage"],
         ["Balance", "Parthenon now costs Paintings instead of Poems"],
         ["QoL", "Improve performance and remove animation stutters"],
      ],
   },
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
            "12 New Renaissance Buildings: Lens Workshop, Bank, University, Coal Mine, Cannon Workshop, Printing House, Museum, Gunpowder Mill, Frigate Builder, Bond Market, Courthouse, Dynamic Workshop",
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
