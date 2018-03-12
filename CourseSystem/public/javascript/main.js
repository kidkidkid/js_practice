/**
 * Created by Administrator on 2017/6/16 0016.
 */

//requestAnimationFrame 中的callback 会有一个time参数 表示调用的时间
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
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var fgm = {};

fgm.$ = function (id) {
    return typeof id === "object" ? id : document.getElementById(id);
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

fgm.animate = function (obj ,json, callback) {
    clearInterval(obj.timer);
    obj.speed = 0;
    obj.timer = setInterval(function () {
        var cur,
            complete = true,
            maxSpeed = 30;
        for(var property in json) {
            cur = fgm.css(obj, property);
            (property === "opacity") && (cur = cur.toFixed(2) * 100);
            obj.speed = (json[property] - cur) / 5;
            obj.speed = obj.speed > 0 ? Math.ceil(obj.speed) : Math.floor(obj.speed);
            (json[property] !== cur) && (complete = false, fgm.css(obj, property, cur + obj.speed));
        }
        if(complete) {
            clearInterval(obj.timer);
            callback && callback();
        }
    }, 30);
};


(function () {
    var head = document.getElementById('head').children,
        login = head[0],
        register = head[1],
        span = head[2],
        login_part = document.getElementById('login'),
        register_part = document.getElementById('register'),
        input_log = login_part.getElementsByTagName('input'),
        input_reg = register_part.getElementsByTagName('input'),
        alerts = document.getElementById('alert'),
        query_login = false;

    register.onclick = function () {
        login_part.style.display = 'none';
        register_part.style.display = 'block';
        fgm.animate(span, {
            left: 100
        });
        alerts.innerHTML = '';
    };
    login.onclick = function () {
        register_part.style.display = 'none';
        login_part.style.display = 'block';
        fgm.animate(span, {
            left: 0
        });
        alerts.innerHTML = '';
    };

    //login
    input_log[3].onclick = function () {
        if (!query_login) {
            var postData = {
                    username: input_log[0].value,
                    password: input_log[1].value,
                    remember: input_log[2].checked.toString()
                },
                postStr = [];
            for (var p in postData)
                postStr.push(`${p}=${postData[p]}`);
            postStr = postStr.join('&');

            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/query_login', true);

            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    if (this.responseText === 'no') {
                        alerts.innerHTML = 'No Such Username or Password.';
                    } else {
                        query_login = true;
                        input_log[3].click();
                    }
                    query_login = false;
                }
            }
            xhr.send(postStr);
            return false;
        }
    };
    //register
    input_reg[5].onclick = function () {
        var postData = {
                username: input_reg[0].value,
                password: input_reg[1].value,
                studentno: input_reg[2].value,
                acc_type: !input_reg[4].checked ? 'student' : 'teacher'
            },
            postStr = [];
        for (var p in postData)
            postStr.push(`${p}=${postData[p]}`);
        postStr = postStr.join('&');

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/query_register', true);


        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                if (this.responseText === 'no') {
                    alerts.innerHTML = 'Username or StudentNo exists.';
                } else {
                    alerts.innerHTML = '&radic; Registered Successfully.';
                }
            }
        }
        xhr.send(postStr);
        return false;
    }

}());

