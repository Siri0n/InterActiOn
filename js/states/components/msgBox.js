import Text from "./text";

class MsgBox{
	constructor(game, group, rect, textRect, locale){
		this.game = game;
		this.g = game.add.group(group);
		this.g.alpha = 0;
		this.g.visible = false;
		this.bg = game.add.tileSprite(rect.x, rect.y, rect.width, rect.height, "msg-bg", null, this.g);
		this.t = new Text({
			game,
			group: this.g,
			locale
		});
		this.t.g.wordWrap = true;
		this.t.g.wordWrapWidth = textRect.width;
		this.bg.inputEnabled = true;
		this.bg.events.onInputDown.add(() => this.hide());
		this.bg.hitArea = game.camera.view;
		this.textRect = textRect;
	}
	show(text){
		return new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.g.visible = true;
			this.game.add.tween(this.g).to(
				{alpha: 1},
				200,
				Phaser.Easing.Linear.None,
				true
			);
			this.t.text = text;
			this.t.g.alignIn(this.textRect, Phaser.CENTER);
		})
	}
	hide(){
		this.game.add.tween(this.g).to(
			{alpha: 0},
			200,
			Phaser.Easing.Linear.None,
			true
		).onComplete.addOnce(() => {
			this.g.visible = false;
			if(this.resolve){
				this.resolve();
				this.resolve = null;
			}
		});
	}
}

export default MsgBox;