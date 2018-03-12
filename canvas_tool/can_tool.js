/**
 ** Created by Administrator on 2017/5/30 0030.
 **/

/*******************************************************************************************************************
  some global functions
 *******************************************************************************************************************/
//context:canvas.getContext
//gap: stepx. stepy
function drawGrid(context, color, stepx, stepy) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = 1;
    for(var i = 0.5; i < context.canvas.width; i += stepx) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, context.canvas.height);
        context.stroke();
    }
    for(i = 0.5; i <= context.canvas.height; i += stepy) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(context.canvas.width, i);
        context.stroke();
    }
    //强迫症 把边上补齐
    context.moveTo(context.canvas.width, context.canvas.height);
    context.lineTo(0, context.canvas.height);
    context.moveTo(context.canvas.width, context.canvas.height);
    context.lineTo(context.canvas.width, 0);
    context.stroke();
    context.restore();
}

function addHandler(obj, type, func) {
    obj.addEventListener ? obj.addEventListener(type, func) : obj.attachEvent("on" + type, func);
}

function removeHandler(obj, type, func) {
    obj.removeEventListener ? obj.removeEventListener(type, func) : obj.detachEvent("on" + type, func);
}

function bind(obj, func) {
    return function() {
        func.apply(obj, arguments);
    }
}

(function () {
    var move = CanvasRenderingContext2D.prototype.moveTo;
    CanvasRenderingContext2D.prototype.moveTo = function (x, y) {
        move.apply(this, arguments);
        this.lastModifiedX = x;
        this.lastModifiedY = y;
    };
    //like: - - - - - - - - - - - - -
    CanvasRenderingContext2D.prototype.dashedLineTo = function (x, y) {
        var last_x = this.lastModifiedX,
            last_y = this.lastModifiedY,
            delta_x = x - last_x,
            delta_y = y - last_y,
            num = parseInt(Math.sqrt(delta_x * delta_x + delta_y * delta_y) / 5);
            for(var i = 0 ; i <= num; i++) {
                i % 2 ?
                    this.lineTo(last_x + delta_x / num * i, last_y + delta_y / num * i) :
                    this.moveTo(last_x + delta_x / num * i, last_y + delta_y / num * i);
            }
    };
}());

// To edit some shape
//这里的loc是相对于视口的
function edit(obj, loc) {
    obj.createPath();
    var delt_x = loc.x - obj._mouse.x;
    var delt_y = loc.y - obj._mouse.y;
    if(obj.context.isPointInPath(loc.x - obj.context.canvas.offsetLeft, loc.y - obj.context.canvas.offsetTop )){
        obj.context.canvas.onmousemove = function (e) {
            var event = e || window.event;
            obj.getImage();
            obj._mouse.x = event.clientX - delt_x;
            obj._mouse.y = event.clientY - delt_y;
            obj.context.save();
            obj.context.beginPath();
            obj.context.lineWidth = obj._linewidth;
            obj.context.strokeStyle = obj._strokestyle;
            if(obj._fill !== "none") {
                if(obj._fill !== "custom")
                    obj.context.fillStyle = obj._fill;
                else
                    obj.context.fillStyle = obj._fillCustom;
            }
            obj.context.arc(obj._mouse.x, obj._mouse.y, obj._radius, 0, Math.PI * 2);
            obj.context.stroke();
            (obj._fill !== "none") && obj.context.fill();
            obj.context.restore();
        };

        obj.context.canvas.onmouseup = function () {
            obj.context.canvas.onmousemove = null;
        };
    }
}



//对于Bezier曲线的编辑
//这里的loc是相对于canvas的
function editBezier(obj, loc) {
    var dragging = draggingPoint(obj, loc);
    if(dragging) {
        var delt_x = loc.x - dragging.x;
        var delt_y = loc.y - dragging.y;
        obj.context.canvas.onmousemove = function (e) {
            var event = e || window.event;
            dragging.x = event.clientX - obj.context.canvas.offsetLeft - delt_x;
            dragging.y = event.clientY - obj.context.canvas.offsetTop - delt_y;
            obj.getImage();
            obj.drawBezier();
        };
        
        obj.context.canvas.onmouseup = function () {
            obj.context.canvas.onmousemove = null;
            obj.drawPoints();
        };
    }
}

