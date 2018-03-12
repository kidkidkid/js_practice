/**
 * Created by Administrator on 2017/6/22 0022.
 */

function chooseBest() {
    var coordiante = {x: 0, y: 0};
        maxBenifit = -10000;
    //push potential chess computer can play
    for(let i = 0; i <= 14; i++) {
        for (let j = 0; j <= 14; j++) {
            if (hasNeighbor(i, j) && TABLE[i][j] === 0) {
                TABLE[i][j] = computer_sign;
                let benifit = score(TABLE, computer_sign) + simulate(people_sign);
                if(benifit > maxBenifit) {
                    coordiante.x = i;
                    coordiante.y = j;
                    maxBenifit = benifit;
                }
                TABLE[i][j] = 0;
            }
        }
    }

    return coordiante;
}

function hasNeighbor(x, y) {
   return (x > 0 && y > 0 && (TABLE[x - 1][y] || TABLE[x][y - 1] || TABLE[x - 1][y - 1]))
       || (x < 14 && y < 14 && (TABLE[x + 1][y] || TABLE[x][y + 1] || TABLE[x + 1][y + 1]))
       || (x > 0 && y < 14 && (TABLE[x][y + 1] || TABLE[x - 1][y] || TABLE[x - 1][y + 1]))
       || (x < 14 && y > 0 && (TABLE[x + 1][y] || TABLE[x + 1][y - 1] || TABLE[x][y - 1]));
}

function simulate(sign) {
    var maxBenifit = 0;
    //push potential chess computer can play
    for(let i = 0; i <= 14; i++) {
        for (let j = 0; j <= 14; j++) {
            if (hasNeighbor(i, j) && TABLE[i][j] === 0) {
                TABLE[i][j] = sign;
                let benifit = score(TABLE, people_sign);
                (benifit > maxBenifit) && (maxBenifit = benifit);
                TABLE[i][j] = 0;
            }
        }
    }
    return maxBenifit;
}
