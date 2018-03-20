class PreloadState extends Phaser.State{
	init(main, filenames){
		this.main = main;
		this.filenames = filenames;
	}
	create(game){
		var levels = this.filenames.map(name => game.cache.getJSON(name));
		console.log(levels);
		this.main.loadLevels(levels);
	}
	preload(game){
		//levels
		this.filenames.forEach(name => game.load.json(name, `resources/levels/${name}.lvl`));
	}
}

export default PreloadState;