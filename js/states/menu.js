import Menu from "./components/menu";

class MenuState extends Phaser.State{
	init(main){
		console.log("MenuState.init");
		this.main = main;
	}
	create(game){
		console.log("MenuState.create");
		game.stage.backgroundColor = "#4488AA";
		var menu = new Menu(game, game.world, new Phaser.Rectangle(0, game.height/4, game.width, game.height/2), [
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
				cb: () => this.main.openEditor()
			}
		]);
	}
}

export default MenuState;