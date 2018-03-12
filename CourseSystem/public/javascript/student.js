/**
 * Created by Administrator on 2017/6/18 0018.
 */
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
        for(let property in json) {
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
    var nav         = document.getElementById('nav').getElementsByTagName('li'),
        information = document.getElementById('information'),
        selectcourse= document.getElementById('selectcourse'),
        owncourse   = document.getElementById('owncourse'),
        about       = document.getElementById('about'),
        span        = document.getElementById('nav').getElementsByTagName('span')[0],
        wrap        = document.getElementById('wrap'),
        fill        = document.getElementById('fill'),
        fillout     = fill.getElementsByTagName('input'),
        cookie      = getCookie();
        //cookie 里面包含了学生的基本信息

        loadInformation(cookie);
   
    nav[0].onclick = function () {
        information.style.display = 'block';
        selectcourse.style.display = owncourse.style.display = about.style.display = 'none';
        fgm.animate(span, {left: 0});
    };

    nav[1].onclick = function () {
        selectcourse.style.display = 'block';
        information.style.display = about.style.display = owncourse.style.display = 'none';
        loadCourse();
        var inputs = selectcourse.getElementsByTagName('input');
        fgm.animate(span, {left: 150});
    };

    nav[2].onclick = function () {
        owncourse.style.display = 'block';
        selectcourse.style.display = information.style.display = about.style.display ='none';
        loadOwnCourse();
        fgm.animate(span, {left: 300});
    }
    nav[3].onclick = function () {
        about.style.display = 'block';
        selectcourse.style.display = owncourse.style.display = information.style.display = 'none';
        fgm.animate(span, {left: 450});
    }
    
    function getCookie() {
        var cookie = document.cookie,
            content = {};
        cookie.split(';').forEach( (item) => {
            let temp = item.split('=');
            content[temp[0].trim()] = temp[1].trim();
        })
        return content;
    }
    
    function loadInformation(cookie) {
        var ul = document.getElementById('information').firstElementChild,
            xhr = new XMLHttpRequest();
        xhr.open('GET', `student_information?name=${cookie.session}`, true);
        xhr.onreadystatechange = function () {
            if(this.readyState === 4 && this.status === 200) {
                //没有填信息
                if(this.responseText === 'no') {
                    wrap.style.display = 'none';
                    fill.style.display = 'block';
                    fillout[2].onclick = function () {
                        var actualname = fillout[0].value;
                        var department = fillout[1].value;
                        if(/^\s*$/.test(actualname) || /^\s*$/.test(department)) {
                            document.getElementById('alert').innerHTML = 'Wrong with the department or actualname.';
                        } else {
                            document.getElementById('alert').innerHTML = '';
                            var _xhr = new XMLHttpRequest();
                            _xhr.open('G' +
                                'ET', `student_fillinfo?actualname=${actualname}&department=${department}&username=${cookie.session}&no=${cookie.no}`);
                            _xhr.onreadystatechange = function () {
                                if(this.readyState ===4 && this.status === 200) {
                                    loadInformation(cookie);
                                } else {
                                    document.getElementById('alert').innerHTML = 'Something Wrong. Try it later.';
                                }
                            }
                            _xhr.send();
                        }
                    };
                } else {
                    fill.style.display = 'none';
                    wrap.style.display = 'block';
                    extend(cookie, JSON.parse(this.responseText));
                    ul.innerHTML = `
                <li>Username  : ${cookie.username}</li>
                <li>Realname  : ${cookie.sname}</li>
                <li>Type      : ${cookie.type}</li>
                <li>Department: ${cookie.department}</li>
                <li>Studentno : ${cookie.sno}</li>
                `;
                }
            }
        }
        xhr.send();
    }

    function extend(destinatin, source) {
        for(var p in source) {
            destinatin[p] = source[p];
        }
    }

    function loadCourse() {
        selectcourse.innerHTML = `
         <ul>
            <li>ClassNo</li>
            <li>ClassName</li>
            <li>Selected</li>
            <li>Choose</li>
        </ul>
        <hr>`;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `/othercourse?no=${cookie.no}`, true);
        xhr.onreadystatechange = function () {
            if(this.readyState === 4 && this.status === 200) {
                var course = JSON.parse(this.responseText);
                var count = 0;
                for(var p in course) {
                    //闭包来解决作用域问题
                    (function () {
                        let index = p;
                        let _xhr = new XMLHttpRequest();
                        _xhr.open('GET', `/coursenumber?cno=${course[p].cno}`, true);
                        _xhr.onreadystatechange = function(){
                            if(this.readyState ===4 && this.status === 200) {
                                course[index].selected = this.responseText;
                                selectcourse.innerHTML += `
                            <ul>
                            <li>${course[index].cno}</li> 
                            <li>${course[index].cname}</li>  
                            <li>${course[index].selected}</li>
                            <li><input type="submit" id=${course[index].cno} value="select"></li>
                            </ul>`;
                                count++;
                                if(count === course.length) {
                                    Array.prototype.forEach.call(selectcourse.getElementsByTagName('input'), (input) => {
                                        input.onclick = function() {
                                            let __xhr = new XMLHttpRequest();
                                            __xhr.open('GET', `/choosecourse?cno=${this.id}&sno=${cookie.sno}`);
                                            __xhr.onreadystatechange = function() {
                                                if(__xhr.readyState ===4 && __xhr.status === 200) {
                                                    loadCourse();
                                                }
                                            }
                                            __xhr.send();
                                        }
                                    });
                                }
                            }
                        }
                        _xhr.send();
                    }());
                }
            }
        }
        xhr.send();
    }

    function loadOwnCourse() {
        owncourse.innerHTML = `
         <ul>
            <li>ClassNo</li>
            <li>ClassName</li>
            <li>TeacherName</li>
            <li>Grade</li>
        </ul>
        <hr>`;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `/student_owncourse?sno=${cookie.sno}`, true);
        xhr.onreadystatechange = function () {
            if(this.readyState === 4 && this.status === 200) {
                    let course = JSON.parse(this.responseText);
                    for(var p in course) {
                    owncourse.innerHTML += `
                            <ul>
                            <li>${course[p].cno}</li> 
                            <li>${course[p].cname}</li>  
                            <li>${course[p].tname}</li>
                            <li>${course[p].grade === null ? 'Not Yet' : course[p].grade}</li>
                            </ul>`;
                    }
                }
            }
        xhr.send();
    };

}());
