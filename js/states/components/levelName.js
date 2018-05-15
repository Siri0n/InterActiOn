import Text from "./text";

class LevelName extends Text{
	constructor({game, group, rect, style, locale, name, num = ""}){
		super({
			game, 
			group,
			style, 
			locale, 
			text: locale => num + (name[locale.current] || name[locale.defaultLanguage])
		});
		this.name = name;
		rect && this.g.alignIn(rect, Phaser.CENTER);
	}
}

export default LevelName;