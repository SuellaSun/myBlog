var send = require('./send-page');
var fs = require('fs');
var write = require('./write-data');

//动态请求处理
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
            getPersonalHomePage(res);
            break;
        default:
            sen.send500(res);
    }//switch
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

        postData = JSON.parse(postData);// 解析接收的浏览器请求
        console.log(postData);

        // 返回给客户端的状态数据
        var reslut = { 'status': '' };
        fs.readFile('./public/json/user-infomation.json', function (err, uesrInfo) {
            if (err)
                send.send500(res);
            else {
                uesrInfo = JSON.parse(uesrInfo);
                var flag = false;
                for (var i = 0; i < uesrInfo.length; i++) {
                    if (uesrInfo[i].username === postData.username && uesrInfo[i].password === postData.password) {
                        flag = true;
                    }
                }
                if (flag) {
                    reslut.status = 200;
                    //res.writeHead(200, { 'content-Type': 'text/plain' });
                }
                else {
                    reslut.status = 401.1;
                    //res.writeHead(530, { 'content-Type': 'text/plain' });
                }
                res.writeHead(200, { 'content-Type': 'text/plain' });
                res.end(JSON.stringify(reslut));
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
        fs.readFile('./public/json/user-infomation.json', function (err, uesrInfo) {
            if (err)
                send.send500(res);
            else {
                uesrInfo = JSON.parse(uesrInfo);
                var flag = false;
                for (var i = 0; i < uesrInfo.length; i++) {
                    if (uesrInfo[i].username === postData.username) {
                        flag = true;
                    }
                }
                if (flag) { // 存在，不唯一
                    reslut.isUnique = false;   
                }
                else {  // 不存在，唯一
                    reslut.isUnique = true;  
                }
                res.writeHead(200, { 'content-Type': 'text/plain' });
                res.end(JSON.stringify(reslut));
            }
        });
    });
}

// 提交博客数据
function postBlog(req, res) {
    console.log("Request handler 'postBlogs' was called.");

    pathname = './public/json/user-blogs.json';
    write.writeData(pathname, req, res);
}
// 读取JSON数据
function getList(res) {
    console.log("Request handler 'getList' was called.");

    pathname =['./public/json/blog-information/2910776796@qq.com.json','./public/json/blog-information/suella123.json','./public/json/blog-information/zhangsan123.json'];
     var datas = [];

    for(var i= 0;i<pathname.length;i++){
        datas[i] = fs.readFileSync(pathname[i],'utf-8');
    }
    
    var str = datas[0].slice(0,datas[0].length-1);
    for(var i= 1;i<datas.length;i++){
        str += ','+datas[i].slice(1,datas[i].length-1);
    }
    str += ']';

    blogData = JSON.parse(str);
    blogData.sort(keySort('date',true));
    
    res.writeHead(200, { 'content-Type': 'application/json' });
                res.end(JSON.stringify(blogData));
}

//对数组对象根据某一属性值排序
function keySort(key,sortType){
    return function(a,b){
         return sortType ? ~~a[key]<b[key]:~~a[key]>b[key]
     }
 }

// 读取个人主页数据
function getPersonalHomePage(res) {
    console.log("Request handler 'getPersonalHomePage' was called.");

    pathname = './public/json/user-blogs.json';
    send.sendPage(pathname, "application/json", res);

}

exports.dynamicReqHandler = dynamicReqHandler;