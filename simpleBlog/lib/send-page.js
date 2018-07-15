fs = require('fs');

//渲染页面
function sendPage(pathname, contentType, res) {
    fs.exists(pathname, function (err) {
        if (!err) {
            send404(res);
        } else {
            fs.readFile(pathname, function (err, data) {
                if (err) {
                    send500(res);
                } else {
                    res.writeHead(200, { 'content-type': contentType });
                    res.end(data.toString());
                }
            });
        }
    });//path.exists
}

function send404(res) {
    res.writeHead(404, { 'content-type': 'text/html; charset = utf-8' });
    res.end("<h1>404</h1><p>file not found</p>");
}
function send500(res) {
    res.writeHead(500, { 'content-type': 'text/html; charset = utf-8' });
    res.end("<h1>500</h1><p>server error</p>");
}


exports.sendPage = sendPage;
exports.send404 = send404;
exports.send500 = send500;