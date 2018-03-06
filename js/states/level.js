import levels from "resources/levels";
import Alpha from "./components/alpha";
import Omega from "./components/omega";
import Plus from "./components/plus";

export default {
	create(game){
		var field = new Field(game, null, null, levels[0]);
	},
	preload(game){
		game.load.image("tile", "resources/tile.png");
		game.load.image("alpha", "resources/alpha.png");
		game.load.image("omega", "resources/omega.png");
		game.load.image("plus", "resources/plus.png");
	}
}

const s = 32;
const Point = Phaser.Point;

function Field(game, parentGroup, rect, data){
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


	var objectsGroup = game.add.group(g);
	var objects = [];

	data.objects.forEach(o => {
		var O = objectConstructors[o.type]
		objects.push(
			new O(
				{
					game, 
					group:objectsGroup,
					s
				}, 
				o,
				self
			)
		);
	})

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
				stack.forEach(o => o.move());
			}else{
				stack.forEach(o => o.bump());
			}
			movingObjects = movingObjects.filter(o => !stack.includes(o));
		}
		return true;
	}

	this.process = async function(){
		objectsGroup.ignoreChildInput = true;
		var i = 42;
		while(step() && i--){}
		await Promise.all(objects.map(o => o.play()));
		objectsGroup.ignoreChildInput = false;
	}
}

var objectConstructors = {
	"alpha": Alpha,
	"omega": Omega,
	"plus": Plus
}

function Tile(game, group, S, {x, y}){
	var img = game.add.image(x*S, y*S, "tile", null, group);
	img.width = img.height = S;
}