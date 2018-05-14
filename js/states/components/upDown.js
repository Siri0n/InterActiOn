import Text from "./text";

class UpDown{
	constructor({game, group = game.world, text, locale, min, max, size = 32, value = min}){
		this.onChange = new Phaser.Signal();
		this.min = min;
		this.max = max;
		this.value = value;
		this.g = game.add.group(group);
		var style = {
			fontSize: size*2/3
		}
		this.label = new Text({
			game, 
			group: this.g,
			text,
			locale,
			style 
		});
		this.valueText = game.add.text(0, 0, this.value, style, this.g);
		this.decButton = createButton(game, this.g, this.dec, this, 32);
		this.decButton.angle = 180;
		this.incButton = createButton(game, this.g, this.inc, this, 32);
		this.update();
		locale.onSwitch.add(() => this.align());
	}
	inc(){
		if(this.value < this.max){
			this.value++;
			this.update();
		}
	}
	dec(){
		if(this.value > this.min){
			this.value--;
			this.update();
		}
	}
	set(value){
		this.value = Phaser.Math.clamp(value, this.min, this.max);
		this.update();
	}
	align(){
		this.decButton.alignTo(this.label.g, Phaser.RIGHT_CENTER);
		this.valueText.alignTo(this.decButton, Phaser.RIGHT_CENTER);
		this.incButton.alignTo(this.valueText, Phaser.RIGHT_CENTER);		
	}
	update(){
		this.valueText.text = this.value;
		this.align();
		this.onChange.dispatch(this.value);
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