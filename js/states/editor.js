import ImageGraphics from "./components/imageGraphics";
import objectConstructors from "./components/objectConstructors";
import Menu from "./components/menu";
import MenuItem from "./components/menuItem";
import UpDown from "./components/upDown";
import Container from "./components/container";

class EditorState extends Phaser.State{
	init(main, data){
		this.main = main;
		this.data = data;
	}
	create(game){
		var self = this;
		var editor = this.editor = new Editor(game, this.main, this.data);
		this.fileUploadHack = function(){
			if(editor.fileUploadHack){
				editor.fileUploadHack = false;
				var input = document.getElementById("file");
				input.addEventListener("change", function(){
					var file = input.files[0];
					if(file){
						var fr = new FileReader();
						fr.onload = e => {
							var result = JSON.parse(e.target.result);
							console.log(result);
							result && self.main.openEditor(result);
						}
						fr.readAsText(file);
					}
				});
				input.click();
			}
		}
		game.canvas.addEventListener("click", this.fileUploadHack);
	}
	preload(game){
		game.load.image("frame", "resources/frame.png");
		game.load.image("alpha", "resources/alpha.png");
		game.load.image("omega", "resources/omega.png");
		game.load.image("plus", "resources/plus.png");
		game.load.spritesheet("editor-tile", "resources/editor-tile.png", 128, 128);
		//game.load.spritesheet("delete", "resources/delete.png", 128, 128);
		game.load.spritesheet("triangle", "resources/triangle.png", 64, 64);
	}
	shutdown(game){
		game.canvas.removeEventListener("click", this.fileUploadHack);
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

		var params = new ParamsEditor(
			game,
			game.world,
			rect.clone().offset(0, game.height/3)
		); 

		function resizeField(){
			field.resize(params.tabs.fieldSize.width.value, 
				params.tabs.fieldSize.height.value);
		}

		params.tabs.fieldSize.width.set(data.width);
		params.tabs.fieldSize.width.onChange.add(resizeField);
		params.tabs.fieldSize.height.set(data.height);
		params.tabs.fieldSize.height.onChange.add(resizeField);

		params.tabs.objectProps.onDelete.add(() => field.delete(field.selected));

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
				{
					text: "Save",
					cb: () => main.saveLevel(field.getLevelData())
				},
				{
					text: "Load",
					cb: () => this.fileUploadHack = true
				}
			]
		);

		palette.onChange.add(type => field.onPaletteChange(type));
		field.onSelected.add(o => {
			if(o){
				params.showTab("objectProps");
			}else{
				params.showTab("fieldSize");
			}
		})
	}
	test(x){
		console.log("test " + x);
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

		this.onSelected = new Phaser.Signal();

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
			this.deselect();
		}else{
			this.add(this.selectedType, x, y);
		}
	}
	onPaletteChange(type){
		this.selectedType = type;
		var isSolid = !objectConstructors[type].floor;
		this.switchLayers(isSolid);
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
		this.height = h;
		this.width = w;
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
						(x, y) => this.onTileClick(x, y)
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
		this.switchLayers(o.body == "solid");
		this.onSelected.dispatch(o);
	}
	deselect(){
		this.frame.visible = false;
		this.selected = null;
		this.onPaletteChange(this.selectedType);
		this.onSelected.dispatch();
	}
	delete(o){
		if(!o){
			return;
		}
		o.destroy();
		this.objects = this.objects.filter(o1 => o1 != o);
		this.deselect();
	}
	switchLayers(isSolid){
		this.solidGroup.ignoreChildInput = !isSolid;
		this.floorGroup.ignoreChildInput = isSolid;
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

class ParamsEditor{
	constructor(game, group, rect){
		this.game = game;
		this.rect = rect;
		this.g = game.add.group(group);
		this.tabs = {};
		
		this.tabs.fieldSize = new FieldSize(game, this.g, rect);
		this.tabs.objectProps = new Props(game, this.g, rect);
		this.showTab("fieldSize");
	}
	showTab(showKey){
		Object.keys(this.tabs).forEach(key => this.tabs[key].g.visible = (key == showKey));
	}
}

class FieldSize{
	constructor(game, group, rect){
		this.game = game;
		this.rect = rect;
		this.g = game.add.group(group);

		this.width = new UpDown(game, this.g, {
			min: 1,
			max: 10,
			label: "Width: "
		});
		this.height = new UpDown(game, this.g, {
			min: 1,
			max: 10,
			label: "Height: "
		});
		this.g.align(1, -1, rect.width, rect.height/2, Phaser.CENTER);
		this.g.alignIn(rect);
	}
}

class Props{
	constructor(game, group, rect){
		this.game = game;
		this.rect = rect;
		this.g = game.add.group(group);
		this.onDelete = new Phaser.Signal();
		this.delete = new MenuItem(game, this.g, "Delete", () => this.onDelete.dispatch());
		this.g.alignIn(rect, Phaser.CENTER);
	}
}