import MsgBox from "./components/msgBox";
import Sidebar from "./components/sidebar";
import LevelName from "./components/levelName";
import objectConstructors from "./components/objectConstructors";

class LevelState extends Phaser.State{
	init(main, levelData, successCallback, cancelCallback){
		this.main = main;
		this.levelData = levelData;
		this.success = successCallback;
		this.cancel = cancelCallback;
	}
	create(game){
		var caption = new LevelName({
			game,
			rect: this.main.params.fieldRect.clone().scale(1, 0.1),
			locale: this.main.locale,
			name: this.levelData.name,
			num: this.levelData.num,
		})

		var field = new Field(
			game, 
			game.world, 
			this.main.params.fieldRect,
			this.main,
			this.levelData, 
			this.success
		);
		var sidebar = new Sidebar(
			game, 
			game.world, 
			[
				{
					key: "undo",
					cb: () => field.undo()
				},
				{
					key: "restart",
					cb: () => field.restart()
				},
				{
					key: "cancel",
					cb: this.cancel
				},
				{
					key: "menu",
					cb: () => this.main.settings.open()
				}
			],
			this.main.params.sidebarButtonSize,
			this.main.params.sidebarOuterSize
		);
	}
}

const s = 48;
const Point = Phaser.Point;

function deepEqual(o1, o2){ //plain objects only
	if(typeof o1 != typeof o2){
		return false;
	}
	let result = true;
	if(typeof o1 == "object"){
		var o2keys = Object.keys(o2);
		for(let key of Object.keys(o1)){
			let i = o2keys.indexOf(key);
			if(i == -1){
				return false;
			}
			o2keys.splice(i, 1);
			if(!deepEqual(o1[key], o2[key])){
				return false;
			}
		}
		return !o2keys.length;
	}else{
		return o1 == o2;
	}
}

class Field{
	constructor(game, parentGroup, rect, main, data, cb){
		this.game = game;
		this.data = data;
		this.s = s;
		this.main = main;
		this.cb = cb;

		this.UP = new Point(0, 1);
		this.DOWN = new Point(0, -1);
		this.RIGHT = new Point(1, 0);
		this.LEFT = new Point(-1, 0);
		this.NULL = new Point(0, 0);
		this.VOID = [{body: "solid"}];
		this.DIRECTIONS = [this.UP, this.RIGHT, this.DOWN, this.LEFT];

		parentGroup = parentGroup || game.world;
		rect = rect || game.world.bounds;
		this.g = game.add.group(parentGroup);
		this.g.position.x = rect.x;
		this.g.position.y = rect.y;

		this.tilesGroup = game.add.group(this.g);
		this.tiles = [];

		this.width = data.width;
		this.height = data.height;

		for(let x = 0; x < data.width; x++){
			for(let y = 0; y < data.height; y++){
				this.tiles.push(new Tile(game, this.tilesGroup, s, {x, y}));
			}
		}
		this.g.alignIn(rect, Phaser.CENTER);

		this.floorGroup = game.add.group(this.g);
		this.wallGroup = game.add.group(this.g);
		this.solidGroup = game.add.group(this.g);
		this.objects = [];
		this.walls = [];
		this.removedObjects = [];

		this.populate(data);

		this.history = [];

		this.msgBox = new MsgBox(
			game, 
			parentGroup, 
			new Phaser.Rectangle(
				rect.x + rect.width/4,
				rect.y + rect.height/4,
				rect.width/2,
				rect.height/2
			),
			main.locale
		);		
	}

	populate(data){
		data.objects.forEach(objectData => {
			var O = objectConstructors[objectData.type];
			var obj = new O(
				{
					game: this.game, 
					group: this.game.world,
					s: this.s,
					main: this.main
				}, 
				objectData,
				this
			)
			var group;
			if(obj.body == "floor"){
				group = this.floorGroup;
			}else if(obj.body == "wall"){
				group = this.wallGroup;
			}else{
				group = this.solidGroup;
			}
			obj.setGroup(group);
			if(obj.body == "wall"){
				this.walls.push(obj);
			}else{
				this.objects.push(obj);
			}
		});
	}
	undo(){
		if(!this.history.length){
			return;
		}

		this.objects.forEach(o => o.destroy());
		this.objects = [];
		this.walls.forEach(w => w.destroy());
		this.walls = [];

		this.populate(this.history.pop());
	}
	restart(){
		if(!this.history.length){
			return;
		}
		this.objects.forEach(o => o.destroy());
		this.objects = [];
		this.walls.forEach(w => w.destroy());
		this.walls = [];

		this.populate(this.history[0]);
		this.history = [];
	}
	getLevelData(){
		var result = {
			width: this.width,
			height: this.height
		};
		result.objects = [
			...this.objects,
			...this.walls
		].map(o => o.plainObject());
		return result;
	}
	showMessage(text){
		return this.msgBox.show(text);
	}

