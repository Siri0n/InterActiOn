const Point = Phaser.Point;
const NULL = new Point(0, 0);

class GameObject{
	constructor(){
		this.momentum = new Point(0, 0);
		this.onClick = new Phaser.Signal();
	}
	get moving(){
		return !this.immobile && !this.momentum.equals(NULL);
	}
	activate(){
		this.g.activate();
	}
	plan(){
		this.moving && (this.nextPosition = Point.add(this.position, Point.normalize(this.momentum)));
	}
	move(){
		var push = Point.normalize(this.momentum);
		this.g.move(push);
		this.position = this.nextPosition;
		this.nextPosition = null;
		this.momentum = Point.subtract(this.momentum, push);
	}
	bump(){
		var push = Point.normalize(this.momentum);
		this.g.bump(push);
		this.nextPosition = null;
		this.momentum = Point.subtract(this.momentum, push);
	}
	disappear(){
		this.g.fade();
		this.field.remove(this);
	}
	destroy(){
		this.g.destroy();
	}
	async play(){
		await this.g.play(); 
	}
	transfer(x, y){
		this.position.x = x;
		this.position.y = y;
		this.g.transfer(x, y);
	}
	setGroup(group){
		this.g.setGroup(group);
	}
	getGraphicsPosition(){
		return this.g.g.position.clone();
	}
	inputEnabled(enabled){
		this.g.inputEnabled(enabled);
	}
	plainObject(){
		return {
			type: this.type,
			position: {
				x: this.position.x,
				y: this.position.y
			}
		}
	}
}

export default GameObject;