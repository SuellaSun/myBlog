var fs = require('fs');
var send = require('./send-page');
var path = require('path');
const util = require('./util');

function writeData(pathname, req, res,handler) {
    var postData = '';

    req.on('data', function (chunk) {
        postData += chunk;
    });

    req.on('end', function () {
        insertUserInfo(pathname, postData, res);
    });
}

function insertUserInfo(pathname, postData, res) {

    var reslut = { "status": "" };

    var username = JSON.parse(postData).username;
    
    // 查看源文件中是否有内容
    fs.readFile(pathname, function (err, fileData) {
        if (err)
            send.send500(res);
        else {
            if (fileData == "") { // 如果文件为空，则写入格式如下
                postData = '[' + postData + ']';
            }
            else { // 如果格式不为空，则将待写入的数据加在最后一个元素后面
                postData = fileData.slice(0, fileData.length - 1) + ',' + postData + ']';
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
                    var filename = path.join(__dirname, '/../public/json/blog-information/'+username + '.json');
                    util.createFolder(filename);
                    fs.createWriteStream(filename);

                }
                res.writeHead(200, { 'content-Type': 'text/plain' });
                res.end(JSON.stringify(reslut));
            });
        }
    });
}

function insertBlogInfo(pathname, postData, res) {
    var reslut = { "status": "" };

    // 查看源文件中是否有内容
    fs.readFile(pathname, function (err, fileData) {
        if (err)
            send.send500(res);
        else {

            if (fileData == "") { // 如果文件为空，则写入格式如下
                postData.id = 1;
                postData = '[' + JSON.stringify(postData) + ']';
            }
            else { // 如果格式不为空，则在将待写入的数据加在最后一个元素后面
                postData.id = JSON.parse(fileData).length + 1;
                postData = '[' + JSON.stringify(postData) + ',' + fileData .slice(1, fileData.length);

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
}

exports.writeData = writeData;
exports.insertUserInfo = insertUserInfo;
exports.insertBlogInfo = insertBlogInfo;