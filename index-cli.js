#!/usr/bin/env node
const yargs = require('yargs')
const sudpee = require('./index')

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
      date: {
        alias: 'd',
        describe: 'print current date on data receive'
      },
      sender: {
        alias: 's',
        describe: 'print address of sender'
      }
    })
      .boolean(['date'])
  }, receive).command('send', 'send data over UDP', function (yargs) {
    return yargs.options({
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
    })
  })
  .argv

function receive (argv) {
  sudpee.receive((msg, info) => {
    const preStrings = []
    if (argv.date) preStrings.push(new Date().toISOString())
    if (argv.sender) preStrings.push(`${info.senderAddress}:${info.senderPort}`)

    console.log(`${preStrings.join(' | ') + (preStrings.length > 0 ? ' | ' : '')}`, msg)
  }, argv.port, argv.address)
}
