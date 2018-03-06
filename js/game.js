import Menu from "./states/menu";
import LevelSelect from "./states/levelSelect";
import Level from "./states/level";

export default function(){
	var game = new Phaser.Game(800, 600, Phaser.AUTO, '');
	game.state.add("menu", Menu);
	game.state.add("levelSelect", LevelSelect);
	game.state.add("level", Level, true);
}