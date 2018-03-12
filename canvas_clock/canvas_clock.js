/**
 * Created by Administrator on 2017/6/1 0001.
 */

(function () {
    var context = document.getElementById("clock").getContext("2d"),
        center_x = context.canvas.width / 2,
        center_y = context.canvas.height / 2,
        inner_r = 200,
        outer_r = 220,
        space = 20,
        angle = Math.PI / 30,
        num_angle = Math.PI / 6,
        hour_length = 70,
        minute_length = 110,
        second_length = 140,
        dial;
    function drawClock() {
        //draw outer
        context.save();
        context.fillStyle = "black";
        context.shadowColor = 'black';
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowBlur = 10;
        context.beginPath();
        context.arc(center_x, center_y, inner_r, 0, Math.PI * 2, true);
        context.arc(center_x, center_y, outer_r, 0, Math.PI * 2, false);
        context.fill();
        context.restore();

        //draw  dial
        context.save();
        for(var i = 0; i < 60; i++) {
            context.beginPath();
            i % 5 === 0 ? context.moveTo(center_x + (inner_r - space) * Math.sin(angle * i), center_y - (inner_r - space) * Math.cos(angle * i)) :
                context.moveTo(center_x + (inner_r - space / 2) * Math.sin(angle * i), center_y - (inner_r - space / 2) * Math.cos(angle * i));
            context.lineTo(center_x + inner_r * Math.sin(angle * i), center_y - inner_r * Math.cos(angle * i));
            context.stroke();
        }
        context.restore();

        //draw numbers
        context.save();
        context.font = "22px bold";
        context.fillStyle = "black";
        context.shadowBlur = 4;
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.shadowColor = "black";
        context.textBaseline = "middle";
        context.textAlign = "center";
        for(i = 1; i <= 12; i++) {
            context.fillText(i.toString(), center_x + (inner_r - space * 1.5) * Math.sin(num_angle * i), center_y - (inner_r - space * 1.5) * Math.cos(num_angle * i));
        }
        context.restore();

        //draw center
        context.beginPath();
        context.arc(center_x, center_y, 5, 0, Math.PI * 2);
        context.fill();
        //draw circle text
        //start angle: PI
        //end angle: PI * 2
        var text = "God Bless you.",
            end_angle = Math.PI,
            start_angle = Math.PI * 2,
            increment = (end_angle - start_angle) / (text.length - 1);
        context.save();
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "bold 22px arial";
        for(i = 0; i < text.length; i++) {
            context.save();
            var temp = start_angle + i * increment;
            context.translate(center_x + 120 * (Math.cos(temp)), center_y - 120 * (Math.sin(temp)));
            context.rotate(Math.PI / 2 - temp);
            context.fillText(text[i], 0, 0);
            context.restore();
        }
        context.restore();
        dial = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        setInterval(drawPointer, 1000);
    }

    function drawPointer() {
        var time = new Date();
        var second = time.getSeconds();
        var minute = time.getMinutes() + second / 60;
        var hour = time.getHours() + minute / 60;

        context.putImageData(dial, 0, 0);
        //draw li
        var image = new Image();
        image.src = "li.png";
        image.onload = function () {
            context.drawImage(image, 30, 30);
        };
        //draw hour hand
        context.save();
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(center_x, center_y);
        context.lineTo(center_x + hour_length * Math.sin(Math.PI / 6 * hour), center_y - hour_length * Math.cos(Math.PI / 6 * hour));
        context.stroke();
                //draw arrow
        context.translate(center_x + hour_length * Math.sin(Math.PI / 6 * hour), center_y - hour_length * Math.cos(Math.PI / 6 * hour));
        context.rotate(- Math.PI + Math.PI / 6 * hour); //这里的rotate 整的是顺时针方向 而不是所谓的逆时针是正角

        context.beginPath();
        context.moveTo(-4, 0);
        context.lineTo(0, 10);
        context.lineTo(4, 0);
        context.fill();
        context.restore();

        //draw minute hand
        context.save();
        context.lineWidth = 3;
        context.moveTo(center_x, center_y);
        context.lineTo(center_x + minute_length * Math.sin(Math.PI / 30 * minute), center_y - minute_length * Math.cos(Math.PI / 30 * minute));
        context.stroke();
        //draw arrow
        context.translate(center_x + minute_length * Math.sin(Math.PI / 30 * minute), center_y - minute_length * Math.cos(Math.PI / 30 * minute));
        context.rotate(- Math.PI + Math.PI / 30 * minute); //这里的rotate 整的是顺时针方向 而不是所谓的逆时针是正角

        context.beginPath();
        context.moveTo(-5, 0);
        context.lineTo(0, 10);
        context.lineTo(5, 0);
        context.fill();
        context.restore();

        //draw second hand
        context.save();
        context.lineWidth = 2;
        context.moveTo(center_x, center_y);
        context.lineTo(center_x + second_length * Math.sin(Math.PI / 30 * second), center_y - second_length * Math.cos(Math.PI / 30 * second));
        context.stroke();
        //draw arrow
        context.translate(center_x + second_length * Math.sin(Math.PI / 30 * second), center_y - second_length * Math.cos(Math.PI / 30 * second));
        context.rotate(- Math.PI + Math.PI / 30 * second); //这里的rotate 整的是顺时针方向 而不是所谓的逆时针是正角

        context.beginPath();
        context.moveTo(-5, 0);
        context.lineTo(0, 10);
        context.lineTo(5, 0);
        context.fill();
        context.restore();
    }
    
    drawClock();
}());