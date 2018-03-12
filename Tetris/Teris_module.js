/**
 * Created by Administrator on 2017/6/23 0023.
 */
//board 的大小为400*600 每个方块大小为40*40 边框1px 宽度38px 高度38px
//位置的表示为格子的左上角到board左上角的距离 与canvas类似
/* ----------->x
 | 0 1 2 3.... 9|
 | .            |
 | .            |
 | .            |
 | .            |
 |_14___________|

 */

const width   = 40,
       height  = 40,
       rate    = 300;

//board记录每个各自的位置
var Board = [];
for(let i = 0; i < 10; i++) {
    Board.push([]);
    for(let j = 0; j < 15; j++) {
        Board[i][j] = 0;
    }
}



//Some questions: game和shape之间没有解耦 在shape函数中直接应用了game
//基类
function Shape() {
    this.timer = null;
}

Shape.prototype = {
    init: function () {
        if(this.gameover()) {
            game.end();
        } else {
            for (let i = 0; i < 4; i++) {
                let bk = document.createElement('div');
                bk.className = 'block';
                bk.style.top = this.pos[i].y * height + 'px';
                bk.style.left = this.pos[i].x * width + 'px';
                bk.style.background = this.color;
                document.getElementById('board').appendChild(bk);
                Board[this.pos[i].x][this.pos[i].y] = bk;//Board 上的位置和 this.pos中相对应
                this.pos[i].block = bk;
            }
            this.animate();
        }
    },

    //自由下落.
    movedown: function () {
        let new_pos = [];
        this.pos.forEach( item => {
            new_pos.push({
                x: item.x,
                y: item.y + 1
            });
            Board[item.x][item.y] = 0;
        });
        //detect collision
        if(this.detectCollision(new_pos)) {
            clearInterval(this.timer);
            this.pos.forEach( item => {
                //回退
                Board[item.x][item.y] = item.block;
            });
            game.moving = null;
            game.eliminate();
            game.generateNewBlock();
        } else {
            new_pos.forEach( (item, i) => {
                this.pos[i].x = item.x;
                this.pos[i].y = item.y;
                this.pos[i].block.style.left = width * item.x + 'px';
                this.pos[i].block.style.top  = height * item.y +'px';
                Board[item.x][item.y] = this.pos[i].block;
            });
        }
    },

    moveleft: function () {
        let new_pos = [];
        this.pos.forEach( item => {
            new_pos.push({
                x: item.x - 1,
                y: item.y
            });
            Board[item.x][item.y] = 0;
        });
        //detect collision
        if(this.detectCollision(new_pos)) {
            this.pos.forEach( item => {
                //回退
                Board[item.x][item.y] = item.block;
            });
        } else {
            new_pos.forEach( (item, i) => {
                this.pos[i].x = item.x;
                this.pos[i].y = item.y;
                this.pos[i].block.style.left = width * item.x + 'px';
                this.pos[i].block.style.top  = height * item.y +'px';
                Board[item.x][item.y] = this.pos[i].block;
            });
        }
    },

    moveright: function () {
        let new_pos = [];
        this.pos.forEach( item => {
            new_pos.push({
                x: item.x + 1,
                y: item.y
            });
            Board[item.x][item.y] = 0;
        });
        //detect collision
        if(this.detectCollision(new_pos)) {
            this.pos.forEach( item => {
                //回退
                Board[item.x][item.y] = item.block;
            });
        } else {
            new_pos.forEach( (item, i) => {
                this.pos[i].x = item.x;
                this.pos[i].y = item.y;
                this.pos[i].block.style.left = width * item.x + 'px';
                this.pos[i].block.style.top  = height * item.y +'px';
                Board[item.x][item.y] = this.pos[i].block;
            });
        }
    },


    detectCollision: function (pos) {
        for(let i = 0; i < pos.length ;i++) {
            if(pos[i].y >= 15 || pos[i].x < 0|| pos[i].x >=10 || Board[pos[i].x][pos[i].y] !== 0) {
                return true;
            }
        }
        return false;
    },

    animate: function () {
        this.timer = setInterval( () => {
            this.movedown();
        }, rate);
    },
    
    gameover: function () {
        for(let i = 0; i < this.pos.length; i++) {
            if(Board[this.pos[i].x][this.pos[i].y] !== 0)
                return true;
        }
        return false;
    }
}


