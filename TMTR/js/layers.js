addLayer("p", {
    name: "p",
    symbol: "P",
    position: 0,
    startData() { return {
        unlocked: true,
		points: zero,
        energy: zero,
        Renergy: zero,
    }},
    color: "cyan",
    requires: new Decimal(5),
    resource: "声望点",
    baseResource: "点数",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.2,
    gainMult() {
        mult = one
        if(hasUpgrade("p",13)) mult = mult.mul(upgradeEffect("p",13))
        if(hasUpgrade("p",23)) mult = mult.mul(upgradeEffect("p",23))
        if(hasUpgrade("p",33)) mult = mult.mul(upgradeEffect("p",33))
        if(hasUpgrade("e",11)) mult = mult.mul(upgradeEffect("e",11))
        if(hasUpgrade("m",23)) mult = mult.mul(upgradeEffect("m",23))
        if(hasUpgrade("m",31)) mult = mult.mul(upgradeEffect("m",31))
        if(hasUpgrade("n",12)) mult = mult.mul(upgradeEffect("n",12))
        if(layers.c.PpointMult().gt(1)) mult = mult.mul(layers.c.PpointMult())
        if(player.c.power.gt(1e6)) mult = mult.mul(layers.c.powerEffect(2))
        if(player.p.Renergy.gt(1)) mult = mult.mul(layers.p.RenergyE())
        return mult
    },
    gainExp() {
        exp = one
        if(hasUpgrade("m",11)) exp = exp.mul(upgradeEffect("m",11))
        if(hasUpgrade("c",11)) exp = exp.mul(upgradeEffect("c",11))
    //挑战限制
        if(inChallenge("c",11)) exp = exp.mul(0.5)
        if(inChallenge("c",12)) exp = exp.mul(0.05)
        return exp
    },
    row: 0,
    hotkeys: [
        {key: "p", description: "P: 暂停游戏", onPress(){
            if(player.devSpeed==1) player.devSpeed = -1
            else player.devSpeed = 1
        }},
        {key: "a", description: "A: 进行声望重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    passiveGeneration() { 
        let a = zero
        if(hasUpgrade("m",14)&&!inChallenge("c",11)) a = a.max(1)
        return a
    },
    doReset(resettingLayer) {
        if(hasUpgrade("p",41)) player.p.Renergy = layers.p.RenergyG().max(player.p.Renergy)
        player.p.energy = zero
        if (layers[resettingLayer].row > layers[this.layer].row) {
            let kept = []
            layerDataReset(this.layer, kept)
        }
        if(inChallenge("c",21)) player.PreseTimes += 1
        if(inChallenge("c",22)) player.points = five
    },
    upgrades:{
        11:{    
            title: "游戏开始!",
            description: "以0.5/s的速度生产点数",
            cost: new Decimal(1),
        },
        12:{    
            title: "Interesting!",
            description: "点数获取x2,解锁一个可购买",
            effect(){
                let eff = two
                if(hasUpgrade("m",21)) eff = eff.pow(upgradeEffect("m",21))
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(2),
        },
        13:{    
            title: "更多声望",
            description: "声望获取x2",
            effect(){
                let eff = two
                if(hasUpgrade("m",21)) eff = eff.pow(upgradeEffect("m",21))
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(4),
            unlocked(){return hasUpgrade("p",12)||player.e.unlocked},
        },
        21:{    
            title: "生产机强化",
            description: `"声望能生产机"效果x5`,
            effect(){
                return five
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(8),
            unlocked(){return hasUpgrade("p",12)||player.e.unlocked},
        },
        22:{    
            title: "更多点数",
            description: "点数获取x10",
            effect(){
                return ten
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(16),
            unlocked(){return hasUpgrade("p",12)||player.e.unlocked},
        },
        23:{    
            title: "点数声望",
            description: "基于点数数量加成声望获取",
            effect(){
                let eff = player.points.max(16).log(16)
                eff = powsoftcap(eff,n(1000),four)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(32),
            unlocked(){return hasUpgrade("p",22)||player.e.unlocked},
        },
        31:{    
            title: "声望点数",
            description: "基于声望数量加成点数获取",
            effect(){
                let eff = player.p.points.max(4).log(4)
                eff = powsoftcap(eff,n(1000),five)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(64),
            unlocked(){return hasUpgrade("p",22)||player.e.unlocked},
        },
        32:{    
            title: "点数自协同",
            description: "基于点数数量加成点数获取",
            effect(){
                let eff = player.points.max(16).log(16).root(16)
                eff = powsoftcap(eff,n(1000),four)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(128),
            unlocked(){return hasUpgrade("p",22)||player.e.unlocked},
        },
        33:{    
            title: "声望自协同",
            description: "基于声望数量加成声望获取,同时解锁一个新的可购买",
            effect(){
                let eff = player.p.points.max(10).log(10)
                eff = powsoftcap(eff,n(1000),five)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(256),
            unlocked(){return hasUpgrade("p",22)||player.e.unlocked},
        },
        41:{    
            title: "声望能量再利用",
            description: "基于重置时的声望能量获得声望源能",
            cost: new Decimal(512),
            unlocked(){return hasUpgrade("p",33)||player.e.unlocked},
        },
        42:{    
            title: "声望源能能量",
            description: "基于声望源能数量加成声望能量获取",
            effect(){
                let eff = layers.p.RenergyE().mul(20).add(1).max(1)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(10000),
            unlocked(){return hasUpgrade("p",33)||player.e.unlocked},
        },
        43:{    
            title: "生产机强化",
            description: "声望能生产机的效果^2",
            effect(){
                let eff = two
                return eff
            },
            effectDisplay(){return "^"+format(this.effect())},
            cost: new Decimal(50),
            unlocked(){return hasUpgrade("p",33)||player.e.unlocked},
            currencyDisplayName: "声望能生产机",
            currencyInternalName: "11",
            currencyLocation(){return player.p.buyables},
        },
    },
    buyables:{
        11:{
            title() {return "声望能生产机"},
            cost(x) {
                let cost = x.max(1).pow(2)
                return cost                
            },
            display() { return "生产声望能量<br>(声望能量在任何重置下都会被重置)<br>当前数量: "+format(getBuyableAmount(this.layer,this.id)) + "<br>当前效果: +"+ format(this.effect())+ "/s<br>当前价格: "+ format(this.cost())+"声望点"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x){
                let eff = x
                if(hasUpgrade("p",21)) eff = eff.mul(upgradeEffect("p",21))
                if(hasUpgrade("p",43)) eff = eff.pow(upgradeEffect("p",43))
                return eff
            },
            unlocked(){return hasUpgrade('p',12)||player.e.unlocked},
        },
        21:{
            title() {return "声望能激发机"},
            cost(x) {
                let cost = two.pow(x.add(6))
                return cost                
            },
            display() { 
                let other = hasUpgrade("e",33)?"+"+format(upgradeEffect("e",33)):""
                return "倍增声望能量获取<br>当前数量: " + format(getBuyableAmount(this.layer,this.id)) + other + "<br>当前效果: x"+ format(this.effect())+ "<br>当前价格: "+ format(this.cost())+"声望点"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x){
                let eff = five.pow(x.add(hasUpgrade("e",33)?upgradeEffect("e",33):0))
                return eff
            },
            unlocked(){return hasUpgrade('p',33)||player.e.unlocked},
        },
    },
    energyE(){
        let eff = player.p.energy.max(2).log(2)
        return eff
    },
    energyG(){
        let get = zero
        if(getBuyableAmount("p",11).gte(1)) get = get.add(buyableEffect("p",11))
        if(getBuyableAmount("p",21).gte(1)) get = get.mul(buyableEffect("p",21))
        if(hasUpgrade("p",42)) get = get.mul(upgradeEffect("p",42))
        return get
    },
    RenergyE(){
        let eff = player.p.Renergy.div(2).add(1).max(1)
        return eff
    },
    RenergyG(){
        let get = player.p.energy.div(100).max(1).log(10)
        return get
    },
    update(diff){
        player.p.energy = player.p.energy.add(layers.p.energyG().mul(diff))
        if(hasUpgrade("e",31)){
            player.p.buyables[11] = player.p.points.root(2).add(1).floor().max(player.p.buyables[11])
            player.p.buyables[21] = player.p.points.max(1).log(2).sub(5).floor().max(player.p.buyables[21])
        }
        if(!inChallenge("c",11)){
            if(hasUpgrade("m",15)) player.p.Renergy = layers.p.RenergyG().max(player.p.Renergy)
            if(hasUpgrade("m",12)){
                quickUpgBuy("p",[11,12,13,21,22,23,31,32,33,41,42,43])
            }
        }
    },
    tabFormat: { 
        "homepage": {   
            content: [
                "main-display","prestige-button",                                
                ["display-text",
                    function(){return "你有 "+format(player.points)+" 点数"}],
                    "blank",["row",[["buyables",[1,2]],["upgrades",[1,2,3,4]]]],"blank",
                ["display-text",function(){if(hasUpgrade("p",12)||player.e.unlocked)return "你有 <h2 style='color:cyan;text-shadow:0px 0px 10px;'>"+format(player.p.energy)+"</h2> 声望能量(+"+format(layers.p.energyG())+"/s),加成点数获取 <h2 style='color:cyan;text-shadow:0px 0px 10px;'>"+format(layers.p.energyE())+"x</h2>"}],
                ["display-text",
                    function(){
                        if(hasUpgrade("p",41)||player.e.unlocked)return "你有 <h2 style='color:#0088FF;text-shadow:0px 0px 10px;'>"+format(player.p.Renergy)+"</h2> 声望源能(+"+format(layers.p.RenergyG().sub(player.p.Renergy).max(0))+"),加成声望获取 <h2 style='color:#0088FF;text-shadow:0px 0px 10px;'>"+format(layers.p.RenergyE())+"x</h2>"}],    
            ],
            unlocked(){return true},
        },
    }, 
})
addLayer("e", {
    name: "e",
    symbol: "E",
    position: 0,
    branches: ["p"],
    startData() { return {
        unlocked: false,
		points: zero,
        energy: zero,
        energyMax: zero,
    }},
    color: "yellow",
    requires: new Decimal(1e12),
    resource: "能量元",
    baseResource: "声望能量",
    baseAmount() {return player.p.energy},
    type: "static",
    exponent: 1,
    gainMult() {
        mult = one
        if(hasUpgrade("e",44)) mult = mult.div(upgradeEffect("e",44))
        return mult
    },
    gainExp() {
        exp = one
        if(layers.c.EpointRoot().gt(1)) exp = exp.mul(layers.c.EpointRoot())
        return exp
    },
    directMult() {
        mult = one
        if(hasUpgrade("m",24)) mult = mult.mul(upgradeEffect("m",24))
        if(hasChallenge("c",22)) mult = mult.mul(challengeEffect("c",22))
        return mult
    },
    row: 1,
    hotkeys: [
        {key: "e", description: "E: 进行能量重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    
    layerShown(){return player.p.energy.gte(1e11)||player.e.unlocked},
    canBuyMax(){return hasUpgrade("e",32)},
    autoPrestige() {return hasUpgrade("m",13)},
    resetsNothing() {return hasUpgrade("m",13)},
    doReset(resettingLayer) {
        player.e.energy = zero
        if (layers[resettingLayer].row > layers[this.layer].row) {
            let kept = []
            layerDataReset(this.layer, kept)
        }
    },
    upgrades:{
        11:{    
            title: "能量激发",
            description: "基于最大能量加成声望获取",
            effect(){
                let eff = player.e.energyMax.max(2).log(2)
                if(hasUpgrade("c",12)) eff = player.e.energyMax.max(1).root(25)
                eff = powsoftcap(eff,n(1000),five)
                eff = logsoftcap(eff,n(1e20),two)
                if(hasUpgrade("e",55)) eff = eff.pow(upgradeEffect("e",55))
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(1),
        },
        21:{
            title:"能量激发II",
            description:"基于最大能量加成点数获取",
            effect(){
                let eff = player.e.energyMax.max(1.5).log(1.5)
                if(hasUpgrade("c",12)) eff = player.e.energyMax.max(1).root(8)
                eff = powsoftcap(eff,n(1000),nine)
                eff = logsoftcap(eff,n(1e30),two)
                if(hasUpgrade("e",55)) eff = eff.pow(upgradeEffect("e",55))
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(80),
            currencyDisplayName:"能量元(没打错)",
            unlocked(){return hasUpgrade("e",11)},     
        },
        22:{
            title(){return hasUpgrade("c",14)?"正增益能量":"反增益能量"},
            description(){return hasUpgrade("c",14)?"基于最大能量加成能量获取":"基于最大能量加成能量获取,但最大能量越高,效果越弱"},
            effect(){
                let eff = player.e.energyMax.max(1).pow(-1).log(10).add(11).max(1)
                if(hasUpgrade("c",14)) eff = player.e.energyMax.max(10).log(10).pow(10)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(100),
            unlocked(){return hasUpgrade("e",11)},
            currencyDisplayName:"能量",
            currencyInternalName:"energy",
            currencyLayer:"e",      
        },
        31:{
            title:"自动购买器",
            description:"自动购买声望能生产机与声望能激发机,且不消耗声望点",
            cost: new Decimal(1e9),
            unlocked(){return hasUpgrade("e",22)},
            currencyDisplayName:"能量",
            currencyInternalName:"energy",
            currencyLayer:"e",      
        },
        32:{
            title:"能量元最大化",
            description:"最大化重置获取能量元",
            cost: new Decimal(1000),
            unlocked(){return hasUpgrade("e",22)},
            currencyDisplayName:"能量",
            currencyInternalName:"energy",
            currencyLayer:"e",      
        },
        33:{
            title:"能量激发III",
            description:"最大能量每有一个数量级的平方,获得一个额外的声望能激发机的等级(怎么一股质量增量味)",
            effect(){
                let eff = player.e.energyMax.max(1).log(10).root(2)
                return eff
            },
            effectDisplay(){return "+"+format(this.effect())},
            cost: new Decimal(1e13),
            unlocked(){return hasUpgrade("e",22)},
            currencyDisplayName:"能量",
            currencyInternalName:"energy",
            currencyLayer:"e",      
        },
        41:{
            title:"优化能量",
            description:"能量获取底数+0.25",
            effect(){
                let eff = one.div(4)
                return eff
            },
            effectDisplay(){return "+"+format(this.effect())},
            cost: new Decimal(50),
            unlocked(){return hasUpgrade("e",33)},
        },
        42:{
            title:"点数自乘",
            description:"点数获取^2",
            effect(){
                let eff = two
                return eff
            },
            effectDisplay(){return "^"+format(this.effect())},
            cost: new Decimal(5e20),
            unlocked(){return hasUpgrade("e",33)},
            currencyDisplayName:"能量",
            currencyInternalName:"energy",
            currencyLayer:"e",      
        },
        43:{
            title:"能量跃迁",
            description:"基于能量加成能量获取",
            effect(){
                let eff = player.e.energy.max(2).log(2)
                eff = powsoftcap(eff,n(1000),four)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(3e26),
            unlocked(){return hasUpgrade("e",33)},
            currencyDisplayName:"能量",
            currencyInternalName:"energy",
            currencyLayer:"e",      
        },
        44:{
            title:"能量跃迁II",
            description:"基于能量降低能量元价格",
            effect(){
                let eff = player.e.energy.max(3).log(3)
                eff = powsoftcap(eff,n(1000),four)
                return eff
            },
            effectDisplay(){return "/"+format(this.effect())},
            cost: new Decimal(1e30),
            unlocked(){return hasUpgrade("e",33)},
            currencyDisplayName:"能量",
            currencyInternalName:"energy",
            currencyLayer:"e",      
        },
        51:{
            title:"能量循环I",
            description:"基于能量降低循环价格",
            effect(){
                let eff = player.e.energy.max(1).root(10)
                if(hasUpgrade("e",52)) eff = eff.pow(upgradeEffect("e",52))
                return eff
            },
            effectDisplay(){return "/"+format(this.effect())},
            cost: new Decimal("e900"),
            unlocked(){return player.c.unlocked&&hasUpgrade("e",44)},
            currencyDisplayName:"能量",
            currencyInternalName:"energy",
            currencyLayer:"e",      
        },
        52:{
            title:"能量循环II",
            description:"基于能量乘方能量循环I的效果",
            effect(){
                let eff = player.e.energy.max(10).log(10).div(500).max(1).root(3.9)
                return eff
            },
            effectDisplay(){return "^"+format(this.effect())},
            cost: new Decimal("e924"),
            unlocked(){return player.c.unlocked&&hasUpgrade("e",44)},
            currencyDisplayName:"能量",
            currencyInternalName:"energy",
            currencyLayer:"e",      
        },
        53:{
            title:"能量循环III",
            description:"基于能量以根指数的形式降低循环价格",
            effect(){
                let eff = player.e.energy.max(10).log(10).max(10).log(10).root(2)
                return eff
            },
            effectDisplay(){return "^"+format(this.effect())+quickSUP(-1)},
            cost: new Decimal("e1005"),
            unlocked(){return player.c.unlocked&&hasUpgrade("e",44)},
            currencyDisplayName:"能量",
            currencyInternalName:"energy",
            currencyLayer:"e",      
        },
        54:{
            title:"能量激发IV",
            description:"基于最大能量加成倍增点获取",
            effect(){
                let eff = player.e.energyMax.max(10).log(10)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal("e1269"),
            unlocked(){return player.c.unlocked&&hasUpgrade("e",44)},
            currencyDisplayName:"能量",
            currencyInternalName:"energy",
            currencyLayer:"e",      
        },
        55:{
            title:"能量激发V",
            description:"基于最大能量乘方能量激发I&II效果",
            effect(){
                let eff = player.e.energyMax.max(10).log(10).max(10).log(10).root(2)
                return eff
            },
            effectDisplay(){return "^"+format(this.effect())},
            cost: new Decimal("e1310"),
            unlocked(){return player.c.unlocked&&hasUpgrade("e",44)},
            currencyDisplayName:"能量",
            currencyInternalName:"energy",
            currencyLayer:"e",      
        },
    },
    bars:{
        energyBar: {
            direction: RIGHT,
            width: 600,
            height: 40,
            req(){
                if(player.e.energyMax.eq(0)) return zero
                let req = player.e.energy.div(player.e.energyMax)
                return req
            },
            fillStyle: {'background-color' : "#008888"},
            progress() { return this.req() },
            display(){return "你有 <h2 style='color:yellow;text-shadow:0px 0px 10px;'>"+format(player.e.energy)+"</h2> 能量(+"+format(layers.e.energyG())+"/s),你最多有"+format(player.e.energyMax)+"能量("+format(this.req().mul(100))+"%)"}
        },
    },
    effectDescription(){
        let a = ""
        if(layers.e.energyG().gte(two.pow(1024))) a = "(已达软上限)"
        return "生成"+format(layers.e.energyG())+"能量/s"+a
    },
    energyG(){
        let floor = two 
        let power = one
        if(hasUpgrade("e",41)) floor = floor.add(upgradeEffect("e",41))
        let get = floor.pow(player.e.points)
        if(get.eq(1)) get = zero
        if(hasUpgrade("e",22)) get = get.mul(upgradeEffect("e",22))
        if(hasUpgrade("e",43)) get = get.mul(upgradeEffect("e",43))
        if(hasUpgrade("n",21)) get = get.mul(upgradeEffect("n",21))
        if(hasMilestone("c",1)) get = get.pow(1.5)
        if(layers.c.energyPowerAdded().gt(0)) power = power.add(layers.c.energyPowerAdded())
        
        get = powsoftcap(get,n(two.pow(1024)),four)
    //挑战限制
        get = get.pow(power)
        if(inChallenge("c",11)) get = get.pow(0.1)
        return get
    },
    update(diff){
        if(player.e.unlocked) player.e.energy = player.e.energy.add(layers.e.energyG().mul(diff))
        player.e.energyMax = player.e.energy.max(player.e.energyMax)
    },
    tabFormat: { 
        "homepage": {   
            content: [
                "main-display","prestige-button",                                
                ["display-text",
                    function(){return "你有 "+format(player.p.energy)+" 声望能量"}],
                    "blank",
                ["bar","energyBar"],"blank",["upgrades",[1,2,3,4,5]]
            ],
            unlocked(){return true},
        },
    }, 
})
addLayer("m", {
    name: "m",
    symbol: "M",
    position: 1,
    branches: ["p"],
    startData() { return {
        unlocked: false,
		points: zero,
    }},
    color: "blue",
    requires: new Decimal(1.5e10),
    resource: "倍增点",
    baseResource: "声望",
    baseAmount() {return player.p.points},
    type: "normal",
    exponent: 0.1,
    gainMult() {
        mult = one
        if(hasUpgrade("e",54)) mult = mult.mul(upgradeEffect("e",54))
        if(hasUpgrade("m",25)) mult = mult.mul(upgradeEffect("m",25))
        if(hasUpgrade("c",13)) mult = mult.mul(upgradeEffect("c",13))
        if(hasUpgrade("n",22)) mult = mult.mul(upgradeEffect("n",22))
        if(hasChallenge("c",12)) mult = mult.mul(challengeEffect("c",12))
        if(layers.c.MpointMult().gt(1)) mult = mult.mul(layers.c.MpointMult())
        return mult
    },
    gainExp() {
        exp = one
        return exp
    },
    row: 1,
    hotkeys: [
        {key: "m", description: "M: 进行倍增重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.p.points.gte(1e9)||player.m.unlocked},
    doReset(resettingLayer) {
        player.e.energy = zero;player.e.energyMax = zero
        if (layers[resettingLayer].row > layers[this.layer].row) {
            let kept = []
            layerDataReset(this.layer, kept)
        }
    },
    upgrades:{
        11:{    
            title: "声望半自乘",
            description: "声望获取^1.5",
            effect(){
                let eff = three.div(2)
                return eff
            },
            effectDisplay(){return "^"+format(this.effect())},
            cost: new Decimal(5),
        },
        12:{    
            title: "声望自动购买",
            description: "自动购买声望升级",
            cost: new Decimal(5),
            unlocked(){return hasUpgrade("m",11)},
        },
        13:{    
            title: "自动能量元",
            description: "自动重置能量元,能量元不再重置任何东西",
            cost: new Decimal(10),
            unlocked(){return hasUpgrade("m",11)},
        },
        14:{    
            title: "自动声望",
            description: "每秒自动获取重置时可获取的声望的100%",
            cost: new Decimal(20),
            unlocked(){return hasUpgrade("m",11)},
        },
        15:{    
            title: "自动源能",
            description: "不需要声望重置即可获取源能",
            cost: new Decimal(50),
            unlocked(){return hasUpgrade("m",11)},
        },
        21:{    
            title: "倍增点底",
            description: "声望层的第2,3个升级基于倍增点而乘方,上限^1024",
            effect(){
                let eff = player.m.points.max(10).log(10)
                eff = eff.min(1024)
                return eff
            },
            effectDisplay(){return "^"+format(this.effect())},
            cost: new Decimal(50),
            unlocked(){return hasUpgrade("m",11)},
        },
        22:{    
            title: "倍增点顶",
            description: "基于倍增点乘方倍增点效果,上限^10",
            effect(){
                let eff = player.m.points.max(5).log(5).root(10)
                eff = eff.min(10)
                return eff
            },
            effectDisplay(){return "^"+format(this.effect())},
            cost: new Decimal(150),
            unlocked(){return hasUpgrade("m",13)},
        },
        23:{    
            title: "倍增点中?",
            description: "倍增点效果以^0.2的形式对声望生效",
            effect(){
                let eff = layers.m.pointE().root(5)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(250),
            unlocked(){return hasUpgrade("m",15)},
        },
        24:{    
            title: "倍增点左???",
            description: "能量元的基础获取直接x1.5",
            effect(){
                let eff = three.div(2)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(550),
            unlocked(){return hasUpgrade("m",22)},
        },
        25:{    
            title: "倍增点右??!!",
            description: "倍增点获取x10,解锁一个新层级",
            effect(){
                let eff = ten
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(1e18),
            unlocked(){return hasUpgrade("m",24)},
        },
        31:{    
            title: "增量声望I",
            description(){
                let a = "2"
                if(hasUpgrade("m",33)) a = format(two.add(upgradeEffect("m",33)))
                return "声望获取x" + a
            },
            effect(){
                let eff = two
                if(hasUpgrade("m",33)) eff = eff.add(upgradeEffect("m",33))
                if(hasUpgrade("m",32)) eff = eff.pow(upgradeEffect("m",32))
                if(hasUpgrade("m",35)) eff = eff.pow(2)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(50),
            unlocked(){return hasUpgrade("m",15)},
        },
        32:{    
            title: "增量声望II",
            description: "增量声望I效果基于能量元乘方,上限^1024",
            effect(){
                let eff = player.e.points.root(3)
                eff = powsoftcap(eff,n(20),three)
                eff = eff.min(1024)
                if(inChallenge("c",11)) eff = one
                return eff
            },
            effectDisplay(){return "^"+format(this.effect())},
            cost: new Decimal(250),
            unlocked(){return hasUpgrade("m",22)},
        },
        33:{    
            title: "增量声望III",
            description: "增量声望I效果底数(原效果)基于倍增点而增加,+500和+1080后软上限",
            effect(){
                let eff = player.m.points.div(100).max(1).log(10)
                if(eff.gt(1)&&hasUpgrade("m",34)&&!inChallenge("c",11)) eff = eff.pow(2)
                eff = powsoftcap(eff,n(500),two)
                eff = powsoftcap(eff,n(1080),ten)
                return eff
            },
            effectDisplay(){return "+"+format(this.effect())},
            cost: new Decimal(1250),
            unlocked(){return hasUpgrade("m",23)},
        },
        34:{    
            title: "增量声望IV",
            description: "增量声望III效果在大于1时^2",
            cost: new Decimal(6250),
            unlocked(){return hasUpgrade("m",24)},
        },
        35:{    
            title: "增量声望V",
            description: "增量声望I效果再^2",
            cost: new Decimal(5e5),
            unlocked(){return hasUpgrade("m",33)},
        },
        41:{    
            title: "增量点数I",
            description(){
                let a = "10"
                if(hasUpgrade("m",43)) a = format(ten.add(upgradeEffect("m",43)))
                return "点数获取x" + a
            },
            effect(){
                let eff = ten
                if(hasUpgrade("m",43)) eff = eff.add(upgradeEffect("m",43))
                if(hasUpgrade("m",42)) eff = eff.pow(upgradeEffect("m",42))
                //if(hasUpgrade("m",35)) eff = eff.pow(2)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(3.4e34),
            unlocked(){return hasUpgrade("m",25)},
        },
        42:{    
            title: "增量点数II",
            description: "增量点数I效果基于循环乘方,上限^512",
            effect(){
                let eff = player.c.points.root(2)
                eff = powsoftcap(eff,n(20),three)
                eff = eff.min(512)
                return eff
            },
            effectDisplay(){return "^"+format(this.effect())},
            cost: new Decimal(1e35),
            unlocked(){return hasUpgrade("m",41)},
        },
        43:{    
            title: "增量点数III",
            description: "增量点数I效果底数(原效果)基于能量而增加,+5000后软上限",
            effect(){
                let eff = player.e.energy.max(10).log(10).max(1.01).log(1.01)
                eff = powsoftcap(eff,n(5000),three)
                return eff
            },
            effectDisplay(){return "+"+format(this.effect())},
            cost: new Decimal(1e71),
            unlocked(){return hasUpgrade("m",41)},
        },
    },
    effectDescription(){
        let a = ""
        if(layers.m.pointE().gte("e73")) a = "(已达软上限)"
        return "倍增点数获取"+format(layers.m.pointE())+"x"+a
    },
    pointE(){
        let eff = player.m.points.max(1).pow(2)
        if(player.m.points.eq(1)) eff = two
        if(hasUpgrade("m",22)) eff = eff.pow(upgradeEffect("m",22))
        eff = powsoftcap(eff,n("e73"),three)
        eff = powsoftcap(eff,n("e1000"),five)
    //挑战限制
        if(inChallenge("c",11)) eff = eff.pow(0.1)
        return eff
    },
    tabFormat: { 
        "homepage": {   
            content: [
                "main-display","prestige-button",                                
                ["display-text",
                    function(){return "你有 "+format(player.p.points)+" 声望点"}],"blank",
                    ["upgrades",[1,2,3,4]]
            ],
            unlocked(){return true},
        },
    }, 
})
addLayer("c", {
    name: "c",
    symbol: "C",
    position: 2,
    branches: ["p"],
    startData() { return {
        unlocked: false,
		points: zero,
        energy: zero,
        energyMax: zero,
        loops: zero,
        looPoints: zero,
        power: zero,
        tstPoint: zero,
        maxTstP: zero,
        atELv: [],
        tstt1: zero,
        tstt2: zero,
        tstt3: zero,
        tstt4: zero,
        doResetTpUpg: false,
    }},
    color: "#88FF88",
    requires: new Decimal(1e210),
    resource: "循环",
    baseResource: "声望点",
    baseAmount() {return player.p.points},
    type: "static",
    exponent: 3,
    gainMult() {
        mult = one
        if(hasChallenge("c",11)) mult = mult.div(challengeEffect("c",11))
        if(hasUpgrade("e",51)) mult = mult.div(upgradeEffect("e",51))
        if(hasUpgrade("n",31)) mult = mult.div(upgradeEffect("n",31))
        return mult
    },
    gainExp() {
        exp = one
        if(hasChallenge("c",21)) exp = exp.mul(challengeEffect("c",21))
        if(hasUpgrade("e",53)) exp = exp.mul(upgradeEffect("e",53))
        return exp
    },
    directMult() {
        mult = one
        return mult
    },
    row: 1,
    hotkeys: [
        {key: "c", description: "C: 进行循环重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("m",25)||player.c.unlocked},
    doReset(resettingLayer) {
        player.e.energy = zero;player.e.energyMax = zero
        if (layers[resettingLayer].row > layers[this.layer].row) {
            let kept = []
            layerDataReset(this.layer, kept)
        }
    },
    upgrades:{
        11:{    
            title: "循环声望",
            description: "基于循环乘方声望获取",
            effect(){
                let eff = player.c.points.max(1).log(10).add(1).root(10)
                return eff
            },
            effectDisplay(){return "^"+format(this.effect())},
            cost: new Decimal(2),
        },
        12:{    
            title: "循环能量",
            description: "重构升级能量激发I,II的效果公式",
            cost: new Decimal(8),
        },
        13:{    
            title: "循环倍增",
            description: "基于循环倍增倍增点获取",
            effect(){
                let eff = three.pow(player.c.points)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            cost: new Decimal(13),
        },
        14:{    
            title: "正反能量重构",
            description: "重构升级反增益能量的效果公式,并修改效果描述",
            cost: new Decimal(23),
        },
        21:{    
            title: "提升循环力量",
            description: "循环力量倍增机效果x2",
            cost: new Decimal(100),
            effect(){
                let eff = two
                return eff
            },
            effectDisplay(){return format(this.effect())+"x"},
            currencyDisplayName:"循环力量",
            currencyInternalName:"power",
            currencyLayer:"c",                  
            style() { return { 'background-color': hasUpgrade(this.layer,this.id)?"#77BF5F":!hasUpgrade(this.layer,this.id)&&canAffordUpgrade(this.layer,this.id)?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",}},
        },
        22:{    
            title: "提升循环力量II",
            description: "循环力量倍增机单次购买加成基于自身购买量提升",
            cost: new Decimal(1000),
            effect(){
                let eff = player.c.buyables[32].add(tmp.c.buyables[32].other).root(2).sub(1).max(0)
                if(hasUpgrade("c",25)) eff = eff.pow(upgradeEffect("c",25))
                return eff
            },
            effectDisplay(){return "+"+format(this.effect())},
            currencyDisplayName:"循环力量",
            currencyInternalName:"power",
            currencyLayer:"c",                  
            style() { return { 'background-color': hasUpgrade(this.layer,this.id)?"#77BF5F":!hasUpgrade(this.layer,this.id)&&canAffordUpgrade(this.layer,this.id)?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",}},
        },
        23:{    
            title: "提升循环力量III",
            description: "循环力量生产机价格基于循环能量倍增机购买量降低",
            cost: new Decimal(2000),
            effect(){
                let eff = player.c.buyables[32].add(tmp.c.buyables[32].other).root(3)
                return eff
            },
            effectDisplay(){return "-"+format(this.effect())},
            currencyDisplayName:"循环力量",
            currencyInternalName:"power",
            currencyLayer:"c",                  
            style() { return { 'background-color': hasUpgrade(this.layer,this.id)?"#77BF5F":!hasUpgrade(this.layer,this.id)&&canAffordUpgrade(this.layer,this.id)?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",}},
        },
        24:{    
            title: "提升循环力量IV",
            description: "每个循环力量生产机给予循环能量倍增机一个额外等级",
            cost: new Decimal(50000),
            effect(){
                let eff = player.c.buyables[31].add(tmp.c.buyables[31].other)
                return eff
            },
            effectDisplay(){return "+"+format(this.effect())},
            currencyDisplayName:"循环力量",
            currencyInternalName:"power",
            currencyLayer:"c",                  
            style() { return { 'background-color': hasUpgrade(this.layer,this.id)?"#77BF5F":!hasUpgrade(this.layer,this.id)&&canAffordUpgrade(this.layer,this.id)?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",}},
        },
        25:{    
            title: "提升循环力量V",
            description: "提升循环力量II效果^2",
            cost: new Decimal(100000),
            effect(){
                let eff = two
                return eff
            },
            effectDisplay(){return "^"+format(this.effect())},
            currencyDisplayName:"循环力量",
            currencyInternalName:"power",
            currencyLayer:"c",                  
            style() { return { 'background-color': hasUpgrade(this.layer,this.id)?"#77BF5F":!hasUpgrade(this.layer,this.id)&&canAffordUpgrade(this.layer,this.id)?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",}},
        },
        31:{    
            title: "提升循环力量VI",
            description: "循环力量倍增机价格基于循环力量二重倍增机降低",
            cost: new Decimal(524288),
            effect(){
                let eff = player.c.buyables[33].add(1).max(1).pow(5)
                return eff
            },
            effectDisplay(){return "/"+format(this.effect())},
            currencyDisplayName:"循环力量",
            currencyInternalName:"power",
            currencyLayer:"c",                  
            style() { return { 'background-color': hasUpgrade(this.layer,this.id)?"#77BF5F":!hasUpgrade(this.layer,this.id)&&canAffordUpgrade(this.layer,this.id)?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return hasUpgrade("c",25)}
        },
        32:{    
            title: "提升循环力量VII",
            description: "循环力量倍增机价格基于自身降低",
            cost: new Decimal(16777216),
            effect(){
                let eff = player.c.buyables[32].add(tmp.c.buyables[32].other).max(1)
                return eff
            },
            effectDisplay(){return "/"+format(this.effect())},
            currencyDisplayName:"循环力量",
            currencyInternalName:"power",
            currencyLayer:"c",                  
            style() { return { 'background-color': hasUpgrade(this.layer,this.id)?"#77BF5F":!hasUpgrade(this.layer,this.id)&&canAffordUpgrade(this.layer,this.id)?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return hasUpgrade("c",25)}
        },
        33:{    
            title: "提升循环力量VIII",
            description: "解锁循环力量三重倍增机,循环力量倍增机单次购买加成+1",
            cost: new Decimal(42),
            effect(){
                let eff = one
                return eff
            },
            effectDisplay(){return "+"+format(this.effect())},
            currencyDisplayName:"循环力量倍增机",
            currencyInternalName: "32",
            currencyLocation(){return player.c.buyables},
            currencyLayer:"c",                  
            style() { return { 'background-color': hasUpgrade(this.layer,this.id)?"#77BF5F":!hasUpgrade(this.layer,this.id)&&canAffordUpgrade(this.layer,this.id)?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return hasUpgrade("c",25)}
        },
        34:{    
            title: "提升循环力量IX",
            description: "循环力量倍增机的价格增长指数基于循环力量二重倍增机降低,上限-0.9",
            cost: new Decimal(134217728),
            effect(){
                let eff = player.c.buyables[33].max(0).root(2).mul(0.1).min(0.9)
                if(hasUpgrade("c",35)) eff = eff.add(upgradeEffect("c",35))
                return eff
            },
            effectDisplay(){return "-"+formatSmall(this.effect())},
            currencyDisplayName:"循环力量",
            currencyInternalName:"power",
            currencyLayer:"c",                        
            style() { return { 'background-color': hasUpgrade(this.layer,this.id)?"#77BF5F":!hasUpgrade(this.layer,this.id)&&canAffordUpgrade(this.layer,this.id)?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return hasUpgrade("c",25)}
        },
        35:{    
            title: "提升循环力量X",
            description: "在循环力量界面下解锁一个子界面,提升循环力量IX的效果+0.05",
            cost: new Decimal(4294967296),//致敬传奇AST
            effect(){
                let eff = n(0.05)
                return eff
            },
            effectDisplay(){return "+"+format(this.effect())},
            currencyDisplayName:"循环力量",
            currencyInternalName:"power",
            currencyLayer:"c",                        
            style() { return { 'background-color': hasUpgrade(this.layer,this.id)?"#77BF5F":!hasUpgrade(this.layer,this.id)&&canAffordUpgrade(this.layer,this.id)?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return hasUpgrade("c",25)}
        },
        41:{    
            title: "跃迁力量升级I",
            description: "在第一循环状态下,剩余时间越短,效果越高",
            cost: new Decimal(1),
            effect(){
                let eff = n(31).sub(player.c.tstt1)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            currencyDisplayName:"跃迁力量",
            currencyInternalName:"tstPoint",
            currencyLayer:"c",                        
            style() { return { 'background-color': hasUpgrade(this.layer,this.id)?"#77FFBB":!hasUpgrade(this.layer,this.id)&&canAffordUpgrade(this.layer,this.id)?"#88FFFF":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return player.c.maxTstP.gt(0)}
        },
        42:{    
            title: "跃迁力量升级II",
            description: "基于剩余跃迁能量加成循环能量获取",
            cost: new Decimal(1),
            effect(){
                let eff = ten.pow(player.c.tstPoint.div(2))
                powsoftcap(eff,n("e10"),four)
                return eff
            },
            effectDisplay(){return "x"+format(this.effect())},
            currencyDisplayName:"跃迁力量",
            currencyInternalName:"tstPoint",
            currencyLayer:"c",                        
            style() { return { 'background-color': hasUpgrade(this.layer,this.id)?"#77FFBB":!hasUpgrade(this.layer,this.id)&&canAffordUpgrade(this.layer,this.id)?"#88FFFF":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return player.c.maxTstP.gt(0)}
        },
        43:{    
            title: "新的重置",
            description: "解锁新的重置层,新层资源重置基础为e1000点数",
            cost: new Decimal(275),
            currencyDisplayName:"跃迁力量",
            currencyInternalName:"tstPoint",
            currencyLayer:"c",                        
            style() { return { 'background-color': hasUpgrade(this.layer,this.id)?"#77FFBB":!hasUpgrade(this.layer,this.id)&&canAffordUpgrade(this.layer,this.id)?"#88FFFF":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return player.c.maxTstP.gt(0)}
        },
    },
    milestones: {
        0: {
            requirementDescription: "6循环",
            effectDescription: "解锁循环第一挑战",
            done(){ return player.c.points.gte(6)},
            unlocked(){return true}
        },
        1: {
            requirementDescription: "8循环",
            effectDescription: "能量获取在软上限前^1.5",
            done(){ return player.c.points.gte(8)},
            unlocked(){return true}
        },
        2: {
            requirementDescription: "9循环",
            effectDescription: "解锁循环第二挑战",
            done(){ return player.c.points.gte(9)},
            unlocked(){return true}
        },
        3: {
            requirementDescription: "11循环",
            effectDescription: "解锁循环第三挑战",
            done(){ return player.c.points.gte(11)},
            unlocked(){return true}
        },
        4: {
            requirementDescription: "17循环",
            effectDescription: "解锁循环第四挑战",
            done(){ return player.c.points.gte(17)},
            unlocked(){return true}
        },
        5: {
            requirementDescription: "20循环",
            effectDescription: "在循环层下解锁一个子界面",
            done(){ return player.c.points.gte(20)},
            unlocked(){return true}
        },
        6: {
            requirementDescription: "25循环",
            effectDescription: "在循环层下再解锁一个子界面",
            done(){ return player.c.points.gte(25)},
            unlocked(){return true}
        },
        7: {
            requirementDescription: "5循环力量三重倍增机",
            effectDescription: "自动购买循环力量倍增机且它不再消耗循环力量",
            done(){ return player.c.buyables[34].gte(5)},
            unlocked(){return player.c.buyables[34].gt(0)}
        },
        8: {
            requirementDescription: "50循环力量三重倍增机",
            effectDescription: "自动购买循环力量二重倍增机和三重倍增机",
            done(){ return player.c.buyables[34].gte(50)},
            unlocked(){return player.c.buyables[34].gt(0)}
        },
    },
    buyables:{
        11:{
            cost(x) {
                let a = n(1e100).pow(x).mul("e1500")
                return a
            },
            title() { return "<h3>" + format(this.cost()) + "</h3><br>声望能量"},
            canAfford() { return player.p.energy.gte(this.cost())},
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.c.loops = player.c.loops.add(1)
            },
            unlocked(){return true},
            style() { return { 'background-color': this.canAfford()?"cyan":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px", height: "50px", width: "120px" }},
            tooltip(){return "购买量: <h2 style='color:cyan;text-shadow:0px 0px 10px;'>"+ format(getBuyableAmount(this.layer,this.id),0) + "</h2>"}
        },
        12:{
            cost(x) {
                let a = n(1e100).pow(x).mul("e1500")
                return a
            },
            title() { return "<h3>" + format(this.cost()) + "</h3><br>能量"},
            canAfford() { return player.e.energy.gte(this.cost())},
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.c.loops = player.c.loops.add(1)
            },
            unlocked(){return true},
            style() { return { 'background-color': this.canAfford()?"yellow":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px", height: "50px", width: "120px" }},
            tooltip(){return "购买量: <h2 style='color:yellow;text-shadow:0px 0px 10px;'>"+ format(getBuyableAmount(this.layer,this.id),0) + "</h2>"}
        },
        13:{
            cost(x) {
                let a = n(1e5).pow(x).mul("e65")
                return a
            },
            title() { return "<h3>" + format(this.cost()) + "</h3><br>倍增点"},
            canAfford() { return player.m.points.gte(this.cost())},
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.c.loops = player.c.loops.add(1)
            },
            unlocked(){return true},
            style() { return { 'background-color': this.canAfford()?"blue":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px", height: "50px", width: "120px" }},
            tooltip(){return "购买量: <h2 style='color:blue;text-shadow:0px 0px 10px;'>"+ format(getBuyableAmount(this.layer,this.id),0) + "</h2>"}
        },
        14:{
            cost(x) {
                let a = x.mul(2).add(20)
                return a
            },
            title() { return "<h3>" + format(this.cost()) + "</h3><br>循环"},
            canAfford() { return player.c.points.gte(this.cost())},
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.c.loops = player.c.loops.add(1)
            },
            unlocked(){return true},
            style() { return { 'background-color': this.canAfford()?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px", height: "50px", width: "120px" }},
            tooltip(){return "购买量: <h2 style='color:#88FF88;text-shadow:0px 0px 10px;'>"+ format(getBuyableAmount(this.layer,this.id),0) + "</h2>"}
        },
        21:{
            cost(x) {
                let a = one
                return a
            },
            title() { return "<h3>" + format(this.cost(),0) + "</h3>循环节/10循环节点"},
            canAfford() { return player.c.loops.gte(this.cost())},
            buy() {
                player.c.loops = player.c.loops.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.c.looPoints = player.c.looPoints.add(10)
            },
            unlocked(){return true},
            style() { return { 'background-color': this.canAfford()?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px", height: "30px", width: "200px" }},
            tooltip(){return "购买量: <h2 style='color:#88FF88;text-shadow:0px 0px 10px;'>"+ format(getBuyableAmount(this.layer,this.id),0) + "</h2>"}
        },
        31:{
            title: "循环力量生产机",
            cost(x) {
                let a = x.add(25)
                if(hasUpgrade("c",23)) a = a.sub(upgradeEffect("c",23))
                return a.max(0)
            },
            display() { return "每秒获得循环力量<br>价格: " + format(this.cost()) + "循环,效果: +"+format(this.effect())+"/s"},
            canAfford() { return player.c.points.gte(this.cost())},
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x){
                let eff = two.pow(x.add(this.other())).sub(1)
                return eff
            },
            other(){
                let other = zero
                return other
            },
            unlocked(){return true},
            style() { return { 'background-color': this.canAfford()?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",height: "75px", width: "600px"}},
            tooltip(){
                let a = "购买量: <h2 style='color:#88FF88;text-shadow:0px 0px 10px;'>"+ format(getBuyableAmount(this.layer,this.id),0) + "</h2>"
                if(this.other().gt(0)) a+="+"+format(this.other(),0)
                return a
            }
        },
        32:{
            title: "循环力量倍增机",
            cost(x) {
                let a = this.floor().pow(x).mul(10).div(this.divt())
                return a
            },
            floor(){
                let floor = two
                if(hasUpgrade("c",34)) floor = floor.sub(upgradeEffect("c",34))
                return floor
            },
            divt(){
                let a = one
                if(hasUpgrade("c",31)) a = a.mul(upgradeEffect("c",31))
                if(hasUpgrade("c",32)) a = a.mul(upgradeEffect("c",32))
                return a
            },
            display() { return "倍增循环力量获取<br>价格: " + format(this.cost()) + "循环力量<br>效果: "+format(this.effect())+"x"},
            canAfford() { return player.c.power.gte(this.cost())},
            buy() {
                if(!hasMilestone("c",7)) player.c.power = player.c.power.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x){
                let addonce = one
                if(hasUpgrade("c",22)) addonce = addonce.add(upgradeEffect("c",22))
                if(hasUpgrade("c",33)) addonce = addonce.add(upgradeEffect("c",33))
                if(buyableEffect("c",33).gt(1)) addonce = addonce.mul(buyableEffect("c",33))
                let eff = x.add(this.other()).mul(addonce)
                eff = eff.add(1)
                if(hasUpgrade("c",21)) eff = eff.mul(upgradeEffect("c",21))
                return eff
            },
            other(){
                let other = zero
                if(hasUpgrade("c",24)) other = other.add(upgradeEffect("c",24))
                return other
            },
            auto(){
                if(hasMilestone("c",7)){
                    let amt = player.c.power.mul(this.divt()).div(10).max(1).log(this.floor()).floor().add(1).max(0).max(getBuyableAmount("c",32))
                    player.c.buyables[32] = amt
                }
            },
            unlocked(){return true},
            style() { return { 'background-color': this.canAfford()?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",height: "75px", width: "200px"}},
            tooltip(){
                let a = "购买量: <h2 style='color:#88FF88;text-shadow:0px 0px 10px;'>"+ format(getBuyableAmount(this.layer,this.id),0) + "</h2>"
                if(this.other().gt(0)) a+="+"+format(this.other(),0)
                return a}
        },
        33:{
            title: "循环力量二重倍增机",
            cost(x) {
                let a = x.mul(5).add(15)
                return a
            },
            display() { return "倍增循环力量倍增机的单次购买加成<br>价格: " + format(this.cost()) + "循环力量倍增机<br>效果: "+format(this.effect())+"x"},
            canAfford() { return player.c.buyables[32].gte(this.cost())},
            buy() {
                player.c.buyables[32] = player.c.buyables[32].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x){
                let addonce = two
                if(getBuyableAmount("c",34).gte(1)) addonce = addonce.mul(buyableEffect("c",34))
                let eff = x.mul(addonce)
                eff = eff.add(1)
                return eff
            },
            other(){
                let other = zero
                return other
            },
            auto(){
                if(hasMilestone("c",8)){
                    let amt = player.c.buyables[32].sub(15).div(5).floor().add(1).max(0).max(getBuyableAmount("c",33))
                    player.c.buyables[33] = amt
                }
            },
            unlocked(){return hasUpgrade("c",25)},
            style() { return { 'background-color': this.canAfford()?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",height: "75px", width: "200px"}},
            tooltip(){
                let a = "购买量: <h2 style='color:#88FF88;text-shadow:0px 0px 10px;'>"+ format(getBuyableAmount(this.layer,this.id),0) + "</h2>"
                if(this.other().gt(0)) a+="+"+format(this.other(),0)
                return a}
        },
        34:{
            title: "循环力量三重倍增机",
            cost(x) {
                let a = x.mul(10).add(40)
                return a
            },
            display() { return "倍增循环力量二重倍增机的单次购买加成<br>价格: " + format(this.cost()) + "循环力量倍增机<br>效果: "+format(this.effect())+"x"},
            canAfford() { return player.c.buyables[32].gte(this.cost())},
            buy() {
                player.c.buyables[32] = player.c.buyables[32].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x){
                let addonce = four
                let eff = x.mul(addonce)
                eff = eff.add(1)
                return eff
            },
            other(){
                let other = zero
                return other
            },
            unlocked(){return hasUpgrade("c",33)},
            auto(){
                if(hasMilestone("c",8)){
                    let amt = player.c.buyables[32].sub(40).div(10).floor().add(1).max(0).max(getBuyableAmount("c",34))
                    player.c.buyables[34] = amt
                }
            },
            style() { return { 'background-color': this.canAfford()?"#88FF88":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",height: "75px", width: "200px"}},
            tooltip(){
                let a = "购买量: <h2 style='color:#88FF88;text-shadow:0px 0px 10px;'>"+ format(getBuyableAmount(this.layer,this.id),0) + "</h2>"
                if(this.other().gt(0)) a+="+"+format(this.other(),0)
                return a}
        },
        41:{
            title() {let text="第一循环-";text+=player.c.atELv.includes(this.id-40)?"启用":"闲置";return text},
            canAfford(){
                if(player.c.atELv.includes(this.id-40)) return false
                if(player.c.tstPoint.gte(this.cost())) return true
                return false
            },
            cost(){ 
                return one
            },
            buy() {        
                player.c.tstPoint = player.c.tstPoint.sub(this.cost())
                player.c.tstt1 = n(30);player.c.atELv.push(this.id-40)
            },
            off(){
                if(player.c.tstt1.eq(0)&&player.c.atELv.includes(this.id-40)) {
                    player.c.atELv.splice(player.c.atELv.indexOf(this.id-40),1)
                    if(!player.c.maxTstP.lt(this.cost())) player.c.tstPoint = player.c.tstPoint.add(this.cost())
                }
            },
            style() { 
                let color = "#BF8F8F"
                if(this.canAfford()) color = "#88FF88"
                if(player.c.atELv.includes(this.id-40)) color = "yellow"
                return { 'background-color': color, filter: "brightness(100%)",'border-radius': "0px",height: "75px",  width: "100px"}},
        },
        42:{
            title() {let text="第二循环-";text+=player.c.atELv.includes(this.id-40)?"启用":"闲置";return text},
            canAfford(){
                if(player.c.atELv.includes(this.id-40)) return false
                if(player.c.tstPoint.gte(this.cost())) return true
                return false
            },
            cost(){ 
                return ten
            },
            buy() {        
                player.c.tstPoint = player.c.tstPoint.sub(this.cost())
                player.c.tstt2 = n(60);player.c.atELv.push(this.id-40)
            },
            off(){
                if(player.c.tstt2.eq(0)&&player.c.atELv.includes(this.id-40)) {
                    player.c.atELv.splice(player.c.atELv.indexOf(this.id-40),1)
                    if(!player.c.maxTstP.lt(this.cost())) player.c.tstPoint = player.c.tstPoint.add(this.cost())
                }
            },
            unlocked(){return player.c.maxTstP.gte(20)},
            style() { 
                let color = "#BF8F8F"
                if(this.canAfford()) color = "#88FF88"
                if(player.c.atELv.includes(this.id-40)) color = "yellow"
                return { 'background-color': color, filter: "brightness(100%)",'border-radius': "0px",height: "75px",  width: "100px"}},
        },
    },
    challenges: {
        11: {
            name: "cycle challenge 1st",
            challengeDescription: "循环第一挑战<br>挑战中,声望获取^0.5,点数获取^0.5,能量获取^0.1,倍乘点效果^0.1,倍增层的第一行后四个升级和增量声望II&IV全部失效",
            canComplete() {return player.p.points.gte(5e19)},
            goalDescription: "5e19声望",
            rewardDescription(){return "基于倍增点降低循环价格<br>当前: /" + format(this.rewardEffect())},
            rewardEffect(){
                let eff = player.m.points.max(1).pow(2.6)
                return eff
            },
            onEnter() {
                player.e.energy = zero;player.e.energyMax = zero
            },
            unlocked(){return hasMilestone("c",0)},
        },
        12: {
            name: "cycle challenge 2nd",
            challengeDescription: "循环第二挑战<br>挑战中,无法获取点数,声望获取^0.05",
            canComplete() {return player.p.Renergy.gte(61)},
            goalDescription: "61声望源能",
            rewardDescription(){return "循环倍增倍增点获取<br>当前: x" + format(this.rewardEffect())},
            rewardEffect(){
                let eff = two.pow(player.c.points)
                return eff
            },
            onEnter() {
                player.e.energy = zero;player.e.energyMax = zero
            },
            unlocked(){return hasMilestone("c",2)},
        },
        21: {
            name: "cycle challenge 3rd",
            challengeDescription: "循环第三挑战<br>挑战中,循环第一挑战同时生效,且你只能重置5次声望,超出则无法完成挑战!",
            canComplete() {return player.p.Renergy.gte(85)&&player.PreseTimes<=5},
            goalDescription: "85声望源能",
            rewardDescription(){return "循环的价格基于能量元以根指数降低<br>当前: ^"+ format(this.rewardEffect()) + quickSUP("-1")},
            rewardEffect(){
                let eff = player.e.points.max(10).log(10).root(2)
                return eff
            },
            onEnter() {
                player.e.energy = zero;player.e.energyMax = zero
                player.PreseTimes = 0
            },
            onExit(){
                player.PreseTimes = 0 
            },
            countsAs:[11],
            unlocked(){return hasMilestone("c",3)},
        },
        22: {
            name: "cycle challenge 4th",
            challengeDescription: "循环第四挑战<br>挑战中,循环第一,二挑战同时生效",
            canComplete() {return player.p.Renergy.gte(11.5)},
            goalDescription: "11.5声望源能",
            rewardDescription(){return "基于循环直接倍增能量元获取<br>当前: x" + format(this.rewardEffect())},
            rewardEffect(){
                let eff = player.c.points.div(3).root(10).max(1)
                if(eff.gt(3)) eff = eff.div(3).log(3).add(3)
                return eff
            },
            onEnter() {
                player.e.energy = zero;player.e.energyMax = zero
            },
            countsAs:[11,12],
            unlocked(){return hasMilestone("c",4)},
        },
    },
    grid:{
        rows: 12,
        cols: 12,
        getStartData() {
            return 0
        },
        getUnlocked(id) {
            let a = 3
            if(getGridData("c",202)) a += getGridData("c",202)
            if(id>a*100||id%100>a-1) return false
            return true
        },
        getCanClick(data, id) {
            if(data<this.limit(id)&&player.c.looPoints.gte(this.cost(id))){
                if(id==101) return true
                if(checkAroundGrid(this.layer,id)) return true
            }
            return false
        },
        onClick(data,id) { 
            player.c.looPoints = player.c.looPoints.sub(this.cost(id))
            player[this.layer].grid[id]++          
        },
        getDisplay(data, id) {
            return data + "/" + this.limit(id)
        },  
        getStyle(data, id){
            let color = "#BF8F8F"
            if(data==this.limit(id)){
            if(this.limit(id)!==0) color = "#77BF5F"
            else color = "#FF3300"}
            else if(data>0) color = "yellow"
            if(this.getCanClick(data, id))color ="#FFFFFF"
            return { 'background-color':color,'border-radius': "0px", height: "50px", width: "50px" }
        },
        limit(id){
            if(id==101) return 100
            if(id==202) return 10
            if(getGridData("c",203)&&id==302) return 0
            if(getGridData("c",302)&&id==203) return 0
            return 1
        },
        cost(id){
            let data = getGridData(this.layer,id)
            if(id==101) return n(data).max(1).pow(2) 
            if(id==102) return ten.add(n(getGridData("c",201)).mul(20))
            if(id==103||id==301) return n(35)
            if(id==201) return ten.add(n(getGridData("c",102)).mul(20))
            if(id==202){
                if(!data) return ten
                return n(1919180)
            }
            if(id==203||id==302) return three
            if(id==303) return n(150)
            return zero
        },
        getTooltip(data, id){
            let efftext = ""
            if(id==101) efftext += "提升倍增点获取<br>"
            if(id==102) efftext += "点数获取 x1e8,<br>增加研究201的价格<br>"
            if(id==103) efftext += "能量元价格^1.2"+quickSUP(-1)+",<br>"
            if(id==201) efftext += "点数获取基于能量元倍增,<br>增加研究102的价格<br>"
            if(id==202) efftext += "增加循环研究的行列量<br>"
            if(id==301) efftext += "基于循环研究对点数的乘数倍增倍增声望获取<br>"
            if(id==303) efftext += "基于循环增加能量获取指数<br>"
            if(id==203||id==302) efftext += "单向门&研究" + format(n(id==302?203:302),0) + "<br>"
            if(id==101||id==201||id==301) efftext += "当前: "+format(gridEffect(this.layer,id))+"x<br>"
            if(id==202||id==303) efftext += "当前: +"+format(gridEffect(this.layer,id),id==202?0:4)+"<br>"
            return efftext + "价格: <h2 style='color:#88FF88;text-shadow:0px 0px 10px;'>"+format(this.cost(id),0) +"</h2> 循环节点"
        },
        getEffect(data, id){
            if(id==101) return ten.pow(data)
            if(id==102) return n(1e8)
            if(id==103) return n(1.2)
            if(id==201) return player.e.points.max(1).pow(2)
            if(id==202) return n(data)
            if(id==301) return layers.c.pointMult().pow(2).min(1e200)
            if(id==303) return player.c.points.root(10).sub(1).max(0).min(0.4)
            return zero
        }
    },
    clickables:{
        11:{
            title() {return "洗点"},
            display() {return "返还全部循环节点,清空已有研究"},
            canClick(){return true},
            onClick() {          
                let constg = quickSpawnConst(12,12,true)      
                for(id in constg) player.c.grid[constg[id]] = Number(0)
                player.c.looPoints = layers.c.maxLooPoint()
                doLoopReset()
            },
            style() { return { 'background-color':"#FFFFFF",'border-radius': "0px", height: "50px", width: "200px" } },
        },
        12:{
            title() {return "洗点II"},
            display() {return "返还全部循环节,清空循环节点,已有研究"},
            canClick(){return true},
            onClick() {          
                let constg = quickSpawnConst(12,12,true)      
                for(id in constg) player.c.grid[constg[id]] = Number(0)
                player.c.buyables[21] = zero
                player.c.looPoints = zero
                player.c.loops = layers.c.maxLoop()
                doLoopReset()
            },
            style() { return { 'background-color':"#FFFFFF",'border-radius': "0px", height: "50px", width: "200px" } },
        },
        21:{
            title() {return "转化跃迁力量"},
            display() {return "重置循环力量,循环力量升级,循环力量生产机和其他倍增机,获得循环力量<br>转化获得 +"+format(this.resetGet(),0)+" 跃迁力量,共有 "+format(player.c.maxTstP,0)+" 跃迁力量<br>(下一个跃迁力量在 "+format(this.nextAt())+" 循环力量)"},
            canClick(){return player.c.power.gte(1e10)},
            onClick() {          
                player.c.tstPoint = player.c.tstPoint.add(this.resetGet())
                player.c.maxTstP = player.c.maxTstP.add(this.resetGet()).max(player.c.tstPoint)
                player.c.power = zero;
                const u = [21,22,23,24,25,31,32,33,34,35]
                const b = [31,32,33,34]
                for(id in u){
                    if(player.c.upgrades.includes(u[id])) player.c.upgrades.splice(player.c.upgrades.indexOf(u[id]),1)
                }
                for(id in b){
                    player.c.buyables[b[id]] = zero
                }
                if(player.c.doResetTpUpg){
                    player.c.doResetTpUpg = false
                    const u2 = [41,42,43,44,45]
                    for(id in u2){
                        if(player.c.upgrades.includes(u2[id])) {
                            player.c.upgrades.splice(player.c.upgrades.indexOf(u2[id]),1)
                            player.c.tstPoint = player.c.tstPoint.add(tmp.c.upgrades[u2[id]].cost)
                        }
                    }
                }
            },
            multipers(){
                let mult = one
                if(player.c.atELv.includes(2)) mult = mult.mul(layers.c.tsEffect(2))
                return mult
            },
            pscStart(){
                let start = n(250)
                if(hasUpgrade("n",32)) start = start.add(upgradeEffect("n",32))
                return start
            },
            resetGet(){
                let get = player.c.power.div(1e9).max(1).log(10).mul(this.multipers())
                get = powsoftcap(get,this.pscStart(),two)
                get = get.sub(player.c.maxTstP).max(0).floor()
                return get
            },
            nextAt(){
                let next = player.c.maxTstP.add(this.resetGet()).add(1)
                next = anti_powsoftcap(next,this.pscStart(),two)
                next = next.div(this.multipers()).add(9)
                next = ten.pow(next)
                return next
            },
            style() { return { 'background-color': this.canClick()?"#88FFFF":"#BF8F8F", filter: "brightness(100%)",'border-radius': "0px",height: "120px", width: "400px"}},
        },
        22:{
            title() {return "跃迁升级回收"},
            display() {return "在转化能量的时候选择是否回收跃迁升级<br>(白色:保留;青色:回收)"},
            canClick(){return true},
            onClick() {          
                player.c.doResetTpUpg = !player.c.doResetTpUpg
            },
            style() { return { 'background-color': player.c.doResetTpUpg?"#88FFFF":"#FFFFFF", filter: "brightness(100%)",'border-radius': "0px",height: "120px", width: "200px"}},
        },
    },
    maxLoop(){
        let max = player.c.buyables[11].add(player.c.buyables[12]).add(player.c.buyables[13]).add(player.c.buyables[14])
        return max
    },
    maxLooPoint(){
        let max = player.c.buyables[21].mul(10)        
        return max
    },
    powerGet(){
        let get = buyableEffect("c",31).mul(buyableEffect("c",32))
        if(player.c.atELv.includes(1)) get = get.mul(layers.c.tsEffect(1))
        if(hasUpgrade("c",42)) get = get.mul(upgradeEffect("c",42))
        if(player.n.unlocked) get = get.mul(layers.n.effect())
        return get
    },
    powerEffect(x){
        let eff = zero
        if(x==1){//p
            eff = player.c.power.pow(2).max(1)
            eff = powsoftcap(eff,two.pow(128),two)
        } 
        if(x==2){//P
            eff = player.c.power.pow(1).max(1)
            eff = powsoftcap(eff,two.pow(64),two)
        } 
        return eff
    },
    tsEffect(x){
        let eff = zero
        if(x==1){//Cp
            if(player.c.atELv.includes(1)){
                eff = ten
                if(hasUpgrade("c",41)) eff = eff.mul(upgradeEffect("c",41))
            }
            else eff = one
        }
        if(x==2){//Tp
            if(player.c.atELv.includes(2)){
                eff = two
            }
            else eff = one
        }
        return eff
    },
    MpointMult(){
        let mult = one
        const ids = [101]
        for(id in ids){
            if(getGridData("c",ids[id])) mult = mult.mul(gridEffect("c",ids[id]))
        }
        return mult 
    },
    pointMult(){
        let mult = one
        const ids = [102,201]
        for(id in ids){
            if(getGridData("c",ids[id])) mult = mult.mul(gridEffect("c",ids[id]))
        }
        return mult
    },
    PpointMult(){
        let mult = one
        const ids = [301]
        for(id in ids){
            if(getGridData("c",ids[id])) mult = mult.mul(gridEffect("c",ids[id]))
        }
        return mult
    },
    EpointRoot(){
        let root = one
        const ids = [103]
        for(id in ids){
            if(getGridData("c",ids[id])) root = root.mul(gridEffect("c",ids[id]))
        }
        return root
    },
    energyPowerAdded(){
        let power = zero
        const ids = [303]
        for(id in ids){
            if(getGridData("c",ids[id])) power = power.add(gridEffect("c",ids[id]))
        }
        return power
    },
    update(diff){
        player.c.power = player.c.power.add(layers.c.powerGet().mul(diff))
        player.c.tstt1 = player.c.tstt1.sub(diff).max(0)
        player.c.tstt2 = player.c.tstt2.sub(diff).max(0)
        player.c.tstt3 = player.c.tstt3.sub(diff).max(0)
        player.c.tstt4 = player.c.tstt4.sub(diff).max(0)
    },
    microtabs:{
        loops:{
            "loops":{
                buttonStyle: {
                    "border-color": "#88FF88"
                },
                content:[
                    ["row",[["buyable",11],["buyable",12],["buyable",13],["buyable",14]]],"blank",
                    ["display-text",function(){
                        return "你有 <h2 style='color:#88FF88;text-shadow:0px 0px 10px;'>"+format(player.c.loops,0)+"</h2> 循环节"}],
                    ["display-text",function(){
                        return "购买上方的四个可购买来获得循环节"}],"blank",["buyables",[2]],"blank",["display-text",function(){
                            return "你有 <h2 style='color:#88FF88;text-shadow:0px 0px 10px;'>"+format(player.c.looPoints,0)+"</h2> 循环节点"}],
                ],
            },
            "researches":{
                buttonStyle: {
                    "border-color": "#FFFFFF"
                },
                content:[
                    ["display-text",function(){
                        return "<h5>你总共有 "+quickColor(format(layers.c.maxLooPoint(),0),"#88FF88")+" 循环节点</h5>"}],
                    ["display-text",function(){
                        return "你有 <h2 style='color:#88FF88;text-shadow:0px 0px 10px;'>"+format(player.c.looPoints,0)+"</h2> 循环节点"}],
                        "blank",
                    "grid"
                ],
            },
            "clear research":{
                buttonStyle: {
                    "border-color": "#FFFFFF"
                },
                content:[
                    ["row",[["clickable",11],["clickable",12]]]
                ],
            },
            "effects":{
                buttonStyle: {
                    "border-color": "#88FF88"
                },
                content:[
                    ["display-text",function(){
                        let text = "以下为当前已获取循环研究的总效果:<br><br><br>"
                        if(getGridData("c",101)<1) text += "<br>...你没有买研究看这个干什么!"
                        if(layers.c.pointMult().gt(1)) text += "<br>加成点数获取 <h2 style='color:white;text-shadow:0px 0px 10px;'>"+format(layers.c.pointMult()) + "x</h2>"
                        if(layers.c.PpointMult().gt(1)) text += "<br>加成声望获取 <h2 style='color:cyan;text-shadow:0px 0px 10px;'>"+format(layers.c.PpointMult()) + "x</h2>"
                        if(layers.c.EpointRoot().gt(1)) text += "<br>降低能量元价格 <h2 style='color:yellow;text-shadow:0px 0px 10px;'> ^"+format(layers.c.EpointRoot()) +quickSUP(-1)+ "</h2>"
                        if(layers.c.energyPowerAdded().gt(0)) text += "<br>增加能量获取指数 <h2 style='color:yellow;text-shadow:0px 0px 10px;'> +"+format(layers.c.energyPowerAdded()) + "</h2>"
                        if(layers.c.MpointMult().gt(1)) text += "<br>加成倍增点获取 <h2 style='color:blue;text-shadow:0px 0px 10px;'>"+format(layers.c.MpointMult()) + "x</h2>"
                        return text
                    }
                    ],
                ],
            },
        },
        power:{
            "spawner":{
                content:[
                    ["row",[["buyable",31]]],["row",[["buyable",32],["buyable",33],["buyable",34]]]
                ]
            },
            "upgrades":{
                content:[
                    ["row",[["upgrade",21],["upgrade",22],["upgrade",23],["upgrade",24],["upgrade",25]]],
                    ["row",[["upgrade",31],["upgrade",32],["upgrade",33],["upgrade",34],["upgrade",35]]],
                    ["row",[["upgrade",41],["upgrade",42],["upgrade",43],["upgrade",44],["upgrade",45]]],
                ]
            },
            "effects":{
                buttonStyle: {
                    "border-color": "#88FF88"
                },
                content:[
                    ["display-text",function(){
                        let text = "循环力量效果:<br>"
                        text += player.c.power.gt(1000)?"<h4 style='color:white;'>循环力量第一效果: 加成点数获取 "+format(layers.c.powerEffect(1)) +"x</h4>":"<h4 style='color:white;text-shadow:0px 0px 10px;'>在1000循环力量,解锁循环力量第一效果</h4>"
                        text += player.c.power.gt(1e6)?"<h4 style='color:cyan;'>循环力量第二效果: 加成声望获取 "+format(layers.c.powerEffect(2)) +"x</h4>":"<h4 style='color:cyan;text-shadow:0px 0px 10px;'>在1000000循环力量,解锁循环力量第二效果</h4>"
                        return text
                    }
                    ],
                ],
            },
            "transition":{
                content:[
                    ["display-text",function(){
                        return "你有 <h2 style='color:#88FFFF;text-shadow:0px 0px 10px;'>"+format(player.c.tstPoint,0)+"</h2> 跃迁力量"}],
                    ["row",[["clickable",21],["clickable",22]]],["column",[["row",[["buyable",41],
                           "blank",["display-text",function(){
                            return format(player.c.tstt1) + "s<br>/30.00s"
                        }],"blank",["display-text",function(){
                            return "投入:  <h2 style='color:#88FFFF;text-shadow:0px 0px 10px;'>"+format(tmp.c.buyables[41].cost,0) + "</h2>  跃迁力量"
                        }],"blank",["display-text",function(){
                            return "效果: 倍增循环力量获取<br><h2 style='color:#88FF88;text-shadow:0px 0px 10px;'>"+format(layers.c.tsEffect(1)) + "x</h2>"
                        }],
                    ]],["row",[["buyable",42],
                           "blank",["display-text",function(){
                            if(player.c.maxTstP.gte(20)) return format(player.c.tstt2) + "s<br>/60.00s"
                        }],"blank",["display-text",function(){
                            if(player.c.maxTstP.gte(20)) return "投入: <h2 style='color:#88FFFF;text-shadow:0px 0px 10px;'>"+format(tmp.c.buyables[42].cost,0) + "</h2> 跃迁力量"
                        }],"blank",["display-text",function(){
                            if(player.c.maxTstP.gte(20)) return "效果: 倍增跃迁力量获取<br><h2 style='color:#88FFFF;text-shadow:0px 0px 10px;'>"+format(layers.c.tsEffect(2)) + "x</h2>"
                        }],
                    ]]]],["display-text",function(){
                        return "<h6 style='color:#888888;'>你可以将跃迁力量投入到循环中,在循环中可以获得增益,当循环剩余时间归零时,返还投入的跃迁力量."}
                    ],
                ],
                unlocked(){return hasUpgrade("c",35)||player.c.maxTstP.gt(0)}
            },
        },
    },
    tabFormat: { 
        "homepage": {   
            content: [
                "main-display","prestige-button",                                
                ["display-text",
                    function(){return "你有 "+format(player.p.points)+" 声望点"}],
                    "blank",["upgrades",[1]]
            ],
            unlocked(){return true},
        },
        "milestones": {   
            content: [
                "main-display","prestige-button",                                
                ["display-text",
                    function(){return "你有 "+format(player.p.points)+" 声望点"}],
                    "blank","milestones",
            ],
            unlocked(){return true},
        },
        "challenges": {   
            content: [
                "main-display","prestige-button",                                
                ["display-text",
                    function(){return "你有 "+format(player.p.points)+" 声望点"}],
                    "blank","challenges",
            ],
            unlocked(){return true},
        },
        "loops": {   
            content: [
                ["microtabs","loops"]
            ],
            unlocked(){return hasMilestone("c",5)},
        },
        "power": {   
            content: [
                "main-display","prestige-button","blank",                                
                ["display-text",
                    function(){return "你有 <h2 style='color:#88FF88;text-shadow:0px 0px 10px;'>"+ format(player.c.power) + "</h2> 循环力量(+"+format(layers.c.powerGet())+"/s)"}],
                ["microtabs","power"]
            ],
            unlocked(){return hasMilestone("c",6)},
        },
    }, 
})
addLayer("n", {
    name: "n",
    symbol: "N",
    branches:["e","m"],
    position: 0,
    startData() { return {
        unlocked: false,
		points: zero,
        resetTimes: zero,
    }},
    color: "#FFFFFF",
    requires: new Decimal(100),
    resource: "网",
    baseResource: "网基础",
    baseAmount() {return player.points.max(1).log(10).sub(900).max(0)},
    type: "normal",
    exponent: 1,
    gainMult() {
        mult = one
        return mult
    },
    gainExp() {
        exp = one
        return exp
    },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row > layers[this.layer].row) {
            let kept = []
            layerDataReset(this.layer, kept)
        }
        player.n.resetTimes = player.n.resetTimes.add(1)
    },
    canReset(){
        return hasUpgrade("c",43)&&player.points.max(1).log(10).sub(900).max(0).gte(this.requires)
    },
    effect(){
        return player.n.resetTimes.mul(4).add(1)
    },
    effectDescription(){
        return "基于你的网重置次数,倍增循环力量获取 <h2 style='color:#88FF88;text-shadow:0px 0px 10px;'>" + format(this.effect()) + "x</h2>"
    },
    row: 2,
    hotkeys: [
        {key: "n", description: "N: 进行网重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("c",43)||player.n.unlocked},
    upgrades:{
        11:{    
            title: "点数提升",
            description: "基于网重置次数倍增点数获取",
            cost: new Decimal(1),        
            effect(){
                let eff = n(1000).pow(player.n.resetTimes).min(1e300)
                return eff
            },              
            effectDisplay(){return "x"+format(this.effect())},
            style() { return {filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return player.n.unlocked}
        },
        12:{    
            title: "声望提升",
            description: "基于网重置次数倍增声望获取",
            cost: new Decimal(1),        
            effect(){
                let eff = n(1000).pow(player.n.resetTimes).min(1e300)
                return eff
            },              
            effectDisplay(){return "x"+format(this.effect())},
            style() { return {filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return player.n.unlocked}
        },
        21:{    
            title: "能量提升",
            description: "基于网重置次数倍增能量获取",
            cost: new Decimal(1),        
            effect(){
                let eff = n(10000).pow(player.n.resetTimes).min("e400")
                return eff
            },              
            effectDisplay(){return "x"+format(this.effect())},
            style() { return {filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return player.n.unlocked}
            ,canAfford(){return hasUpgrade("n",11)}
        },
        22:{    
            title: "倍增提升",
            description: "基于网重置次数倍增倍增点获取",
            cost: new Decimal(1),        
            effect(){
                let eff = n(10).pow(player.n.resetTimes).min(1e200)
                return eff
            },              
            effectDisplay(){return "x"+format(this.effect())},
            style() { return {filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return player.n.unlocked}
            ,canAfford(){return hasUpgrade("n",12)}       
        },
        31:{    
            title: "循环提升",
            description: "基于网重置次数降低循环价格",
            cost: new Decimal(2),        
            effect(){
                let eff = n(1e50).pow(player.n.resetTimes).min("e5000")
                return eff
            },              
            effectDisplay(){return "/"+format(this.effect())},
            style() { return {filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return player.n.unlocked}
            ,canAfford(){return hasUpgrade("n",21)}
        },
        32:{    
            title: "跃迁提升",
            description: "基于网重置次数延迟跃迁能量获取的软上限(初始在250)",
            cost: new Decimal(2),        
            effect(){
                let eff = six.mul(player.n.resetTimes).min(600)
                return eff
            },              
            effectDisplay(){return "+"+format(this.effect())},
            style() { return {filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return player.n.unlocked}
            ,canAfford(){return hasUpgrade("n",22)}
        },
        41:{    
            title: "???",
            description: "暂时通关!",
            cost: new Decimal(6),   
            style() { return {filter: "brightness(100%)",'border-radius': "0px",}},
            unlocked(){return player.n.unlocked}
            ,canAfford(){return hasUpgrade("n",31)&&hasUpgrade("n",32)}
        },
    },
    tabFormat: { 
        "homepage": {   
            content: [
                "main-display","prestige-button",                                
                ["display-text",
                    function(){return "你有 "+format(player.points.max(1).log(10).sub(900).max(0))+" 网基础和 "+format(player.n.resetTimes,0)+" 网重置次数<h6>网基础获取公式: log"+quickSUB(10)+"点数-900</h6>"}],
                    "blank",["upgrades",[1,2,3,4]],["display-text",
                        function(){return "这些升级与反物质维度的无限升级类似,需要购买该列的前一个升级才可以购买下一个升级<br>大概8次(理论可以7次)网重置以通关!"}],
            ],
            unlocked(){return true},
        },
    }, 
})