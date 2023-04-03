#include <HTTPClient.h>

#include <ArduinoJson.h>

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

//LEDs
int blue = 5;
int green = 6;
int red = 7;

HTTPClient http;
String server = "http://172.20.10.2:7005/";
String current_status = "current_status";
String ble_mac_addresses = "ble_mac";

const char* UBIDOTS_TOKEN = "BBFF-0mYAG51tYbnT7cBHyyCCieFnzBcN8A";  // Put here your Ubidots TOKEN
const char* WIFI_SSID = "iPhone-Ayushman";                          // Put here your Wi-Fi SSID
const char* WIFI_PASS = "wifilelo123";                              // Put here your Wi-Fi password

// Ubidots
#include <Ubidots.h>
Ubidots ubidots(UBIDOTS_TOKEN, UBI_HTTP);


const int maxDevices = 10;                // max number of devices that can be monitored
String devicesOfInterest[maxDevices];     // identification of the devices being monitored
int nDevices = 0;                         // number of devices being monitored

int nDevicesFound = 0;                    // number of devices of interest detected and within threshold
int devicesFound[maxDevices];             // the devices detected by the scan within threshold (-1 represents no value)

bool deviceFound[maxDevices];
bool deviceInRange[maxDevices];

int thresholdRSSI = -55;
int timeOfScan = 5;

void getMonitoredDevices()
{
  String getURL = server + ble_mac_addresses;
  http.begin(getURL.c_str());

  int responseCode = http.GET();
  String payload = http.getString();

  http.end();

  // Serial.print("GET DEVICES PAYLOAD: ");
  // Serial.println(payload);

  StaticJsonDocument<400> doc;
  DeserializationError error = deserializeJson(doc, payload);

  // Test if parsing succeeds.
  if (error) {
    // Serial.print(F("deserializeJson() failed: "));
    // Serial.println(error.f_str());
    return;
  }

  nDevices = doc["devices"].size();
  for(int i = 0 ; i  < nDevices ; ++i)
  {
    const char* temp = doc["devices"][i];
    devicesOfInterest[i] = String(temp);

    Serial.print("Device: ");
    Serial.println(devicesOfInterest[i]);
  }
  
}

bool sendDeviceStatus(bool deviceInRange)
{
  String postURL = server + current_status;
  http.begin(postURL.c_str());

  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<400> doc;
  JsonObject object = doc.to<JsonObject>();
  object["is_present"] = deviceInRange;
  object["n_devices_found"] = nDevicesFound;

  StaticJsonDocument<400> doc1;
  JsonArray array = doc1.to<JsonArray>();
  for(int i = 0 ; i < nDevicesFound ; ++i)
  {
    array.add(devicesFound[i]);
    Serial.print("Found Device: ");
    Serial.println(devicesFound[i]);
  }

  object["devices_found"] = array;

  String jsonString;
  serializeJson(doc, jsonString);

  Serial.print("DATA SENT via POST: ");
  Serial.println(jsonString);

  int responseCode = http.POST(jsonString);

  if(responseCode > 0)
  {
    // Serial.print("POST Request Successful. Code: ");
    // Serial.println(responseCode);
    return 1;
  }
  else
  {
    // Serial.print("Error in POST Request: ");
    // Serial.println(responseCode);
    return 0;
  }

  http.end();
}

bool getCommonDeviceStatus()
{
  String getURL = server + current_status;
  http.begin(getURL.c_str());

  int responseCode = http.GET();
  String payload = http.getString();

  http.end();

  Serial.print("GET STATUS PAYLOAD: ");
  Serial.println(payload);

  StaticJsonDocument<400> doc;
  DeserializationError error = deserializeJson(doc, payload);

  // Test if parsing succeeds.
  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return 0;
  }

  Serial.print("Device Status Received: ");
  bool value = doc["is_present"];
  Serial.println(value);
  return value;
}

