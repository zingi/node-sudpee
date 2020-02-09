const test = require('ava')
const sudpee = require('./index')

test('send and receive', async t => {
  return new Promise(resolve => {
    sudpee.receive(msg => { resolve(msg) }, 3000)
    sudpee.send('hello udp', 3000)
  }).then(msg => t.is(msg, 'hello udp'))
})

test('json', async t => {
  return new Promise(resolve => {
    sudpee.receive(msg => { resolve(msg) }, 3001)
    sudpee.send({ value: 3 }, 3001)
  }).then(msg => t.is(msg.value, 3))
})
