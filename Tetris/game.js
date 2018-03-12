/**
 * Created by Administrator on 2017/6/24 0024.
 */

function Game() {
    this.moving = null;
    this.score = 0;
}

Game.prototype = {
    start: function () {
        this.generateNewBlock();
        //在事件监听中注意this指向
        document.onkeydown = (e => {
            let event = e || window.event;
            switch (event.keyCode) {
                //space: rotate
                case 32:
                    this.moving && this.moving.rotate();
                    break;
                //left
                case 37:
                    this.moving && this.moving.moveleft();
                    break;
                //right
                case 39:
                    this.moving && this.moving.moveright();
                    break;
                //down faster
                case 40:
                    this.moving && this.moving.movedown();
                    break;
            }
        });
    },
    generateNewBlock: function () {console.log(5);
        switch (Math.floor(Math.random() * 5)) {
            case 0:
                this.moving = new Line();
                break;
            case 1:
                this.moving = new Cube();
                break;
            case 2:
                this.moving = new L();
                break;
            case 3:
                this.moving = new T();
                break;
            case 4:
                this.moving = new X();
                break;
        }
    },
    end: function () {
        this.moving = null;
        document.onkeydown = null;
    },
    eliminate: function () {
        let pos = this.getEliminatePos(),
            main = document.getElementById('board');
        //remove
        for(let i = 14; i >= 0; i--) {
            let index = pos.position[14 - i];
            //index是在消除之后i应该要去的位置 如果index是0 则去掉这一行
                if(i !== index && index !== 0) {
                    console.log(pos);
                    for (let j = 0; j < 10; j++) {
                        Board[j][index] = Board[j][i];
                        Board[j][index] !== 0 && (Board[j][index].style.top = parseInt(Board[j][index].style.top) + pos.depth[i] * height + 'px');
                    }
                }
                if(index === 0 && i !== 0) {
                    this.score++;
                    for(let j = 0; j < 10;j ++) {
                        main.removeChild(Board[j][i]);
                    }
                }
        }
        for(let i = pos.position[pos.position.length - 1]; i >= 0; i--) {
            for(let j = 0; j < 10; j++) {
                Board[j][i] = 0;
            }
        }

        document.getElementById('grade').innerText = this.score.toString();
    },
    getEliminatePos: function () {
        let pos = [],
            depth = [],
            depth_max = 0;
        for(var i = 14; i >= 0; i--) {
            for(var j = 0; j < 10; j++) {
                if(Board[j][i] === 0)
                    break;
            }
            if(j === 10) {
                depth_max++;
                pos.push(0);
            } else {
                pos.push(i + depth_max);
            }
            depth.push(depth_max);
        }
        return {
            position: pos,
            depth: depth
        };
    }
}

var game = new Game();
game.start();
