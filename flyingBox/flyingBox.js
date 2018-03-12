/**
 * Created by Administrator on 2017/7/17 0017.
 */

function Background(context, rate) {
    this.pipes = [];
    this.pipeTimer = null;
    this.moveTimer = null;
    this.context = context;
    this.rate = rate;
    this.interval = 180 / rate * 16;
    this.init();
}

Background.prototype = {
    constructor: Background,
    init: function () {
        this.pipeTimer = setInterval(() => {
            this.pipes.push(new Pipe(this.context));
        }, this.interval);
        this.animate();
    },

    draw: function () {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        for(let i = 0; i < this.pipes.length; i++)
            this.pipes[i].draw();
    },

    move: function (distance) {
        for(let i = 0; i < this.pipes.length; i++)
            this.pipes[i].move(distance);
    },

    animate: function () {
        this.moveTimer = setInterval(() => {
            this.move(this.rate);
            this.draw();
        }, 16);
    }
};


/*
pipe: |     |
      |     |
      |     |
    ---      ---
   |           |
   ------------
 */
function Pipe(context) {
    this.up_points = [];
    this.down_points = [];
    this.height = 40;
    this.Maxwidth = 60;
    this.Minwidth = 40;
    this.context = context;
    this.init();
}

Pipe.prototype = {
    constructor: Pipe,
    init: function () {
        var up = Math.floor(Math.random() * 200) + 50,
            down = Math.floor(Math.random() * 50 + 50) + up,
            height = this.context.canvas.height,
            width = this.context.canvas.width;
        //push points to up_Pipe
        this.up_points.push({
            x: width + this.Maxwidth,
            y: up
        });
        this.up_points.push({
            x: width,
            y: up
        });
        this.up_points.push({
            x: width ,
            y: up - this.height
        });
        this.up_points.push({
            x: width  + (this.Maxwidth - this.Minwidth) / 2,
            y: up - this.height
        });
        this.up_points.push({
            x: width  + (this.Maxwidth - this.Minwidth) / 2,
            y: 0
        });
        this.up_points.push({
            x: width  + (this.Maxwidth + this.Minwidth) / 2,
            y: 0
        });
        this.up_points.push({
            x: width + (this.Maxwidth + this.Minwidth) / 2,
            y: up - this.height
        });
        this.up_points.push({
            x: width + this.Maxwidth,
            y: up - this.height
        });

        //push points to down_Pipe
        this.down_points.push({
            x: width + this.Maxwidth,
            y: down
        });
        this.down_points.push({
            x: width,
            y: down
        });
        this.down_points.push({
            x: width,
            y: down + this.height
        });
        this.down_points.push({
            x: width + (this.Maxwidth - this.Minwidth) / 2,
            y: down + this.height
        });
        this.down_points.push({
            x: width + (this.Maxwidth - this.Minwidth) / 2,
            y: height
        });
        this.down_points.push({
            x: width+ (this.Maxwidth + this.Minwidth) / 2,
            y: height
        });
        this.down_points.push({
            x: width + (this.Maxwidth + this.Minwidth) / 2,
            y: down + this.height
        });
        this.down_points.push({
            x: width + this.Maxwidth,
            y: down + this.height
        });
    },

    drawUp: function() {
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(this.up_points[0].x, this.up_points[0].y);
        for(let i = 1; i < this.up_points.length; i++)
            this.context.lineTo(this.up_points[i].x, this.up_points[i].y);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
        this.context.restore();
    },
    drawDown: function () {
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(this.down_points[0].x, this.down_points[0].y);
        for(let i = 1; i < this.up_points.length; i++)
            this.context.lineTo(this.down_points[i].x, this.down_points[i].y);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
        this.context.restore();
    },
    draw: function () {
        this.drawUp();
        this.drawDown();
    },

    move(distance) {
        for(let i = 0; i < this.up_points.length; i++) {
            this.up_points[i].x -= distance;
            this.down_points[i].x -= distance;
        }
    }
};



var board = document.getElementById("board"),
    context = board.getContext("2d");

var x = new Background(context, 3);
