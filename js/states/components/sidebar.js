import Container from "./container";

class Sidebar extends Container{
	constructor(game, group, items, size, outerSize){
		var children = items.map(data => {
			var button = game.add.button(0, 0, data.key, data.cb, null, 1, 0, 2, 1);
			button.height = button.width = size;
			return button;
		});
		super(game, group, game.camera.fixedView, []);
		this.g.fixedToCamera = true;
		this.size = size;
		this.outerSize = outerSize;
		this.add(children);
	}
	alignChildren(){
		this.g.align(1, -1, this.outerSize, this.outerSize);
	}
	alignSelf(){
		this.g.cameraOffset.x = this.game.camera.width - this.outerSize;
		this.g.cameraOffset.y = this.game.camera.height - this.outerSize*this.children.length;
	}
}

export default Sidebar;