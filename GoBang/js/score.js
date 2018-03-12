/*
 * Created by Administrator on 2017/6/22 0022.
 */

/*
In the board, as we assume:
0: No Chess
1: Black Chess
2: White Chess
4: horizontal Checked (when evaluating the board)
5: vertical checked
6: diagonal1 checked
7: diagonal2 checked

Value Table(W: white, B:black)
WWWWW: 10000
WWWW : 1000
WWW  : 100
WW   : 10
W    : 1
WWWWB : 100
WWWB  : 10
WWB   : 1
WB(=W) : 1
BW..WB :0

table: [
[.....],
[.....],
......,
[.....]
]  (it's scale is [15][15])

PRESUMPTION: people  : black
             computer : white
 */

const score_table = [
    [0, 1, 10, 100, 1000, 10000],// => W....W
    [0, 1, 1, 10, 100, 1000],     // => BW...W
    [0, 0, 0, 0, 0, 0]           // =>BW..WB
];

const  computer_sign   = 2,
        people_sign     = 1;


function score(table, sign) {
    let temp = copy_table(table),
        total = 0;
    for(let x = 0; x < 15; x++) {
        for(let y = 0; y < 15; y++) {
            if(temp[x][y] !== 0 && temp[x][y] === sign) {
                let score_total = horizon(temp, x, y,sign)
                    + vertical(temp, x, y, sign)
                    + diagnoal_1(temp, x, y, sign)
                    + diagnoal_2(temp, x, y, sign);

                total += score_total;
            }
        }
    }
    return total;
}


function copy_table(table) {
    var temp = [];
    for(let i = 0; i < table.length; i++) {
        temp.push([]);
        for(let j = 0; j < table[0].length; j++) {
            temp[i][j] = table[i][j];
        }
    }
    return temp;
}


//sign: tell the object is black or white
//1:black  2:white
function vertical(table, x, y, sign) {
    let block_num = 0,
        chess_num = 1,
        tmp = x - 1;
    //  <--- left scan
    while(tmp >= 0) {
        if(table[tmp][y] !== sign) {
            table[tmp][y] !== 0 && block_num++;
            break;
        } else {
            chess_num++;
            tmp--;
        }
    }
    tmp = x + 1;
    // ---> right scan
    while(tmp <15 ) {
        if(table[tmp][y] !== sign) {
            table[tmp][y] !== 0 && block_num++;
            break;
        } else {
            chess_num++;
            tmp++;
        }
    }

    return score_table[block_num][chess_num];
}



function horizon(table, x, y, sign) {
    let block_num = 0,
        chess_num = 1,
        tmp = y - 1;
    //  <--- left scan
    while(tmp >= 0) {
        if(table[x][tmp] !== sign) {
            table[x][tmp] !== 0 && block_num++;
            break;
        } else {
            chess_num++;
            tmp--;
        }
    }
    tmp = y + 1;
    // ---> right scan
    while(tmp <15 ) {
        if(table[x][tmp] !== sign) {
            table[x][tmp] !== 0 && block_num++;
            break;
        } else {
            chess_num++;
            tmp++;
        }
    }

    return score_table[block_num][chess_num];
}

/*
 x
    x
        x
            x
 */
function diagnoal_1(table, x, y, sign) {
    let block_num = 0,
        chess_num = 1,
        tmp_x = x - 1,
        tmp_y = y - 1;
    //  <--- left-up scan
    while(tmp_x >= 0 && tmp_y >= 0) {
        if(table[tmp_x][tmp_y] !== sign) {
            table[tmp_x][tmp_y] !== 0 && block_num++;
            break;
        } else {
            chess_num++;
            tmp_x--; tmp_y--;
        }
    }
    tmp_x = x + 1;
    tmp_y = y + 1;
    // ---> right-down scan
    while(tmp_x < 15 && tmp_y < 15) {
        if(table[tmp_x][tmp_y] !== sign) {
            table[tmp_x][tmp_y] !== 0 && block_num++;
            break;
        } else {
            chess_num++;
            tmp_x++;
            tmp_y++;
        }
    }

    return score_table[block_num][chess_num];
}

/*
            x
        x
     x
  x
 */

