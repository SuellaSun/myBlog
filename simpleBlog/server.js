var http = require('http');
var url = require('url');
var path = require('path');
var static = require('./lib/static-request-handler');
var dynamic = require('./lib/dynamic-request-handler');
var mime =require('./lib/mime-type');
var PORT = 3000;



var server = http.createServer(onRequest);
//服务器监听程序
function onRequest(req, res) {

    var pathname = url.parse(req.url).pathname;

    // 获取后缀名并解析为相应的文件类型
    var suffix = path.extname(pathname);
    
    // 根据后缀名区分静态资源和动态资源请求
    if (suffix != null && suffix.trim() != "") {
        var contentType = mime.getContentType(suffix);
        static.staticReqHandler(pathname, contentType, res);
    } else {
        dynamic.dynamicReqHandler(pathname, req, res);
    }

}//onRequest

server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");