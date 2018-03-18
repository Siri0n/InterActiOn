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

		game.load.image("wall", "resources/wall.png");

		game.load.spritesheet("shape", "resources/shape.png", 128, 128);
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

const s = 48;
const Point = Phaser.Point;

class Field{
	constructor(game, parentGroup, rect, data, cb){
		this.game = game;
		this.data = data;
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
		for(let x = 0; x < data.width; x++){
			for(let y = 0; y < data.height; y++){
				this.tiles.push(new Tile(game, this.tilesGroup, s, {x, y}));
			}
		}
		this.g.alignIn(rect, Phaser.CENTER);

		this.floorGroup = game.add.group(this.g);
		this.solidGroup = game.add.group(this.g);
		this.objects = [];
		this.removedObjects = [];
		
		this.winFlag = false;

		data.objects.forEach(o => {
			var O = objectConstructors[o.type];
			this.objects.push(
				new O(
					{
						game, 
						group: O.floor ? this.floorGroup : this.solidGroup,
						s
					}, 
					o,
					this
				)
			);
		});

		this.msgBox = new MsgBox(
			game, 
			parentGroup, 
			new Phaser.Rectangle(
				rect.x + rect.width/4,
				rect.y + rect.height/4,
				rect.width/2,
				rect.height/2
			)
		);		
	}

	showMessage(text){
		return this.msgBox.show(text);
	}

	objectsAt(p){
		if(p.x < 0 || p.y < 0 || p.x >= this.data.width || p.y >= this.data.height){
			return this.VOID;
		}
		var result = this.objects.filter(o => o.position.equals(p));
		return result;
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
		var movingObjects = this.objects.filter(o => o.moving);
		if(!movingObjects.length){
			return false;
		}
		movingObjects.forEach(o => o.plan());
		var movedObjects = [];
		while(movingObjects.length){
			let stack = [movingObjects[0]];
			let canMove = false;
			while(true){
				let objs = this.objectsAt(stack[0].nextPosition).filter(o => o.body == "solid");
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
			var collidingObjects = this.objectsAt(o.position);
			var solidObjects = collidingObjects.filter(o => o.body == "solid");
			if(solidObjects.length > 1){
				throw new Error("Unhandled collision");
			}
			collidingObjects.forEach(o2 => {
				o2.onEnter && o2.onEnter(o);
			});
		});
		return true;
	}

	async process(){
		this.processInput(false);
		var i = 42;
		while(this.step() && i--){}
		await Promise.all(this.objects.concat(this.removedObjects).map(o => o.play()));
		this.removedObjects.forEach(o => o.destroy());
		this.removedObjects = [];
		this.processInput(true);
		if(this.winFlag){
			await this.showMessage("You win!");
			this.cb();
		}
	}

	remove(o){
		this.objects = this.objects.filter(o2 => o2 != o);
		this.removedObjects.push(o);
	}

	processInput(active){
		this.objects.forEach(o => o.onClick && (o.onClick.active = active));
	}
	win(){
		this.winFlag = true;
	}
}

function Tile(game, group, S, {x, y}){
	var img = game.add.image(x*S, y*S, "tile", null, group);
	img.width = img.height = S;
}

export default LevelState;