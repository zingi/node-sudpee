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

test('release port', async t => {
  const receiver1 = await sudpee.receive(undefined, 3002)
  await receiver1.finish()

  return new Promise(resolve => {
    sudpee.receive(msg => resolve(`2: ${msg}`), 3002)
    sudpee.send('hello udp', 3002)
  }).then(msg => t.is(msg, '2: hello udp'))
})
