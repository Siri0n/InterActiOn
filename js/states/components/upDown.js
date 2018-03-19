class UpDown{
	constructor(game, group, options){
		this.onChange = new Phaser.Signal();
		this.min = options.min;
		this.max = options.max;
		this.value = options.value || this.min;
		this.g = game.add.group(group);
		var size = options.size || 32;
		var style = {
			fontSize: size*2/3
		}
		this.label = game.add.text(0, 0, options.label, style, this.g);
		this.valueText = game.add.text(0, 0, this.value, style, this.g);
		this.decButton = createButton(game, this.g, this.dec, this, 32);
		this.decButton.angle = 180;
		this.incButton = createButton(game, this.g, this.inc, this, 32);
		this.update();
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
	update(){
		this.valueText.text = this.value;
		this.decButton.alignTo(this.label, Phaser.RIGHT_CENTER);
		this.valueText.alignTo(this.decButton, Phaser.RIGHT_CENTER);
		this.incButton.alignTo(this.valueText, Phaser.RIGHT_CENTER);
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