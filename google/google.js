/**
 * Created by Administrator on 2017/6/6 0006.
 */

var fgm = {};

fgm.$ = function (id) {
    return typeof id === "object" ? id : document.getElementById(id);
};

//oParent 下寻找tag
fgm.$$ = function (tagName, oParent) {
    return (oParent || document).getElementsByTagName(tagName);
};

fgm.$$$ = function (className, tagName, oParent) {
    var reg = new RegExp("(^|\\s)" + className + "(\\s|$)"),
        el = fgm.$$(tagName, oParent),
        len = el.length,
        aClass = [];
    for(var i = 0; i < len; i++) {
        reg.test(el[i].className) && aClass.push(el[i]);
    }
    return aClass;
};
//children不返回文本节点 childNodes返回包括文本节点
fgm.index = function (element) {
    var child = element.parentNode.children;
    for(var i = 0; i < child.length; i++) {
        if(child[i] === element) return i;
    }
};

fgm.css = function (element, attr, value) {
    if(arguments.length === 2) {
        if(typeof  attr === "string")
            return parseFloat(getComputedStyle ? getComputedStyle(element, null)[attr] : element.currentStyle[attr]);
        for(var p in attr) {
            p === "opacity" ? element.style.opacity = attr[p] / 100 : element.style[p] = attr[p];
        }
    }
    if(arguments.length === 3) {
        switch(attr) {
            case "width":
            case "height":
            case "paddingTop":
            case "paddingRight":
            case "paddingBottom":
            case "paddingLeft":
            case "top":
            case "right":
            case "bottom":
            case "left":
            case "marginTop":
            case "marginRigth":
            case "marginBottom":
            case "marginLeft":
                element.style[attr] = value + "px";
                break;
            case "opacity"://opacity here is [0, 100]
                element.style.opacity = value / 100;
                break;
            default:
                element.style[attr] = value;
        }
    }
};

fgm.animate = function (obj ,json, opt) {
    clearInterval(obj.timer);
    obj.speed = 0;
    opt = fgm.extend({
        type: "buffer",
        callback: function () {}
    }, opt);
    obj.timer = setInterval(function () {
        var cur,
            complete = true,
            maxSpeed = 30;
        for(var property in json) {
            cur = fgm.css(obj, property);
            (property === "opacity") && (cur = cur.toFixed(2) * 100);
            switch (opt.type) {
                case "buffer":
                    obj.speed = (json[property] - cur) / 5;
                    obj.speed = obj.speed > 0 ? Math.ceil(obj.speed) : Math.floor(obj.speed);
                    (json[property] !== cur) && (complete = false, fgm.css(obj, property, cur + obj.speed));
                    break;
            }
        }
        if(complete) {
            clearInterval(obj.timer);
            if(obj.type === "flex") {
                for(var p in json)
                    fgm.css(obj, p, json[p]);
            }
            opt.callback.apply(obj, arguments);
        }
    }, 30);
};

fgm.contains = function (element, oParent) {
    if(oParent.contains) {
        return oParent.contains(element);
    } else {
        return !!(oParent.compareDocumentPosition(element) & 16);
    }
};
//返回element的parent是tagName的元素 没有则返回false
fgm.isParent = function (element, tagName) {
    while (element !== undefined && element !== undefined && element.tagName.toUpperCase() !== "BODY") {
        if(element.tagName.toUpperCase() === tagName.toUpperCase())
            return element;
        element = element.parentNode;
    }
    return false;
};
//extend property
fgm.extend = function (destination, source) {
    for(var prop in source) {
        if(source.hasOwnProperty(prop))
            destination[prop] = source[prop];
    }
    return destination;
};




//图片加载构造函数
function Loading() {
    this.init.apply(this, arguments);
}
//aImg: 要加载的照片
Loading.prototype.init = function (id, aImg, handler) {
    var example = fgm.$(id),
        layer = fgm.$$$("overlay", "div", example)[0],
        load = fgm.$$$("load", "div", example)[0],
        span = fgm.$$("span", load)[0],
        p = fgm.$$("p", load)[0],
        data = [],
        loaded = 0;
    if(!layer || !load || !span || !p) {
        handler();
        return;
    }
    for(var i = 0, imgCount = aImg.length; i < imgCount; i++) {
        (function (i) {
            //image preload
            var image = new Image();
            image.onload = function () {
                span.innerText = p.style.width = Math.ceil(++loaded / imgCount * 100) + "%";
                var img = document.createElement("img");
                img.src = this.src;
                data.push(img);
                if(data[i] && data.length === imgCount) {
                    fgm.animate(layer, {opacity: 0}, {
                        callback: function () {
                            fgm.css(layer, "display", "none");
                            handler && handler();
                        }
                    })
                }
            };
            //事件定义最好放在触发该事件的句柄之前
            image.src = aImg[i];
        })(i);//定义一个函数后立即执行 又可以利用闭包的特性 又不用另外申明
    }
};



