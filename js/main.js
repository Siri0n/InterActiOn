import createGame from "./game";
import levels from "resources/levels";
import FileSaver from "file-saver";

const params = {
	sidebarWidth: 64
}

class Main{
	constructor(){
		this.game = createGame();
		window.test = this.game;
		this.params = {
			sidebarButtonSize: 60,
			sidebarOuterSize: 64
		};
		this.params.fieldRect = new Phaser.Rectangle(0, 0, this.game.width - this.params.sidebarOuterSize, this.game.height);
		this.levels = levels;
		this.data = {nextLevel: 0};
		this.goToMenu();
	}
	goToMenu(){
		this.game.state.start("menu", true, false, this);
	}
	play(i, success, cancel){
		this.game.state.start("level", true, false, this, levels[i], success, cancel);
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
		if(levels[i]){
			this.play(i, () => {
				this.data.nextLevel = i + 1;
				this.playAll();
			},
			() => this.selectLevel()
		);
		}else{
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
	loadLevel(){
		var input = document.createElement("input");
		input.click();
	}

}

export default Main;