import Menu from "./states/menu";
import LevelSelect from "./states/levelSelect";
import LevelEditor from "./states/editor";
import Level from "./states/level";

export default function(){
	var game = new Phaser.Game(800, 600, Phaser.AUTO, '');
	game.state.add("menu", Menu);
	game.state.add("levelSelect", LevelSelect);
	game.state.add("editor", LevelEditor);
	game.state.add("level", Level);
	return game;
}