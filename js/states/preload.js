import Background from "./components/background";

class PreloadState extends Phaser.State{
	init(main, filenames){
		this.main = main;
		this.filenames = filenames;
	}
	create(game){
		this.main.onGameStart();
		
		var background = new Background(game, game.stage, this.main.screen);
		var progress = new Progress(game, game.world, this.main.screen);

		game.load.baseURL = "resources/";

		//levels
		this.filenames.forEach(name => game.load.json(name, `levels/${name}.lvl`));
		//sidebar buttons
		game.load.spritesheet("up", "arrow-up.png", 128, 128);
		game.load.spritesheet("down", "arrow-down.png", 128, 128);
		game.load.spritesheet("menu", "menu-button.png", 128, 128);
		game.load.spritesheet("restart", "restart.png", 128, 128);
		game.load.spritesheet("undo", "undo.png", 128, 128);
		game.load.spritesheet("cancel", "cancel.png", 128, 128);
		game.load.spritesheet("load", "load.png", 128, 128);
		game.load.spritesheet("save", "save.png", 128, 128);
		game.load.spritesheet("play", "play.png", 128, 128);
		//background
		game.load.image("msg-bg", "msg-bg.png");
		//game objects
		game.load.spritesheet("shape", "shape.png", 128, 128);
		game.load.spritesheet("power", "power_.png", 128, 128);

		game.load.image("alpha", "alpha.png");
		game.load.image("omega", "omega.png");
		game.load.image("theta", "theta.png");
		game.load.image("plus", "plus.png");
		game.load.image("minus", "minus.png");
		game.load.image("wall", "wall.png");

		game.load.image("tile", "tile.png");
		game.load.image("particle", "particle.png");
		//editor
		game.load.spritesheet("editor-tile", "editor-tile.png", 128, 128);
		game.load.spritesheet("editor-tile-wall", "editor-tile-wall.png", 128, 128);
		game.load.spritesheet("triangle", "triangle.png", 64, 64);
		game.load.image("frame", "frame.png");
		//sound
		game.load.audio("bgm0", "sound/bgm-test.mp3", true);
		game.load.audio("bgm1", "sound/bgm.mp3", true);
		game.load.audio("bgm2", "sound/bgm2.mp3", true);
		game.load.audio("pusch", "sound/pusch.wav", true);
		game.load.audio("fade", "sound/fade.wav", true);
		game.load.audio("bump", "sound/bump.wav", true);

		game.load.start();

		game.load.onLoadComplete.add(() => {
			var levels = this.filenames.map(name => game.cache.getJSON(name));
			this.main.loadLevels(levels);
		});
	}
	preload(game){
		game.stage.backgroundColor = "#3355ff";
		game.load.image("bg-star", "resources/bg-star.png");
	}
}

export default PreloadState;

class Progress{
	constructor(game, group, rect){
		this.text = "Loading...";
		this.i = 0;
		this.di = 1;
		this.game = game;
		this.g = game.add.text(0, 0, this.text, {

		}, group);
		this.g.anchor.x = this.g.anchor.y = 0.5;
		this.resize(rect.value);
		rect.onChange.add((value) => this.resize(value));
		var timer = this.game.time.create();
		timer.loop(200, this.update, this);
		timer.start();
	}
	update(){
		this.g.text = this.text.substr(0, this.i) + " " + this.text.substr(this.i);
		this.i += this.di;
		if(this.i == 0 || this.i == this.text.length){
			this.di *= -1;
		}
	}
	resize(rect){
		this.g.alignIn(rect, Phaser.CENTER);
	}
}