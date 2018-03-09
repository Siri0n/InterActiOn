class MenuState extends Phaser.State{
	init(main){
		this.main = main;
	}
	create(game){
		game.stage.backgroundColor = "#4488AA";
		var menu = new Menu(game, new Phaser.Rectangle(0, game.height/4, game.width, game.height/2), [
			{
				text: this.main.data.nextLevel ? "Continue" : "Play",
				cb: () => this.main.playAll()
			},
			{
				text: "Select level",
				cb: () => this.main.selectLevel()
			},
			{
				text: "Level editor",
				cb: () => alert("Not implemented yet")
			}
		]);
	}
}
function Menu(game, rect, items){
	var g = this.g = game.add.group();
	var children = items.map(data => new MenuItem(game, g, data.text, data.cb));
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
export default MenuState;