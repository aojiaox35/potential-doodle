const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 设备状态存储
let deviceState = {
  connected: false,
  power: false,
  intensity: 0,
  lastUpdated: null
};

// 模拟设备连接
function simulateDeviceConnection() {
  deviceState.connected = Math.random() > 0.2; // 80% 连接成功率
}

// 中间件配置
app.use(cors());
app.use(express.json());

// HTTP 接口
app.post('/control', (req, res) => {
  const { power, intensity } = req.body;
  
  if (!deviceState.connected) {
    return res.status(503).json({ error: '设备未连接' });
  }

  // 参数验证
  if (typeof power !== 'boolean' || 
      typeof intensity !== 'number' ||
      intensity < 0 || 
      intensity > 100) {
    return res.status(400).json({ error: '无效参数' });
  }

  // 更新设备状态
  deviceState = {
    ...deviceState,
    power,
    intensity,
    lastUpdated: new Date()
  };

  // 广播状态更新
  broadcastState();
  
  // 这里添加实际控制设备的代码
  console.log(`发送指令: 电源 ${power ? '开' : '关'}, 强度 ${intensity}%`);
  
  res.json({ 
    status: 'success',
    ...deviceState
  });
});

app.get('/status', (req, res) => {
  simulateDeviceConnection();
  res.json({
    connected: deviceState.connected,
    lastUpdated: deviceState.lastUpdated
  });
});

// WebSocket 处理
wss.on('connection', (ws) => {
  ws.send(JSON.stringify(deviceState));
  
  ws.on('close', () => {
    console.log('客户端断开连接');
  });
});

// 广播状态更新
function broadcastState() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(deviceState));
    }
  });
}

// 定时状态检查
setInterval(() => {
  simulateDeviceConnection();
  broadcastState();
}, 5000);

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});