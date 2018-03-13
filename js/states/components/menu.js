function Menu(game, group, rect, items, style){
	var g = this.g = game.add.group(group);
	var children = items.map(data => new MenuItem(game, g, data.text, data.cb, style));
	g.align(1, -1, rect.width, rect.height/children.length, Phaser.CENTER);
	g.position.x = rect.x;
	g.position.y = rect.y;
}

function MenuItem(game, group, text, cb, style){
	style = style || {};
	var g = this.g = game.add.text(0, 0, text, style, group);
	g.anchor.x = g.anchor.y = 0.5;
	g.inputEnabled = true;
	g.events.onInputOver.add(_ => g.scale.x = g.scale.y = 1.2);
	g.events.onInputOut.add(_ => g.scale.x = g.scale.y = 1);
	g.events.onInputDown.add(cb);
}

export default Menu;