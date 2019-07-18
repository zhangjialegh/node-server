let path = require('path');
let config = {
    host: 'localhost',// 监听主机
    port: 8006,// 主机端口号
    root: path.join(__dirname, '../static')// 静态文件根目录
}
module.exports = config;