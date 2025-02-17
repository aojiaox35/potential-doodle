#include <WiFi.h>
#include <WebServer.h>

// 网络配置
const char* ssid = "Your_SSID";
const char* password = "Your_PASSWORD";

WebServer server(80);

// 电机控制引脚
const int IN1 = 13;
const int IN2 = 12;

// 当前状态
int intensity = 0;
bool powerOn = false;

void setup() {
  Serial.begin(115200);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  
  // 连接WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nConnected to WiFi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // 设置HTTP路由
  server.on("/control", HTTP_POST, handleControl);
  server.on("/status", handleStatus);
  
  server.begin();
}

void loop() {
  server.handleClient();
  updateMotor();
}

void handleControl() {
  if (server.method() != HTTP_POST) return;
  
  powerOn = server.arg("power") == "on";
  intensity = server.arg("intensity").toInt();
  
  String response = "{\"status\":\"success\",\"power\":\"" 
                  + String(powerOn?"on":"off") 
                  + "\",\"intensity\":" 
                  + intensity + "}";
                  
  server.send(200, "application/json", response);
}

void handleStatus() {
  String response = "{\"connected\":true,\"power\":\""
                  + String(powerOn?"on":"off")
                  + "\",\"intensity\":"
                  + intensity + "}";
                  
  server.send(200, "application/json", response);
}

void updateMotor() {
  if (!powerOn) {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    return;
  }
  
  int pwmValue = map(intensity, 0, 100, 0, 255);
  analogWrite(IN1, pwmValue);
  digitalWrite(IN2, LOW);
}