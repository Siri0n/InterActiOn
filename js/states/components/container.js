class GraphicsContainer{
	constructor(game, group, rect, children){
		this.g = game.add.group(group);
		this.game = game;
		this.rect = rect;
		this.children = [];
		this.add(children);
	}
	add(children){
		children.forEach(child => {
			this.children.push(child);
			//child.attr = child.attr || {};
			if(child.setParentGroup){
				child.setParentGroup(this.g);
			}else if(child.g){
				this.g.add(child.g);
			}else if(child instanceof PIXI.Sprite){
				this.g.add(child);
			}
		});
		this.alignChildren();
		this.alignSelf();
	}
	setRect(rect){
		this.rect = rect;
		this.alignChildren();
		this.alignSelf();
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