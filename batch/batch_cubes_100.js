var batch_cubes = [
'YBBWRGGOWRGYRGRBYYOOBRGRWYYRBBYWGOYGYBRGWOBRGOWWOOOWBW',
'WRWYROOGBGBBYORYYRBGOBGWGYRWBYRWRGBGWBOBORYYORWWOOWYGG',
'WBWOROBYYOWRYOOBBRBYBBGRBYOGBYRWWOWGWGWGYYGGYRWOROGGRR',
'BBGYRGGROROOYYBYWYRRWBGGRYYGBWOWWRWGWBOWYWOGYROGROBBOB',
'GRRYRGRWBOOYBGWRRGYBWGGBOYRWBBYWOORWOWGWBYBYYBORYOWGGO',
'GYBBRYWGOOOGRRBYOWRBWOGRYYWBBRBWGBYGRWGYWBWWRYROGOGYOO',
'BYRRRRYOOYBRGYGWGWGGROGYBYWRBOWWBOGGYWOBWBRYBOBWOOGYRW',
'BYGGROWBORRGRYYGGYRGWOGRBYOBBBWWWWOBWWRBROYGOORYYOYGWB',
'YORWRYRYRBRGYOYBGWGGORGRBYGRBWGWYWWGYOOWWWOBROBGOOBBYB',
'RRYORBRWYWBWGOGOYRGWBYGGOYYOBRBWRBWYBGWOGWGWROYBBORYGO',
'RYRORBBRGYGWRGRWYYBOGWGRBYOBBOWWGORWOYGYYGOWBBROWOGYBW',
'BYWYRWWBGWOOGOOYGRBGOWGYRYGOBWRWBWWBYBYGBOYGGRRROOYRRB',
'BOBYRBYOOYBRGWBYROWYRBGBWYWRBWGWOOYGYGGWRRWRGOORGOGWYB',
'GWGRRGRROYBBWWBYOWOBOYGRGYOWBYRWBWGRYGWROBYBBGWGYOYOOR',
'BYWRRRBGYOWRYORGYBOBYYGRGYWGBOWWORBGYWBRYGORWOBWOOGGBW',
'ROGYRGWBWYRBORRBOWOYGBGRWYWBBGRWYBWOYYYOWRGBRBGGGOOYOW',
'BWWGRYBWROOWRRWGGOGBYBGYRYOWBGRWRYOBWGOGYBYBROWYYOBGOR',
'OYOORYRRRWWWGWYBBWBOGYGWGYOGBOBWGOROGRYGRWBWBYYRBOGYBR',
'YWBORYYYBOBBRBYOOWRRGYGWGYWOBRBWGRRWRRWOOGOWGGGBYOGYBW',
'YRGORROYBOBBYORYBYRYGWGRGYWOBYBWBOOBRWOWYGWWWWGGGOGBRR',
'BORGRBRGBORWGYWRRYBGYBGBYYWGBWBWOBRGOYOGOYGYOWOYWOWWRR',
'OGWYRBWWBGRRBGYOOGRRYRGYBYOGBWOWWRBOWWYRGBWYGGBBROYYOO',
'RRRYRGOOWYGBYYGRWBWYGWGOBYRBBWOWRGGBYOGOWWOBORGWROBYYB',
'YYWWRGGBBROOYOWRROGBBWGGWYRYBBWWRGOWROBOBWOYYGGYYORRGB',
'RGYORRBOBGGWRYOWBRGYWWGOWYYRBRGWRYBOYOOWGYRWGBBGYOWOBB',
'YOBYRYGGYOBWOWOBOWRGGOGWOYGRBWBWBGGWRRRBYOBWYGBYYORRRW',
'BRYGRBGGOOROYOGWORGWYGGOWYYOBYRWWRYWBRGWYWOBYRBRBOGBWB',
'GRWGRGGWRRROYGYBOBOBYOGBYYYGBRYWYGWWRWRWOBOWWGBBROBOOY',
'WGBORWBGRBBRYWGYBOWYRWGOGYWOBYOWRRROGRWGYYBRWYGOBOBGYO',
'BOBGRRWBRWRRBWGYBRYBOYGWOYRYBOGWBGWGOWGYYYBYRWROGOGWOO',
'YGOBRBRRYGOYBYOBWYGYRBGBYYWGBOGWRWRRGOBROGORBWYWWOWOGW',
'RRYRRBGBOGWOYYBYWRGGWRGBRYWGBOYWYROOWBOBGRBYBGOWWOOWGY',
'OGYWRWOWWGBWBORBGOBRYBGYOYOGBGYWYGRGWBYRWWGOYRRBYORRBO',
'YYWYRYORGBGYGYWOORBBOWGBOYGRBWRWOWOWRGGRBBYWBGWYGOROBR',
'GOYBRWBOBYYRYYOWBRGBORGGYYRBBOGWGROBOWGORRGYBYGWWOWWRW',
'BBOGRGYYGRYGOOYROWBOWRGBRYBYBOWWWRGGOWBOBGWYYWGYROWBRR',
'WGBBRGYWYRYBROOBYOWOGGGBWYOBBYRWWOORYGGORRWBYGRWYOWGRB',
'BRWRRGGWRWYYRBYBWRBBOOGOWYRGBOBWYYBYBGGORWROGOYWYOWOGG',
'OBWOROBGRYGOWWGYWGRWBYGBOYGYBRYWOORWBBYOYYRWGRRGGOBWRB',
'ORBORGWWRGYGRGYBROWYYWGGYYOGBWRWORBOYBWGWWBBGBYOROBYOR',
'RWGGRBGBWBROYROGYYRRYGGYOYOGBYRWYROOBWRWOYBWWWBBWOBGGO',
'GRYWRGGOYOGYRBOBYGOBWYGBWYGRBWOWBBRWOOWRRBRYRBGGWOYYOW',
'GWYORWORBOGBYWOWGGOOWRGYBYOBBYGWBRWGRRBYORGRBYGRBOYWYW',
'BBWRRGOROYWYGYGWWRBRRBGBWYOYBYGWYWOWRGGRBOYGBGOYWOOORB',
'OOGGRGYBRWOOBWGYWOYYGWGGYYYBBYRWORWOBRRGGRWBYWBWRORBOB',
'YGWYROBWYROWRBRGWGRWBRGGRYRYBYGWWBRGOBWOBGYOYWYBBOOOGO',
'GWYRRGRYWRWWGBBOYGOOYWGGRYRYBGOWBYBWBGOWORBBORWGROYBOY',
'RWOYRROBOWRBYRGWGWBGBBGOGYOBBGYWWRRYRYOGYRYOWBOYWOBGWG',
'GGYRRGYYYWYOBOGOOBRWRRGYGYGRBBWWWBOGOWWORGRBWWOBBOBRYY',
'WRBYRYYOBGBRGGWROYOGOGGGYYBOBRWWWRWWRRGYBWOBYGYOOORBWB',
'BWORRYRBGYGWGRWOBWBGRBGOWYBOBYRWWGWYOOWBOOYYYGGRROYRGB',
'YOOWRRYBRBGBRYBWWWBGOBGOYYRGBOWWWYOGWYYGRWGYGRGRBOBORO',
'RBBOROBGGBYYORYRGOWYYWGGYYBOBYRWBRGWRROGRWGWBGBYWOWWOO',
'OWYORBRYRBGYBGBWORGRWBGRYYRGBWGWYOROWORGWGYOBGWWBOBYYO',
'OGBRRBYYGGBBRRYRYYOOYWGYOYOBBRGWBWWRWGGWWGOWBBYRROGOOW',
'OOGOROBWGYYOWRRWGWOWBYGGRYBWBYBWRRBYORRBGGRGBGBYOOWWYY',
'WRGORWBBRGYWRYYBOYRYOBGOGYBOBWGWWGYWRRWOWYBROGBBGORYGO',
'WYYRRBOGYBYGWOBRORGGRWGBYYWRBBRWOGWOGWWOYYBRRYGBBOOWGO',
'GGORRWWBYWYOGRRGOBYWRBGOYYWRBGOWWBRBYGYOBWBBORYGGOYWOR',
'ROBORWBYYYWOWRBRGYOBGYGRBYRGBOGWGYWRGRRWYWGBGWWBBOOOYO',
'BWWYRRGGOYOYRYBYYOGGRBGBRYWBBGRWOWWYOGOBBGWWRGOWOOYBRR',
'RGYBRBGOBBWRWYOWOGOOYWGRYYBYBYGWROBYGRWBGBOOGRGRROWWWY',
'ROYWRGOGBBRGWYYOORGBYGGRYYOWBRGWWBWBWRYOYRGYWOBGBOORBW',
'OWYORYWBYBYGROGOBBRBWGGGOYOWBGRWWYRWBYOWROYBRRGGWOYGRB',
'BYWGRBWWGOOGRBWORRBBYOGWGYYRBYGWWOOYOOBYRYGRWGBRYOGBWR',
'GWGYRGBRBOOOWGWRWYRRWBGYGYOGBBYWROYGWORBBOGWBRWYROOYBY',
'YOBWRGGOBRRYRYWRRYOBBYGGOYGWBBRWGWYWOOOGBRGWOBWYROYGBW',
'RGRWRRYOGBGGOYWOYWGYYBGGOYWOBYBWWBOBORRWRYGWOYGBBOBWRR',
'WGGRRROOBBWWBBRYYRWWRBGGYYOYBGRWYBWOGWYGBGOGYYBROOROOW',
'RBOGRRGOGBWWOYYRWBYYYOGBOYWBBGYWGWRRGOOGGOBRRWWYBORBYW',
'YWWYRWWRRRORBGGYROGBBOGWOYOBBRBWGWRRGGGYGYBYBWWOYOYOBO',
'GYYWRGBGYYOYOWBRORGROOGRGYWBBYBWBWRBWRRWOGOGGOBBWOYRYW',
'BOWBRGYOWOYGOWRBRBOBYGGRWYGOBYGWWRRGOYRBOGRWWWRYBOYGBY',
'OWGYRWGOOGGYRGGWORWBYBGRWYWGBBRWYWRBROOYBBYYBWYBGOOORR',
'YYGORRRRBGGWGWRYBOYGRRGBOYYRBYBWGWWWOYYBWWBOOBOOGOBGWR',
'GGRRRRWWYWYBOROBGGYORGGBWYOWBBYWWYYGYOWGGRWRBOBOOOYRBB',
'OGGYRWWYRBGGROYBOOYOWRGBRYWGBRGWWRBGRBOYBOWRBYOBWOYWYG',
'ORRWRRGYOYGYRBYGGBWWBBGBRYOBBYRWWOYRGORBGOBOGWWYOOYWGW',
'YOOGRRWBGGRRBYWOWYGBROGGYYRYBWGWGGORBWOBBOYWRYBWYORWOB',
'BOBBRGWYGWYOGORWYWRWORGWBYOBBRBWWYGRBYYOGRYGOYRGROOBWG',
'RGOWRYYYGBROBORWRGWOYWGBRYGRBGYWOGYRWBBWWOGWYBOOBOGRBY',
'BWRYRYBBOOOWRWGWBWGOYRGOBYRBBWGWGOOBYYRYWOGYWRRGGORBGY',
'OBGYRBRWYWOWGGBRYYROGOGWBYOWBRGWGBWYOGRWRYBROGYBROYWBO',
'RRBGROORRGYBYGGYBOWYWWGRBYWRBGWWOYOOWGOGBBRBBGOYYOYRWW',
'OBYWRYWRBYGGRWOWGBRYBRGOYYBOBOGWYGRWBWOWRYGWORBGBOGYOR',
'OOYORYRWWGWGYGRBGOBYYBGBWYYRBGOWOWWYRBOWBWRRBBYGROROGG',
'RYYBROOWBGYBYROWGBROWYGWGYGYBOWWROBWBBYOBGRGGRRGOOWWRY',
'OWRGRYYGRBOBRWBWBWGBWBGGYYRYBOYWOBRGYWWGRGROYOROGOBOWY',
'OGORRORWYYGWGRRGYYGOBBGBYYBOBYRWRBYWOOWGWRWBRBWOGOGYWB',
'GGRRRROYORBYGRBYWYBWYBGOGYBWBWOWOWOGWBWBYOBGORYRYOGGRW',
'RBBORRYRRBGGOBWGWOWWYYGGYYOBBOYWRRGYGWYBWOWYBRGOROOWBG',
'ORWGRGBWGYWOWBWOOGRYBWGRGYYGBOBWOWYGRYYORBYBRYOGBOWBRR',
'RBBRROYBBGWOBYWRGOWRWRGBWYGWBOBWGYORBGWGRYGOGYYOYOYOWR',
'YGOBRBBOORROWGYGYGWYBWGWOYBWBOBWGWWYBOBRRRYYGOYWROGRRG',
'WORRRBOGOBBGWYYGOGYWRGGWBYRGBGWWORYWORYBYGWRYBWOOOBBYR',
'ROWGRYGGGWWRWOYRBBOBBRGWOYGRBRWWYYOYBWOWBRBYGOBGYOROGY',
'WOYWRWYGBRRRGYYOBBRBGOGYBYOGBRGWWORYOGWBRBWOGGWRBOYWYO',
'YGBORGRROGYWGWYGOWRWROGRBYBYBRYWWBBRBBGOGBOGOYWWOORWYY',
'BORRRBBYOOGWROYGYWGGYBGBWYYGBRBWOGWYRYBWOGORYBROGOWRWW',
'OGWWRBROGGGGYWWOYRBYYYGRBYOBBRGWRWWBYGRGOBOWBROWBOYORY'];
