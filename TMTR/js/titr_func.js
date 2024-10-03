//游戏进度计算器
function gamePlayedPercent(){
    let p0 = player.points.div(5).max(1).log(10).min(9)//9
    let p1 = player.p.points.div(5).max(1).log(10).min(8)//8
    let p2 = player.e.points.div(10).min(8)//8
    let p3 = player.p.energy.mul(3).max(1).log(10).div(7).min(5)//5
    let p4 = player.p.Renergy.div(11).min(3)//3
    let p5 = player.e.energy.max(1).log(10).div(4).min(8)//8
    let p6 = n(player.p.upgrades.length).div(3).min(4).add(n(player.e.upgrades.length).div(2).min(5))//4+5=9
    let p = p0.add(p1).add(p2.add(p3.add(p4.add(p5.add(p6))))).div(0.5)//50
    return p
}
//循环节洗点重置
function doLoopReset(){
    doReset("m")
    player.e.points = player.m.points = player.e.energyMax = player.e.energy = zero
}
    