function draggingPoint(obj, loc) {
    //刚刚不小心在forEach里面return 外面的函数当然得不到了 蠢哭
    var pt = null;
    obj.endpoints.forEach(function (v) {
        obj.context.beginPath();
        obj.context.arc(v.x, v.y, 5, 0, Math.PI * 2);
        if(obj.context.isPointInPath(loc.x, loc.y)) {
            pt = v;
        }
    });
   obj.controlpoints.forEach(function (v) {
        obj.context.beginPath();
        obj.context.arc(v.x, v.y, 5, 0, Math.PI * 2);
        if(obj.context.isPointInPath(loc.x, loc.y)) {
            pt = v;
        }
    });
    return pt;
}




/*******************************************************************************************************************
Constructor:Draw_Line & it's prototype
 //Draw_line: function to draw a line manually
 //context: draw Obj
*******************************************************************************************************************/
function Draw_line(context) {
    this.context = context;
    this.drag = false;
    //老问题 用bind绑定 会生成不同的函数 相当于绑定了很多次
    this._before = bind(this, this.onDown);
    this._on = bind(this, this.onMove);
    this._up = bind(this, this.onUp);
}

Draw_line.prototype = {
    constructor: Draw_line,
    //add Listener
    initialize: function () {
        addHandler(this.context.canvas, "mousedown" , this._before);
        addHandler(this.context.canvas, "mousemove" , this._on);
        addHandler(this.context.canvas, "mouseup", this._up);
    },
    saveImage: function () {
        this._image = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
    },
    getImage: function () {
        this.context.putImageData(this._image, 0, 0);
    },
    //get Position when mouse down
    getMouse: function (e) {
        var event = e || window.event;
        this._mouse = this._loc = {
            x: event.clientX - this.context.canvas.offsetLeft,
            y: event.clientY - this.context.canvas.offsetTop
        };
    },
    //get Position whrn mouse move
    getLoc: function (e) {
        var event = e || window.event;
        this._loc = {
            x: event.clientX - this.context.canvas.offsetLeft,
            y: event.clientY - this.context.canvas.offsetTop
        }
    },
    //draw horizontal & vertical line when mouse down
    drawHV: function () {
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(this._mouse.x, 0);
        this.context.dashedLineTo(this._mouse.x, this.context.canvas.height);
        this.context.moveTo(0, this._mouse.y);
        this.context.dashedLineTo(this.context.canvas.width, this._mouse.y);
        this.context.stroke();
        this.context.restore();
    },
    //draw support line
    drawSupport: function () {
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(this._loc.x, this._loc.y);
        this.context.dashedLineTo(this._loc.x, this._mouse.y);
        this.context.moveTo(this._loc.x, this._loc.y);
        this.context.dashedLineTo(this._mouse.x, this._loc.y);
        this.context.stroke();
        this.context.restore();
    },
    //draw Real Line
    drawLine: function () {
        this.context.save();
        this.context.strokeStyle = this._strokestyle;
        this.context.lineWidth = this._linewidth;
        this.context.beginPath();
        this.context.moveTo(this._loc.x, this._loc.y);
        this.context.lineTo(this._mouse.x, this._mouse.y);
        this.context.stroke();
        this.context.restore();
    },
    onDown: function () {
        this.saveImage();
        this.getMouse();
        this.getStyle();
        this.drag = true;
    },
    onMove: function () {
        if(this.drag) {
            this.getLoc();
            this.getImage();
            this.drawHV();
            this.drawSupport();
            this.drawLine();
        }
    },
    onUp: function () {
        this.drag = false;
        this.getImage();
        this.drawLine();
    },
    destroy: function () {
        removeHandler(this.context.canvas, "mousedown" , this._before);
        removeHandler(this.context.canvas, "mousemove" , this._on);
        removeHandler(this.context.canvas, "mouseup", this._up);
    },
    getStyle: function () {
        var width = document.getElementById("line_width");
        var color = document.getElementById("line_color");
        this._linewidth = width.options[width.selectedIndex].innerText;
        this._strokestyle = color.options[color.selectedIndex].innerText;
    }
};



