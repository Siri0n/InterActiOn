import ImageGraphics from "./components/imageGraphics";
import objectConstructors from "./components/objectConstructors";
import MenuItem from "./components/menuItem";
import UpDown from "./components/upDown";
import Container from "./components/container";
import Sidebar from "./components/sidebar";

function EditorWallMixin(BaseClass){
	return class extends BaseClass{
		constructor(gOptions, options){
			super(gOptions, options);
			this.onClick = new Phaser.Signal();
			this.g.inputEnabled = true;
			this.g.events.onInputDown.add(() => this.onClick.dispatch());
			var _s = this.s / this.g.scale.x;
			this.g.hitArea = new Phaser.Rectangle(-_s/2, -_s/2, _s, _s);
		}
		inputEnabled(enabled){
			this.g.inputEnabled = enabled;
		}
	}
}

var editorConstructors = Object.assign({}, objectConstructors);
["wall"].forEach(key => editorConstructors[key] = EditorWallMixin(editorConstructors[key]));

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
	shutdown(game){
		game.canvas.removeEventListener("click", this.fileUploadHack);
	}

}

export default EditorState;

const S = 48;

class Editor{
	constructor(game, main, data){
		this.game = game;
		this.main = main;

		data = data || {
			name: "Level Name",
			height: 4,
			width: 4,
			objects: []
		}
		var rect = new Phaser.Rectangle(game.width*3/4, 0, game.width/4, game.height/4);

		var fieldName = new ShittyTextInput(game, game.world, main.params.fieldRect.clone().scale(1, 0.1), data.name);

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
			["alpha", "omega", "theta", "plus", "minus", "wall"]
		);

		var params = new ParamsEditor(
			game,
			game.world,
			rect.clone().offset(0, game.height/4)
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
		params.tabs.objectProps.power.onChange.add(p => field.selected.setPower(p));

		var sidebar = new Sidebar(
			game, 
			game.world, 
			[
				{
					key: "play",
					cb: () => this.main.playCustom(field.getLevelData())
				},
				{
					key: "save",
					cb: () => this.main.saveLevel(field.getLevelData())
				},
				{
					key: "load",
					cb: () => this.fileUploadHack = true
				},
				{
					key: "menu",
					cb: () => this.main.settings.open()
				}
			],
			this.main.params.sidebarButtonSize,
			this.main.params.sidebarOuterSize
		);

		palette.onChange.add(c => field.onPaletteChange(c));

		field.onSelected.add(o => {
			if(o){
				params.showTab("objectProps");
				params.tabs.objectProps.showPropsFor(o);
			}else{
				params.showTab("fieldSize");
			}
		})

		fieldName.onChange.add(name => field.name = name);


	}
}

