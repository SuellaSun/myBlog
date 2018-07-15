var fs = require('fs');
var send = require('./send-page');

function writeData(pathname, req, res) {
    var postData = '';
    
    req.on('data', function (chunk) {
        postData += chunk;
    });

    req.on('end', function () {
        var reslut = { "status": "" };
        //查看源文件中是否有内容
        fs.readFile(pathname, function (err, data) {
            if (err)
                send500(res);
            else {
                if (data == "") {
                    postData = '[' + postData + ']';
                }
                else {
                    var buf = new Buffer(data);
                    postData = buf.slice(0, buf.length - 1) + ',' + postData + ']';
                }
                fs.writeFile(pathname, postData, 'utf8', function (err) {
                    if (err) {
                        console.log('保存失败');
                        reslut.status = 403.3;
                    }
                    else {
                        // 保存完成后的回调函数
                        console.log("保存完成");
                        reslut.status = 200;
                    }
                    res.writeHead(200, { 'content-Type': 'text/plain' });
                    res.end(JSON.stringify(reslut));

                });
            }
        });
    });
}

exports.writeData = writeData;