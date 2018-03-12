/**
 * Created by Administrator on 2017/6/22 0022.
 */

//simple UI
(function () {
    var main          = document.getElementById('main'),
        block_width   = 40,
        block_height  = 40,
        chess_width   = 32;

    for(let i = 0; i < 14 * 14; i++) {
        let block = `<div class="block"></div>`;
        main.innerHTML += block;
    }

    for(let x = 0; x < 15; x++) {
        for(let y = 0; y < 15; y++) {
            let chess = document.createElement('div');
            chess.className = 'chess';
            chess.style.left = y * block_width - chess_width / 2 + 'px';
            chess.style.top  = x * block_height - chess_width / 2 + 'px';
            chess.x = x;
            chess.y = y;
            main.appendChild(chess);
        }
    }
}());