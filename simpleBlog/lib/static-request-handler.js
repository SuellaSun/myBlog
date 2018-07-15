var fs = require('fs');
var send = require('./send-page');

//静态资源处理
function staticReqHandler(pathname, contentType, res) {
    console.log("receive:" + pathname);

    pathname = './public' + pathname;

    console.log("realpath:" + pathname);

    send.sendPage(pathname, contentType, res);
}//staticReqHandler

exports.staticReqHandler = staticReqHandler;