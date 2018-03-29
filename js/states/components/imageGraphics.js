const Point = Phaser.Point;

function removeConsequentBumps(commands){
	for(let i = 0; i < commands.length; i++){
		let c = commands[i];
		let p = commands[i - 1];
		if(c.type == "bump" && p && (p.type == "bump" || p.type == "wait")){
			c.type = "wait";
		}
	}
}

function removeTrailingWaits(commands){
	while(commands.length && commands[commands.length - 1].type == "wait"){
		commands.pop();
	}
}

function realisticMove(commands){
	for(let i = 0; i < commands.length; i++){
		let c = commands[i];
		let n = commands[i + 1];
		if(c.type == "move" && n && n.type == "move"){
			if(!c.shift.cross(n.shift)){
				c.shift = Point.add(c.shift, n.shift);
				commands.splice(i + 1, 1);
				i--;
			}
		}
	}
}

function moveBump(commands){
	for(let i = 0; i < commands.length; i++){
		let c = commands[i];
		let n = commands[i + 1];
		if(c.type == "move" && n && n.type == "bump"){
			if(!c.shift.cross(n.shift)){
				c.type = "moveBump";
				c.sound = n.sound;
				commands.splice(i + 1, 1);
				i--;
			}
		}
	}
}

const TIME_UNIT = 500;

function wait(time, cb){
	return () => setInterval(cb, time); //for now
}

const commandHandlers = {
	move(resolve, command, ctx){
		ctx.game.add.tween(ctx.g)
		.to(
			{
				x: ctx.g.x + command.shift.x*ctx.s, 
				y: ctx.g.y + command.shift.y*ctx.s
			},
			TIME_UNIT*command.shift.getMagnitude(),
			Phaser.Easing.Quadratic.InOut,
			true
		)
		.onComplete.addOnce(resolve);
	},
	moveBump(resolve, command, ctx){
		const BUMP_FORWARD_TIME = TIME_UNIT*0.1;
		const BUMP_BACK_TIME = TIME_UNIT*0.3;
		const WAIT_TIME = TIME_UNIT - BUMP_FORWARD_TIME - BUMP_BACK_TIME;

		var delta = Point.normalize(command.shift).multiply(0.1, 0.1);
		var shift = Point.add(command.shift, delta);
		var forward = ctx.game.add.tween(ctx.g)
		.to(
			{
				x: ctx.g.x + shift.x*ctx.s, 
				y: ctx.g.y + shift.y*ctx.s
			},
			TIME_UNIT*command.shift.getMagnitude() + BUMP_FORWARD_TIME,
			Phaser.Easing.Quadratic.In,
			true
		)
		forward.onComplete.addOnce(() => ctx.audio.playSound(command.sound));
		var back = ctx.game.add.tween(ctx.g)
		.to(
			{
				x: ctx.g.x + command.shift.x*ctx.s, 
				y: ctx.g.y + command.shift.y*ctx.s
			},
			BUMP_BACK_TIME,
			Phaser.Easing.Quadratic.Out
		);
		back.onComplete.addOnce(
			wait(WAIT_TIME, resolve)
		);
		forward.chain(back);
	},
	bump(resolve, command, ctx){
		ctx.audio.playSound(command.sound);
		ctx.game.add.tween(ctx.g)
		.to(
			{
				x: ctx.g.x + command.shift.x*ctx.s/8, 
				y: ctx.g.y + command.shift.y*ctx.s/8
			},
			TIME_UNIT/2,
			Phaser.Easing.Quadratic.InOut,
			true, 0, 0, true
		)
		.onComplete.addOnce(resolve);
	},
	wait(resolve, command, ctx){
		wait(TIME_UNIT, resolve)();
	},
	fade(resolve, command, ctx){
		ctx.audio.playSound(command.sound);
		ctx.game.add.tween(ctx.g)
		.to(
			{
				alpha: 0 
			},
			TIME_UNIT,
			Phaser.Easing.Linear.None,
			true
		)
		.onComplete.addOnce(resolve);
	},
	activate(resolve, command, ctx){
		ctx.audio.playSound(command.sound);
		ctx.game.add.tween(ctx.g.scale)
		.to(
			{
				x: 1.1,
				y: 1.1
			},
			TIME_UNIT/2,
			Phaser.Easing.Quadratic.InOut,
			true, 0, 0, true
		)
		.onComplete.addOnce(resolve);
	}
}

class ImageGraphics{
	constructor(key, {game, group, s, audio}, {x, y}){
		this.key = key;
		this.s = s;
		this.game = game;
		this.audio = audio;
		this.g = game.add.group(group);
		this.transfer(x, y); 

		this.image = game.add.image(0, 0, key, null, this.g);
		this.image.width = this.image.height = s;
		this.image.anchor.x = this.image.anchor.y = 0.5;
		this.image.inputEnabled = true;
		this.commands = [];
	}

	setGroup(group){
		group.add(this.g);
	}

	onClick(f){
		this.g.onChildInputDown.add(f);
	}

	activate(){
		this.commands.push({
			type: "activate",
			sound: "pusch"
		});
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
			shift: p,
			sound: "bump"
		});
	}

	fade(){
		this.commands.push({
			type: "fade",
			sound: "fade"
		});
	}

	wait(){
		this.commands.push({
			type: "wait"
		});
	}

	destroy(){
		this.g.destroy();
	}

	async play(){
		removeConsequentBumps(this.commands);
		removeTrailingWaits(this.commands);
		realisticMove(this.commands);
		moveBump(this.commands)
		while(this.commands.length){
			await this.execute(this.commands.shift());
		}
	}

	execute(command){
		var commandHandler = commandHandlers[command.type];
		return new Promise((resolve, reject) => commandHandler(resolve, command, this));
	}

	transfer(x, y){
		this.g.x = x*this.s + this.s/2
		this.g.y = y*this.s + this.s/2
	}
	inputEnabled(enabled){
		this.g.ignoreChildInput = !enabled;
	}
}

export default ImageGraphics;