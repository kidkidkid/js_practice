//classList is a Array-like Object
//el: Element
//外部是无法直接获得里面的变量的
(function(){
	var proto  = Array.prototype,
		push   = proto.push,
		join   = proto.join,
		splice = proto.splice;

	function classList(el){
		this.el = el;
		//trim and split
		var classes = this.el.className.replace(/^\s+|\s$/, "").split(" ");
		for(let i = 0; i < classes.length; i++){
			push.call(this, classes[i]);//像一个对象中push 产生类似于array的效果 
                                    	//Array.prototype.push 会产生一个length属性
		}
	}

	classList.prototype = {
		constructor: classList,
		contain: function(name){
			return this.el.className.indexOf(name) !=-1;
		},
		toString: function(){
			//return this.join(" ");  这个肯定无法实现的 this没有push函数的 只能用call调用的
			return join.call(this, " ");
		},
		add: function(name){
			if(!this.contain(name))
				push.call(this, name);
			this.el.className = this.toString();
		},
		remove: function(name){
			if(this.contain(name)){
				for(var i = 0; i < this.length; i++){
					if(this[i] == name)
						break;
				}
				splice.call(this, i, 1);
				this.el.className = this.toString();
			}
		}
	}

	window.classList = classList;

	function defineElementGetter(obj, prop, getter) {
		if (Object.defineProperty) {
			Object.defineProperty(obj, prop, {
				get: getter
			});
		} else {
			obj.__defineGetter__(prop, getter);
		}
	}	

	defineElementGetter(HTMLElement.prototype, "classList", function(){
		return new classList(this);
	})
}())


function _2048(){
	this.table = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
	this.length = 0;
	this.score = 0;
	}

_2048.prototype.random = function(){
	while(true){
		var x = parseInt(Math.random() * 4);
		var y = parseInt(Math.random() * 4);
		if(this.table[x][y] == 0){
			this.table[x][y] = 2;break;
		} 	
	}
}

_2048.prototype.show = function(){
	this.table.forEach(function(v){
		console.log(v);
	})
}

		//    x ->  - - - -
		//	  y	  | 0......
 		//		  | ....... 
		//		  | .......
		//		  | .......
		
_2048.prototype.up = function(){
	var x, y, top ,temp, flag, con = false;
	//move data to the top, then combine
	for(x = 0; x < this.table[0].length; x++){
		top = 0; flag = 0;
		for(y = 0; y < this.table.length; y++){
			if(this.table[y][x] != 0){
				(y != top) && (con = true);
				temp = this.table[y][x];
				this.table[y][x] = 0;
				this.table[top][x] = temp;
				top ++;flag++;
			}
			if(flag >= 2 && this.table[top -1][x] == this.table[top - 2][x]){
				this.table[top - 2][x] = 2 * this.table[top - 1][x];
				this.score += this.table[top - 2][x];
				this.table[top - 1][x] = 0;
				top--;
				flag = false;
				con = true;
			}
		}   	
	}
	return con;
}


_2048.prototype.bottom = function(){
	var x, y, bottom ,temp, flag, len = this.table.length, con = false;
	//move data to the top, then combine
	for(x = 0; x < this.table[0].length; x++){
		bottom = len - 1; flag = 0;
		for(y = len - 1; y >=0; y--){
			if(this.table[y][x] != 0){
				(y != bottom) && (con = true);
				temp = this.table[y][x];
				this.table[y][x] = 0;
				this.table[bottom][x] = temp;
				bottom--;flag++;
			}
			if(flag >= 2 && this.table[bottom + 1][x] == this.table[bottom + 2][x]){
				this.table[bottom + 2][x] = 2 * this.table[bottom + 1][x];
				this.score += this.table[bottom + 2][x];
				this.table[bottom + 1][x] = 0;
				bottom++;
				flag = 0;
				con = true;
			}
		}   	
	}
	return con;
}


