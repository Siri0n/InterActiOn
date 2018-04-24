import ImageGraphics from "./imageGraphics";

const POSITION_COEF = 0.15;
const SIZE_COEF = 0.6;

class AdvancedImageGraphics extends ImageGraphics{
	constructor({key, tint}, {game, group, s, main}, {x, y}, {movable, power}){
		super("shape", {game, group, s, main}, {x, y});

		this.image.tint = tint;

		this.sigil = game.add.image(0, 0, key, 0, this.g);
		this.sigil.height = this.sigil.width = s;
		this.sigil.anchor.x = this.sigil.anchor.y = 0.5;

		this.power = game.add.image(
			s*POSITION_COEF,
			0,
			"power",
			null,
			this.g
		);
		this.power.height = this.power.width = s * SIZE_COEF;
		this.power.anchor.x = this.power.anchor.y = 0.5;

		this.setPower(power);
	}	
	setPower(power){
		power = power || 1;
		if(power > 1){
			this.power.frame = power - 2;
			this.power.visible = true;
			this.sigil.height = this.sigil.width = this.s*SIZE_COEF;
			this.sigil.x = -this.s*POSITION_COEF;		
		}else{
			this.power.visible = false;
			this.sigil.height = this.sigil.width = this.s;
			this.sigil.x = 0;	
		}
	}
}

export default AdvancedImageGraphics;