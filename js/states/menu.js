import Menu from "./components/menu";

class MenuState extends Phaser.State{
	init(main){
		this.main = main;
	}
	create(game){
		var menu = new Menu(game, game.world, this.main.params.menuRect, [
			{
				text: this.main.data.nextLevel ? "continue" : "play",
				cb: () => this.main.playAll()
			},
			{
				text: "select_level",
				cb: () => this.main.selectLevel()
			},
			{
				text: "settings",
				cb: () => this.main.settings.open()
			},
			{
				text: "level_editor",
				cb: () => this.main.openEditor()
			}
		], main.locale);
	}
}

export default MenuState;