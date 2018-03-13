import createGame from "./game";
import levels from "resources/levels";

class Main{
	constructor(){
		this.game = createGame();
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
		//this.game.state.start("levelSelect", true, false, this, this.levels);
		//test
		var levels = [...Array(88).keys()].map(i => ({name: "level " + (i + 1)}));
		this.game.state.start("levelSelect", true, false, this, levels);
	}
	openEditor(data){
		this.game.state.start("editor", true, false, this, data);
	}


}

export default Main;