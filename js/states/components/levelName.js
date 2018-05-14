import Text from "./text";

class LevelName extends Text{
	constructor({game, group, rect, locale, name, num = ""}){
		super({
			game, 
			group, 
			locale, 
			text: locale => (num && num + ". ") + (name[locale.current] || name[locale.defaultLanguage])
		});
		this.name = name;
		this.g.alignIn(rect, Phaser.CENTER);
	}
}

export default LevelName;