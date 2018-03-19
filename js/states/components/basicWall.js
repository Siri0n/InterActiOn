import Wall from "./wall";

class BasicWall extends Wall{
	constructor({game, group, s}, {position}, field){
		super("wall", {game, group, s}, position);
		this.type = "wall";
	}
}

export default BasicWall;