	objectsAt(p){
		if(p.x < 0 || p.y < 0 || p.x >= this.data.width || p.y >= this.data.height){
			return this.VOID;
		}
		var result = this.objects.filter(o => p.equals(o.position));
		return result;
	}

	objectsMovingTo(p){
		return this.objects.filter(o => o.nextPosition && p.equals(o.nextPosition));
	}

	wallBetween(p1, p2){
		var p = Point.interpolate(p1, p2, 0.5);
		var walls = this.walls.filter(o => o.position.equals(p));
		if(walls.length > 1){
			throw new Error("dafuq?");
		}else{
			return walls[0];
		}
	}

	inDirection(pos, dir, cb){
		var objects;
		while(objects != this.VOID){
			pos = Point.add(pos, dir);
			objects = this.objectsAt(pos);
			objects.forEach(o => cb(o));
		}
	}

	inAllDirections(pos, cb){
		this.DIRECTIONS.forEach(dir => {
			this.inDirection(pos, dir, o => cb(o, dir));
		});
	}

	step(){
		//call onEnter callbacks
		this.objects.filter(o => o.justMoved).forEach(o => {
			var collidingObjects = this.objectsAt(o.position);
			collidingObjects.forEach(o2 => {
				if(o2.onEnter){
					o2.onEnter(o);
				}
			});
		});

		var movingObjects = this.objects.filter(o => o.moving);
		movingObjects.forEach(o => o.plan());

		//detect wall collision
		var bumpingIntoWalls = [];
		movingObjects.forEach(o => {
			var wall = this.wallBetween(o.position, o.nextPosition);
			if(wall){
				bumpingIntoWalls.push(o);
			}
		});

		movingObjects = movingObjects.filter(o => !bumpingIntoWalls.includes(o));
		bumpingIntoWalls.forEach(o => o.bump());

		while(movingObjects.length){
			let stack = [movingObjects[0]];
			let canMove = false;
			while(true){
				let movingTo = this.objectsMovingTo(stack[0].nextPosition)
					.filter(o => (o.body == "solid") && (o != stack[0]));

				if(movingTo.length > 0){
					stack = stack.concat(movingTo);
					break;
				}

				let objs = this.objectsAt(stack[0].nextPosition).filter(o => o.body == "solid");
				if(objs.length > 1){
					throw new Error("Unhandled collision");
				}
				let o = objs[0];
				if(!o || o.willMoveAway){
					canMove = true;
					break;
				}
				if(!o.nextPosition || stack.includes(o)){
					break;
				}
				stack.unshift(o);
			}
			if(canMove){
				stack.forEach(o => o.move());
			}else{
				stack.forEach(o => o.bump());
			}
			movingObjects = movingObjects.filter(o => !stack.includes(o));
		}
		return this.execute();
	}

	execute(){
		var allObjects = [...this.objects, ...this.removedObjects];
		if(allObjects.some(o => o.command)){
			allObjects.forEach(o => o.execute());
			return true;
		}else{
			return false;
		}
	}

	async process(){
		this.processInput(false);
		var data = this.getLevelData();

		var i = 42;
		while(this.step() && i--){}
		await Promise.all(this.objects.concat(this.removedObjects).map(o => o.play()));
		this.removedObjects.forEach(o => o.destroy());
		this.removedObjects = [];
		if(this.checkWinCondition()){
			await this.showMessage("you_win");
			this.cb();
		}
		var newData = this.getLevelData();
		if(!deepEqual(data, newData)){
			this.history.push(data);
		}
		this.processInput(true);
	}

	remove(o){
		this.objects = this.objects.filter(o2 => o2 != o);
		this.removedObjects.push(o);
	}

	processInput(active){
		this.objects.forEach(o => o.onClick && (o.onClick.active = active));
	}
	checkWinCondition(){
		return !this.objects.some(o => o.type == "omega");
	}
}

function Tile(game, group, S, {x, y}){
	var img = game.add.image(x*S, y*S, "tile", null, group);
	img.width = img.height = S;
}

export default LevelState;