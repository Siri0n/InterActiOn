function removeConsequentBumps(commands){
	for(let i = 0; i < commands.length; i++){
		let c = commands[i];
		let p = commands[i - 1];
		if(c.type == "bump" && p && (p.type == "bump" || p.type == "wait")){
			c.type = "wait";
		}
		console.log(commands);
	}
}

const TIME_UNIT = 500;

class ImageGraphics{
	constructor(key, {game, group, s}, {x, y}){
		this.s = s;
		this.game = game;
		this.g = game.add.image(x*s + s/2, y*s + s/2, key, null, group);
		this.g.width = this.g.height = s;
		this.g.anchor.x = this.g.anchor.y = 0.5;
		this.g.inputEnabled = true;
		this.commands = [];
	}
	onClick(f){
		this.g.events.onInputDown.add(f);
	}
	move(p){
		this.commands.push({
			type: "move",
			shift: p
		});
		//this.g.position.add(p.x*this.s, p.y*this.s);
	}
	bump(p){
		this.commands.push({
			type: "bump",
			shift: p
		});
	}
	async play(){
		console.log("play");
		removeConsequentBumps(this.commands);
		while(this.commands.length){
			await this.execute(this.commands.shift());
		}
	}
	execute(command){
		if(command.type == "move"){
			return new Promise((resolve, reject) => {
				this.game.add.tween(this.g)
					.to(
						{
							x: this.g.x + command.shift.x*this.s, 
							y: this.g.y + command.shift.y*this.s
						},
						TIME_UNIT,
						Phaser.Easing.Quadratic.InOut,
						true
					)
					.onComplete.addOnce(resolve);
			});
		}else if(command.type == "bump"){
			return new Promise((resolve, reject) => {
				this.game.add.tween(this.g)
					.to(
						{
							x: this.g.x + command.shift.x*this.s/4, 
							y: this.g.y + command.shift.y*this.s/4
						},
						TIME_UNIT/2,
						Phaser.Easing.Quadratic.InOut,
						true, 0, 0, true
					)
					.onComplete.addOnce(resolve);
			});
		}else if(command.type == "wait"){
			return new Promise((resolve, reject) => {
				this.game.add.tween(this.g)
					.to(
						{},
						TIME_UNIT,
						Phaser.Easing.Linear.None,
						true
					)
					.onComplete.addOnce(resolve);
			})
		}
	}

}

export default ImageGraphics;