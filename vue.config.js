const config = require('./config')
const proxyPath = config.server.proxy_path

module.exports = {
  devServer: {
    host: '0.0.0.0',
    port: 3242,
    disableHostCheck: true,
    public: 'misc.twoseven.xyz',
    https: config.server.https,
    proxy: {
      '/socket.io': {
        target: proxyPath,
        ws: true
      },
      '/websocket': {
        target: proxyPath,
        ws: true
      }
    }
  }
}
