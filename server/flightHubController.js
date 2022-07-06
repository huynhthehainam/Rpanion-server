const fs = require('fs')
const tokenPath = 'token.json'
class FlightHubController {
  constructor (settings, winston) {
    this.settings = settings
    this.winston = winston
    this.token = ''
    if (!fs.existsSync(tokenPath)) {
      this.writeLocal('')
    }
    const localDataStr = fs.readFileSync(tokenPath)
    const localData = JSON.parse(localDataStr)
    this.token = localData.token ? localData.token : ''
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
    return callback(this.token)
  }
}

module.exports = FlightHubController
