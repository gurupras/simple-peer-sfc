const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const configPath = path.join(__dirname, 'config.yaml')

let config
try {
  config = yaml.safeLoad(fs.readFileSync(configPath))
  const { https } = config.server
  if (https) {
    https.key = fs.readFileSync(https.key)
    https.cert = fs.readFileSync(https.cert)
  }
} catch (e) {
  console.error('Failed to load config.yaml: ' + e.message)
  // throw e
}

if (process.env.NODE_ENV === 'development') {
  config.type = 'development'
}

Object.assign(config.server, config.server.production)

if (config.type === 'development') {
  Object.assign(config.server, config.server.dev)
}

module.exports = config
