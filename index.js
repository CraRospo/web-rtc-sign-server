const express = require('express')
const session = require('express-session')
const http = require('http')
const UserRouter = require('./routes/user')
const mongoose = require('mongoose')
const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server

const app = express()
map = new Map()
const cacheChannel = new Map()
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
const wss = new WebSocketServer({ clientTracking: true, noServer: true });

// 监听upgrade
server.on('upgrade', function (request, socket, head) {

  socket.on('error', onSocketError);

  // 解析session
  sessionParser(request, {}, () => {
    if (!request.session) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    socket.removeListener('error', onSocketError);

    // 触发websocket的链接
    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request);
    });
  });
});

// 服务器被客户端连接
wss.on('connection', (ws, req) => {
  const userId = req.session.userId
  const userName = req.session.userName;

  // 给当前链接的socket添加id
  ws.connectionId = req.session.userId

  // 存入user-map
  map.set(userId, userName);

  // 发送一条系统消息
  wss.clients.forEach(client => {
    client.send(JSON.stringify({
      type: 'system',
      data: {
        msg: `欢迎${userName}加入群聊`
      }
    }))
  })

  ws.on('message', (message) => {
    const msg = message.toString()
    const { type, target, data } = JSON.parse(msg)

    wss.clients.forEach(client => {
      const currentId = client.connectionId
      switch (type) {
        case 'connect':
          if(target === currentId) {
            client.send(JSON.stringify({
              type: 'connect',
              data: {
                reqId: ws.connectionId,
                reqName: map.get(ws.connectionId)
              }
            }))
          }
          
          break;
        case 'offer':
        case 'answer':
        case 'accept':
        case 'denied':
        case 'stream-offer':
        case 'stream-answer':
        case 'stream-abort':
        case 'new-ice-candidate':
          if(target === currentId) {
            client.send(msg)
          }
          break;
        default:
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type,
              data: {
                id: client.connectionId,
                self: client === ws,
                name: map.get(client.connectionId),
                msg: data
              }
            }))
          }
          break;
      }
    })

    // 错误链接
    ws.on('error', console.error);
  })

  // 关闭链接
  ws.on('close', function () {
    console.log('close')
    map.delete(userId);
  });
})

function onSocketError(err) {
  console.error(err);
}

server.listen(8010)