const dgram = require('dgram')
const events = require('events')

class Receiver extends events.EventEmitter {}

function createReceiver (address, port, clb) {
  return new Promise((resolve, reject) => {
    const receiver = new Receiver()
    const server = dgram.createSocket('udp4')

    function messageCallback (msg, rinfo) {
      const info = {
        receiverAddress: server.address,
        receiverPort: port,
        senderAddress: rinfo.address,
        senderPort: rinfo.port,
        messageSize: rinfo.size
      }

      const returnedMessage = parseIncomingMessage(msg)

      if (clb) { clb(returnedMessage, info) }
      receiver.emit('message', returnedMessage, info)
    }

    function errorCallback (error) {
      receiver.emit('error', error)
    }

    function uncaughtExceptionCallback (error) {
      if (error.errno === 'EADDRINUSE') {
        reject(error)
        finishCallback()
      }
    }

    function listeningCallback () {
      const address = server.address()
      receiver.address = address.address
      receiver.port = address.port

      resolve(receiver)
    }

    function finishCallback () {
      server.removeListener('message', messageCallback)
      server.removeListener('error', errorCallback)
      server.removeListener('listening', listeningCallback)
      process.removeListener('uncaughtException', uncaughtExceptionCallback)
      
      return new Promise(resolve => server.close(() => resolve()))
    }

    server.on('message', messageCallback)
    server.on('error', errorCallback)
    server.on('listening', listeningCallback)
    process.on('uncaughtException', uncaughtExceptionCallback)  

    receiver.finish = finishCallback

    server.bind(port, address, () => resolve(receiver))
  })
}

function parseIncomingMessage (message) {
  let string = null
  let json = null

  try {
    string = message.toString()
    json = JSON.parse(string)
  } catch (e) {}

  if (json) {
    return json
  } else if (string) {
    return string
  } else {
    return message
  }
}

function parseOutgoingMessage (message) {
  if (typeof message === 'object') {
    return JSON.stringify(message)
  }
  return message
}

function receive (callback, port = 2020, address = '0.0.0.0') {
  return new Promise((resolve, reject) => {
    createReceiver(address, port, callback).then(receiver => resolve(receiver)).catch(err => reject(err))
  })
}

function send (message, port = 2020, address = '255.255.255.255') {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket('udp4')

    try {
      client.bind(() => {
        if (address === '255.255.255.255') {
          client.setBroadcast(true)
        }

        client.send(parseOutgoingMessage(message), port, address, (err) => {
          client.close()

          if (err) reject(err)
          else resolve()
        })
      })
    } catch (error) {
      reject(error)
    }
  })
}

module.exports.receive = receive
module.exports.send = send
