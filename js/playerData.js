class PlayerData{
	constructor(){

	}
	get(key, def){
		var result = window.localStorage.getItem(key);
		return (result === null) ? def : result; 
	}
	set(key, val){
		window.localStorage.setItem(key, val);
	}
	getBoolean(key, def){
		var result = this.get(key, def);
		if(result === "true"){
			return true;
		}else if(result === "false"){
			return false;
		}else{
			return !!result;
		}
	}
}

export default PlayerData;