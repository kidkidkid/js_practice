/**
 * Created by Administrator on 2017/6/23 0023.
 */

var blocks = [];
const rate = 100;

/*
Directions:
0: Up
1: Right
2: Down
3: Left
 */

function initBlock() {
    for(let i = 0; i < 40; i++) {
        blocks.push([]);
        for(let j = 0; j < 40; j++) {
            blocks[i][j] = 0;
        }
    }
}

function generateBlock() {
    while (true){
        let x = Math.floor(Math.random() * 40),
            y = Math.floor(Math.random() * 40);
        if(blocks[x][y] === 0) {
            return {
                x: x,
                y: y,
                color: randomColor(),
                stops: []
            };
        }
    }
}

function randomColor() {
    let num = Math.floor(Math.random() * 0xffffff).toString(16);
    while(num.length < 6) {
        num += '0';
    }
    return '#' + num;
}

function Snake() {
    this.head = generateBlock();
    this.food = generateBlock();
    this.body = [this.head];
    this.timer = null;
    this.change = false;//在一个rate时间内只能改变一次
    this.init();
}

Snake.prototype = {
    init: function () {
        this.head.direction = Math.floor(Math.random() * 4);
        this.draw();
        this.move();
        /*
        37: left
        38: up
        39: right
        40: down
         */
        document.onkeydown = (event) => {
            switch (event.keyCode) {
                case 37:
                    if (this.change | this.head.direction === 1 || this.head.direction === 3) break;
                    else {
                        this.head.direction = 3;
                        this.addstop({
                            x: this.head.x,
                            y: this.head.y,
                            direction: this.head.direction
                        });
                        this.change = true;
                        break;
                    }
                case 38:
                    if(this.change || this.head.direction ===2 || this.head.direction === 0) break;
                    else {
                        this.head.direction = 0;
                        this.addstop({
                            x: this.head.x,
                            y: this.head.y,
                            direction: this.head.direction
                        });
                        this.change = true;
                        break;
                    }
                case 39:
                    if(this.change || this.head.direction === 3 || this.head.direction === 1) break;
                    else {
                        this.head.direction = 1;
                        this.addstop({
                            x: this.head.x,
                            y: this.head.y,
                            direction: this.head.direction
                        });
                        this.change = true;
                        break;
                    }
                case 40:
                    if(this.change || this.head.direction ===0 || this.head.direction === 2) break;
                    else {
                        this.head.direction = 2;
                        this.addstop({
                            x: this.head.x,
                            y: this.head.y,
                            direction: this.head.direction
                        });
                        this.change = true;
                        break;
                    }
            }
        }
    },
    draw: function () {
        let board = document.getElementById('board');
        board.innerHTML = '';
        //draw body
        this.body.forEach( item => {
            let bk = document.createElement('div');
            bk.className = 'block';
            bk.style.top = item.x * 15 + 'px';
            bk.style.left = item.y * 15 + 'px';
            bk.style.background = item.color;
            board.appendChild(bk);
        });
        //draw food
        let bk = document.createElement('div');
        bk.className = 'block';
        bk.style.top = this.food.x * 15 + 'px';
        bk.style.left = this.food.y * 15 + 'px';
        bk.style.background = this.food.color;
        board.appendChild(bk);
    },
    move: function () {
        this.timer = setInterval( () => {
            this.detectstop();
            this.detectfood();
            this.body.forEach( item => {
                let x = item.x,
                    y = item.y;
                switch (item.direction) {
                    case 0:
                        if(x - 1 < 0){
                            this.triggerfailure();
                        } else {
                            blocks[x][y] = 0;
                            blocks[x - 1][y] = 1;
                            item.x--;
                        }
                        break;
                    case 1:
                        if(y + 1 >= 40){
                            this.triggerfailure();
                        } else {
                            blocks[x][y] = 0;
                            blocks[x][y + 1] = 0;
                            item.y++;
                        }
                        break;
                    case 2:
                        if(x + 1 >= 40) {
                            this.triggerfailure();
                        } else {
                            blocks[x][y] = 0;
                            blocks[x + 1][y] = 1;
                            item.x++;
                        }
                        break;
                    case 3:
                        if(y - 1 < 0) {
                            this.triggerfailure();
                        } else {
                            blocks[x][y] = 0;
                            blocks[x][y - 1] = 1;
                            item.y--;
                        }
                        break;
                }
            })
            if(this.collideswithbody()) this.triggerfailure();
            this.timer && this.draw();
            this.change = false;
        }, rate);
    },
    //当head变方向的时候 后面的点在同一点也要做出改变
    addstop: function (stop) {
        for(let i = 1; i < this.body.length; i++) {
            let temp = this.body[i].stops;
            if(temp.length && temp[temp.length - 1].x === stop.x && temp[temp.length - 1].y === stop.y) {
                temp[temp.length - 1].direction = stop.direction;
            } else {
                this.body[i].stops.push({
                    x: stop.x,
                    y: stop.y,
                    direction: stop.direction
                });
            }
        }
    },
    //是否要转变方向
    detectstop: function () {
        for(let i = 1; i < this.body.length; i++) {
            let obj = this.body[i],
                stop = obj.stops;
            if(stop.length > 0) {
                if(obj.x === stop[0].x && obj.y === stop[0].y) {
                    obj.direction = stop[0].direction;
                    stop.shift();
                }
            }
        }
    },
    //和食物的碰撞
    detectfood: function () {
        switch (this.head.direction) {
            case 0:
                if(this.head.x -1 === this.food.x && this.head.y === this.food.y){
                    this.food.direction = this.head.direction;
                    this.body.unshift(this.food);
                    this.head = this.food;
                    this.food = generateBlock();
                }
                break;
            case 1:
                if(this.head.x === this.food.x && this.head.y + 1 === this.food.y){
                    this.food.direction = this.head.direction;
                    this.body.unshift(this.food);
                    this.head = this.food;
                    this.food = generateBlock();
                }
                break;
            case 2:
                if(this.head.x + 1 === this.food.x && this.head.y === this.food.y){
                    this.food.direction = this.head.direction;
                    this.body.unshift(this.food);
                    this.head = this.food;
                    this.food = generateBlock();
                }
                break;
            case 3:
                if(this.head.x === this.food.x && this.head.y - 1 === this.food.y){
                    this.food.direction = this.head.direction;
                    this.body.unshift(this.food);
                    this.head = this.food;
                    this.food = generateBlock();
                }
                break;
        }
    },
    collideswithbody: function() {
        let x = this.head.x,
            y = this.head.y;
        for(let i = 1; i < this.body.length; i++) {
            if(this.body[i].x === x && this.body[i].y === y) {console.log(this.body);
                return true;
            }
        }
        return false;
    },
    triggerfailure: function () {
        clearInterval(this.timer);
        this.timer = null;
        alert('DONE');
    }
};

function Game() {
    initBlock();
    var snake = new Snake();
}

Game();