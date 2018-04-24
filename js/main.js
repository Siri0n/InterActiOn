import createGame from "./game";
import PlayerData from "./playerData";
import levelNames from "resources/levels";
import FileSaver from "file-saver";
import Container from "./states/components/container";
import MenuItem from "./states/components/menuItem";
import Background from "./states/components/background";

class Main{
	constructor(){
		this.game = createGame();
		window.test = this.game;
		this.params = {
			sidebarButtonSize: 60,
			sidebarOuterSize: 64,
			screen: new Phaser.Rectangle(0, 0, this.game.width, this.game.height),
			menuRect: new Phaser.Rectangle(0, this.game.height/4, this.game.width, this.game.height/2)
		};
		this.playerData = new PlayerData();
		this.params.fieldRect = new Phaser.Rectangle(0, 0, this.game.width - this.params.sidebarOuterSize, this.game.height);
		this.data = {nextLevel: 0};
		this.game.state.start("preload", true, false, this, levelNames);
	}
	loadLevels(levels){
		this.levels = levels;
		var musicList = ["bgm0", "bgm1", "bgm2"];
		this.audio = new Audio(this.game, ["pusch", "fade", "bump"], musicList);
		var playRandom = () => this.audio.playMusic(Phaser.ArrayUtils.getRandomItem(musicList));
		this.audio.onMusicEnd.add(playRandom);
		playRandom();
		this.audio.soundOn = this.playerData.getBoolean("sound", true);
		this.audio.musicOn = this.playerData.getBoolean("music", true);
		this.settings = new Settings(this.game, this);
		this.background = new Background(this.game, this.game.stage, this.params.screen);
		this.goToMenu();
	}
	goToMenu(){
		this.game.state.start("menu", true, false, this);
	}
	play(i, success, cancel){
		this.game.state.start("level", true, false, this, this.levels[i], success, cancel);
	}
	restart(data, success, cancel){
		this.game.state.start("level", true, false, this, data, success, cancel);
	}
	playCustom(data){
		var cb = () => this.openEditor(data)
		this.game.state.start("level", true, false, this, data, cb, cb);
	}
	playOne(i){
		this.play(i, () => this.goToMenu(), () => this.selectLevel());
	}
	playAll(){
		var i = this.data.nextLevel;
		if(this.levels[i]){
			this.play(i, () => {
				this.data.nextLevel = i + 1;
				this.playAll();
			},
			() => this.selectLevel()
		);
		}else{
			this.data.nextLevel = 0;
			this.goToMenu();
		}
	}
	selectLevel(){
		this.game.state.start("levelSelect", true, false, this, this.levels);
	}
	openEditor(data){
		this.game.state.start("editor", true, false, this, data);
	}
	saveLevel(data){
		var str = JSON.stringify(data);
		var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
		FileSaver.saveAs(blob, (data.name || "level") + ".lvl");
	}
	setAudio(type, value){
		if(type == "sound"){
			this.audio.soundOn = value;
		}else if(type == "music"){
			this.audio.musicOn = value;
		}
		this.playerData.set(type, value);
	}

}

class Audio{
	constructor(game, soundNames, musicNames){
		this.sound = {};
		this.music = {};
		this.game = game;
		soundNames.forEach(name => {
			var sound = game.add.audio(name);
			this.sound[name] = sound;
		});
		musicNames.forEach(name => {
			var music = game.add.audio(name, 0.5);
			this.music[name] = music;
		});
		this.currentMusic = null;
		this._soundOn = this._musicOn = true;
		this.onMusicEnd = new Phaser.Signal();
	}
	playSound(name){
		this.sound[name] && this.sound[name].play();
	}
	playMusic(name){
		if(this.currentMusic){
			this.currentMusic.stop();
		}
		var newMusic = this.music[name];
		if(newMusic){
			this.currentMusic = newMusic;
			newMusic.play();
			newMusic.onStop.addOnce(() => this.onMusicEnd.dispatch());
		}
	}
	get soundOn(){
		return this._soundOn;
	}
	set soundOn(val){
		this._soundOn = val;
		this.mute(this.sound, !val);
	}
	get musicOn(){
		return this._musicOn;
	}
	set musicOn(val){
		this._musicOn = val;
		this.mute(this.music, !val);
	}
	mute(obj, val){
		for(let key of Object.keys(obj)){
			obj[key].mute = val;
		}
	}
}

class Settings{
	constructor(game, main){
		this.game = game;
		this.g = game.add.group(game.stage);
		var rect = main.params.screen;
		this.menu = new Container(game, this.g, main.params.menuRect, [
			new MenuItem(game, this.g, "Resume", () => this.close()),
			new Toggle(game, this.g, "Sounds on", "Sounds off", val => main.setAudio("sound", val), main.audio.soundOn),
			new Toggle(game, this.g, "Music on", "Music off", val => main.setAudio("music", val), main.audio.musicOn),
			new MenuItem(game, this.g, "Go to main menu", () => {
				this.close();
				main.goToMenu();
			})
		]);
		this.g.visible = false;
	}
	open(){
		this.g.visible = true;
		this.game.world.visible = false;
	}
	close(){
		this.g.visible = false;
		this.game.world.visible = true;
	}
}

class Toggle extends MenuItem{
	constructor(game, group, trueText, falseText, cb, initialValue){
		super(game, group, initialValue ? trueText : falseText, () => {
			this.value = !this.value;
			this.g.text = this.value ? trueText : falseText;
			cb(this.value);
		});
		this.value = initialValue;
	}
}
export default Main;