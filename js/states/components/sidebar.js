import Container from "./container";

class Sidebar extends Container{
	constructor({game, group, rect, buttons, buttonSize, outerSize}){
		var children = buttons.map(data => {
			var button = game.add.button(0, 0, data.key, data.cb, null, 1, 0, 2, 1);
			button.height = button.width = buttonSize;
			return button;
		});
		super(game, group, rect, []);
		this.buttonSize = buttonSize;
		this.outerSize = outerSize;
		this.add(children);
		rect && this.resize(rect);
	}
	resize(rect){
		this.vertical = rect.width < rect.height;
		console.log(rect, this.vertical);
		super.resize(rect);
	}
	alignChildren(){
		var n = this.vertical ? 1 : -1;
		this.g.align(n, -n, this.outerSize, this.outerSize);
	}
	alignSelf(){
		this.rect && this.g.alignIn(
			this.rect, 
			this.vertical ? Phaser.BOTTOM_RIGHT : Phaser.CENTER
		);
	}
}

export default Sidebar;