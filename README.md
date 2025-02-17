# 使用说明：
将代码中的API_ENDPOINT替换为实际的设备控制接口地址

需要后端接口支持以下功能：

POST /control 接收JSON格式的控制指令：
、、、
json
{
    "power": "on/off",
    "intensity": 0-100
}
、、、
GET /status 返回设备连接状态