/*******************************************************************************************************************
 Constructor:DrawRound & it's prototype
 //drawRound
 //center is fixed, and change the radius
 *******************************************************************************************************************/
function DrawRound(context) {
    this.context = context;
    this.drag = false;
    this._before = bind(this, this.onDown);
    this._on = bind(this, this.onMove);
    this._up = bind(this, this.onUp);
}

DrawRound.prototype = {
    constructor: DrawRound,
    //add Listener
    initialize: function () {
        addHandler(this.context.canvas, "mousedown" , this._before);
        addHandler(this.context.canvas, "mousemove" , this._on);
        addHandler(this.context.canvas, "mouseup", this._up);
    },
    saveImage: function () {
        this._image = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
    },
    getImage: function () {
        this.context.putImageData(this._image, 0, 0);
    },
    //get Position when mouse down
    getMouse: function (event) {
        this._mouse = this._loc = {
            x: event.clientX - this.context.canvas.offsetLeft,
            y: event.clientY - this.context.canvas.offsetTop
        };
    },
    //get Position whrn mouse move
    getLoc: function (event) {
        //实际上 这样写 event是没有用的 因为不是这个函数绑定到事件上
        this._loc = {
            x: event.clientX - this.context.canvas.offsetLeft,
            y: event.clientY - this.context.canvas.offsetTop
        }
    },
    //draw horizontal & vertical line when mouse down
    drawSupport: function () {
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(this._loc.x, 0);
        this.context.dashedLineTo(this._loc.x, this.context.canvas.height);
        this.context.moveTo(0, this._loc.y);
        this.context.dashedLineTo(this.context.canvas.width, this._loc.y);
        this.context.stroke();
        this.context.restore();
    },
    //through the loc[x, y] and center, draw a circle
    draw_round: function () {
        var del_x = this._loc.x - this._mouse.x;
        var del_y = this._loc.y - this._mouse.y;
        var radius = Math.sqrt(del_x * del_x + del_y * del_y);
        this._radius = radius;
        this.context.save();
        this.context.lineWidth = this._linewidth;
        this.context.strokeStyle = this._strokestyle;
        if(this._fill !== "none") {
            if(this._fill !== "custom")
                this.context.fillStyle = this._fill;
            else
                this.context.fillStyle = this._fillCustom;
        }
        this.context.beginPath();
        this.context.arc(this._mouse.x, this._mouse.y, radius, 0, Math.PI * 2);
        this.context.stroke();
        (this._fill !== "none") && this.context.fill();
        this.context.restore();
    },
    createPath: function () {
        this.context.beginPath();
        this.context.arc(this._mouse.x, this._mouse.y, this._radius, 0, Math.PI * 2);
    },
    onDown: function (e) {
        var event = e || window.event;
        this.saveImage(event);
        this.getMouse(event);
        this.getStyle();
        this.drag = true;
    },
    onMove: function (e) {
        var event = e || window.event;
        if(this.drag) {
            this.getLoc(event);
            this.getImage();
            this.draw_round();
            this.drawSupport();
        }
    },
    onUp: function () {
        this.drag = false;
        this.getImage();
        this.draw_round();
    },
    destroy: function () {
        removeHandler(this.context.canvas, "mousedown" , this._before);
        removeHandler(this.context.canvas, "mousemove" , this._on);
        removeHandler(this.context.canvas, "mouseup", this._up);
    },
    getStyle: function () {
        var width = document.getElementById("round_line_width");
        var color = document.getElementById("round_line_color");
        var fill = document.getElementById("round_fill");
        var custom = document.getElementById("round_fill_custom");
        this._linewidth = width.options[width.selectedIndex].innerText;
        this._strokestyle = color.options[color.selectedIndex].innerText;
        this._fill = fill.options[fill.selectedIndex].innerText;
        if(custom.value.length !== 7 || custom.value.indexOf("#") !==0 || (/[g-zG-Z]/).test(custom.value) !== false) {
            (this._fill === "custom") && (this._fill = "none");
        } else { //如果输入的是错误的rgb 而用户又是选择的custom 则无法显示
            this._fillCustom = custom.value;
        }

    }
};



