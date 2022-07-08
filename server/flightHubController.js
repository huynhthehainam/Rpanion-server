const request = require('request')
const fs = require('fs')
const { mavlink20 } = require('../mavlink/mavlink_common_v2')
const tokenPath = 'token.json'
const INTERVAL_TIME = 5000
const DRONE_HUB_URL = 'https://dronehub.api.mismart.ai'
class FlightHubController {
  constructor (settings, winston, fcManager, cloudUpload) {
    this.settings = settings
    this.winston = winston
    this.fcManager = fcManager
    this.cloudUpload = cloudUpload
    this.token = ''

    if (!fs.existsSync(tokenPath)) {
      this.writeLocal('')
    }
    this.isConnected = false
    this.accessToken = null
    const localDataStr = fs.readFileSync(tokenPath)
    const localData = JSON.parse(localDataStr)
    this.token = localData.token ? localData.token : ''
    this.mavLinkMessages = []
    this.flightHubMessages = []
    this.intervalObj = null
    this.startInterval()

    this.fcManager.eventEmitter.on('gotMessage', (msg) => {
      const itemIndex = this.mavLinkMessages.findIndex((item) => item._id === msg._id)

      if (itemIndex >= 0) {
        this.mavLinkMessages[itemIndex] = msg
      } else {
        // console.log('add new item', msg._name)
        this.mavLinkMessages.push(msg)
      }

      if (msg._id === mavlink20.MAVLINK_MSG_ID_GPS_RAW_INT) {
        const gpsMsg = this.findItemByMsgId(mavlink20.MAVLINK_MSG_ID_GPS_RAW_INT)
        const imuMsg = this.findItemByMsgId(mavlink20.MAVLINK_MSG_ID_RAW_IMU)
        // console.log(imuMsg)
        const direction = imuMsg.zgyro >= 0 ? imuMsg.zgyro : imuMsg.zgyro + 360
        this.flightHubMessages.push({
          latitude: gpsMsg.lat,
          longitude: gpsMsg.lon,
          direction
        })
      }
    })

    this.connectToFlightHub()
  }

  async connectToFlightHub () {
    this.isConnected = false
    this.cloudUpload.deviceToken = null
    request({
      url: `${DRONE_HUB_URL}/auth/GenerateDeviceToken`,
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      json: {
        deviceToken: this.token
      }

    }, (err, resp, body) => {
      if (resp.statusCode < 300) {
        this.accessToken = body.data.accessToken
        this.cloudUpload.deviceToken = this.token
        this.isConnected = true
      }
    })
  }

  findItemByMsgId (msgId) {
    return this.mavLinkMessages.find((item) => item._id === msgId)
  }

  startInterval () {
    this.intervalObj = setInterval(() => {
      if (this.getIsValid()) {
        if (this.flightHubMessages.length > 0) {
          const data = {
            data: this.flightHubMessages
          }
          request({
            url: `${DRONE_HUB_URL}/authorizeddevices/me/telemetryrecords`,
            method: 'POST',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${this.accessToken}`
            },
            json: data
          }, (err, resp, body) => {
          })
        }
      }

      this.flightHubMessages = []
    }, INTERVAL_TIME)
  }

  getIsValid () {
    return this.isConnected
  }

  getToken (callback) {
    return callback(this.token)
  }

  writeLocal (token) {
    const data = {
      token
    }
    const dataStr = JSON.stringify(data)
    fs.writeFileSync(tokenPath, dataStr, { recursive: true })
  }

  setToken (newToken, callback) {
    this.token = newToken
    this.writeLocal(this.token)
    this.connectToFlightHub(this.token)
    return callback(this.token)
  }
}

module.exports = FlightHubController
