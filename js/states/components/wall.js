function isVertical(position){
	return position.x % 1 != 0;
}

class Wall{
	constructor(key, {game, group, s}, position){
		this.position = new Phaser.Point(position.x, position.y);
		this.body = "wall";
		this.game = game;
		this.s = s;
		this.g = game.add.image(
			this.position.x*s + s/2, 
			this.position.y*s + s/2,
			key,
			null,
			group
		);
		this.g.anchor.x = this.g.anchor.y = 0.5;
		this.g.scale.x = this.g.scale.y = s / this.g.width;
		if(isVertical(this.position)){
			this.g.angle = 90;
		}
	}
	getGraphicsPosition(){
		return this.g.position.clone();
	}
	setGroup(group){
		group.add(this.g);
	}
	transfer(x, y){
		this.position.x = x;
		this.position.y = y;
		this.g.x = x*this.s + this.s/2
		this.g.y = y*this.s + this.s/2
		if(isVertical(this.position)){
			this.g.angle = 90;
		}else{
			this.g.angle = 0;
		}
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
	destroy(){
		this.g.destroy();
	}
}

export default Wall;