/*******************************************************************************************************************
 Bezier
 *******************************************************************************************************************/
function Bezier(context) {
    this.context = context;
    this.endpoints = [{}, {}];
    this.controlpoints = [{}, {}];
    this._before = bind(this, this.onDown);
    this._on = bind(this, this.onMove);
    this._up = bind(this, this.onUp);
    this.drag = false;
}

Bezier.prototype = {
    constructor: Bezier,
    initialize: function () {
        addHandler(this.context.canvas, "mousedown" , this._before);
        addHandler(this.context.canvas, "mousemove" , this._on);
        addHandler(this.context.canvas, "mouseup", this._up);
        this.drag = false;
    },
    saveImage: function () {
        this._image = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
    },
    getImage: function () {
        (this._image !== undefined) && this.context.putImageData(this._image, 0, 0);
    },
    //get Position when mouse down
    getMouse: function (event) {
        this._mouse = this._loc = {
            x: event.clientX - this.context.canvas.offsetLeft,
            y: event.clientY - this.context.canvas.offsetTop
        };
    },
    //get Position whrn mouse move
    getLoc: function (event) {
        this._loc = {
            x: event.clientX - this.context.canvas.offsetLeft,
            y: event.clientY - this.context.canvas.offsetTop
        }
    },
    drawRectangular: function () {
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(this.endpoints[0].x, this.endpoints[0].y);
        this.context.dashedLineTo(this.controlpoints[0].x, this.controlpoints[0].y);
        this.context.dashedLineTo(this.endpoints[1].x, this.endpoints[1].y);
        this.context.dashedLineTo(this.controlpoints[1].x, this.controlpoints[1].y);
        this.context.dashedLineTo(this.endpoints[0].x, this.endpoints[0].y);
        this.context.stroke();
        this.context.restore();
    },
    drawBezier: function () {
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(this.endpoints[0].x, this.endpoints[0].y);
        this.context.bezierCurveTo(this.controlpoints[0].x, this.controlpoints[0].y, this.controlpoints[1].x, this.controlpoints[1].y, this.endpoints[1].x, this.endpoints[1].y);
        this.context.stroke();
        this.context.restore();
    },
    onDown: function (e) {
        var event = e || window.event;
        this.getMouse(event);
        this.saveImage();
        this.endpoints[0].x = this._mouse.x;
        this.endpoints[0].y = this._mouse.y;
        this.drag = true;
    },
    onMove: function (e) {
        var event = e || window.event;
        if(this.drag) {
            this.getImage();
            this.getLoc(event);
            this.endpoints[1].x = this._loc.x;
            this.endpoints[1].y = this._loc.y;
            this.controlpoints[0].x = this.endpoints[0].x;
            this.controlpoints[0].y = this.endpoints[1].y;
            this.controlpoints[1].x = this.endpoints[1].x;
            this.controlpoints[1].y = this.endpoints[0].y;
            this.drawRectangular();
            this.drawBezier();
        }
    },
    onUp: function () {
        this.drag = false;
        this.getImage();
        this.drawBezier();
    },
    destroy: function () {
        removeHandler(this.context.canvas, "mousedown" , this._before);
        removeHandler(this.context.canvas, "mousemove" , this._on);
        removeHandler(this.context.canvas, "mouseup", this._up);
    },
    drawPoints: function () {
        this.context.save();
        this.context.beginPath();
        this.context.arc(this.endpoints[0].x, this.endpoints[0].y, 4, 0, Math.PI * 2);
        this.context.arc(this.endpoints[1].x, this.endpoints[1].y, 4, 0, Math.PI * 2);
        this.context.fill();
        this.context.beginPath();
        this.context.arc(this.controlpoints[0].x, this.controlpoints[0].y, 4, 0, Math.PI * 2);
        this.context.stroke();
        this.context.beginPath();
        this.context.arc(this.controlpoints[1].x, this.controlpoints[1].y, 4, 0, Math.PI * 2);
        this.context.stroke();
        this.context.restore();
    },
    quitAndSave: function () {
        this.getImage();
        this.drawBezier();
        this.saveImage();
    }
};


