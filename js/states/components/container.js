class GraphicsContainer{
	constructor(game, group, rect, children, parent){
		this.g = game.add.group(group);
		this.game = game;
		this.rect = rect;
		parent && this.setParent(parent);
		this.children = [];
		this.add(children);
		var oldUpdate = this.g.update;
		this.g.update = () => {
			this.shouldUpdate && this.update();
			oldUpdate.call(this.g);
		};
	}
	add(children){
		children.forEach(child => {
			this.children.push(child);
			if(child.setParent){
				child.setParent(this);
			}else if(child.g){
				this.g.add(child.g);
			}else if(child instanceof PIXI.Sprite){
				this.g.add(child);
			}
		});
		this.shouldUpdate = true;
	}
	setParent(parent){
		this.parent = parent;
		this.parent.g.add(this.g);
	}
	setRect(rect){
		this.rect = rect;
		this.alignChildren();
		this.alignSelf();
	}
	update(){
		this.alignChildren();
		this.alignSelf();
		this.parent && (this.parent.shouldUpdate = true);
		this.shouldUpdate = false;
	}
	alignChildren(){
		//default implementation
		this.g.align(1, -1, this.rect.width, this.rect.height/this.children.length, Phaser.CENTER);
	}
	alignSelf(){
		//default implementation
		this.g.alignIn(this.rect, Phaser.CENTER);
	}
}

export default GraphicsContainer;