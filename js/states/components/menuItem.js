function MenuItem(game, group, text, cb, style){
	style = style || {};
	var g = this.g = game.add.text(0, 0, text, style, group || game.world);
	g.anchor.x = g.anchor.y = 0.5;
	g.inputEnabled = true;
	g.events.onInputOver.add(_ => g.scale.x = g.scale.y = 1.2);
	g.events.onInputOut.add(_ => g.scale.x = g.scale.y = 1);
	g.events.onInputDown.add(_ => {
		g.scale.x = g.scale.y = 1;
		cb()
	});
}

export default MenuItem;