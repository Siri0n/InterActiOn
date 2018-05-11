import MenuItem from "./menuItem";
import Container from "./container";

class Menu extends Container{
	constructor(game, group, rect, items, locale, style){
		var children = items.map(
			({text, cb}) => new MenuItem({game, text, cb, style, locale})
		);
		super(game, group, rect, children);
	}
}


export default Menu;