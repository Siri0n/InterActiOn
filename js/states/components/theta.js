import GameObject from "./gameObject";
import ImageGraphics from "./imageGraphics";

const Point = Phaser.Point;

class Theta extends GameObject{
	constructor(gOptions, {position}, field){
		super();
		this.position = Point.parse(position);
		this.type = "theta";
		this.body = "floor";
		this.immobile = true;

		this.onClick = new Phaser.Signal();
		this.g = new ImageGraphics("theta", gOptions, this.position);
		this.g.onClick(() => this.onClick.dispatch());
		this.field = field;

		this.onClick.add(() => {
			this.field.showMessage("This is Theta. You should not move Alpha here.");
		});
	}
	onEnter(o){
		o.disappear();
		this.disappear();
	}
}

Theta.floor = true;

export default Theta;