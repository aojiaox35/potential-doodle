# 部署说明
安装依赖：
、、、
bash
npm install express ws cors
、、、
启动服务器：
、、、
bash
node server.js
、、、

修改API地址为：
、、、
const API_ENDPOINT = 'http://你的服务器地址:3000/control';
、、、

设备的实际控制（例子）
、、、
// 在POST /control处理程序中添加硬件控制代码
const serialPort = require('serialport');
const port = new serialPort('/dev/ttyUSB0', { baudRate: 9600 });

function sendToDevice(command) {
  const buffer = Buffer.from(`P${command.power ? 1 : 0}V${command.intensity}\n`);
  port.write(buffer);
}
、、、
