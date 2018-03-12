/**
 * Created by Administrator on 2017/6/16 0016.
 */
//搞了很久的cookie终于知道了这里的小秘密 一个set-cookie只能定义一个自己的类型 而expires之类的都是可以添加的
var ejs = require('ejs');
var fs = require('fs');
var http = require('http');
var mysql = require('mysql');
var querystring = require('querystring');

var connection_account = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password: ' ',
        database: 'account'
}),
    connection_main = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password: ' ',
        database: 'main'
    });

var server = http.createServer();
server.on('request', (req, res) => {
    switch (req.method.toUpperCase()) {
        case 'GET':
            route(req.url, req, res);
            break;
        case 'POST':
            post(req, res);
            break;
    }
});
server.listen(4000, () => {
    console.log('Listening port 4000.');
})

//static files
function route(url, req, res) {
    var cookie = getCookie(req),
         urls = url.split('?');

    //localhost:port
    if(url === '/') {
        //初始化界面的时候 如果有cookie则不用登录
        if(cookie.username) {
            connection_account.query('select * from account where username = ?', [cookie.username], (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    res.setHeader('set-cookie', [`session=${result[0].username}`,`type=${result[0].acc_type}`,`no=${result[0].number}`]);
                    result[0].acc_type === 'student' ? res.end(ejs.render(fs.readFileSync('./public/ejs/student.ejs', 'utf-8')))
                     : res.end(ejs.render(fs.readFileSync('./public/ejs/teacher.e' +
                        'js', 'utf-8')));
                }
            })
        } else {
            url = './public/index.html';
            getStaticFile(url, res);
        }
    }
    //处理其他的路径
    //处理退出逻辑
    else if(urls[0] === '/logout') {
            res.setHeader('Set-Cookie', `username=${cookie.username};expires=${new Date(0).toGMTString()}`);
            res.writeHead(302, {'Location': '/'});
            res.end();
    }
    //处理课程查询逻辑
    else if (urls[0] === '/othercourse') {
        let content = querystring.parse(urls[1]);
        connection_main.query('select * from courses where cno not in ( select cno from sc where sno = ? )', [content.no], (err, result) => {
            if(err) {
                console.log(err);
                res.end('no');
            } else {
                if(result.length === 0) {
                    res.end('no');
                } else {
                    res.end(JSON.stringify(result));
                }
            }
        })
    }
    //查询某门课程的已选人数
    else if(urls[0] === '/coursenumber') {
        let content = querystring.parse(urls[1]);
        connection_main.query('select count(sno) from sc where cno=?', [content.cno], (err, result) => {
            if(err) {
                console.log(err);
            } else {
                res.end(result[0]['count(sno)'].toString());
            }
        });
    }
    //查询学生的已有课程
    else if(urls[0] === '/student_owncourse') {
        let content = querystring.parse(urls[1]);
        connection_main.query('select distinct * from sc,courses,teachers where sc.cno=courses.cno and courses.tno=teachers.tno and sc.sno = ?', [content.sno], (err, result) => {
            if(err) {
                console.log(err);
            } else {
                res.end(JSON.stringify(result));
            }
        })
    }
    //查询老师的教授课程
    else if(urls[0] === '/teacher_owncourse') {
        let content = querystring.parse(urls[1]);
        connection_main.query('select * from courses where tno = ?', [content.tno], (err, result) => {
            if(err) {
                console.log(err)
            } else {
                res.end(JSON.stringify(result));
            }
        })
    }
    else if(urls[0] === '/sc') {
        let content = querystring.parse(urls[1]);
        connection_main.query('select * from sc where cno = ?', [content.cno], (err, result) => {
            if(err) {
                console.log(err);
            } else {
                res.end(JSON.stringify(result));
            }
        })
    }
    //查询学生的基本信息
    //result 里面是一个数组 数组中包含的是object
    else if (urls[0] === '/student_information') {
        let content = querystring.parse(urls[1]);
        connection_main.query('select * from students where username = ?', [content.name], (err, result) => {
            if(err) {
                console.log(err);
                res.end('no');
            } else {
                if(result.length === 0) {
                    res.end('no');
                } else {
                    res.end(JSON.stringify(result[0]));
                }
            }
        })
    }
    //查询老师的基本信息
    //result 里面是一个数组 数组中包含的是object
    else if (urls[0] === '/teacher_information') {
        let content = querystring.parse(urls[1]);
        connection_main.query('select * from teachers where username = ?', [content.name], (err, result) => {
            if(err) {
                console.log(err);
                res.end('no');
            } else {
                if(result.length === 0) {
                    res.end('no');
                } else {
                    res.end(JSON.stringify(result[0]));
                }
            }
        })
    }
    else if(urls[0] === '/student_fillinfo') {
        let content = querystring.parse(urls[1]);
        connection_main.query('insert into students values(?,?,?,?)', [content.actualname, content.no, content.username, content.department], (err, result) => {
            if(err) {
                console.log(err);
            } else {
                res.end('yes');
            }
        });
    }
    else if(urls[0] ==='/teacher_fillinfo') {
        let content = querystring.parse(urls[1]);
        connection_main.query('insert into teachers values(?,?,?,?)', [content.actualname, content.no, content.username, content.department], (err, result) => {
            if(err) {
                console.log(err);
            } else {
                res.end('yes');
            }
        });
    }
    //选课逻辑
    else if(urls[0] === '/choosecourse') {
        let content = querystring.parse(urls[1]);
        connection_main.query('insert into sc values(?,?,?)', [content.sno, content.cno, null], (err, result) => {
            if(err) {
                console.log(err);
            } else {
                res.end();
            }
        })
    }
    //打分逻辑
    else if (urls[0] === '/updatescore') {
        let content = querystring.parse(urls[1]);
        connection_main.query('update sc set grade=? where sno = ? and cno = ?', [content.grade, content.sno, content.cno], (err, result) => {
            if(err) {
                console.log(err);
            } else {
                res.end();
            }
        });
    }
    //教师的添课逻辑
    else if(urls[0] === '/addclass') {
        let content = querystring.parse(urls[1]);
        if(/[^0-9]+/.test(content.cno)) {
            res.end('no')
        } else {
            connection_main.query('select * from courses where cno = ? or cname = ?', [content.cno, content.cname], (err, result) => {
                if(err) {
                    console.log(err);
                } else {
                    if(result.length !== 0) {
                        res.end('no');
                    } else {
                        connection_main.query('insert into courses values (?,?,?)', [content.cno, content.cname, content.tno], (err, result) => {
                            if(err) {
                                console.log(err);
                            } else {
                                res.end('yes');
                            }
                        })
                    }
                }
            })
        }
    }
    //不需要逻辑处理 直接获取文件
    else {
        url = `./public/${url}`;
        getStaticFile(url, res);
    }
}

