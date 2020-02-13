```
                  __                           
                 /\ \                          
  ____  __  __   \_\ \  _____      __     __   
 /',__\/\ \/\ \  /'_` \/\ '__`\  /'__`\ /'__`\ 
/\__, `\ \ \_\ \/\ \L\ \ \ \L\ \/\  __//\  __/ 
\/\____/\ \____/\ \___,_\ \ ,__/\ \____\ \____\
 \/___/  \/___/  \/__,_ /\ \ \/  \/____/\/____/
                          \ \_\                
                           \/_/                                        
```

**Simple UDP for node.**

## Features
* Sending and receiving unicast/broadcast messages via UDP
* Automatically stringifies and parses sent and received JSON
* CLI Tool

## Documentation
  * [Usage](#usage)
    * [Receving Data](#receiving-data)
    * [Sending Data](#sending-data)
  * Examples
    * [Basic Example](#basic-example)
    * [Advanced Example](#advanced-example)
  * [CLI Tool](#cli-tool)
    * [Receiving Data](#receving-data-with-cli)
    * [Sending Data](#sending-Data-with-cli)

## Usage

### Receving Data

```javascript
const receiver = await sudpee.receive((message, info) => {}, [port], [address])
```
* `message` received message (if string is JSON, it is automatically parsed to JSON)
* `info`
  ```javascript
  {
    receiverAddress: string,
    receiverPort: number,
    senderAddress: string,
    senderPort: number,
    size: number,
  }
  ```
* `port` on which port to listen for data _(default: 2020)_
* `address` on which address to listen for data _(default: 0.0.0.0)_
* `receiver.finish()` close underlying socket
* `receiver.on('error', err => {})` callback for errors from the receiver

### Sending Data

```javascript
await sudpee.send(message, [port], [address])
```
* `message` the message to be sent
* `port` to which port to send _(default: 2020)_
* `address` to which address to send _(default=broadcast: 255.255.255.255)_


## Basic Example

```javascript
const sudpee = require('sudpee');

(async () => {
  // receive UDP broadcast on port 3000
  await sudpee.receive(msg => console.log(msg), 3000)
  // send UDP broadcast to port 3000
  sudpee.send('Hello World', 3000)  
})()
```
```
$ Hello World
```

## Advanced Example
```javascript
const sudpee = require('sudpee');

(async () => {
  const end = 3

  const receiver = await sudpee.receive((msg, info) => {
    console.log('message: ', msg, `from: ${info.senderAddress}:${info.senderPort}`)
    // automatically parses JSON
    // .finish() closes the underlying socket
    if (msg.counter === end) receiver.finish()
  }, 3000, '192.168.1.23')

  receiver.on('error', err => console.error(err))

  for (let i = 1; i <= end; i++) {
    // automatically stringifies JSON
    await sudpee.send({ counter: i }, 3000, '192.168.1.23')
  }
})()
```
```
$ message:  { counter: 1 } from: 192.168.1.23:37357
$ message:  { counter: 2 } from: 192.168.1.23:58838
$ message:  { counter: 3 } from: 192.168.1.23:34600
```

## CLI Tool

### Install CLI

`npm i sudpee -g`

### Receving Data with CLI

`sudpee receive <options>`
* `-p` port (default: 2020)
* `-a` address (default: 0.0.0.0)
* `-t` print timestamp
* `-s` print sender address
* `--help` print help

### Sending Data with CLI

`sudpee send <options>`
* `-p` Port (default: 2020)
* `-a` address (default=broadcast: 255.255.255.255)
* `-m` the message to be sent
* `-i` read message from stdin (alternative to `-m`)
* `--help` print help