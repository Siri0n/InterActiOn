import Text from "./text";

class MsgBox{
	constructor(game, group, rect, locale){
		this.g = game.add.group(group);
		this.g.x = rect.x;
		this.g.y = rect.y;
		this.bg = game.add.tileSprite(0, 0, rect.width, rect.height, "msg-bg", null, this.g);
		this.t = new Text({
			game,
			group: this.g,
			locale
		});
		this.t.g.wordWrap = true;
		this.t.g.wordWrapWidth = rect.width * 0.9;
		this.bg.inputEnabled = true;
		this.bg.events.onInputDown.add(() => this.hide());
		this.g.visible = false;
	}
	show(text){
		return new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.g.visible = true;
			this.t.text = text;
			this.t.g.alignIn(this.bg, Phaser.CENTER);
		})
	}
	hide(){
		if(this.resolve){
			this.resolve();
			this.resolve = null;
		}
		this.g.visible = false;
	}
}

export default MsgBox;