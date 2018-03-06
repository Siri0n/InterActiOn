const Point = Phaser.Point;
const NULL = new Point(0, 0);

class GameObject{
	constructor(){
		this.momentum = new Point(0, 0);
	}
	moving(){
		return !this.immobile && !this.momentum.equals(NULL);
	}
	plan(){
		this.moving() && (this.nextPosition = Point.add(this.position, Point.normalize(this.momentum)));
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
	async play(){
		await this.g.play(); 
	}
}

export default GameObject;