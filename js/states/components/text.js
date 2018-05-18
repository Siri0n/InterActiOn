export default class Text{
	constructor({game, group = game.world, parent, position = {x: 0, y: 0}, style = {}, text, locale, updateOnCreation = true}){
		this.locale = locale;
		this.text = text;
		this.g = game.add.text(position.x, position.y, "", style, group);
		parent && this.setParent(parent);
		updateOnCreation && this.text && this.update();
		this.locale.onSwitch.add(() => this.update());
	}
	set text(text){
		this._text = typeof text == "function" ? text : locale => locale.get(text);
		this.g && this.update();
	}
	get text(){
		return this._text(this.locale);
	}
	setParent(container){
		this.parent = container;
		this.parent.g.add(this.g);
	}
	update(){
		this.g.text = this.text;
		this.parent && (this.parent.shouldUpdate = true);
	}
}