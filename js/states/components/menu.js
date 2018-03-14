import MenuItem from "./menuItem";
import Container from "./container";

class Menu extends Container{
	constructor(game, group, rect, items, style){
		var children = items.map(data => new MenuItem(game, null, data.text, data.cb, style));
		super(game, group, rect, children);
	}
}


export default Menu;