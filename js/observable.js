class Observable{
	constructor(value, memorize){
		this.onChange = new Phaser.Signal();
		this.onChange.memorize = memorize;
		this.value = value;
	}
	get value(){
		return this._value;
	}
	set value(value){
		this._value = value;
		this.onChange.dispatch(value);
		return value;
	}
}

module.exports = Observable;