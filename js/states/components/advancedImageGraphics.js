import ImageGraphics from "./imageGraphics";

const POSITION_COEF = 0.25;
const SIZE_COEF = 1.75;

class AdvancedImageGraphics extends ImageGraphics{
	constructor(key, {game, group, s}, {x, y}, power){
		super(key, {game, group, s}, {x, y});
		this.powerGraphics = game.add.image(
			s*POSITION_COEF,
			s*POSITION_COEF,
			"power",
			0,
			group
		);
		this.g.addChild(this.powerGraphics);
		this.powerGraphics.height = this.powerGraphics.width = s * SIZE_COEF;
		this.setPower(power);
	}	
	setPower(power){
		this.power = power;
		this.powerGraphics.visible = (power > 1);
		if(power > 1){
			this.powerGraphics.frame = power - 2;
		}
	}
}

export default AdvancedImageGraphics;