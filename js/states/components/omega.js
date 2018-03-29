import GameObject from "./gameObject";
import ImageGraphics from "./imageGraphics";

const Point = Phaser.Point;

class Omega extends GameObject{
	constructor(gOptions, {position}, field){
		super();
		this.position = Point.parse(position);
		this.type = "omega";
		this.body = "floor";
		this.immobile = true;

		this.onClick = new Phaser.Signal();
		this.g = new ImageGraphics("omega", gOptions, this.position);
		this.g.onClick(() => this.onClick.dispatch());
		this.field = field;

		this.onClick.add(() => {
			this.field.showMessage("This is Omega. You should move Alpha here.");
		});
	}
	onEnter(o){
		if(o.type == "alpha"){
			o.disappear();
			this.disappear();
		}
	}
}

Omega.floor = true;

export default Omega;