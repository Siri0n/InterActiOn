export default class Locale{
	constructor(languages, defaultLanguage){
		this.languages = languages;
		this.defaultLanguage = defaultLanguage;
		this.current = defaultLanguage;
		this.onSwitch = new Phaser.Signal();
	}
	switch(lang){
		if(!this.languages[lang]){
			lang = this.defaultLanguage;
		}
		if(lang != this.current){
			this.current = lang;
			this.onSwitch.dispatch(lang);
		}
	}
	get(key){
		return this.languages[this.current][key];
	}
}