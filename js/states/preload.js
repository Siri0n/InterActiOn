class PreloadState extends Phaser.State{
	init(main, filenames){
		this.main = main;
		this.filenames = filenames;
	}
	create(game){
		var levels = this.filenames.map(name => game.cache.getJSON(name));
		console.log("PreloadState.create");
		this.main.loadLevels(levels);
	}
	preload(game){
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
		game.load.image("bg-star", "bg-star.png");
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
		//editor
		game.load.spritesheet("editor-tile", "editor-tile.png", 128, 128);
		game.load.spritesheet("editor-tile-wall", "editor-tile-wall.png", 128, 128);
		game.load.spritesheet("triangle", "triangle.png", 64, 64);
		game.load.image("frame", "frame.png");
		//sound
		game.load.audio("bgm", "sound/bgm-test.mp3", true);
		game.load.audio("pusch", "sound/pusch.wav", true);
		game.load.audio("fade", "sound/fade.wav", true);
		game.load.audio("bump", "sound/bump.wav", true);
	}
}

export default PreloadState;