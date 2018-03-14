import createGame from "./game";
import levels from "resources/levels";
import FileSaver from "file-saver";

class Main{
	constructor(){
		this.game = createGame();
		window.test = this.game;
		console.log(this.game.canvas);
		//this.game.canvas.addEventListener("click", () => this.loadLevel());
		this.levels = levels;
		this.data = {nextLevel: 0};
		this.goToMenu();
	}
	goToMenu(){
		this.game.state.start("menu", true, false, this);
	}
	play(i, cb){
		this.game.state.start("level", true, false, this, levels[i], cb);
	}
	playCustom(data){
		this.game.state.start("level", true, false, this, data, () => this.openEditor(data));
	}
	playOne(i){
		this.play(i, () => this.goToMenu());
	}
	playAll(){
		var i = this.data.nextLevel;
		if(levels[i]){
			this.play(i, () => {
				this.data.nextLevel = i + 1;
				this.playAll();
			});
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