_2048.prototype.left = function(){
	var x, y, left ,temp, flag, len = this.table.length, con = false;
	//move data to the top, then combine
	for(x = 0; x < len; x++){
		left = 0; flag = 0;
		for(y = 0; y < len; y++){
			if(this.table[x][y] != 0){
				(y != left) && (con = true);
				temp = this.table[x][y];
				this.table[x][y] = 0;
				this.table[x][left] = temp;
				left++;flag++;
			}
			if(flag >= 2 && this.table[x][left -1] == this.table[x][left - 2]){
				this.table[x][left - 2] = 2 * this.table[x][left - 1];
				this.score += this.table[x][left - 2];
				this.table[x][left - 1] = 0;
				left--;
				flag = 0;
				con = true;
			}
		}   	
	}
	return con;
}


_2048.prototype.right = function(){
	var x, y, right ,temp, flag, len = this.table.length, con = false;
	//move data to the top, then combine
	for(x = 0; x < len; x++){
		right = len - 1; flag = 0;
		for(y = len - 1; y >= 0; y--){
			if(this.table[x][y] != 0){
				(y != right) && (con = true);
				temp = this.table[x][y];
				this.table[x][y] = 0;
				this.table[x][right] = temp;
				right--;flag ++;
			}
			if(flag >= 2 && this.table[x][right + 1] == this.table[x][right + 2]){
				this.table[x][right + 2] = 2 * this.table[x][right + 1];
				this.score += this.table[x][right + 2];
				this.table[x][right + 1] = 0;
				right++;
				flag = 0;
				con = true;
			}
		}   	
	}
	return con;
}

		//true: can continue game
		//false: game is over
_2048.prototype.judge = function(){
	var len =this.table.length;
	if(this.length != 16) return true;
	for(x = 0; x < len; x++)
		for(y = 0; y < len - 1; y++){
			if(this.table[x][y] == this.table[x][y + 1]) return true;
		}
	for(x = 0; x < len; x++)
		for(y = 0; y < len - 1; y++){
			if(this.table[y][x] == this.table[y + 1][x]) return true;
		}
	return false;
}




window.onload = function(){
	var game  = new _2048();
	var grid  = document.getElementsByClassName("grid-cell");
	var score = document.getElementsByClassName("score")[0].getElementsByTagName("span")[0];
	var best  = document.getElementsByClassName("best")[0].getElementsByTagName("span")[0];
	var new_game = document.getElementsByClassName("new-start")[0];
	var contain = document.getElementsByClassName("grid")[0];
	var game_over = document.getElementById("game-over");
	var try_again = game_over.getElementsByTagName("button")[0];

	ini();

	document.onkeydown = function(event){
		var event = event || window.event;
		switch(event.keyCode){
			case 37:
				game.left() && game.random();
				show();
				break;
			case 38:
				game.up() && game.random();
				show();
				break;
			case 39:
				game.right() && game.random();
				show();
				break;
			case 40:
				game.bottom() && game.random();
				show();
			default:
				break;
		}
	}

	new_game.onclick = try_again.onclick = function(){
		delete localStorage.state;	
		ini();
	}

	function show(){
		var len = 0, num;
		for(var i = 0; i < 16; i++){
			num = game.table[parseInt(i / 4)][i & 3];
			grid[i].className = grid[i].className.replace(/\sno\w+/, "");
			grid[i].innerText = "";
			(num > 0) && (grid[i].className += " no" + num, len++, grid[i].innerText = num);
			score.innerText = game.score;
			if(localStorage.best === undefined || game.score >= localStorage.getItem("best")){
				localStorage.setItem("best", game.score);
				best.innerText = game.score;
				}
			}
			//只能store字符串
		var temp = {};
		temp.score = game.score;
		temp.grid = game.table;
		localStorage.state = JSON.stringify(temp);
		game.length = len;

		if (!game.judge()) {
			game_over.style.display = "block";
			contain.classList.add("over");
		} else {
			game_over.style.display = "none";
			contain.classList.remove("over");
		}
	}


	function ini(){
		if (localStorage.state !== undefined) {
			var temp = JSON.parse(localStorage.state);
			var bes = JSON.parse(localStorage.best);
			game.score = temp.score;
			game.table = temp.grid;
			best.innerText = bes;
			show();
		} else { 
			game = new _2048();
			game.random();
			show();
			if(localStorage.best !== undefined)
				best.innerText = localStorage.getItem("best");
		}
	}

}