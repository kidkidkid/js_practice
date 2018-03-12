/**
 * Created by Administrator on 2017/6/19 0019.
 */

var superagent = require('superagent');
var cheerio = require('cheerio');

superagent.get('http://cnodejs.org/')
    .end( (err, res) => {
        //这个$就很类似与jquey了 先load一段html 然后就可以直接用$ 对内容进行筛选
        var $ = cheerio.load(res.text);
        $('.topic_title').each( (index, el) => {

        });

    });