int deviceRSSI; // temp variable for checking RSSI
class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks{
  void onResult(BLEAdvertisedDevice advertisedDevice)
  {
    
    deviceRSSI = advertisedDevice.getRSSI();

    for(int i = 0 ; i < nDevices ; ++i)
    {

      if((strcmp(advertisedDevice.getAddress().toString().c_str(), devicesOfInterest[i].c_str()) == 0) || 
         (advertisedDevice.haveName() && (strcmp(advertisedDevice.getName().c_str(), devicesOfInterest[i].c_str()) == 0)))
      {
        deviceFound[i] = true;
        if(deviceRSSI > thresholdRSSI)
        {
          deviceInRange[i] = true;
        }
      }

    }

    // if(deviceRSSI > thresholdRSSI)
    //   Serial.printf("Advertised Device: %s\n", advertisedDevice.toString().c_str());

  }
};

BLEScan* bleDeviceScanner;

void setup() {
  Serial.begin(115200);

  // Ubidots
  while(!ubidots.wifiConnect(WIFI_SSID, WIFI_PASS))
  {
    //  wait for WiFi connection
    delay(500);
    Serial.println("Waiting for WiFi ... ");
  }

  //  DEFINE LED PIN  //
  pinMode(red, OUTPUT);
  pinMode(green, OUTPUT);
  pinMode(blue, OUTPUT);

  Serial.println("Scanning for BLE Devices...");

  BLEDevice::init("M5StampC3");
  bleDeviceScanner = BLEDevice::getScan();
  bleDeviceScanner->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  
  // some parameters related to the scan
  bleDeviceScanner->setActiveScan(true);
  bleDeviceScanner->setInterval(100);
  bleDeviceScanner->setWindow(99);

}

void loop() {
  
  Serial.println(F("---------------------------------------------------------- NEW SCAN -----------------------------------------------------------------"));
  
  getMonitoredDevices();
  
  // reset the values to be updated in the scan
  for(int i = 0 ; i < maxDevices ; ++i)
  {
    deviceFound[i] = false;
    deviceInRange[i] = false;
  }

  nDevicesFound = 0;

  bool anyDeviceInRange = false;
  int deviceId = -1;

  BLEScanResults foundDevices = bleDeviceScanner->start(timeOfScan, false);
  
  
  int index = 0;
  for(int i = 0 ; i < nDevices ; ++i)
  {
    if(deviceFound[i])
    {
      Serial.printf("Device %d detected by the scan. Identification: ", i);
      Serial.println(devicesOfInterest[i].c_str());

      if(deviceInRange[i])
      {
        Serial.printf("Device %d is within the set threshold.\n", i);
        anyDeviceInRange = true;
        deviceId = i;

        devicesFound[index] = i;
        index++;
      }
    }
  }

  nDevicesFound = index;

  if(anyDeviceInRange == true)
  {
    Serial.println(F("At least one device of interest was in range."));

  }
  else
  {
    Serial.println(F("No device of interest was in range."));
  }

  Serial.println(F("Sending values to Backend..."));

  bool sentToBackend = false;
  digitalWrite(blue, HIGH);
  sentToBackend = sendDeviceStatus(anyDeviceInRange);
  
  if(sentToBackend)
  {
    Serial.println(F("Values sent to Backend Successfully."));
  }
  else
  {
    Serial.println(F("Values couldn't be sent to Backend."));   
  }

  digitalWrite(blue, LOW);

  bool currentDeviceStatus = getCommonDeviceStatus();
  ubidots.add("deviceDetected", currentDeviceStatus);
  ubidots.add("deviceId", deviceId);

  delay(200);
  Serial.println(F("Sending values to Ubidots..."));   

  bool bufferSent = false;
  digitalWrite(red, HIGH);
  
  bufferSent = ubidots.send();

  if(bufferSent)
  {
    Serial.println("Values sent to Ubidots successfully.");
  }
  else
  {
    Serial.println("Values couldn't be sent to Ubidots.");   
  }

  digitalWrite(red, LOW);
  

  bleDeviceScanner->clearResults();
  delay(2000);
}
