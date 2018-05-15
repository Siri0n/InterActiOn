import Sidebar from "./components/sidebar";
import LevelName from "./components/levelName";

class LevelSelectState extends Phaser.State{
	init(main, levels){
		this.main = main;
		this.levels = levels;
	}
	create(game){
		var levelSelect = new LevelSelect(
			game, 
			game.world, 
			this.main.params.fieldRect, 
			this.levels, 
			i => this.main.playOne(i),
			this.main.locale
		);
		var sidebar = new Sidebar(
			game,
			game.world,
			[
				{
					key: "up",
					cb: () => levelSelect.scrollBack()
				},
				{
					key: "down",
					cb: () => levelSelect.scrollForward()
				},
				{
					key: "menu",
					cb: () => this.main.settings.open()
				}
			],
			this.main.params.sidebarButtonSize,
			this.main.params.sidebarOuterSize
		);
		window.sidebar = sidebar;
	}
}

export default LevelSelectState;

class LevelSelect{
	constructor(game, group, rect, levels, cb, locale){
		this.rect = rect;
		game.camera.bounds = null;

		var supergroup = game.add.group(group);
		var groups = [];
		var buttons = [];
		levels.forEach((data, i) => {
			var groupIndex = Math.floor(i/9);
			if(!groups[groupIndex]){
				groups[groupIndex] = game.add.group(supergroup);
			}
			var button = new LevelSelectButton(game, groups[groupIndex], data, 100, 100, i, cb, locale);
			buttons.push(button);
		})
		groups.forEach(g => g.align(3, 3, 150, 150, Phaser.CENTER));
		supergroup.align(1, -1, rect.width, rect.height, Phaser.CENTER);

		this.currentScreen = 0;
		this.maxScreen = Math.ceil(levels.length/9) - 1;
		this.game = game;
		this.updateButtons();
	}
	scrollForward(){
		if(this.currentScreen == this.maxScreen){
			return;
		}
		this.currentScreen++;
		this.scroll();

	}
	scrollBack(){
		if(this.currentScreen == 0){
			return;
		}
		this.currentScreen--;
		this.scroll();
	}
	scroll(){
		this.game.add.tween(this.game.camera)
		.to(
			{
				y: this.currentScreen * this.rect.height
			},
			500,
			Phaser.Easing.Quadratic.InOut,
			true
		);
		this.updateButtons();
	}
	updateButtons(){
		//nothing for now
	}
}

class LevelSelectButton{
	constructor(game, group, level, width, height, i, cb, locale){
		this.g = game.add.group(group);
		this.bg = game.add.tileSprite(0, 0, width, height, "msg-bg", null, this.g);
		this.t = new LevelName({
			game,
			group: this.g,
			locale,
			style: {
				fontSize: 15,
				align: "center"
			},
			name: level.name,
			num: level.num + ".\n"
		}); 
		//game.add.text(0, 0, (i + 1) + ". " + level.name, {fontSize: 15}, this.g); // продолжить тут
		this.t.g.wordWrap = true;
		this.t.g.wordWrapWidth = width * 0.9;
		this.t.g.alignIn(this.bg, Phaser.CENTER);
		this.bg.inputEnabled = true;
		this.bg.events.onInputDown.add(() => cb(i));
	}
}