/*******************************************************************************************************************
eraser
 *******************************************************************************************************************/
function Eraser(context) {
    this.context = context;
    this._on = bind(this, this.onMove);
    this._before = bind(this, this.onDown);
    this._up = bind(this, this.onUp);
    this._clear = false;
    this._radius = 20;
    this._shape = "circle";
}

Eraser.prototype = {
    constructor: Eraser,
    saveImage: function () {
        this._image = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
    },
    getImage: function () {
        this.context.putImageData(this._image, 0, 0);
    },
    onMove: function (e) {
        var event = e || window.event;
        this.getMouse(event);
        this.getStyle();
        this.getImage(); //恢复到之前状态
        if(this._clear) {
            this.downToClear();
            drawGrid(this.context, "black",10, 10);
            this.saveImage();
        }
        this.createEraser();
    },
    onDown: function () {
        this._clear = true;
    },
    onUp: function () {
        this._clear = false;
    },
    getMouse: function (event) {
        this._mouse = {
            x: event.clientX - this.context.canvas.offsetLeft,
            y: event.clientY - this.context.canvas.offsetTop
        }
    },
    createEraser: function () {
        this.context.save();
        this.context.beginPath();
        this.context.arc(this._mouse.x, this._mouse.y, this._radius, 0, Math.PI * 2);
        this.context.shadowColor = "grey";
        this.context.shadowOffsetX = 2;
        this.context.shadowOffsetY = 2 ;
        this.context.shadowBlur = 10;
        this.context.fillStyle = "#ffffff";
        this.context.stroke();
        this.context.fill();
        this.context.restore();
    },
    downToClear: function () {
        this.context.save();
        this.context.beginPath();
        this.context.arc(this._mouse.x, this._mouse.y, this._radius, 0, Math.PI * 2);
        this.context.clip();
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.restore();
    },
    initialize: function () {
        addHandler(this.context.canvas, "mousedown" , this._before);
        addHandler(this.context.canvas, "mousemove" , this._on);
        addHandler(this.context.canvas, "mouseup", this._up);
    },
    destroy: function () {
        removeHandler(this.context.canvas, "mousedown" , this._before);
        removeHandler(this.context.canvas, "mousemove" , this._on);
        removeHandler(this.context.canvas, "mouseup", this._up);
    },
    getStyle: function () {
        var option = document.getElementById("eraser_radius");
        this._radius = option[option.selectedIndex].innerText;
    }
};


/*******************************************************************************************************************
 Text
 *******************************************************************************************************************/
function Text(context) {
    this.context = context;
    this._on = bind(this, this.onMove);
    this._before = bind(this, this.onDown);
    this._input = bind(this, this.inPut);
    this._size = 60;
    this._width = 2;
    this._text = "";
    this._cur = 0;
}

Text.prototype = {
    constructor: Text,
    saveImage: function () {
        this._image = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
    },
    getImage: function () {
       // this.context.putImageData(this._image, 0, 0, this._loc.x, this._loc.y, this._width, this.getHeight());
        this.context.putImageData(this._image, 0, 0);
    },
    initialize: function () {
        addHandler(this.context.canvas, "mousedown" , this._before);
        addHandler(this.context.canvas, "mousemove" , this._on);
        this.saveImage();
        this._blink = null;
    },
    destroy: function () {
        removeHandler(this.context.canvas, "mousedown" , this._before);
        removeHandler(this.context.canvas, "mousemove" , this._on);
    },
    drawPath:function () {
        this.context.beginPath();
        this.context.rect(this._cursor.x, this._cursor.y, this._width, this._size);
        this.context.stroke();
    },
    getLoc: function (event) {
        //这样写 两者指向了同一个对象
        this._cursor = {
            x: event.clientX - this.context.canvas.offsetLeft,
            y: event.clientY - this.context.canvas.offsetTop
        };
    },
    onMove: function (e) {
        var event = e || window.event;
        this.getLoc(event);
        this.getImage();
        this.drawPath();
    },
    onDown: function () {
        if(!this._blink)
            this.blinkText();
        this._loc = {
            x: this._cursor.x,
            y: this._cursor.y
        };
        removeHandler(this.context.canvas, "mousemove", this._on);
        addHandler(window, "keydown", this._input);
    },
    blinkText: function () {
        var self = this;
        this._blink = setInterval(function () {
            self.drawPath();
            setTimeout(function () {
                self.getImage();
            }, 400);
        }, 800);
    },
    insertText: function (letter) {
        this._text = this._text.substring(0, this._cur) + letter + this._text.slice(this._cur);
        this._cur++;
        this.context.save();
        this.context.textAlign = "start";
        this.context.textBaseline = "top";
        this.context.font = this._size + "px arial";
        this.context.fillText(this._text, this._loc.x, this._loc.y);
        this._cursor.x += this.context.measureText(letter).width;
        this.context.restore();
    },
    inPut: function (e) {
        var event = e || window.event;
        //8: backspace  13: enter
        if(e.keyCode === 13 || e.keyCode === 8)
            e.preventDefault();
        else {
            clearInterval(this._blink);
            this.getImage();
            this.insertText(String.fromCharCode(e.keyCode));
            this.saveImage();
            this.blinkText();
        }
    }
};


