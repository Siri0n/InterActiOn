export default class Text{
	constructor({game, group = game.world, position = {x: 0, y: 0}, style = {}, text, locale, updateOnCreation=true}){
		this.locale = locale;
		this.text = text;
		this.g = game.add.text(position.x, position.y, "", style, group);
		updateOnCreation && this.text && this.update();
		this.locale.onSwitch.add(() => this.update());
	}
	set text(text){
		this._text = typeof text == "function" ? text : locale => locale.get(text);
		this.g && (this.g.text = this.text);
	}
	get text(){
		return this._text(this.locale);
	}
	update(){
		this.g.text = this.text;
	}
}