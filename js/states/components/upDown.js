import Text from "./text";
import Container from "./container";

class UpDown extends Container{
	constructor({game, group = game.world, parent, text, locale, min, max, size = 32, value = min}){
		super(game, group, null, [], parent);
		this.onChange = new Phaser.Signal();
		this.min = min;
		this.max = max;
		this.value = value;
		var style = {
			fontSize: size*2/3
		}
		this.label = new Text({
			game, 
			parent: this,
			text,
			locale,
			style 
		});

		this.valueText = game.add.text(0, 0, this.value, style, this.g);
		this.decButton = createButton(game, this.g, this.dec, this, 32);
		this.decButton.angle = 180;
		this.incButton = createButton(game, this.g, this.inc, this, 32);
		this.add([
			this.label,
			this.decButton,
			this.valueText,
			this.incButton
		]);
		this.updateValue();
	}
	inc(){
		if(this.value < this.max){
			this.value++;
			this.updateValue();
		}
	}
	dec(){
		if(this.value > this.min){
			this.value--;
			this.updateValue();
		}
	}
	set(value){
		this.value = Phaser.Math.clamp(value, this.min, this.max);
		this.updateValue();
	}
	alignChildren(){
		if(!this.label){
			return;
		}
		this.decButton.alignTo(this.label.g, Phaser.RIGHT_CENTER);
		this.valueText.alignTo(this.decButton, Phaser.RIGHT_CENTER);
		this.incButton.alignTo(this.valueText, Phaser.RIGHT_CENTER);		
	}
	alignSelf(){}
	updateValue(){
		this.valueText.text = this.value;
		this.onChange.dispatch(this.value);
		this.shouldUpdate = true;
	}
}

function createButton(game, group, cb, ctx, size){
	var button = game.add.button(0, 0, "triangle", cb, ctx, 1, 0, 2, 1);
	button.anchor.x = button.anchor.y = 0.5;
	button.height = button.width = size;
	group.add(button);
	return button
}
export default UpDown;