function getStaticFile(url, res) {
    //如果是一般的静态文件 就直接send
    fs.readFile(url, (err, data) => {
        if(err) {
            res.end('404.No such file.');
        } else {
            res.end(data);
        }
    });
}

function getCookie(req) {
    var cookie = {};
    if(req.headers['cookie']) {
        req.headers['cookie'].split(';').forEach( item => {
            let temp = item.split('=');
            cookie[temp[0].trim()] = temp[1].trim();
        });
    }
    return cookie;
}

//处理post逻辑
function post(req, res) {
    //已经验证成功时候 登陆的时候跳转到这里
    if(req.url === '/login') {
        let content = {};
        req.on('data', (data) => {
            var temp = data.toString().split('&');
            temp.forEach( one => {
                let item = one.split('=');
                content[item[0]] = item[1];
            })
        });
        req.on('end', () => {
            //给登陆的帐号以600s的生存周期的cookie
            //max-age 是按照秒算的
            //如果选择了Remember Me, response里面加一个set-cokie
            connection_account.query('select * from account where username = ?', [content.username], (err, result) => {
                if(err) {
                    console.log(err);
                    res.end('something wrong.');
                } else {
                    if(result.length === 0) {
                        res.end('something wrong.');
                    } else {
                        if(content.remember) {
                            res.setHeader('Set-Cookie', [`session=${content.username}`, `type=${result[0].acc_type}`, `no=${result[0].number}`,`username=${content.username};max-age = 600`]);
                        } else {
                            res.setHeader('Set-Cookie', [`session=${content.username}`, `type=${result[0].acc_type}`, `no=${result[0].number}`]);
                        }
                        result[0].acc_type === 'student' ? res.end(ejs.render(fs.readFileSync('./public/ejs/student.ejs', 'utf-8')))
                            : res.end(ejs.render(fs.readFileSync('./public/ejs/teacher.ejs', 'utf-8')));
                    }
                }
            })
        });
    }
    //在登陆之前进行查询
    else if(req.url === '/query_login') {
        let content = {};
        req.on('data', (data) => {
            var temp = data.toString().split('&');
            temp.forEach( one => {
                let item = one.split('=');
                content[item[0]] = item[1];
            })
        });
        req.on('end', () => {
            connection_account.query('select * from account where username = ? and password = ?', [content.username, content.password], (err, result) => {
                if(err) {
                    res.end('no');
                } else {
                    if(result.length === 0) {
                        res.end('no');
                    } else {
                        res.end('yes');
                    }
                }
            });
        })
    }
    //在注册之前进行查询 看username 和 studentNo是否已经存在
    else if(req.url === '/query_register') {
        let content = {};
        req.on('data', (data) => {
            var temp = data.toString().split('&');
            temp.forEach( one => {
                let item = one.split('=');
                content[item[0]] = item[1];
            })
        });
        req.on('end', () => {
            connection_account.query('select * from account where username = ? or number = ?', [content.username, content.studentno], (err, result) => {
                if(err) {
                    console.log(err);
                    res.end('no');
                } else {
                    if(result.length === 0) {
                        res.end('yes'); //yes:可以注册 之后就开始注册
                        connection_account.query('insert into account values(?,?,?,?)', [content.username, content.password, content.acc_type, content.studentno], (err, data) => {
                            if(err) {
                                console.log(err);
                            } else {
                                res.end('yes');
                            }
                        });
                    } else {
                        res.end('no');//no:不可以注册
                    }
                }
            });
        });
    }
}

