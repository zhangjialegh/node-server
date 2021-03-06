// -d --root 静态文件目录 -o --host 主机 -p --port 端口号
let yargs = require('yargs');
let Server = require('../util/pathread.js')
let argv = yargs.option('d', {
    alias: 'root',
    demand: false,
    description: '请配置监听静态文件目录',
    default: process.cwd(),
    type: 'string'
}).option('o', {
    alias: 'host',
    demand: false,
    description: '请配置监听的主机',
    default: 'localhost',
    type: 'string'
}).option('p', {
    alias: 'port',
    demand: false,
    description: '请配置监听的主机的端口号',
    default: 8080,
    type: 'number'
}).usage('myselfsever -d / -p 8080 -o localhost')
    .example(
        'myselfsever -d / -p 9090 -o localhost', '在本机器的9090端口上监听客户端发来的请求'
    ).help('h').argv;


let server = new Server();
server.start(argv);