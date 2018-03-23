import Menu from "./components/menu";

class MenuState extends Phaser.State{
	init(main){
		console.log("MenuState.init");
		this.main = main;
	}
	create(game){
		console.log("MenuState.create");
		game.stage.backgroundColor = "#4488AA";
		var menu = new Menu(game, game.world, this.main.params.menuRect, [
			{
				text: this.main.data.nextLevel ? "Continue" : "Play",
				cb: () => this.main.playAll()
			},
			{
				text: "Select level",
				cb: () => this.main.selectLevel()
			},
			{
				text: "Settings",
				cb: () => this.main.settings.open()
			},
			{
				text: "Level editor",
				cb: () => this.main.openEditor()
			}
		]);
	}
}

export default MenuState;