import GameObject from "./gameObject";
import AdvancedImageGraphics from "./advancedImageGraphics";

const Point = Phaser.Point;

class Alpha extends GameObject{
	constructor(gOptions, {position}, field){
		super();
		this.position = Point.parse(position);
		this.type = "alpha";
		this.body = "solid";
		
		this.g = new AdvancedImageGraphics({key: "alpha", tint: 0xffff55}, gOptions, this.position, {});
		this.g.onClick(() => this.onClick.dispatch());
		this.field = field;

		this.onClick.add(() => {
			this.field.showMessage("alpha_help");
		});
	}
}

export default Alpha;