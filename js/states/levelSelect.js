import Sidebar from "./components/sidebar";
import LevelName from "./components/levelName";

const {Rectangle} = Phaser;

class LevelSelectState extends Phaser.State{
	init(main, levels){
		this.main = main;
		this.levels = levels;
	}
	create(game){
		this.levelSelect = new LevelSelect({
			game, 
			rect: this.main.screen.value, 
			levels: this.levels, 
			cb: i => this.main.playOne(i),
			locale: this.main.locale
		});
		this.sidebar = new Sidebar({
			game,
			buttons: [
				{
					key: "up",
					cb: () => this.levelSelect.scrollBack()
				},
				{
					key: "down",
					cb: () => this.levelSelect.scrollForward()
				},
				{
					key: "menu",
					cb: () => this.main.settings.open()
				}
			],
			buttonSize: this.main.params.sidebarButtonSize,
			outerSize: this.main.params.sidebarOuterSize
		});
		this.main.screen.onChange.add(rect => this._resize(rect));
	}
	_resize(rect){
		var mainRect, sidebarRect;
		var s = this.main.params.sidebarOuterSize
		if(rect.width > rect.height){
			mainRect = new Rectangle(
				rect.x,
				rect.y,
				rect.width - s,
				rect.height
			);
			sidebarRect = new Rectangle(
				mainRect.right,
				rect.y,
				s,
				rect.height
			)
		}else{
			mainRect = new Rectangle(
				rect.x,
				rect.y,
				rect.width,
				rect.height - s
			);
			sidebarRect = new Rectangle(
				rect.x, 
				mainRect.bottom, 
				rect.width, 
				s
			);
		}

		this.sidebar.resize(sidebarRect);
		this.levelSelect.resize(mainRect);
	}
}

export default LevelSelectState;

class LevelSelect{
	constructor({game, group = game.world, rect, levels, cb, locale}){

		this.supergroup = game.add.group(group);
		this.groups = [];
		this.buttons = [];
		levels.forEach((level, i) => {
			var groupIndex = Math.floor(i / 9);
			if(!this.groups[groupIndex]){
				this.groups[groupIndex] = game.add.group(this.supergroup);
			}
			var button = new LevelSelectButton({
				game, 
				group: this.groups[groupIndex], 
				level, 
				i, 
				cb, 
				locale
			});
			this.buttons.push(button);
		})

		this.currentScreen = 0;
		this.maxScreen = Math.ceil(levels.length / 9) - 1;
		this.game = game;
		rect && this.resize(rect);
	}
	resize(rect){
		this.rect = rect;
		var smallRect = rect.clone().scale(1/4, 1/4);
		var verySmallRect = rect.clone().scale(1/5, 1/5);
		this.buttons.forEach(button => button.resize(verySmallRect));
		this.groups.forEach(g => g.align(3, 3, smallRect.width, smallRect.height, Phaser.CENTER));
		this.supergroup.align(1, -1, rect.width, rect.height, Phaser.CENTER);
		this.supergroup.y = -this.currentScreen * rect.height;
	}
	scrollForward(){
		if(this.currentScreen == this.maxScreen){
			return;
		}
		this.currentScreen++;
		this.scroll();

	}
	scrollBack(){
		if(this.currentScreen == 0){
			return;
		}
		this.currentScreen--;
		this.scroll();
	}
	scroll(){
		this.game.add.tween(this.supergroup)
		.to(
			{
				y: - this.currentScreen * this.rect.height
			},
			500,
			Phaser.Easing.Quadratic.InOut,
			true
		);
		this.updateButtons();
	}
	updateButtons(){
		//nothing for now
	}
}

class LevelSelectButton{
	constructor({game, group, level, rect, i, cb, locale}){
		this.g = game.add.group(group);
		this.bg = game.add.tileSprite(0, 0, 0, 0, "msg-bg", null, this.g);
		this.t = new LevelName({
			game,
			group: this.g,
			locale,
			style: {
				fontSize: 15,
				align: "center"
			},
			name: level.name,
			num: level.num + ".\n"
		}); 
		this.t.g.wordWrap = true;
		this.bg.inputEnabled = true;
		this.bg.events.onInputDown.add(() => cb(i));
		rect && this.resize(rect);
	}
	resize(rect){
		this.bg.height = rect.height;
		this.bg.width = rect.width;
		this.t.g.wordWrapWidth = rect.width * 0.9;
		this.t.g.alignIn(this.bg, Phaser.CENTER);
	}
}