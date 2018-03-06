class Graphics{
	onClick(f){
		this.g.events.onInputDown.add(f);
	}
	move(p){
		this.g.position.add(p.x*this.s, p.y*this.s);
	}
	stop(p){
		//NIY
	}
}

export default Graphics;