/*********************************************************************************************
Line
 ********************************************************************************************** */
//Line: [][][][]
function Line() {
    this.pos = [
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 5, y: 0},
        {x: 6, y: 0}
    ];
    this.color = '#1beaff';
    //0: [][][][]
    //1:  []
    //    []
    //    []
    //    []
    this.status = 0;
    this.init();
}
Line.prototype = new Shape();
/*
 [0][1][2][3]      []
  =>               []
     []            []
     []            []
     []            =>
     []          [][][][]
 */
Line.prototype.rotate = function () {
    let new_pos = [];
    if(this.status === 0) {
        let base_x = this.pos[2].x,
            base_y = this.pos[2].y;
        for(let i = 0; i < 4; i++) {
            new_pos.push({
                x: base_x,
                y: base_y + i
            });
            Board[this.pos[i].x][this.pos[i].y] = 0;
        }
        //不能在这个位置旋转
        if(this.detectCollision(new_pos)) {
            this.pos.forEach( item => {
                Board[item.x][item.y] = item.block;
            })
        } else {
            new_pos.forEach( (item, i) => {
                this.pos[i].x = item.x;
                this.pos[i].y = item.y;
                this.pos[i].block.style.left = width * item.x + 'px';
                this.pos[i].block.style.top  = height * item.y +'px';
                Board[item.x][item.y] = this.pos[i].block;
            });
            this.status = 1;
        }
    } else {
        let base_x = this.pos[2].x,
            base_y = this.pos[2].y;
        for(let i = 0; i < 4; i++) {
            new_pos.push({
                x: base_x + i - 2,
                y: base_y
            });
            Board[this.pos[i].x][this.pos[i].y] = 0;
        }
        //不能在这个位置旋转
        if(this.detectCollision(new_pos)) {
            this.pos.forEach( item => {
                Board[item.x][item.y] = item.block;
            })
        } else {
            new_pos.forEach( (item, i) => {
                this.pos[i].x = item.x;
                this.pos[i].y = item.y;
                this.pos[i].block.style.left = width * item.x + 'px';
                this.pos[i].block.style.top  = height * item.y +'px';
                Board[item.x][item.y] = this.pos[i].block;
            });
            this.status = 0;
        }
    }
    
}



/*********************************************************************************************
Cube
 ********************************************************************************************** */

//cube [][]
//     [][]
function Cube() {
    this.pos = [
        {x: 4, y: 0},
        {x: 5, y: 0},
        {x: 4, y: 1},
        {x: 5, y: 1}
    ];
    this.color = '#fcffab';
    this.init();
}
Cube.prototype = new Shape();
Cube.prototype.rotate = ( () => {
    console.log('HaHa, it cannt rotate.');
});


/*********************************************************************************************
T
 ********************************************************************************************** */
