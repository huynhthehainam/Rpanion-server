const assert = require('assert')
const settings = require('settings-store')
const FHCManagerClass = require('./flightController')
const winston = require('./winstonconfig')(module)

describe('Flight Hub Controller Functions', function () {
  it('#fcinit()', function () {
    const fhc = FHCManagerClass(settings, winston)
    assert(fhc, 'Not connected')
  })
})