function Google(id, data) {
    this.img = [];
    this.queue = 0;
    this.li = [];
    this.pos = [];
    this.zIndex = 10;
    this.list = document.createElement("div");
    this.ul = document.createElement("ul");
    this.init.apply(this, arguments);
}

Google.prototype = {
    init: function (id, data) {
        this.box = typeof id === "string" ? document.getElementById(id) : id;
        this.box .className = "google";
        this._create(data);
        this._layout();
        this._addEvent();
    },
    _create: function (data) {
        var imgFrag = document.createDocumentFragment();
        var liFrag = document.createDocumentFragment();
        for(var i = 0, len = data.length, result = []; i < len; i++) {
            var img = new Image();
            var li = document.createElement("li");
            li.innerHTML = "<img src=" + data[i].img.replace(/(\d+)/, "$1_") + "><div><h5>" + data[i].tit + "</h5><a>Play</a></div>";
            img.src = data[i].img;
            this.img.push(img);
            this.li.push(li);
            imgFrag.appendChild(img);
            liFrag.appendChild(li);
        }
        this.list.className = "list";
        this.list.appendChild(imgFrag);
        this.ul.appendChild(liFrag);
        this.box.appendChild(this.list);
        this.box.appendChild(this.ul);
    },
    _layout: function () {
        for(var i = this.li.length; i--;) {
            //add Index
            this.li[i].index = i;
            this.li[i].style.top = this.li[i].offsetTop + "px";
            this.pos[i] = this.li[i].style.left = this.li[i].offsetLeft + "px";
            this.li[i].style.position = "absolute";
        }
    },
    _addEvent: function () {
        var self = this;
        this.ul.onclick = this.ul.onmouseover = function (e) {
            //即有animation的时候 即有队列在动的时候 无效
            if (self.queue > 0) return;
            var event = e || window.event;
            var target = event.target || event.srcElement;
            if (fgm.contains(target, this) && fgm.isParent(target, "li")) {
                var li = fgm.isParent(target, "li");
                var h5 = fgm.$$("h5", li)[0];
                //active
                if (li.className) return;
                switch (e.type) {
                    case "click" :
                        li.active = true;
                        var lis = fgm.$$("li", self.ul);
                        var last = self.ul.children[lis.length - 1];
                        var index = fgm.index(li);
                        var img = self.img[li.index];
                        //fgm.css(li, {zIndex : self.zIndex++});
                        self.queue = lis.length - index - 1;
                        //一开始的时候 最后一个不是active 如果是active把它放到最后 继续循环 放到最后之后这个状态又回到了开始
                        if (last.className === "active") {
                            fgm.$$("h5", last)[0].style.display = "none";
                            last.className = "";
                            fgm.animate(last, {left: -100}, {
                                callback: function () {
                                    last.style.top = 0;
                                    last.style.left = self.pos[self.pos.length - 1];
                                    last.style.width = "32px";
                                    last.style.height = "38px";
                                }
                            })
                        }
                        self.ul.insertBefore(li, self.ul.firstElementChild);
                        fgm.css(img, {zIndex: self.zIndex++, opacity: 0});
                        fgm.animate(img, {opacity: 100});
                        h5.style.display = "none";


                        fgm.animate(li, {
                            top: -49,
                            left: 10,
                            width: 70,
                            height: 84
                        }, {
                            callback: function () {
                                //this是赋值给obj的 在fgm.anmate中
                                var that = this;
                                this.className = "active";
                                h5.style.display = "block";
                                timer = setInterval(function () {
                                    fgm.animate(lis[++index], {
                                        left: parseFloat(self.pos[index - 1])
                                    }, {
                                        callback: function () {
                                            self.queue--;
                                        }
                                    });
                                    if (index >= lis.length - 1) {
                                        clearInterval(timer);
                                        //把click的那个放到末尾 一直循环保持这种状态
                                        self.ul.appendChild(that);
                                        that.active = false;
                                    }
                                }, 100);
                            }
                        });
                        break;
                    case "mouseover":
                        fgm.css(h5, "display", "block");
                        fgm.animate(li, {top: -10});
                        li.onmouseout = function () {
                            if (!li.active && !self.queue) {
                                fgm.css(h5, "display", "none");
                                fgm.animate(li, {top: 0});
                            }
                        }
                        break;
                }
            }
        }
    },
    _play: function () {
        var that = this;

        this.timer = setInterval(function () {
            var li = fgm.$$("li", that.ul);
            li[0].click();
        },4000);
    },
    autoPlay: function () {
        var that = this;
        var li = fgm.$$("li", this.ul);
        li[0].click();
        this._play();
        this.box.onmouseleave = function ()  {
            that._play();
        };
        this.box.onmouseenter = function () {
            clearInterval(that.timer);
        };
    }
};