#!/usr/bin/env node
import yargs from 'yargs'
import readline from 'node:readline'
import * as sudpee from './index.js'

const DEFAULT_PORT = 2020
const DEFAULT_RECEIVE_ADDRESS = '0.0.0.0'
const DEFAULT_SEND_ADDRESS = '255.255.255.255'

const argv = yargs.scriptName('sudpee').help()
  .command('receive', 'receive data over UDP', yargs => {
    yargs.options({
      port: {
        alias: 'p',
        describe: 'on which port to listen',
        default: DEFAULT_PORT
      },
      address: {
        alias: 'a',
        describe: 'on which address to listen',
        default: DEFAULT_RECEIVE_ADDRESS
      },
      timestamp: {
        alias: 't',
        describe: 'print timestamp on data receive'
      },
      sender: {
        alias: 's',
        describe: 'print address of sender'
      }
    })
      .boolean(['date'])
  }, receive).command('send', 'send data over UDP', function (yargs) {
    return yargs.options({
      message: {
        alias: 'm',
        describe: 'the message to be sent'
      },
      stdin: {
        alias: 'i',
        describe: 'send multiple messages from stdin'
      },
      port: {
        alias: 'p',
        describe: 'to which port to send',
        default: DEFAULT_PORT
      },
      address: {
        alias: 'a',
        describe: 'to which address to send',
        default: DEFAULT_SEND_ADDRESS
      }
    }).boolean(['stdin'])
  }, send)
  .argv

function receive (argv) {
  sudpee.receive((msg, info) => {
    const preStrings = []
    if (argv.date) preStrings.push(new Date().toISOString())
    if (argv.sender) preStrings.push(`${info.senderAddress}:${info.senderPort}`)

    console.log(`${preStrings.join(' | ') + (preStrings.length > 0 ? ' | ' : '')}`, msg)
  }, argv.port, argv.address)
    .then(receiver => {
      receiver.on('error', err => console.error(err))
      console.log(`listening on: ${receiver.address}:${receiver.port}`)
    })
    .catch(err => console.error(err))
}

function send (argv) {
  if (argv.message) {
    sudpee.send(argv.message, argv.port, argv.address)
  } else if (argv.stdin) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'message: '
    })

    rl.prompt()
    rl.on('line', msg => {
      msg.trim()
      sudpee.send(msg, argv.port, argv.address)
      rl.prompt()
    })
  } else {
    console.error('No message or input provided')
  }
}
