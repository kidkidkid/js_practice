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
    var nav         = document.getElementById('nav').getElementsByTagName('li'),
        information = document.getElementById('information'),
        ownclass    = document.getElementById('ownclass'),
        add         = document.getElementById('add'),
        about       = document.getElementById('about'),
        span        = document.getElementById('nav').getElementsByTagName('span')[0],
        wrap        = document.getElementById('wrap'),
        fill        = document.getElementById('fill'),
        fillout     = fill.getElementsByTagName('input'),
        see         = document.getElementById('see'),
        cookie      = getCookie();

    loadInformation(cookie);

    nav[0].onclick = function () {
        information.style.display = 'block';
        ownclass.style.display = add.style.display = about.style.display = 'none';
        fgm.animate(span, {left: 0});
    };

    nav[1].onclick = function () {
        ownclass.style.display = 'block';
        information.style.display = about.style.display = add.style.display = 'none';
        fgm.animate(span, {left: 150});
        loadOwnCourse();
    };

    nav[2].onclick = function () {
        add.style.display = 'block';
        ownclass.style.display = information.style.display = about.style.display ='none';
        fgm.animate(span, {left: 300});
        add.getElementsByTagName('input')[2].onclick = (() => {
            addclass(add.getElementsByTagName('input')[0].value, add.getElementsByTagName('input')[1].value);
        });
    }
    nav[3].onclick = function () {
        about.style.display = 'block';
        ownclass.style.display = add.style.display = information.style.display = 'none';
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
        xhr.open('GET', `teacher_information?name=${cookie.session}`, true);
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
                                'ET', `teacher_fillinfo?actualname=${actualname}&department=${department}&username=${cookie.session}&no=${cookie.no}`);
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
                <li>Realname  : ${cookie.tname}</li>
                <li>Type      : ${cookie.type}</li>
                <li>Department: ${cookie.department}</li>
                <li>Teacherno : ${cookie.tno}</li>
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
    
    function loadOwnCourse() {
        ownclass.innerHTML = `
        <ul>
            <li>ClassNo</li>
            <li>ClassName</li>
            <li>Selected</li>
            <li>See</li>
        </ul>`;
        var xhr = new XMLHttpRequest();
        //从后端获得该老师所教授的课程信息
        xhr.open('GET', `/teacher_owncourse?tno=${cookie.no}`);
        xhr.onreadystatechange = function () {
            if(this.readyState === 4 && this.status ===200) {
                var course = JSON.parse(this.responseText);
                var count = 0;
                for(var p in course) {
                    //闭包来解决作用域问题
                    (function () {
                        let index = p;
                        let _xhr = new XMLHttpRequest();
                        //获得某个课程的所选人数
                        _xhr.open('GET', `/coursenumber?cno=${course[p].cno}`, true);
                        _xhr.onreadystatechange = function(){
                            if(this.readyState ===4 && this.status === 200) {
                                course[index].selected = this.responseText;
                                ownclass.innerHTML += `
                            <ul>
                            <li>${course[index].cno}</li> 
                            <li>${course[index].cname}</li>  
                            <li>${course[index].selected}</li>
                            <li><input type="submit" id=${course[index].cno} value="See"></li>
                            </ul>`;
                                count++;
                                //class加载完毕 开始设置listener
                                if(count === course.length) {
                                   Array.prototype.forEach.call(ownclass.getElementsByTagName('input'), (input) => {
                                       input.onclick = function () {
                                           see.style.display = 'block';
                                            var __xhr = new XMLHttpRequest();
                                            __xhr.open('GET', `sc?cno=${input.id}`);
                                            __xhr.onreadystatechange = function () {
                                                if(this.readyState === 4 && this.status === 200) {
                                                    let content = JSON.parse(this.responseText);
                                                    loadSee(content);

                                                    //给×设置监听
                                                    see.getElementsByTagName('span')[0].onclick = ( () => {
                                                        see.style.display = 'none';
                                                    });
                                                    //给提交分数的submit添加监听
                                                    var inputs = see.getElementsByTagName('input'),
                                                        ul  = see.getElementsByTagName('ul'),
                                                        len = inputs.length;
                                                    inputs[len - 1].onclick = function () {
                                                        for(let i = 0; i < len - 1; i++) {
                                                            let number = Number(inputs[i].value);
                                                            if(inputs[i].value !== '' && number >=0 && number <=100 && !/[^0-9]/.test(inputs[i].value)) {
                                                                let ___xhr = new XMLHttpRequest();
                                                                ___xhr.open('GET', `updatescore?sno=${ul[i + 1].getElementsByTagName('li')[0].innerText}&cno=${input.id}&grade=${number}`);
                                                                ___xhr.onreadystatechange = function() {
                                                                    if(this.readyState === 4 && this.status === 200) {
                                                                        see.style.display = 'none';
                                                                    }
                                                                }
                                                                ___xhr.send();
                                                            }
                                                        }
                                                    }
                                                }
                                            };
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

    function loadSee(content) {
        see.innerHTML = ` <div><span>&times</span></div>
                            <ul>
                            <li>StudentNo</li>
                            <li>GradeBefore</li>
                            <li>Score</li>                                                               
                            </ul>
                            <hr>`;
        content.forEach(item => {
            see.innerHTML += `  <ul>
                                 <li>${item.sno}</li>
                                 <li>${item.grade === null ? 'Not Yet' : item.grade}</li>
                                 <li><input type="text" placeholder="Grade"></li>                                                 
                                 </ul>`;
        });
        see.innerHTML += `<div class="sc_submit"><input type="submit" value="submit"></div>`
    }

    function addclass(classorder, classname) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `addclass?cno=${classorder}&cname=${classname}&tno=${cookie.tno}`);
        xhr.onreadystatechange = function () {
            if(this.readyState === 4 && this.status ===200) {
                if(this.responseText === 'no') {
                    document.getElementById('add_alert').innerText = 'Classorder or Classname exists or illegal.';
                } else {
                    document.getElementById('add_alert').innerText = 'Add class successfully.';
                }
            }
        }
        xhr.send();
    }
}());