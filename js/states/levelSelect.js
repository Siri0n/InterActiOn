class LevelSelectState extends Phaser.State{
	init(main, levels){
		this.main = main;
		this.levels = levels;
	}
	create(game){
		var levelSelect = new LevelSelect(game, this.levels, i => this.main.playOne(i));
	}
	preload(game){
		game.load.spritesheet("wide-arrow", "resources/wide-arrow.png", 512, 128);
		game.load.image("msg-bg", "resources/msg-bg.png");
	}
}

export default LevelSelectState;

class LevelSelect{
	constructor(game, levels, cb){
		//game.world.bounds.width = game.world.bounds.height = 10000;
		game.camera.bounds = null;

		var supergroup = game.add.group();
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
		supergroup.align(-1, 1, game.camera.width, game.camera.height, Phaser.CENTER);

		var buttonRight = this.buttonRight = game.add.button(0, 0, "wide-arrow", this.scrollRight, this, 1, 0, 2, 0);
		buttonRight.angle = 270;
		buttonRight.fixedToCamera = true;
		buttonRight.anchor.x = buttonRight.anchor.y = 0.5;
		buttonRight.cameraOffset.x = game.camera.width - buttonRight.height/2;
		buttonRight.cameraOffset.y = game.camera.height/2;

		var buttonLeft = this.buttonLeft = game.add.button(0, 0, "wide-arrow", this.scrollLeft, this, 1, 0, 2, 0);
		buttonLeft.angle = 90;
		buttonLeft.fixedToCamera = true;
		buttonLeft.anchor.x = buttonLeft.anchor.y = 0.5;
		buttonLeft.cameraOffset.x = buttonLeft.height/2;
		buttonLeft.cameraOffset.y = game.camera.height/2;

		this.currentScreen = 0;
		this.maxScreen = Math.floor(levels.length/9);
		this.game = game;
		this.updateButtons();
	}
	scrollRight(){
		this.currentScreen++;
		this.scroll();

	}
	scrollLeft(){
		this.currentScreen--;
		this.scroll();
	}
	scroll(){
		this.game.add.tween(this.game.camera)
		.to(
			{
				x: this.currentScreen * this.game.camera.width
			},
			500,
			Phaser.Easing.Quadratic.InOut,
			true
		);
		this.updateButtons();
	}
	updateButtons(){
		this.buttonLeft.visible = (this.currentScreen > 0);
		this.buttonRight.visible = (this.currentScreen < this.maxScreen);
	}
}

class LevelSelectButton{
	constructor(game, group, level, width, height, i, cb){
		this.g = game.add.group(group);
		this.bg = game.add.tileSprite(0, 0, width, height, "msg-bg", null, this.g);
		this.t = game.add.text(0, 0, (i + 1) + ". " + level.name, {}, this.g);
		this.t.wordWrap = true;
		this.t.wordWrapWidth = width * 0.9;
		this.t.alignIn(this.bg, Phaser.CENTER);
		this.bg.inputEnabled = true;
		this.bg.events.onInputDown.add(() => cb(i));
	}
}