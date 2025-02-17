const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 增强配置
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: ['https://your-domain.com'],
  methods: ['GET', 'POST']
}));

// 设备状态存储
const deviceState = {
  connected: false,
  power: false,
  intensity: 0,
  lastUpdated: null
};

// 硬件控制接口（模拟）
class DeviceController {
  constructor() {
    this.connection = this.initializeConnection();
  }

  async initializeConnection() {
    // 实际硬件连接逻辑
    return true;
  }

  async sendCommand(command) {
    // 实际发送指令到硬件
    console.log(`Sending command: ${JSON.stringify(command)}`);
    return Math.random() > 0.1; // 模拟90%成功率
  }
}

const device = new DeviceController();

// HTTP接口
app.post('/control', async (req, res) => {
  try {
    const { power, intensity } = req.body;
    
    // 输入验证
    if (typeof power !== 'boolean' || 
        !Number.isInteger(intensity) ||
        intensity < 0 || 
        intensity > 100) {
      return res.status(400).json({ error: '无效参数' });
    }

    // 发送到硬件
    const success = await device.sendCommand({ power, intensity });
    
    if (!success) {
      return res.status(500).json({ error: '设备控制失败' });
    }

    // 更新状态
    Object.assign(deviceState, {
      power,
      intensity,
      lastUpdated: new Date(),
      connected: true
    });

    broadcastState();
    
    res.json(deviceState);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/status', (req, res) => {
  res.json({
    connected: deviceState.connected,
    lastUpdated: deviceState.lastUpdated
  });
});

// WebSocket处理
wss.on('connection', (ws) => {
  ws.send(JSON.stringify(deviceState));
  
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
  });
});

function broadcastState() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(deviceState));
    }
  });
}

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    uptime: process.uptime()
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '系统错误' });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});