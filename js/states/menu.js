export default {
	create(game){
		game.stage.backgroundColor = "#4488AA";
		var menu = new Menu(game, new Phaser.Rectangle(0, game.height/4, game.width, game.height/2));
	},
	preload(){
	}
}

function Menu(game, rect){
	var g = this.g = game.add.group();
	var children = [
		new MenuItem(game, g, "Test 1", _ => game.state.start("levelSelect")),
		new MenuItem(game, g, "Test 2", _ => game.state.start("level")),
		new MenuItem(game, g, "Test 3", _ => alert(3))
	];
	g.align(1, -1, rect.width, rect.height/children.length, Phaser.CENTER);
	g.position.x = rect.x;
	g.position.y = rect.y;
}

function MenuItem(game, group, text, cb){
	var g = this.g = game.add.text(0, 0, text, {}, group);
	g.anchor.x = g.anchor.y = 0.5;
	g.inputEnabled = true;
	g.events.onInputOver.add(_ => g.scale.x = g.scale.y = 1.2);
	g.events.onInputOut.add(_ => g.scale.x = g.scale.y = 1);
	g.events.onInputDown.add(cb);
}