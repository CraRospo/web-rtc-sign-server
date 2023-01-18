const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server;

// 创建 websocket 服务器 监听在 3000 端口
const wss = new WebSocketServer({port: 8010})

// 服务器被客户端连接
wss.on('connection', (ws, req) => {
  console.log(req.socket.remoteAddress)
  console.log(req.headers)
  console.log('开始链接')
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
