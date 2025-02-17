#后端依赖
、、、
npm install express ws cors morgan helmet
、、、

#后端部署
、、、
NODE_ENV=production nohup node server.js &
、、、

#前端部署
1.配置Nginx反向代理
2.启用HTTPS（使用Let's Encrypt）
3.配置CORS白名单

