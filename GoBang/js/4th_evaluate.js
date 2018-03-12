/**
 * Created by Administrator on 2017/6/22 0022.
 */

function chooseBest() {
    return MinMax(4);
}

function hasNeighbor(x, y) {
    return (x > 0 && y > 0 && (TABLE[x - 1][y] || TABLE[x][y - 1] || TABLE[x - 1][y - 1]))
        || (x < 14 && y < 14 && (TABLE[x + 1][y] || TABLE[x][y + 1] || TABLE[x + 1][y + 1]))
        || (x > 0 && y < 14 && (TABLE[x][y + 1] || TABLE[x - 1][y] || TABLE[x - 1][y + 1]))
        || (x < 14 && y > 0 && (TABLE[x + 1][y] || TABLE[x + 1][y - 1] || TABLE[x][y - 1]));
}

function MinMax(deep) {
    let best = -Infinity,
        coordiante = {x: 0, y: 0},
        alpha = Infinity,
        beta  = -Infinity;

    for(let i = 0; i < 15; i++) {
        for(let j = 0; j < 15; j++) {
            if(TABLE[i][j] === 0 && hasNeighbor(i ,j)) {
                TABLE[i][j] = computer_sign;
                let temp = Min(deep - 1, alpha, beta);
                if(temp > best) {
                    best = temp;
                    coordiante.x = i;
                    coordiante.y = j;
                }
                console.log([i,j,temp]);
                TABLE[i][j] = 0;
            }
        }
    }

    return coordiante;
}


//predict people
//people always want the point less ( point equals computse's score minus person's score)
function Min(deep, alpha, beta) {
    let mini  = Infinity,
        queue = [];

    if(deep <=0 || win(TABLE)) {
        return score(TABLE, computer_sign) - score(TABLE, people_sign);
    }
    for(let i = 0; i < 15; i++) {
        for(let j = 0; j < 15; j++) {
            if(TABLE[i][j] === 0 && hasNeighbor(i, j)) {
                queue.push({x:i, y:j});
            }
        }
    }
    for(let i = 0; i < queue.length ; i++) {
        TABLE[queue[i].x][queue[i].y] = people_sign;
        let temp = Max(deep - 1, mini < alpha ? mini : alpha, beta );
        if(temp < mini) {
            mini = temp;
        }
        TABLE[queue[i].x][queue[i].y] = 0;
        if(temp < beta) break;
    }
    return mini;
}

//predict computer
//computer always wants the point higher
function Max(deep, alpha, beta) {
    let maxi = -Infinity,
        queue = [];
    if (deep <= 0 || win(TABLE)) {
        return score(TABLE, computer_sign) - score(TABLE, people_sign);
    }
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (TABLE[i][j] === 0 && hasNeighbor(i, j)) {
                queue.push({x: i, y: j});
            }
        }
    }
    for (let i = 0; i < queue.length; i++) {
        TABLE[queue[i].x][queue[i].y] = computer_sign;
        let temp = Min(deep - 1, alpha, maxi > beta ? maxi : beta);
        if (temp > maxi) {
            maxi = temp;
        }
        TABLE[queue[i].x][queue[i].y] = 0;
        if(temp > alpha) break;
    }
    return maxi;
}


/*没有经过alpha-beta剪枝  运行速率太慢

//predict people
//people always want the point less ( point equals computse's score minus person's score)
function Min(deep) {
    let mini  = Infinity,
        queue = [];

    if(deep <=0) {
        return score(TABLE, computer_sign) - score(TABLE, people_sign);
    }
    for(let i = 0; i < 15; i++) {
        for(let j = 0; j < 15; j++) {
            if(TABLE[i][j] === 0 && hasNeighbor(i, j)) {
                queue.push({x:i, y:j});
            }
        }
    }
    for(let i = 0; i < queue.length ; i++) {
        TABLE[queue[i].x][queue[i].y] = people_sign;
        let temp = Max(deep - 1);
        if(temp < mini) {
            mini = temp;
        }
        TABLE[queue[i].x][queue[i].y] = 0;
    }
    return mini;
}

//predict computer
//computer always wants the point higher
function Max(deep) {
    let point = score(TABLE, computer_sign) - score(TABLE, people_sign),
        maxi  = -Infinity,
        queue = [];
    if(deep <=0) {
        return point;
    }
    for(let i = 0; i < 15; i++) {
        for(let j = 0; j < 15; j++) {
            if(TABLE[i][j] === 0 && hasNeighbor(i, j)) {
                queue.push({x:i, y:j});
            }
        }
    }
    for(let i = 0; i < queue.length ; i++) {
        TABLE[queue[i].x][queue[i].y] = computer_sign;
        let temp = Min(deep - 1);
        if(temp > maxi) {
            maxi = temp;
        }
        TABLE[queue[i].x][queue[i].y] = 0;
    }
    return maxi;
}*/

