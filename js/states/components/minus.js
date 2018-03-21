import GameObject from "./gameObject";
import AdvancedImageGraphics from "./advancedImageGraphics";

const Point = Phaser.Point;

class Plus extends GameObject{
	constructor(gOptions, {position, power}, field){
		super();
		this.position = Point.parse(position);
		this.type = "minus";
		this.body = "solid";
		this.power = power || 1;

		this.onClick = new Phaser.Signal();
		this.g = new AdvancedImageGraphics(
			{
				key: "minus", 
				tint: 0x3c9eff
			}, 
			gOptions, 
			this.position, 
			{
				power: this.power
			}
		);
		this.g.onClick(() => this.onClick.dispatch());
		this.field = field;

		this.onClick.add(() => {
			var powerPoint = new Point(-this.power, -this.power); //nice pun, isn't it?
			field.inAllDirections(this.position, function(obj, dir){
				if(obj.momentum){
					Point.add(obj.momentum, Point.multiply(dir, powerPoint), obj.momentum);
				}
			});
			field.process();	
		});
	}
	setPower(p){
		this.power = p;
		this.g.setPower(p);
	}
	plainObject(){
		return Object.assign(super.plainObject(), {power: this.power});
	}
}

export default Plus;