var fs = require('fs');
var path = require('path');
var write = require('./write-data');
var send = require('./send-page');
const util = require('./util');

function dynamicReqHandler(pathname, req, res) {
    switch (pathname) {
        case "/":
            pathname = "./public/views/index.html";
            send.sendPage(pathname, 'text/html', res);
            break;
        case "/login":
            login(req, res);
            break;
        case "/signup":
            signup(req, res);
            break;
        case "/uniqueValidate":
            uniqueValidate(req, res);
            break;
        case "/postBlogs":
            postBlog(req, res);
            break;
        case "/getBlogList":
            getList(res);
            break;
        case "/getPersonalhome":
            getPersonalHomePage(req, res);
            break;
        case "/getArticleDetails":
            getArticleDetails(req, res);
            break;

        default:
            send.send500(res);
    }
}

// 用户登录验证
function login(req, res) {
    console.log("Request handler 'login' was called.");

    var postData = '';
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到postData变量中
    req.on('data', function (chunk) {
        postData += chunk;
    });
    // 在end事件触发后然后向客户端返回。
    req.on('end', function () {
        var reslut = { 'status': '' };
        postData = JSON.parse(postData);

        fs.readFile('./public/json/user-infomation.json', function (err, userInfo) {
            if (err)
                send.send500(res);
            else {
                if(userInfo !=""){
                    userInfo = JSON.parse(userInfo);
                    let flag = util.userExists(userInfo, postData);
                    if (flag >= 0) 
                        reslut.status = 200;
                    else 
                        reslut.status = 401.1;
                    res.writeHead(200, { 'content-Type': 'text/plain' });
                    res.end(JSON.stringify(reslut));
                }else{
                    reslut.status = 401.1;
                    res.writeHead(200, { 'content-Type': 'text/plain' });
                    res.end(JSON.stringify(reslut));
                }
            }
        });
    });
}

// 注册
function signup(req, res) {
    console.log("Request handler 'signup' was called.");
    pathname = './public/json/user-infomation.json';
    write.writeData(pathname, req, res);
}

// 验证用户名是否唯一
function uniqueValidate(req, res) {
    console.log("Request handler 'uniqueValidate' was called.");
    var postData = '';
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到postData变量中
    req.on('data', function (chunk) {
        postData += chunk;
    });
    // 在end事件触发后然后向客户端返回。
    req.on('end', function () {

        postData = JSON.parse(postData);// 解析接收的浏览器请求
        console.log(postData);

        // 返回给客户端的状态数据
        var reslut = { 'isUnique': '' };
        fs.readFile('./public/json/user-infomation.json', function (err, userInfo) {
            if (err)
                send.send500(res);
            else {
                if (userInfo != "") {
                    userInfo = JSON.parse(userInfo);
                    var flag = false;
                    for (var i = 0; i < userInfo.length; i++) {
                        if (userInfo[i].username === postData.username) 
                            flag = true;
                    }
                    if (flag) // 存在，不唯一
                        reslut.isUnique = false;
                    else  // 不存在，唯一
                        reslut.isUnique = true;
                    res.writeHead(200, { 'content-Type': 'text/plain' });
                    res.end(JSON.stringify(reslut));
                }
            }
        });
    });
}

// 提交博客数据
function postBlog(req, res) {
    console.log("Request handler 'postBlogs' was called.");
    var postData = '';

    req.on('data', function (chunk) {
        postData += chunk;
    });

    req.on('end', function () {
        postData = JSON.parse(postData);

        fs.readFile('./public/json/user-infomation.json', function (err, userInfo) {
            if (err)
                send.send500(res);
            else {
                let pathname = util.getPath(userInfo, postData.user);
                postData.blog.username = postData.user.username;
                write.insertBlogInfo(pathname, postData.blog, res);
            }
        });
    });

}
// 首页读取JSON数据，显示博客列表（修改，显示所有用户的最新10条）
function getList(res) {
    console.log("Request handler 'getList' was called.");

    dirname = path.join(__dirname, '/../public/json/blog-information/');
    let fileNames = util.findSync(dirname);
    var datas = [];
    for (let i = 0; i < fileNames.length; i++) {
        datas[i] = fs.readFileSync(fileNames[i], 'utf-8');
    }
    var copyDatas = util.getNotNullFile(datas);
    var blogData = "";
    if (copyDatas.length != 0) {
        var blogData = copyDatas[0].slice(0, copyDatas[0].length - 1);
        for (let i = 1; i < copyDatas.length; i++) {
            blogData += ',' + copyDatas[i].slice(1, copyDatas[i].length - 1);
        }
        blogData += ']';

        // 以date降序重新排列blogData
        blogData = JSON.parse(blogData).sort(util.keySort("date"));

        res.writeHead(200, { 'content-Type': 'application/json' });
        res.end(JSON.stringify(blogData));
    }
    else {
        blogData = "[]";

        res.writeHead(200, { 'content-Type': 'application/json' });
        res.end(blogData);
    }
}

// 读取个人主页数据
function getPersonalHomePage(req, res) {
    console.log("Request handler 'getPersonalHomePage' was called.");

    var postData = '';
    req.on('data', function (chunk) {
        postData += chunk;
    });
    // 在end事件触发后然后向客户端返回。
    req.on('end', function () {
        postData = JSON.parse(postData);// 解析接收的浏览器请求

        // 根据用户名区分是哪个用户的主页数据，读取相应文件
        fs.readFile('./public/json/user-infomation.json', function (err, userInfo) {
            if (err)
                send.send500(res);
            else {
                var pathname = util.getPath(userInfo, postData);
                send.sendPage(pathname, "application/json", res);
            }
        });
    });
}

// 获取博客详情
function getArticleDetails(req, res) {
    console.log("Request handler 'getArticleDetails' was called.");

    var postData = '';
    req.on('data', function (chunk) {
        postData += chunk;
    });

    req.on('end', function () {
        postData = JSON.parse(postData);
        let pathname = './public/json/blog-information/' + postData.username + '.json';
        blogData = JSON.parse(fs.readFileSync(pathname, 'utf-8'));

        res.writeHead(200, { 'content-type': "application/json" });
        res.end(JSON.stringify(blogData[blogData.length - postData.id]));
    });
}
exports.dynamicReqHandler = dynamicReqHandler;