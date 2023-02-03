const express = require('express')
const session = require('express-session')
const http = require('http')
const UserRouter = require('./routes/user')
const mongoose = require('mongoose')
const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server

const app = express()
const map = new Map()
// 设置默认 mongoose 连接
const mongoDB = 'mongodb://127.0.0.1/admin';
mongoose.set('strictQuery', false);
mongoose.connect(mongoDB);
// 让 mongoose 使用全局 Promise 库
mongoose.Promise = global.Promise;
// 取得默认连接
const db = mongoose.connection;

// 将连接与错误事件绑定（以获得连接错误的提示）
db.on('error', console.error.bind(console, 'MongoDB 连接错误：'));

// 创建session-parse
const sessionParser = session({
  saveUninitialized: false,
  secret: '$eCuRiTy',
  resave: false
});

// 中间件
app.use(sessionParser);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 路由
app.use('/api', UserRouter)

//端口
app.set('port', 8010)

// 创建serve实例
const server = http.createServer(app)

// 创建 websocket 服务器
const wss = new WebSocketServer({ clientTracking: false, noServer: true });

// 监听upgrade
server.on('upgrade', function (request, socket, head) {

  socket.on('error', onSocketError);

  console.log('Parsing session from request...');

  // 解析session
  sessionParser(request, {}, () => {
    if (!request.session) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    console.log('Session is parsed!');

    socket.removeListener('error', onSocketError);

    // 触发websocket的链接
    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request);
    });
  });
});

// 服务器被客户端连接
wss.on('connection', (ws, req) => {
  const userId = req.session.userId;
  const userName = req.session.userName;

  const notification = {
    type: 'text',
    data: {
      id: userId,
      type: 0,
      name: 'System',
      msg: `欢迎${userName}加入群聊`
    }
  }

  ws.send(JSON.stringify(notification))

  map.set(userId, ws);

  ws.on('error', console.error);

  ws.on('message', (message) => {

    const msg = message.toString()
    const response = JSON.stringify({
        type: 'text',
        data: {
          id: userId,
          type: 1,
          name: userName,
          msg
        }
      })

    ws.send(response, (err) => { // send 方法的第二个参数是一个错误回调函数
      if (err) {
        console.log(`[SERVER] error: ${err}`);
      }
    })

    ws.on('close', function () {
      map.delete(userId);
    });
  })
})

function onSocketError(err) {
  console.error(err);
}

server.listen(8010)