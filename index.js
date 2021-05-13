import dgram from 'node:dgram'
import EventEmitter from 'node:events'

/**
 * Class for receving udp messages.
 * @extends EventEmitter
 * @property {Function} finish
 */
class Receiver extends EventEmitter {
  // pre-define finish here, so it shows up in VSCode IntelliSense
  /**
   * Stop listening
   * @returns {Promise<null>} promise resolves, when listening could be shut down successfully
   */
  finish(){}

  // https://stackoverflow.com/questions/47045000/how-do-i-jsdoc-custom-eventemitter-on-events-in-visual-studio-code
  // overriding addListener methods, for showing events in VSCode IntelliSense

  /**
   * @typedef {["message" | "error", ...any[]]} eventsDef
   */

  /**
   * @param {eventsDef} args
   */
   addListener(...args) {
    super.addListener(...args);
  }
  /**
   * @param {eventsDef} args
   */
  on(...args) {
    super.on(...args);
  }
}

/**
 * 
 * @param {string} address on which address to listen
 * @param {number} port on which port to listen
 * @param {messageReceivedCallback} clb callback function, which is called when a message was received
 * @returns 
 */
function createReceiver (address, port, clb) {
  return new Promise((resolve, reject) => {
    const receiver = new Receiver()
    const server = dgram.createSocket('udp4')

    /**
     * Helper function to process a received message internally.
     * @param {ArrayBufferLike} msg received message
     * @param {object} rinfo remote address info
     */
    function messageCallback (msg, rinfo) {
      /**
       * Meta information about a received message.
       * @typedef {object} MetaInfo
       * @property {string} receiverAddress address on which message was received
       * @property {number} receiverPort port on which messages was received
       * @property {string} senderAddress address from messgae sender
       * @property {number} senderPort port from message sender
       * @property {number} messageSize size of received message in bytes
       */
      /**
       * @type {MetaInfo} info
       */
      const info = {
        receiverAddress: server.address,
        receiverPort: port,
        senderAddress: rinfo.address,
        senderPort: rinfo.port,
        messageSize: rinfo.size
      }

      // try to parse message => string => object
      const returnedMessage = parseIncomingMessage(msg)

      // if callback was provided, call it
      if (clb) { clb(returnedMessage, info) }

      // always emit received message and MetaInfo to the receiver
      receiver.emit('message', returnedMessage, info)
    }

    // helper callback to forward an error
    function errorCallback (error) {
      receiver.emit('error', error)
    }

    // helper callback to forward an uncaught exception
    function uncaughtExceptionCallback (error) {
      if (error.errno === 'EADDRINUSE') {
        reject(error)
        finishCallback()
      }
    }

    // helper callback, which is called when listening is started successfully
    function listeningCallback () {
      const address = server.address()
      receiver.address = address.address
      receiver.port = address.port

      resolve(receiver)
    }

    /**
     * function to stop listening for udp messages
     * @returns {Promise<null>} promise resolves, when listening could be shut down successfully
     */    
    function finishCallback () {
      server.removeListener('message', messageCallback)
      server.removeListener('error', errorCallback)
      server.removeListener('listening', listeningCallback)
      process.removeListener('uncaughtException', uncaughtExceptionCallback)

      return new Promise(resolve => server.close(() => resolve()))
    }

    // listen for events, to forward them to the receiver object
    server.on('message', messageCallback)
    server.on('error', errorCallback)
    server.on('listening', listeningCallback)
    process.on('uncaughtException', uncaughtExceptionCallback)

    // set finish method of receiver, to enable to stop listening
    receiver.finish = finishCallback

    server.bind(port, address, () => resolve(receiver))
  })
}

/**
 * First tries to convert buffer to string.
 * If succesful tries to parse string as json object,
 * else returns buffer.
 * If parsing to object was succesful, returns object,
 * otherwise returns string.
 * @param {ArrayBufferLike} message received buffer
 * @returns {string|object|ArrayBufferLike}
 */
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

/**
 * Assure outgoing message is a string,
 * regardless if content is string or object.
 * @param {string|object} message 
 * @returns {string}
 */
function parseOutgoingMessage (message) {
  if (typeof message === 'object') {
    return JSON.stringify(message)
  }
  return message
}

/**
 * Callback for a recevied message.
 * @callback messageReceivedCallback
 * @param {string | object} message the received message
 * @param {MetaInfo} metaInfo meta information about the received message
 */

/**
 * Tries to listen on the provided address and port for udp messages.
 * If a message was received, it will returned to the provided callback.
 * 
 * @param {messageReceivedCallback} callback this function is called with the received message and metadata
 * @param {number} port listens on this port
 * @param {string} address listens on this address
 * @returns {Promise<Receiver>} if promise resolves successfully, it is actively receving messages
 */
function receive (callback, port = 2020, address = '0.0.0.0') {
  return new Promise((resolve, reject) => {
    createReceiver(address, port, callback).then(receiver => resolve(receiver)).catch(err => reject(err))
  })
}

/**
 * Tries to send the provided message via udp to the provided address and port.
 * Address defaults to broadcast.
 * 
 * @param {string | object} message content to send
 * @param {number} port to which port to the send the udp message
 * @param {string} address to which address to send the upd message
 * @returns {Promise<null>} if promise resolves, sending message was successful
 */
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

export {
  receive, send
}