/*******************************************************************************************************************
 window.onload = XXXXxxx
 *******************************************************************************************************************/
function helpBezier(use) {
    if(use.constructor === Bezier) {
        use.quitAndSave();
    }
    if(use.constructor === Eraser) {
        use.getImage();
    }
    if(use.constructor === Text) {
        use.getImage();
        clearInterval(use._blink);
    }
}


function dRAW() {
    var context = document.getElementById("box").getContext("2d");
    var tool = document.getElementById("tool").getElementsByTagName("div");
    var line_style = document.getElementById("line");
    var round_style = document.getElementById("round");
    var eraser_style = document.getElementById("eraser");

    drawGrid(context, "black", 10, 10);
    var tools = {
        line: new Draw_line(context),
        round: new DrawRound(context),
        bezier: new Bezier(context),
        eraser: new Eraser(context),
        text: new Text(context)
    };
    //now: some style, line lineWidth, StrokeStyle etc
    //use: what shape is using now
    var now = line_style;
    var use = tools.line;
    use.initialize();

    tool[0].onclick = function () {
        context.canvas.onmousedown = context.canvas.onmouseup = null;
        now.style.display = "none";
        line_style.style.display = "block";
        now = line_style;
        use.destroy();
        helpBezier(use);
        use = tools.line;
        use.initialize();
    };

    tool[1].onclick = function () {
        context.canvas.onmousedown = context.canvas.onmouseup = null;
        now.style.display = "none";
        round_style.style.display = "block";
        now = round_style;
        use.destroy();
        helpBezier(use);
        use = tools.round;
        use.initialize();
    };
    tool[2].onclick = function () {
        context.canvas.onmousedown = context.onmouseup = null;
        use.destroy();
        helpBezier(use);
        use = tools.bezier;
        use.initialize();
    };
    tool[3].onclick = function () {
        context.canvas.onmousedown = context.onmouseup = null;
        use.destroy();
        now.style.display = "none";
        eraser_style.style.display = "block";
        now = eraser_style;
        helpBezier(use);
        use = tools.eraser;
        use.initialize();
        use.saveImage();
    };
    tool[4].onclick = function () {
        context.canvas.onmousedown = context.onmouseup = null;
        use.destroy();
        helpBezier(use);
        use = tools.text;
        use.initialize();
    }
    //这里实现的Edit只是是对于当前所画的圆, Bezier的change
    tool[5].onclick = function (event) {
        use.destroy();
        (use.constructor === Eraser) && use.getImage();
        //如果之前是Bezier 则在之后要加上controlPoints & endPoints
        (use.constructor === Bezier) && (use.drawPoints());

        context.canvas.onmousedown = function () {
            var event = event || window.event;
            if(use.constructor === DrawRound) {
                edit(use, {
                    x: event.clientX,
                    y: event.clientY
                });
            }
            if(use.constructor === Bezier) {
                editBezier(use, {
                    x: event.clientX - context.canvas.offsetLeft,
                    y: event.clientY - context.canvas.offsetTop
                });
            }
        };
    }
}


addHandler(window, "load", dRAW);
