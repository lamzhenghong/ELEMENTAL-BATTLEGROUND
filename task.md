# Tasks

- [x] Define BOSS_TEMPLATES and randomize boss spawning in `triggerSpawnWave`
- [x] Add `bossProjectilesRef` and implement updates, drawing, and collision logic in `updateGameLoop`
    - [x] Implement Fire Dragon phase attacks (fireballs, fire patches, falling meteors)
    - [x] Implement Ice Golem phase attacks (3-way ice shards, blizzard slow patches, frost tomb field)
    - [x] Implement Storm Thunderbird phase attacks (lightning strikes, lightning walls, thunderstorm)
    - [x] Remake BANNERS array configurations (LIMITED and STANDARD BANNERS)
- [x] Update combat party construction to calculate element resonances and store wielder weapon names
- [x] Implement team synergy resonances calculations and apply modifiers (ATK, CD, Crit Rate, Speed, DMG)
- [x] Implement visual synergy badges in the Top Combat Info HUD bar
- [x] Implement weapon passive triggers and transient states in the game loop
    - [x] 5★ weapons: Solar Searing Blade, Calamity Blaze, Solar Wind Bow, Abyssal Ocean Scepter, Primordial Jade Winged-Spear
    - [x] 4★ weapons: Sacrificial reset, Favonius energy charge, Royal Claymore crit stacks, Widsith swap-in buffs, Crescent Pike infusion, Dragon's Bane damage modifier
    - [x] 3★ weapons: Thrilling Tales swap-out buff, Black Tassel slime bonus, Debate Club area DMG, and element condition check damage modifiers
- [x] Verify everything compiles and builds successfully checks
