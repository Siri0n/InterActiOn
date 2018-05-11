import Text from "./text";

class MenuItem extends Text{
	constructor(args){
		super(args);
		const g = this.g;
		const {cb} = args;
		g.anchor.x = g.anchor.y = 0.5;
		g.inputEnabled = true;
		g.events.onInputOver.add(_ => g.scale.x = g.scale.y = 1.2);
		g.events.onInputUp.add(_ => g.scale.x = g.scale.y = 1.2);
		g.events.onInputOut.add(_ => g.scale.x = g.scale.y = 1);
		g.events.onInputDown.add(_ => {
			g.scale.x = g.scale.y = 1;
			cb()
		});
	}
}

export default MenuItem;