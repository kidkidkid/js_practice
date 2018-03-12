/**
 * Created by Administrator on 2017/6/22 0022.
 */


function yourturn() {
    var chess = document.getElementsByClassName('chess');
    Array.prototype.forEach.call(chess, item => {
        if(!item.style.background) {
            item.onmouseover = ( () => {
                item.style.border = 'dashed 1px black';
            });

            item.onmouseout = ( () => {
                item.style.border = '';
            });

            item.onclick = function () {
                item.style.background = 'black';
                TABLE[item.x][item.y] = people_sign;
                computerturn();
            }
        }
    })
}

function computerturn() {
    var chess = document.getElementsByClassName('chess');
    Array.prototype.forEach.call(chess, item => {
        item.onmouseover = null;
        item.onmouseout  = null;
        item.onclick      = null;
    });
    let coordinate = chooseBest();console.log(coordinate);
    document.getElementsByClassName('chess')[coordinate.x * 15 + coordinate.y].style.background = "white";
    TABLE[coordinate.x][coordinate.y] = computer_sign;
    yourturn();
}

function startGame() {
    TABLE = [];
    for(let i = 0; i < 15; i++) {
        TABLE.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    TABLE[7][7] = computer_sign;
    document.getElementsByClassName('chess')[7 * 15 + 7].style.background = "white";
    yourturn();
}

//GAME START.
startGame();