//T  []
// [][][]
function T() {
    this.pos = [
        {x: 4, y: 0},
        {x: 3, y: 1},
        {x: 4, y: 1},
        {x: 5, y: 1}
    ];
    this.color = '#ffa3e5';
    /*
    0:    [0]
       [1][2][3]

   1:    [0]
         [2][3]
         [1]

   2:  [0][2][3]
          [1]

   3:     [3]
      [0][2]
         [1]
     */
    this.status = 0;
    this.init();
}
T.prototype = new Shape();
T.prototype.rotate = function () {
    let new_pos = [];
    switch (this.status) {
        case 0:
            this.pos.forEach( item => {
                new_pos.push({
                    x: item.x,
                    y: item.y
                })
                Board[item.x][item.y] = 0;
            });
            new_pos[1].x++;
            new_pos[1].y++;

            //不能在这个位置旋转
            if(this.detectCollision(new_pos)) {
                this.pos.forEach( item => {
                    Board[item.x][item.y] = item.block;
                })
            } else {
                new_pos.forEach( (item, i) => {
                    this.pos[i].x = item.x;
                    this.pos[i].y = item.y;
                    this.pos[i].block.style.left = width * item.x + 'px';
                    this.pos[i].block.style.top  = height * item.y +'px';
                    Board[item.x][item.y] = this.pos[i].block;
                });
                this.status = 1;
            }

            break;
        case 1:
            this.pos.forEach( item => {
                new_pos.push({
                    x: item.x,
                    y: item.y
                })
                Board[item.x][item.y] = 0;
            });
            new_pos[0].x--;
            new_pos[0].y++;

            //不能在这个位置旋转
            if(this.detectCollision(new_pos)) {
                this.pos.forEach( item => {
                    Board[item.x][item.y] = item.block;
                })
            } else {
                new_pos.forEach( (item, i) => {
                    this.pos[i].x = item.x;
                    this.pos[i].y = item.y;
                    this.pos[i].block.style.left = width * item.x + 'px';
                    this.pos[i].block.style.top  = height * item.y +'px';
                    Board[item.x][item.y] = this.pos[i].block;
                });
                this.status = 2;
            }
            break;
        case 2:
            this.pos.forEach( item => {
                new_pos.push({
                    x: item.x,
                    y: item.y
                })
                Board[item.x][item.y] = 0;
            });
            new_pos[3].x--;
            new_pos[3].y--;

            //不能在这个位置旋转
            if(this.detectCollision(new_pos)) {
                this.pos.forEach( item => {
                    Board[item.x][item.y] = item.block;
                })
            } else {
                new_pos.forEach( (item, i) => {
                    this.pos[i].x = item.x;
                    this.pos[i].y = item.y;
                    this.pos[i].block.style.left = width * item.x + 'px';
                    this.pos[i].block.style.top  = height * item.y +'px';
                    Board[item.x][item.y] = this.pos[i].block;
                });
                this.status = 3;
            }
            break;
        case 3:
            this.pos.forEach( item =>{
                Board[item.x][item.y] = 0;
            });
            new_pos.push({
                x: this.pos[0].x + 1,
                y: this.pos[0].y - 1
            });
            new_pos.push({
                x: this.pos[1].x - 1,
                y: this.pos[1].y - 1
            });
            new_pos.push({
                x: this.pos[2].x,
                y: this.pos[2].y
            });
            new_pos.push({
                x: this.pos[3].x + 1,
                y: this.pos[3].y + 1
            });

            //不能在这个位置旋转
            if(this.detectCollision(new_pos)) {
                this.pos.forEach( item => {
                    Board[item.x][item.y] = item.block;
                })
            } else {
                new_pos.forEach( (item, i) => {
                    this.pos[i].x = item.x;
                    this.pos[i].y = item.y;
                    this.pos[i].block.style.left = width * item.x + 'px';
                    this.pos[i].block.style.top  = height * item.y +'px';
                    Board[item.x][item.y] = this.pos[i].block;
                });
                this.status = 0;
            }
            break;
    }
}

/*********************************************************************************************
L
 ********************************************************************************************** */

