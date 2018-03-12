/**
 * Created by Administrator on 2017/6/4 0004.
 */

/******************************************************************************************************
Vector: 向量
 ******************************************************************************************************/
function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype = {
    constructor: Vector,
    getMagnitude: function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    },
    add: function (vector) {
        var v = new Vector();
        v.x = this.x + vector.x;
        v.y = this.y + vector.y;
        return v;
    },
    subtract: function (vector) {
        var v = new Vector();
        v.x = this.x - vector.x;
        v.y = this.y - vector.y;
        return v;
    },
    dotProduct: function (vector) {
        return this.x * vector.x + this.y * vector.y;
    },
    edge: function (vector) {
        return this.subtract(vector);
    },
    perpendicular: function () {
        var v = new Vector();
        v.x = this.y;
        v.y = -this.x;
        return v;
    },
    normalize: function () {
        var v = new Vector(0, 0),
            m = this.getMagnitude();
        if(m) {
            v.x = this.x / m;
            v.y = this.y / m;
        }
        return v;
    },
    normal: function () {
        var p =this.perpendicular();
        return p.normalize();
    }
};

/******************************************************************************************************
shape: 各种图形的形状 是一个父类
 ***************************************************************************************************** */
function Shape() {
    this.x = undefined;
    this.y = undefined;
    this.strokeStyle = "rgba(255, 253, 209, 0.9)";
    this.fillStyle = "rgba(147, 197, 114, 0.8)";
}

Shape.prototype = {
    collidesWith: function (shape) {
        var axes = this.getAxes();
        axes = axes.concat(shape.getAxes());
        return !this.separationOnaxes(axes, shape);
    },
    separationOnaxes: function (axes, shape) {
        for(var i = 0; i < axes.length; i++) {
            var axis = axes[i];
            var projection1 = shape.project(axis);
            var projection2 = this.project(axis);
            if(!projection1.overlaps(projection2)) { //没有重叠
                return true; //true: no collision
            }
        }
        return false;
    },
    //求投影
    project: function (axis) {
        throw "Not Implemented";
    },
    //得到轴 即边
    getAxes: function () {
        throw "Not Implemented";
    },
    createPath: function (context) {
        throw "Not Implemented";
    },
    //....
    fill: function (context) {
        context.save();
        context.fillStyle = this.fillStyle;
        this.createPath(context);
        context.fill();
        context.restore();
    },
    stroke: function (context) {
        context.save();
        context.strokeStyle = this.strokeStyle;
        this.createPath(context);
        context.stroke();
        context.restore();
    },
    isPointInPath: function (context, x, y) {
        this.createPath(context);
        return context.isPointInPath(x, y);
    }
}

/******************************************************************************************************
Polygon: 多边形  Point: 点
 ***************************************************************************************************** */
function Point(x, y) {
    this.x = x;
    this.y = y;
}


function Polygon() {
    this.points = [];
    this.strokeStyle = "blue";
    this.fillStyle = "black";
}

Polygon.prototype = new Shape();

Polygon.prototype.collidesWith = function (shape) {
    var axes = shape.getAxes();
    if(axes === undefined) {
        return polygonCollidesWithCircle(this, shape);
    } else {
        return !this.separationOnaxes(axes, shape);
    }
};

Polygon.prototype .getAxes = function () {
    var v1 = new Vector(),
        v2 = new Vector(),
        axes = [];
    for (var i = 0; i < this.points.length - 1; i++) {
        v1.x = this.points[i].x;
        v1.y = this.points[i].y;
        v2.x = this.points[i + 1].x;
        v2.y = this.points[i + 1].y;
        axes.push(v1.edge(v2).normal());
    }
    v1.x = this.points[this.points.length - 1].x;
    v1.y = this.points[this.points.length - 1].y;
    v2.x = this.points[0].x;
    v2.y = this.points[0].y;
    axes.push(v1.edge(v2).normal());
    return axes;
};
    //axis 是axes数组中的一个轴
    //project这个该函数是为了得出在某一个轴上面的
Polygon.prototype.project = function (axis) {
    var scalars = [],
        v= new Vector();
    this.points.forEach(function (point) {
        v.x = point.x;
        v.y = point.y;
        scalars.push(v.dotProduct(axis));
    });
    return new Projection(Math.min.apply(Math, scalars),Math.max.apply(Math, scalars));
};

Polygon.prototype.addPoint = function (x, y) {
    this.points.push(new Point(x, y));
};

Polygon.prototype.createPath = function (context) {
    if(this.points.length === 0)
        return;
    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    for(var i = 0; i <  this.points.length; i++) {
        context.lineTo(this.points[i].x, this.points[i].y);
    }
    context.closePath();
};

Polygon.prototype.move = function (dx, dy) {
    for(var i = 0, point; i < this.points.length; i++) {
        point = this.points[i];
        point.x += dx;
        point.y += dy;
    }
;}

/******************************************************************************************************
Projection:  映射
 ******************************************************************************************************/
function Projection(min, max) {
    this.min = min;
    this.max = max;
}

Projection.prototype.overlaps = function (projection) {
    return this.max > projection.min && projection.max > this.min;
};

/********************************************************************************************************
Circle
 ********************************************************************************************************/
function Circle(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.strokeStyle = "rgba(255, 50, 100, 0.9)";
    this.fillStyle = "rgba(147, 197, 114, 0.8)";
}

Circle.prototype =  new Shape();

Circle.prototype.collidesWith = function (shape) {
    var axes = shape.getAxes();
    if(axes === undefined) {
        //circle
        return Math.sqrt(Math.pow(shape.x - this.x, 2) + Math.pow(this.y - shape.y, 2)) < (this.radius + shape.radius);
    } else {
        return polygonCollidesWithCircle(shape, this);
    }
};

Circle.prototype.getAxes = function () {
    return undefined;
};

Circle.prototype.project = function (axis) {
    var scalars = [],
        dotProduct = new Vector(this.x, this.y).dotProduct(axis);

    scalars.push(dotProduct + this.radius);
    scalars.push(dotProduct - this.radius);

    return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
};

Circle.prototype.move = function (dx, dy) {
    this.x += dx;
    this.y += dy;
};

Circle.prototype.createPath = function (context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
}


function getPolygonPointClosestToCircle(polygon, circle) {
    var min = Infinity,
        num = polygon.points.length,
        minPoint= null;
    for(var i = 0; i < num; i++) {
        var len = Math.pow(polygon.points[i].x - circle.x, 2) + Math.pow(polygon.points[i].y - circle.y, 2);
        if(len < min) {
            min = len;
            minPoint = polygon.points[i];
        }
    }
    var axes = polygon.getAxes();
    var v1 = new Vector(circle.x, circle.y);
    var v2 = new Vector(polygon.x, polygon.y);
    axes.push(v1.subtract(v2).normalize());
    return axes;
}

function polygonCollidesWithCircle(polygon, circle) {
    var axes = getPolygonPointClosestToCircle(polygon, circle);
    return !polygon.separationOnaxes(axes, circle);
}

