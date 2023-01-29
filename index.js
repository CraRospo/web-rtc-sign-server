const express = require('express')
const http = require('http')
const UserRouter = require('./routes/user')
const mongoose = require('mongoose')
const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server

const app = express()
// 设置默认 mongoose 连接
const mongoDB = 'mongodb://127.0.0.1/admin';
mongoose.connect(mongoDB);
// 让 mongoose 使用全局 Promise 库
mongoose.Promise = global.Promise;
// 取得默认连接
const db = mongoose.connection;

// 将连接与错误事件绑定（以获得连接错误的提示）
db.on('error', console.error.bind(console, 'MongoDB 连接错误：'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', UserRouter)
app.set('port', 8020)

const server = http.createServer(app)

server.listen(8020)

// 创建 websocket 服务器 监听在 3000 端口
const wss = new WebSocketServer({port: 8010})

// 服务器被客户端连接
wss.on('connection', (ws, req) => {
  const test = {
    type: 'text',
    data: {
      id: 0,
      type: 0,
      name: '',
      msg: '欢迎‘阿婆’加入聊天'
    }
  }

  const systemMsg = JSON.stringify(test)
  
  ws.send(systemMsg, (err) => {
    if (err) {
      console.log(`[SERVER] error: ${err}`);
    }
  })

  ws.on('message', (message) => {
    const msg = message.toString()

    const response = JSON.stringify({
      type: 'text',
      data: {
        id: 0,
        type: 1,
        name: 'Grece',
        msg
      }
    })

    ws.send(response, (err) => { // send 方法的第二个参数是一个错误回调函数
      if (err) {
        console.log(`[SERVER] error: ${err}`);
      }
    })
  })
})

wss.on('wsClientError', (err, ws, req) => {
  console.log('client-error')
  console.log(error)
})

wss.on('error',(error) => console.log('error' + error) )