//L []
//  []
//  [][]
function L() {
    this.pos = [
        {x: 4, y: 0},
        {x: 4, y: 1},
        {x: 4, y: 2},
        {x: 5, y: 2}
        ];
    this.color = '#ffb71b';
    //0:  [0]
    //    [1]
    //    [2][3]
    //
    //1:   [2][3][0]
    //     [1]
    //
    //2:    [3][2]
    //         [0]
    //        [1]
    //
    //3:          [0]
    //      [1][3][2]
    this.status = 0;
    this.init();
}
L.prototype = new Shape();
L.prototype.rotate = function () {
    let new_pos = [];
    this.pos.forEach( item => {
        new_pos.push({
            x: item.x,
            y: item.y
        });
        Board[item.x][item.y] = 0;
    })
    
    switch (this.status) {
        case 0:
            new_pos[0].x += 2 ;
            new_pos[0].y += 2 ;
            new_pos[1].y += 2 ;
            
            if(this.detectCollision(new_pos)) {
                this.pos.forEach( item => {
                    Board[item.x][item.y] = item.block;
                })
            } else {
                new_pos.forEach((item, i) => {
                    this.pos[i].x = item.x;
                    this.pos[i].y = item.y;
                    this.pos[i].block.style.left = width * item.x + 'px';
                    this.pos[i].block.style.top = height * item.y + 'px';
                    Board[item.x][item.y] = this.pos[i].block;
                });
                this.status = 1;
            }
            break;
        case 1:
            new_pos[0].x -= 2 ;
            new_pos[0].y += 1 ;
            new_pos[1].y += 1 ;
            new_pos[3].x -= 2 ;

            if(this.detectCollision(new_pos)) {
                this.pos.forEach( item => {
                    Board[item.x][item.y] = item.block;
                })
            } else {
                new_pos.forEach((item, i) => {
                    this.pos[i].x = item.x;
                    this.pos[i].y = item.y;
                    this.pos[i].block.style.left = width * item.x + 'px';
                    this.pos[i].block.style.top = height * item.y + 'px';
                    Board[item.x][item.y] = this.pos[i].block;
                });
                this.status = 2;
            }

            break;
        case 2:
            new_pos[0].y -= 2 ;
            new_pos[1].x -= 2 ;
            new_pos[1].y -= 2 ;

            if(this.detectCollision(new_pos)) {
                this.pos.forEach( item => {
                    Board[item.x][item.y] = item.block;
                })
            } else {
                new_pos.forEach((item, i) => {
                    this.pos[i].x = item.x;
                    this.pos[i].y = item.y;
                    this.pos[i].block.style.left = width * item.x + 'px';
                    this.pos[i].block.style.top = height * item.y + 'px';
                    Board[item.x][item.y] = this.pos[i].block;
                });
                this.status = 3;
            }

            break;
        case 3:
            new_pos[0].y -= 1 ;
            new_pos[1].x += 2 ;
            new_pos[1].y -= 1;
            new_pos[3].x += 2 ;

            if(this.detectCollision(new_pos)) {
                this.pos.forEach( item => {
                    Board[item.x][item.y] = item.block;
                })
            } else {
                new_pos.forEach((item, i) => {
                    this.pos[i].x = item.x;
                    this.pos[i].y = item.y;
                    this.pos[i].block.style.left = width * item.x + 'px';
                    this.pos[i].block.style.top = height * item.y + 'px';
                    Board[item.x][item.y] = this.pos[i].block;
                });
                this.status = 0;
            }

            break;
    }
}
/*********************************************************************************************
X
********************************************************************************************** */
//X   [][]
//  [][]
function X() {
    this.pos = [
        {x: 4, y: 0},
        {x: 5, y: 0},
        {x: 5, y: 1},
        {x: 6, y: 1}
        ];
    this.color = '#02ff53';
    /*
    0:   [0][1]
            [2][3]

     1:     [0]
         [2][3]
         [1]

     */
    this.status = 0;
    this.init();
}
X.prototype = new Shape();
X.prototype.rotate = function () {
    let new_pos = [];
    switch (this.status) {
        case 0:
            this.pos.forEach( item => {
                new_pos.push({
                    x: item.x,
                    y: item.y
                })
                Board[item.x][item.y] = 0;
            });
            new_pos[0].x += 2;
            new_pos[1].y += 2;

            if(this.detectCollision(new_pos)) {
                this.pos.forEach( item => {
                    Board[item.x][item.y] = item.block;
                })
            } else {
                new_pos.forEach( (item, i) => {
                    this.pos[i].x = item.x;
                    this.pos[i].y = item.y;
                    this.pos[i].block.style.left = width * item.x + 'px';
                    this.pos[i].block.style.top  = height * item.y +'px';
                    Board[item.x][item.y] = this.pos[i].block;
                });
                this.status = 1;
            }

            break;
        case 1:
            this.pos.forEach( item => {
                new_pos.push({
                    x: item.x,
                    y: item.y
                })
                Board[item.x][item.y] = 0;
            });
            new_pos[0].x -= 2;
            new_pos[1].y -= 2;
            if(this.detectCollision(new_pos)) {
                this.pos.forEach( item => {
                    Board[item.x][item.y] = item.block;
                })
            } else {
                new_pos.forEach( (item, i) => {
                    this.pos[i].x = item.x;
                    this.pos[i].y = item.y;
                    this.pos[i].block.style.left = width * item.x + 'px';
                    this.pos[i].block.style.top  = height * item.y +'px';
                    Board[item.x][item.y] = this.pos[i].block;
                });
                this.status = 0;
            }

            break;
    }
}