function diagnoal_2(table, x, y, sign) {
    let block_num = 0,
        chess_num = 1,
        tmp_x = x - 1,
        tmp_y = y + 1;
    //  <--- left-up scan
    while(tmp_x >= 0 && tmp_y < 15) {
        if(table[tmp_x][tmp_y] !== sign) {
            table[tmp_x][tmp_y] !== 0 && block_num++;
            break;
        } else {
            chess_num++;
            tmp_x--;
            tmp_y++;
        }
    }
    tmp_x = x + 1;
    tmp_y = y - 1;
    // ---> right-down scan
    while(tmp_x < 15 && tmp_y >= 0) {
        if(table[tmp_x][tmp_y] !== sign) {
            table[tmp_x][tmp_y] !== 0 && block_num++;
            break;
        } else {
            chess_num++;
            tmp_x++;
            tmp_y--;
        }
    }

    return score_table[block_num][chess_num];

}

function win(Table) {
    let table = copy_table(Table);
    for (let x = 0; x < 15; x++) {
        for (let y = 0; y < 15; y++) {
            if (table[x][y] !== 0) {
                let sign = table[x][y],
                    chess_num = 1,
                    tmp_x = x - 1,
                    tmp_y = y;
                //horizontal
                //  <--- left scan
                while (tmp_x >= 0) {
                    if (table[tmp_x][tmp_y] !== sign) {
                        break;
                    } else {
                        chess_num++;
                        tmp_x--;
                    }
                }
                tmp_x = x + 1;
                // ---> right scan
                while (tmp_x < 15) {
                    if (table[tmp_x][tmp_y] !== sign) {
                        break;
                    } else {
                        chess_num++;
                        tmp_x++;
                    }
                }
                if (chess_num === 5) return true;
                //vertical
                tmp_x = x;
                tmp_y = y - 1;
                chess_num = 1;

                while (tmp_y >= 0) {
                    if (table[tmp_x][tmp_y] !== sign) {
                        break;
                    } else {
                        chess_num++;
                        tmp_y--;
                    }
                }
                tmp_y = y + 1;
                // ---> right scan
                while (tmp_y < 15) {
                    if (table[tmp_x][tmp_y] !== sign) {
                        break;
                    } else {
                        chess_num++;
                        tmp_y++;
                    }
                }

                if (chess_num === 5) return true;

                chess_num = 1;
                tmp_x = x - 1;
                tmp_y = y - 1;
                //  <--- left-up scan
                while (tmp_x >= 0 && tmp_y >= 0) {
                    if (table[tmp_x][tmp_y] !== sign) {
                        break;
                    } else {
                        chess_num++;
                        tmp_x--;
                        tmp_y--;
                    }
                }
                tmp_x = x + 1;
                tmp_y = y + 1;
                // ---> right-down scan
                while (tmp_x < 15 && tmp_y < 15) {
                    if (table[tmp_x][tmp_y] !== sign) {
                        break;
                    } else {
                        chess_num++;
                        tmp_x++;
                        tmp_y++;
                    }
                }
                if (chess_num === 5) return true;

                chess_num = 1;
                tmp_x = x - 1;
                tmp_y = y + 1;
                //  <--- left-up scan
                while (tmp_x >= 0 && tmp_y < 15) {
                    if (table[tmp_x][tmp_y] !== sign) {
                        break;
                    } else {
                        chess_num++;
                        tmp_x--;
                        tmp_y++;
                    }
                }
                tmp_x = x + 1;
                tmp_y = y - 1;
                // ---> right-down scan
                while (tmp_x < 15 && tmp_y >= 0) {
                    if (table[tmp_x][tmp_y] !== sign) {
                        break;
                    } else {
                        chess_num++;
                        tmp_x++;
                        tmp_y--;
                    }
                }
                if (chess_num === 5) return true;
            }
        }
    }
    return false;
}

var zzz= [];
for(let i = 0; i <15;i++){
    zzz.push([]);
    for(let j = 0; j < 15; j++) {
        zzz[i][j]=0;
    }
}
zzz[0][0]=zzz[0][1]=zzz[0][2]=zzz[0][3]=zzz[0][4]=1;
console.log(win(zzz));