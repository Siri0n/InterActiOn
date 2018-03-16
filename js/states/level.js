import MsgBox from "./components/msgBox";
import Sidebar from "./components/sidebar";
import objectConstructors from "./components/objectConstructors";

class LevelState extends Phaser.State{
	init(main, levelData, successCallback, cancelCallback){
		this.main = main;
		this.levelData = levelData;
		this.success = successCallback;
		this.cancel = cancelCallback;
	}
	create(game){
		var field = new Field(
			game, 
			game.world, 
			this.main.params.fieldRect, 
			this.levelData, 
			this.success
		);
		var sidebar = new Sidebar(
			game, 
			game.world, 
			[
				{
					key: "restart",
					cb: () => this.main.restart(this.levelData, this.success, this.cancel)
				},
				{
					key: "cancel",
					cb: this.cancel
				},
				{
					key: "menu",
					cb: () => this.main.goToMenu()
				}
			],
			this.main.params.sidebarButtonSize,
			this.main.params.sidebarOuterSize
		);
	}
	preload(game){
		game.load.image("tile", "resources/tile.png");

		game.load.image("alpha", "resources/alpha.png");
		game.load.image("omega", "resources/omega.png");
		game.load.image("plus", "resources/plus.png");
		game.load.spritesheet("power", "resources/power_.png", 128, 128);

		game.load.image("msg-bg", "resources/msg-bg.png");
		game.load.spritesheet("restart", "resources/restart.png", 128, 128);
		game.load.spritesheet("cancel", "resources/cancel.png", 128, 128);
		game.load.spritesheet("menu", "resources/menu-button.png", 128, 128);

	}

}

const s = 32;
const Point = Phaser.Point;

function Field(game, parentGroup, rect, data, cb){
	const self = this;

	const UP = this.UP = new Point(0, 1);
	const DOWN = this.DOWN = new Point(0, -1);
	const RIGHT = this.RIGHT = new Point(1, 0);
	const LEFT = this.LEFT = new Point(-1, 0);
	const NULL = this.NULL = new Point(0, 0);
	const VOID = this.VOID = [{body: "solid"}];

	const DIRECTIONS = [this.UP, this.RIGHT, this.DOWN, this.LEFT];
	const IS_SOLID = o => o.body == "solid";

	parentGroup = parentGroup || game.world;
	rect = rect || game.world.bounds;
	var g = this.g = game.add.group(parentGroup);
	g.position.x = rect.x;
	g.position.y = rect.y;
	var tilesGroup = game.add.group(g);
	var tiles = [];
	for(let x = 0; x < data.width; x++){
		for(let y = 0; y < data.height; y++){
			tiles.push(new Tile(game, tilesGroup, s, {x, y}));
		}
	}
	g.alignIn(rect, Phaser.CENTER);


	var floorGroup = game.add.group(g);
	var solidGroup = game.add.group(g);
	var objects = [];
	var removedObjects = [];
	var winFlag = false;

	data.objects.forEach(o => {
		var O = objectConstructors[o.type];
		objects.push(
			new O(
				{
					game, 
					group: O.floor ? floorGroup : solidGroup,
					s
				}, 
				o,
				self
			)
		);
	})

	const msgBox = new MsgBox(
		game, 
		parentGroup, 
		new Phaser.Rectangle(
			rect.x + rect.width/4,
			rect.y + rect.height/4,
			rect.width/2,
			rect.height/2
		)
	);

	this.showMessage = function(text){
		return msgBox.show(text);
	}

	this.objectsAt = function(p){
		if(p.x < 0 || p.y < 0 || p.x >= data.width || p.y >= data.height){
			return self.VOID;
		}
		var result = objects.filter(o => o.position.equals(p));
		return result;
	}

	this.inDirection = function(pos, dir, cb){
		var objects;
		while(objects != self.VOID){
			pos = Point.add(pos, dir);
			objects = self.objectsAt(pos);
			objects.forEach(o => cb(o));
		}
	}

	this.inAllDirections = function(pos, cb){
		DIRECTIONS.forEach(dir => {
			self.inDirection(pos, dir, o => cb(o, dir));
		});
	}

	function step(movingObjects){
		var movingObjects = objects.filter(o => o.moving());
		if(!movingObjects.length){
			return false;
		}
		movingObjects.forEach(o => o.plan());
		var movedObjects = [];
		while(movingObjects.length){
			let stack = [movingObjects[0]];
			let canMove = false;
			while(true){
				let objs = self.objectsAt(stack[0].nextPosition).filter(IS_SOLID);
				if(objs.length > 1){
					throw new Error("Unhandled collision");
				}
				let o = objs[0];
				if(!o){
					canMove = true;
					break;
				}
				if(!o.nextPosition){
					break;
				}
				if(stack.includes(o)){
					break;
				}
				stack.unshift(o);
			}
			if(canMove){
				stack.forEach(o => {
					o.move();
					movedObjects.push(o);

				});
			}else{
				stack.forEach(o => o.bump());
			}
			movingObjects = movingObjects.filter(o => !stack.includes(o));
		}
		movedObjects.forEach(o => {
			var collidingObjects = self.objectsAt(o.position);
			var solidObjects = collidingObjects.filter(IS_SOLID);
			if(solidObjects.length > 1){
				throw new Error("Unhandled collision");
			}
			collidingObjects.forEach(o2 => {
				o2.onEnter && o2.onEnter(o);
			});
		});
		return true;
	}

	this.process = async function(){
		g.ignoreChildInput = true;
		var i = 42;
		while(step() && i--){}
		await Promise.all(objects.concat(removedObjects).map(o => o.play()));
		removedObjects.forEach(o => o.destroy());
		removedObjects = [];
		g.ignoreChildInput = false;
		if(winFlag){
			await this.showMessage("You win!");
			cb();
		}
	}

	this.remove = function(o){
		objects = objects.filter(o2 => o2 != o);
		removedObjects.push(o);
	}

	this.win = function(){
		winFlag = true;
	}
}


function Tile(game, group, S, {x, y}){
	var img = game.add.image(x*S, y*S, "tile", null, group);
	img.width = img.height = S;
}

export default LevelState;