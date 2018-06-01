import Menu from "./components/menu";

class MenuState extends Phaser.State{
	init(main){
		this.main = main;
	}
	create(game){
		this.menu = new Menu(game, game.world, this.main.params.menuRect, [
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
		this.main.screen.onChange.add(rect => this._resize(rect));
	}
	_resize(rect){
		var menuRect = rect.clone().inflate(
			- rect.width / 4,
			- rect.height / 4
		);
		this.menu.resize(menuRect);
	}
}

export default MenuState;