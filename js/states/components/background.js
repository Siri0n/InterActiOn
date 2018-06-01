class Background{
	constructor(game, group, rect){
		this.g = game.add.group();
		group.add(this.g, false, 0);
		var layer1 = new BackgroundLayer(game, this.g, rect, 6, 0.5, 0.5);
		var layer2 = new BackgroundLayer(game, this.g, rect, 5, -0.6, 0.7);
		var layer3 = new BackgroundLayer(game, this.g, rect, 4, 0.4, -0.8);
		this.g.alpha = 0.3;
	}
}

export default Background;

const K = 0.4;
class BackgroundLayer{
	constructor(game, group, rect, scale, dx, dy){
		console.log(rect);
		this.g = game.add.tileSprite(
			rect.value.x,
			rect.value.y,
			rect.width,
			rect.height,
			"bg-star",
			null,
			group
		);
		this.g.tileScale.x = this.g.tileScale.y = scale;
		this.g.update = () => {
			this.g.tilePosition.add(dx*K, dy*K);
		}
		this.g.blendMode = Phaser.blendModes.SCREEN;

		this.rect = rect;
		this.rect.onChange.add(() => this.resize());
	}
	resize(){
		this.g.x = this.rect.value.x;
		this.g.y = this.rect.value.y;
		this.g.width = this.rect.value.width;
		this.g.height = this.rect.value.height;
	}
}