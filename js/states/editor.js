import ImageGraphics from "./components/imageGraphics";
import objectConstructors from "./components/objectConstructors";
import Menu from "./components/menu";
import UpDown from "./components/upDown";

class EditorState extends Phaser.State{
	init(main, data){
		this.main = main;
		this.data = data;
	}
	create(game){
		var editor = new Editor(game, this.main, this.data);
	}
	preload(game){
		game.load.image("frame", "resources/frame.png");
		game.load.image("alpha", "resources/alpha.png");
		game.load.image("omega", "resources/omega.png");
		game.load.image("plus", "resources/plus.png");
		game.load.spritesheet("editor-tile", "resources/editor-tile.png", 128, 128);
		game.load.spritesheet("delete", "resources/delete.png", 128, 128);
		game.load.spritesheet("triangle", "resources/triangle.png", 64, 64);
	}

}

export default EditorState;

const S = 32;

class Editor{
	constructor(game, main, data){
		this.game = game;
		this.main = main;

		data = data || {
			height: 4,
			width: 4,
			objects: []
		}
		var rect = new Phaser.Rectangle(game.width*3/4, 0, game.width/4, game.height/3);

		var field = new EditorField(
			game, 
			game.world, 
			new Phaser.Rectangle(0, 0, game.width*3/4, game.height),
			data,
			S
		);

		var palette = new ComponentPalette(
			game,
			game.world,
			rect,
			S,
			["alpha", "omega", "plus"]
		);

		var fieldWidth = new UpDown(game, game.world, {
			min: 1,
			max: 10,
			value: data.width,
			label: "Width: "
		});

		fieldWidth.g.alignIn(rect.clone().offset(0, game.height/3).scale(1, 0.5), Phaser.CENTER);

		var fieldHeight = new UpDown(game, game.world, {
			min: 1,
			max: 10,
			value: data.height,
			label: "Height: "
		});

		fieldHeight.g.alignIn(rect.clone().offset(0, game.height/2).scale(1, 0.5), Phaser.CENTER);

		function resizeField(){
			field.resize(fieldWidth.value, fieldHeight.value);
		}

		fieldWidth.onChange.add(resizeField);
		fieldHeight.onChange.add(resizeField);

		var menu = new Menu(
			game,
			game.world,
			rect.clone().offset(0, game.height*2/3),
			[
				{
					text: "Back",
					cb: () => main.goToMenu()
				},
				{
					text: "Test",
					cb: () => main.playCustom(field.getLevelData())
				},
			]
		);

		palette.onChange.add(type => {
			console.log("onChange", type);
			field.selectedType = type;
		});
	}
}

class EditorField{
	constructor(game, group, rect, {height, width, objects}, s){
		this.game = game;
		this.s = s;
		this.rect = rect;
		this.height = height;
		this.width = width;

		this.g = game.add.group(group);
		this.tilesGroup = game.add.group(this.g);
		this.floorGroup = game.add.group(this.g);
		this.solidGroup = game.add.group(this.g);
		this.frame = game.add.image(0, 0, "frame");
		this.frame.height = this.frame.width = s;
		this.frame.anchor.x = this.frame.anchor.y = 0.5;
		this.g.add(this.frame);
		this.frame.visible = false;

		this.tiles = [];
		this.objects = [];

		for(let i = 0; i < width; i++){
			for(let j = 0; j < height; j++){
				this.tiles.push(new EditorTile(
					game,
					this.tilesGroup,
					s,
					{x:i, y:j},
					(x, y) => this.onTileClick(x, y)
				));
			}
		}
		this.g.alignIn(rect, Phaser.CENTER);

		objects.forEach(o => this.add(o.type, o.position.x, o.position.y));
	}
	onTileClick(x, y){
		if(this.selected){
			this.selected.transfer(x, y);
			this.selected = null;
			this.frame.visible = false;
		}else{
			this.add(this.selectedType, x, y);
		}
	}
	add(type, x, y){
		var O = objectConstructors[type];
		var o = new O(
			{
				game: this.game, 
				group: O.floor ? this.floorGroup : this.solidGroup,
				s: this.s
			}, 
			{
				position: {x, y}
			},
			this
		);
		o.onClick.removeAll();
		o.onClick.add(() => this.select(o));
		this.objects.push(o);
	}
	getLevelData(){
		return {
			height: this.height,
			width: this.width,
			objects: this.objects.map(o => o.plainObject())
		}
	}
	resize(w, h){
		this.tiles.forEach(t => {
			if(!inside(t, w, h)){
				t.destroy();
			}
		});
		this.tiles = this.tiles.filter(t => inside(t, w, h));
		this.objects.forEach(o => {
			if(!inside(o, w, h)){
				o.destroy();
			}
		});
		this.objects = this.objects.filter(o => inside(o, w, h));


		for(let i = 0; i < w; i++){
			for(let j = 0; j < h; j++){
				if(!this.tiles.some(t => (t.position.x == i) && t.position.y == j )){
					this.tiles.push(new EditorTile(
						this.game,
						this.tilesGroup,
						this.s,
						{x:i, y:j},
						(x, y) => this.onTileClick.dispatch(x, y)
					));
				}
			}
		}

		this.g.alignIn(this.rect, Phaser.CENTER);
	}
	select(o){
		this.frame.visible = true;
		this.frame.x = o.g.g.x;
		this.frame.y = o.g.g.y;
		this.selected = o;
		if(o.body == "solid"){
			this.solidGroup.ignoreChildInput = false;
			this.floorGroup.ignoreChildInput = true;
		}else{
			this.solidGroup.ignoreChildInput = true;
			this.floorGroup.ignoreChildInput = false;
		}
	}

}

function inside(o, w, h){
	return (o.position.x < w) && (o.position.y < h);
}

class EditorTile{
	constructor(game, group, s, {x, y}, cb){
		this.g = game.add.button(x*s + s/2, y*s + s/2, "editor-tile", () => cb(x, y), null, 1, 0, 2, 1);
		group.add(this.g);
		this.g.anchor.x = this.g.anchor.y = 0.5;
		this.g.width = this.g.height = s;
		this.position = new Phaser.Point(x, y);
	}
	destroy(){
		this.g.destroy();
	}
}

class ComponentPalette{
	constructor(game, group, rect, s, types){
		var g = this.g = game.add.group(group);
		g.x = rect.x;
		g.y = rect.y;
		var components = [];
		types.forEach(type => {
			var O = objectConstructors[type];
			var component = new O(
				{
					game, 
					group: g,
					s
				},
				{
					position: {x: 0, y: 0}
				}
			);
			component.onClick.removeAll();
			component.onClick.add(() => this.select(component))
			components.push(component);
		})
		g.align(2, -1, s, s, Phaser.CENTER);
		this.frame = game.add.image(0, 0, "frame");
		this.frame.height = this.frame.width = s;
		this.frame.anchor.x = this.frame.anchor.y = 0.5;
		this.g.add(this.frame);
		this.onChange = new Phaser.Signal();
		this.onChange.add(() => {}); //dirty hack
		this.onChange.memorize = true;
		this.select(components[0]);
	}
	select(c){
		this.frame.position = c.g.g.position;
		this.selected = c.type;
		this.onChange.dispatch(this.selected);
	}
}