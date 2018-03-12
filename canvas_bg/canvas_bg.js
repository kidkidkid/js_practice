/**
 * Created by Administrator on 2017/6/19 0019.
 */

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; x++) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var canvas = document.createElement('canvas'),
    context = canvas.getContext('2d');
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
canvas.style.position = 'fixed';
context.lineWidth = 0.4;
document.body.appendChild(canvas);

var points = [],
    num = 600,
    xMax = document.documentElement.clientWidth,
    yMax = document.documentElement.clientHeight,
    radius = 1,
    dis = 150;

for(let i = 0; i < num; i++) {
    points.push({
        x: Math.random() * xMax,
        y: Math.random() * yMax,
        xvelocity: Math.random() * 1 - 0.5,
        yvelocity: Math.random() * 1 - 0.5,
        index: i
    });console.log(points[points.length - 1].xvelocity);
}
drawPoints();
animate();

function drawPoints() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach( point => {
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();
        for(let i = point.index + 1; i < num; i++) {
            if(Math.pow(points[i].x - point.x, 2) + Math.pow(points[i].y - point.y, 2) < dis * dis) {
                context.beginPath();
                context.moveTo(point.x, point.y);
                context.lineTo(points[i].x, points[i].y);
                context.stroke();
            }
        }
    });
}

function animate() {
    points.forEach( point => {
        point.x + point.xvelocity < 0 ? (point.xvelocity = -point.xvelocity, point.x = 0)
            : point.x + point.xvelocity > xMax ? (point.xvelocity = -point.xvelocity, point.x = xMax) : point.x += point.xvelocity;
        point.y + point.yvelocity < 0 ? (point.yvelocity = -point.yvelocity, point.y = 0)
            : point.y + point.yvelocity > yMax ? (point.yvelocity = -point.yvelocity, point.y = yMax) : point.y += point.yvelocity;
    })
    drawPoints();
    requestAnimationFrame(animate);
}
