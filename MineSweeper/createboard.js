/**
 * Created by Administrator on 2017/7/13 0013.
 */
/*
Board:
0: good
1: mine
2: show
 */
var Board = [],
    Box  = [];
const size = 15;
const num = 30;

(function () {
    initialize();

    function initialize() {
        var board = document.getElementById("board");

        for(let i = 0; i < size * size; i++) {
            i % size === 0 && (Board.push([]), Box.push([]));
            let div = document.createElement("div");
            board.appendChild(div);
            div.pos = {
                x: Math.floor(i / size),
                y: Math.floor(i % size)
            };
            Board[Math.floor(i / size)][i % size] = 0;
            Box[Math.floor(i / size)][i % size] = div;
                div.onmouseenter = function() {
                let pos = this.pos;
                if(Board[pos.x][pos.y] !== 2) {
                    this.className = "hover";
                }
            }
            div.onmouseleave = function () {
                let pos = this.pos;
                if(Board[pos.x][pos.y] !== 2) {
                    this.className = "";
                }
            }
            div.onmousedown = function (e) {
                switch (e.button) {
                    //单击左键
                    case 0 :
                        let pos = this.pos;
                        if (Board[pos.x][pos.y] === 1) {
                            for(let i = 0; i < size; i++)
                                for(let j = 0; j < size; j++) {
                                if(Board[i][j] === 1)
                                    Box[i][j].style.background = "red";
                                }
                            alert("GAME OVER");
                        }
                        else {
                            trigger(pos.x, pos.y);

                            if(isSuccessful()) {
                                let clcok = document.getElementById("clock");
                                //alert("Time used: " + clcok.innerText);
                                clearInterval(clcok.timer);
                            }
                        }
                        break;
                    //单击右键
                    case 2:
                        (Board[this.pos.x][this.pos.y] !== 2) && (this.innerText = "×");
                        break;
                }
            }
            div.oncontextmenu = function () {
                return false;
            }
        }
        createMine();
        startClock();
    }
    
    function createMine() {
        let size = num;
        while(size > 0) {
            let x = Math.floor(Math.random() * 15),
                y = Math.floor(Math.random() * 15);
            if(Board[x][y] === 0) {
                Board[x][y] = 1;
                size--;
            }
        }
    }

    //无雷区拓展
    function trigger(x, y) {
        Board[x][y] = 2;
        let queue = [Box[x][y]];

        //把没有显示出的雷放进队列中
        //放进队列中的肯定是要显示出来的 如果周围有雷 那么显示雷数
        while(queue.length > 0) {
            let head = queue[0].pos;


            //如果[x, y]周围八个都不是雷 则可以显示
            if(countMine(head.x, head.y) === 0 ) {
                Box[head.x][head.y].style.background = "#d7dfff";
                itor(head.x, head.y, function(m ,n) {
                    Box[m][n].style.background = "#d7dfff";
                    Board[m][n] === 0 && queue.push(Box[m][n]);
                    Board[m][n] = 2;
                });
            } else {
                Box[head.x][head.y].style.background = "#d7dfff";
                Box[head.x][head.y].innerHTML = `<span>${countMine(head.x, head.y)}</span>`;
            }

            queue.shift();
        }
    }

    function countMine(x, y) {
        let count = (x > 0 && Board[x - 1][y] === 1)
            + (y > 0 && Board[x][y - 1] === 1)
            + (x < size - 1 && Board[x + 1][y] === 1)
            + (y < size - 1 && Board[x][y + 1] === 1)
            + (x > 0 && y > 0 && Board[x - 1][y - 1] === 1)
            + (x > 0 && y < size - 1 && Board[x - 1][y + 1] === 1)
            + (y > 0 && x < size - 1 && Board[x + 1][y - 1] === 1)
            + (x < size - 1 && y < size - 1 && Board[x + 1][y + 1] === 1);
        return count;
    }
    
    function itor(x, y, z) {
        x > 0 && Board[x - 1][y] === 0 && z(x - 1, y);
        y > 0 && Board[x][y - 1] === 0 && z(x, y - 1);
        x < size - 1 && Board[x + 1][y] === 0 && z(x + 1, y);
        y < size - 1 && Board[x][y + 1] === 0 && z(x, y + 1);
        x < size - 1 && y < size - 1 && Board[x + 1][y + 1] === 0 && z(x + 1, y + 1);
        x > 0 && y > 0 && Board[x - 1][y - 1] === 0 && z(x - 1, y - 1);
        x > 0 && y < size - 1 && Board[x - 1][y + 1] === 0 && z(x - 1, y + 1);
        x < size - 1 && y > 0 && Board[x + 1][y - 1] === 0 && z(x + 1, y - 1);
    }

    function startClock() {
        let clock = document.getElementById("clock"),
            start = +new Date();
        clock.timer = setInterval(() => {
            let passedTime = +new Date() - start;
            clock.innerHTML = (passedTime / 1000).toFixed(2);
        }, 50);
    }
    
    function isSuccessful() {
        for(let i = 0; i < size; i++)
            for(let j = 0; j < size; j++) {
            if(Board[i][j] === 0)
                return false;
            }
        return true;
    }

}());