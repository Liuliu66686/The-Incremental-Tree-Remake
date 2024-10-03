let modInfo = {
	name: "The Incremental Tree Remake",
	id: "liuliussecondTreeRemake",
	author: "Liuliu66686",
	pointsName: "点数",
	modFiles: ["layers.js", "tree.js","vue.js","functions.js","titr_func.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (5), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.0",
	name: "正式更新!",
}

let changelog = `<h1>更新日志:</h1><br>
	<h3>v1.0</h3><br>
		- 更新了一个重置层级<br>
		- 增加循环层的后半部分<br>
		- 修复bug<br>
	<h3>v0.1.1</h3><br>
		- 增加循环层的前半部分<br>
	<h3>v0.1</h3><br>
		- 增加倍增层<br>
	<h3>v0.0</h3><br>
		- 增加声望层,能量层<br>
`

let winText = `恭喜通关! 你到达了终点, 但...只是现在!<br>快去催更吧!`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	if(inChallenge("c",12)) return false
	if(hasUpgrade("p",11)||player.e.unlocked) return true
	return false
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(0.5)
	if(hasUpgrade("p",12)) gain = gain.mul(upgradeEffect("p",12))
	if(hasUpgrade("p",22)) gain = gain.mul(upgradeEffect("p",22))
	if(hasUpgrade("p",31)) gain = gain.mul(upgradeEffect("p",31))
	if(hasUpgrade("p",32)) gain = gain.mul(upgradeEffect("p",32))
	if(hasUpgrade("e",21)) gain = gain.mul(upgradeEffect("e",21))
	if(hasUpgrade("m",41)) gain = gain.mul(upgradeEffect("m",41))
    if(hasUpgrade("n",11)) gain = gain.mul(upgradeEffect("n",11))
	if(!layers.p.energyE().eq(1)) gain = gain.mul(layers.p.energyE())
	if(player.m.unlocked) gain = gain.mul(layers.m.pointE())
	if(layers.c.pointMult().gt(1)) gain = gain.mul(layers.c.pointMult())
	if(player.c.power.gt(1000)) gain = gain.mul(layers.c.powerEffect(1))
	let power = one
	if(hasUpgrade("e",42)) power = power.mul(upgradeEffect("e",42))
	//挑战限制
	if(inChallenge("c",11)) power = power.mul(0.5)
	gain = gain.pow(power)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	gamePlayedPercent: new Decimal(0),
	PreseTimes: 0,
}}

// Display extra things at the top of the page
var displayThings = [function(){
	let c21t = ""
	if(inChallenge("c",21)) c21t = "<br>当前声望重置次数: " + player.PreseTimes + "/5"
	return "欢迎来到增量树重置版!<br>群号:951232913<h6>tips:这也是元素周期增量树的群" + c21t}
]

// Determines when the game "ends"
function isEndgame() {
	return hasUpgrade("n",41)
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {
	
}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}

