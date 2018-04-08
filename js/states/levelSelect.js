import Sidebar from "./components/sidebar";

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
			i => this.main.playOne(i)
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
/*	preload(game){
		game.load.image("msg-bg", "resources/msg-bg.png");
		game.load.spritesheet("up", "resources/arrow-up.png", 128, 128);
		game.load.spritesheet("down", "resources/arrow-down.png", 128, 128);
		game.load.spritesheet("menu", "resources/menu-button.png", 128, 128);
	}*/
}

export default LevelSelectState;

class LevelSelect{
	constructor(game, group, rect, levels, cb){
		this.rect = rect;
		//game.world.bounds.width = game.world.bounds.height = 10000;
		game.camera.bounds = null;

		var supergroup = game.add.group(group);
		var groups = [];
		var buttons = [];
		levels.forEach((data, i) => {
			var groupIndex = Math.floor(i/9);
			if(!groups[groupIndex]){
				groups[groupIndex] = game.add.group(supergroup);
			}
			var button = new LevelSelectButton(game, groups[groupIndex], data, 100, 100, i, cb);
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
	constructor(game, group, level, width, height, i, cb){
		this.g = game.add.group(group);
		this.bg = game.add.tileSprite(0, 0, width, height, "msg-bg", null, this.g);
		this.t = game.add.text(0, 0, (i + 1) + ". " + level.name, {fontSize: 15}, this.g);
		this.t.wordWrap = true;
		this.t.wordWrapWidth = width * 0.9;
		this.t.alignIn(this.bg, Phaser.CENTER);
		this.bg.inputEnabled = true;
		this.bg.events.onInputDown.add(() => cb(i));
	}
}