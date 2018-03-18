function removeConsequentBumps(commands){
	for(let i = 0; i < commands.length; i++){
		let c = commands[i];
		let p = commands[i - 1];
		if(c.type == "bump" && p && (p.type == "bump" || p.type == "wait")){
			c.type = "wait";
		}
	}
}

const TIME_UNIT = 500;

class ImageGraphics{

	constructor(key, {game, group, s}, {x, y}){
		this.key = key;
		this.s = s;
		this.game = game;
		this.g = game.add.group(group);
		this.transfer(x, y); 

		this.image = game.add.image(0, 0, key, null, this.g);
		this.image.width = this.image.height = s;
		this.image.anchor.x = this.image.anchor.y = 0.5;
		this.image.inputEnabled = true;
		this.commands = [];
	}

	onClick(f){
		this.g.onChildInputDown.add(f);
	}

	move(p){
		this.commands.push({
			type: "move",
			shift: p
		});
	}

	bump(p){
		this.commands.push({
			type: "bump",
			shift: p
		});
	}

	fade(){
		this.commands.push({
			type: "fade"
		});
	}

	destroy(){
		this.g.destroy();
	}

	async play(){
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
		}else if(command.type == "fade"){
			return new Promise((resolve, reject) => {
				this.game.add.tween(this.g)
					.to(
						{
							alpha: 0 
						},
						TIME_UNIT,
						Phaser.Easing.Linear.None,
						true
					)
					.onComplete.addOnce(resolve);
			})
		}
	}

	transfer(x, y){
		this.g.x = x*this.s + this.s/2
		this.g.y = y*this.s + this.s/2
	}
}

export default ImageGraphics;