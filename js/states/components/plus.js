import GameObject from "./gameObject";
import ImageGraphics from "./imageGraphics";

const Point = Phaser.Point;

class Plus extends GameObject{
	constructor(gOptions, {position}, field){
		super();
		this.position = Point.parse(position);
		this.type = "plus";
		this.body = "solid";

		this.onClick = new Phaser.Signal();
		this.g = new ImageGraphics("plus", gOptions, this.position);
		this.g.onClick(() => this.onClick.dispatch());
		this.field = field;

		this.onClick.add(() => {
			field.inAllDirections(this.position, function(obj, dir){
				if(obj.momentum){
					Point.add(obj.momentum, dir, obj.momentum);
				}
			});
			field.process();	
		});
	}
}

export default Plus;