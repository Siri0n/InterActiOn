class MsgBox{
	constructor(game, group, rect){
		this.g = game.add.group(group);
		this.g.x = rect.x;
		this.g.y = rect.y;
		this.bg = game.add.tileSprite(0, 0, rect.width, rect.height, "msg-bg", null, this.g);
		this.t = game.add.text(0, 0, "", {}, this.g);
		this.t.wordWrap = true;
		this.t.wordWrapWidth = rect.width * 0.9;
		this.bg.inputEnabled = true;
		this.bg.events.onInputDown.add(() => this.hide());
		this.g.visible = false;
	}
	show(text){
		return new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.g.visible = true;
			this.t.text = text;
			this.t.alignIn(this.bg, Phaser.CENTER);
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