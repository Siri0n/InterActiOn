import GameObject from "./gameObject";
import ImageGraphics from "./imageGraphics";

const Point = Phaser.Point;

class Omega extends GameObject{
	constructor(gOptions, {position}, field){
		super();
		this.position = Point.parse(position);
		this.type = "omega";
		this.body = "none";
		this.immobile = true;
		this.g = new ImageGraphics("omega", gOptions, this.position);
		this.g.onClick(_ => {
			alert("This is Omega. You should move Alpha here.");
		});

	}
}

export default Omega;