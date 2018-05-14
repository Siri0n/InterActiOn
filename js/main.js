import createGame from "./game";
import PlayerData from "./playerData";
import levelNames from "resources/levels";
import FileSaver from "file-saver";
import Container from "./states/components/container";
import MenuItem from "./states/components/menuItem";
import Locale from "./locale";
import locales from "resources/locales";
import Text from "./states/components/text";

const SPEEDS = {
	low: 600,
	medium: 400,
	high: 200
}

class Main{
	constructor(){
		this.game = createGame();
		window.game = this.game;
		window.main = this
		this.params = {
			sidebarButtonSize: 60,
			sidebarOuterSize: 64,
			screen: new Phaser.Rectangle(0, 0, this.game.width, this.game.height),
			menuRect: new Phaser.Rectangle(0, this.game.height/4, this.game.width, this.game.height/2)
		};
		this.playerData = new PlayerData();
		this.timeUnit = new ObservableParam();
		this.gameSpeed = this.playerData.get("gameSpeed", "medium");
		this.params.fieldRect = new Phaser.Rectangle(0, 0, this.game.width - this.params.sidebarOuterSize, this.game.height);
		this.data = {nextLevel: 0};
		this.locale = new Locale(locales, "eng");
		this.locale.onSwitch.add(lang => this.playerData.set("locale", lang));
		this.locale.switch(
			this.playerData.get(
				"locale",
				Locale.autoDetect()
			)
		);
		this.game.state.start("preload", true, false, this, levelNames);
	}
	loadLevels(levels){
		this.levels = levels;
		levels.forEach((level, i) => level.num = i + 1);
		var musicList = ["bgm0", "bgm1", "bgm2"];
		this.audio = new Audio(this.game, ["pusch", "fade", "bump"], musicList);
		var playRandom = () => this.audio.playMusic(Phaser.ArrayUtils.getRandomItem(musicList));
		this.audio.onMusicEnd.add(playRandom);
		playRandom();
		this.audio.soundOn = this.playerData.getBoolean("sound", true);
		this.audio.musicOn = this.playerData.getBoolean("music", true);
		this.settings = new Settings(this.game, this);
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
		FileSaver.saveAs(blob, (data.name[this.locale.defaultLanguage] || "level") + ".lvl");
	}
	setAudio(type, value){
		if(type == "sound"){
			this.audio.soundOn = value;
		}else if(type == "music"){
			this.audio.musicOn = value;
		}
		this.playerData.set(type, value);
	}
	set gameSpeed(value){
		this._gameSpeed = value;
		this.timeUnit.value = SPEEDS[value];
		this.playerData.set("gameSpeed", value);
	}
	get gameSpeed(){
		return this._gameSpeed;
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
			var music = game.add.audio(name, 0.25);
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
		if(this.currentMusic && this.currentMusic.isPlaying){
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
			new MenuItem({
				game, 
				group: this.g,
				locale: main.locale,
				text: "resume", 
				cb: () => this.close()
			}),
			new Toggle({
				game, 
				group: this.g,
				locale: main.locale,
				variants: [
					{
						value: false,
						text: locale => locale.get("sounds") + " " + locale.get("off")
					},
					{
						value: true,
						text: locale => locale.get("sounds") + " " + locale.get("on")
					}
				], 
				cb: val => main.setAudio("sound", val), 
				index: main.audio.soundOn | 0
			}),
			new Toggle({
				game, 
				group: this.g,
				locale: main.locale,
				variants: [
					{
						value: false,
						text: locale => locale.get("music") + " " + locale.get("off")
					},
					{
						value: true,
						text: locale => locale.get("music") + " " + locale.get("on")
					}
				], 
				cb: val => main.setAudio("music", val), 
				index: main.audio.musicOn | 0
			}),
			new Toggle({
				game, 
				group: this.g,
				locale: main.locale,
				variants: [
					{
						value: "low",
						text: locale => locale.get("game_speed") + " " + locale.get("low")
					},
					{
						value: "medium",
						text: locale => locale.get("game_speed") + " " + locale.get("medium")
					},
					{
						value: "high",
						text: locale => locale.get("game_speed") + " " + locale.get("high")
					}
				], 
				cb: val => main.gameSpeed = val, 
				index: {value: main.gameSpeed}
			}),
			new Toggle({
				game, 
				group: this.g,
				locale: main.locale,
				variants: Object.keys(main.locale.languages).map(key => ({
					value: key,
					text: "lang"
				})), 
				cb: val => main.locale.switch(val), 
				index: {value: main.locale.current}
			}),
			new MenuItem({
				game, 
				group: this.g,
				locale: main.locale,
				text: "go_to_menu", 
				cb: () => {
					this.close();
					main.goToMenu();
				}
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
	constructor({game, group, locale, variants, cb, index = 0}){
		if(index.value){
			index = variants.findIndex(v => v.value == index.value);
		}
		super({
			game, 
			group,
			locale,
			text: variants[index].text,
			cb: () => {
				this.index = (this.index + 1) % variants.length;
				this.text = this.variants[this.index].text;
				cb(this.variants[this.index].value);
			}
		});
		this.variants = variants;
		this.index = index;
	}
}

class ObservableParam{
	constructor(value){
		this._value = value;
		this.onChange = new Phaser.Signal();
	}
	get value(){
		return this._value;
	}
	set value(value){
		this._value = value;
		this.onChange.dispatch(value);
		return value;
	}
}

export default Main;