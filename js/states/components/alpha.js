import GameObject from "./gameObject";
import ImageGraphics from "./imageGraphics";

const Point = Phaser.Point;

class Alpha extends GameObject{
	constructor(gOptions, {position}, field){
		super();
		this.position = Point.parse(position);
		this.type = "alpha";
		this.body = "solid";

		this.onClick = new Phaser.Signal();
		this.g = new ImageGraphics("alpha", gOptions, this.position);
		this.g.onClick(() => this.onClick.dispatch());
		this.field = field;

		this.onClick.add(() => {
			this.field.showMessage("This is Alpha. You should move it to Omega, but clicking on it won't help you.");
		});
	}
}

export default Alpha;