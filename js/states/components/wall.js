function isVertical(position){
	return position.x % 1 != 0;
}

class Wall{
	constructor(key, {game, group, s}, position){
		this.position = new Phaser.Point(position.x, position.y);
		console.log("wall", this.position);
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
	play(){
		
	}
}

export default Wall;