class EditorField{
	constructor(game, group, rect, {name, height, width, objects}, s){
		this.game = game;
		this.s = s;
		this.rect = rect;
		this.height = height;
		this.width = width;
		this.name = name;

		this.g = game.add.group(group);
		this.tilesGroup = game.add.group(this.g);
		this.wallTilesGroup = game.add.group(this.g);
		this.floorGroup = game.add.group(this.g);
		this.wallGroup = game.add.group(this.g);
		this.solidGroup = game.add.group(this.g);
		this.frame = game.add.image(0, 0, "frame");
		this.frame.height = this.frame.width = s;
		this.frame.anchor.x = this.frame.anchor.y = 0.5;
		this.g.add(this.frame);
		this.frame.visible = false;

		this.tiles = [];
		this.wallTiles = [];
		this.objects = [];

		this.onSelected = new Phaser.Signal();

		this.createTiles();
		this.g.alignIn(rect, Phaser.CENTER);

		objects.forEach(o => this.add(o.type, o.position.x, o.position.y, o.power));
	}
	createTiles(){
		this.tiles = [];
		this.wallTiles = [];
		for(let i = 0; i < this.width; i++){
			for(let j = 0; j < this.height; j++){
				this.tiles.push(new EditorTile(
					this.game,
					this.tilesGroup,
					this.s,
					{x:i, y:j},
					(x, y) => this.onTileClick(x, y)
				));
				if(i > 0){
					this.wallTiles.push(new EditorWallTile(
						this.game,
						this.wallTilesGroup,
						this.s,
						{x: i - 0.5, y: j},
						(x, y) => this.onTileClick(x, y)
					));
				}
				if(j > 0){
					this.wallTiles.push(new EditorWallTile(
						this.game,
						this.wallTilesGroup,
						this.s,
						{x: i, y: j - 0.5},
						(x, y) => this.onTileClick(x, y)
					));
				}
			}
		}
	}
	onTileClick(x, y){
		if(this.selected){
			this.selected.transfer(x, y);
			this.deselect();
		}else{
			this.add(this.selectedComponent.type, x, y);
		}
	}
	onPaletteChange(c){
		this.selectedComponent = c;
		this.updateInputIgnore();
	}
	add(type, x, y, power){
		var O = editorConstructors[type];
		var obj = new O(
			{
				game: this.game, 
				group: this.game.world,
				s: this.s
			}, 
			{
				position: {x, y},
				power
			},
			this
		);
		var group;
		if(obj.body == "floor"){
			group = this.floorGroup;
		}else if(obj.body == "wall"){
			group = this.wallGroup;
		}else{
			group = this.solidGroup;
		}
		obj.setGroup(group);
		obj.onClick.removeAll();
		obj.onClick.add(() => this.select(obj));
		this.objects.push(obj);
	}
	getLevelData(){
		return {
			name: this.name,
			height: this.height,
			width: this.width,
			objects: this.objects.map(o => o.plainObject())
		}
	}
	resize(w, h){
		this.height = h;
		this.width = w;
		this.tiles.forEach(t => t.destroy());
		this.wallTiles.forEach(t => t.destroy());

		this.objects.forEach(o => {
			if(!inside(o, w, h)){
				o.destroy();
			}
		});
		this.objects = this.objects.filter(o => inside(o, w, h));


		this.createTiles();

		this.g.alignIn(this.rect, Phaser.CENTER);
	}
	select(o){
		if(this.selected == o){
			this.deselect();
			return;
		}
		this.frame.visible = true;
		this.frame.position = o.getGraphicsPosition();
		this.selected = o;
		this.updateInputIgnore();
		this.onSelected.dispatch(o);
	}
	deselect(){
		this.frame.visible = false;
		this.selected = null;
		this.updateInputIgnore();
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
	updateInputIgnore(){
		var selected = this.selected || this.selectedComponent;
		var body = selected.body;
		if(body == "solid"){
			this.wallTilesGroup.ignoreChildInput = true;
			this.tilesGroup.ignoreChildInput = false;
		}else if(body == "floor"){
			this.wallTilesGroup.ignoreChildInput = true;
			this.tilesGroup.ignoreChildInput = false;
		}else if(body == "wall"){
			this.wallTilesGroup.ignoreChildInput = false;
			this.tilesGroup.ignoreChildInput = true;
		}
		this.objects.forEach(o => o.inputEnabled(o.body == body));
		this.solidGroup.alpha = (body == "solid" ? 1 : 0.5);
		this.floorGroup.alpha = (body == "floor" ? 1 : 0.5);
		this.wallGroup.alpha = (body == "wall" ? 1 : 0.5);
	}
}

function inside(o, w, h){
	return (o.position.x <= w - 1) && (o.position.y <= h - 1);
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

class EditorWallTile{
	constructor(game, group, s, {x, y}, cb){
		this.g = game.add.button(x*s + s/2, y*s + s/2, "editor-tile-wall", () => cb(x, y), null, 1, 0, 2, 1);
		group.add(this.g);
		this.g.anchor.x = this.g.anchor.y = 0.5;
		this.g.width = this.g.height = s / 1.414;
		this.g.angle = (x % 1) ? -45 : 45;
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
			var O = editorConstructors[type];
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
		g.align(4, -1, s, s, Phaser.CENTER);
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
		this.frame.position = c.getGraphicsPosition();
		this.selected = c;
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

class Props extends Container{
	constructor(game, group, rect){
		super(game, group, rect, []);

		this.onDelete = new Phaser.Signal();
		this.delete = new MenuItem(game, game.world, "Delete", () => this.onDelete.dispatch());
		this.power = new UpDown(game, this.g, {
			min: 1,
			max: 9,
			label: "Power: "
		});
		this.add([
			this.delete,
			this.power
		])
	}
	showPropsFor(o){
		if(o.power){
			this.power.g.visible = true;
			this.power.set(o.power);
		}else{
			this.power.g.visible = false;
		}
	}
}

class ShittyTextInput extends MenuItem{
	constructor(game, group, rect, text){
		var onChange = new Phaser.Signal();
		var cb = () => {
			var newName = prompt("Enter level name");
			if(!newName){
				return;
			}
			onChange.dispatch(newName);
			this.g.text = newName;
		}
		super(game, group, text, cb, {});
		this.onChange = onChange;
		this.g.alignIn(rect, Phaser.CENTER);
	}
}