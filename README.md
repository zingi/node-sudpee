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
* [CLI Tool](#cli-tool)

## Basic Example

```javascript
const sudpee = require('sudpee');

(async () => {
  // receive UDP broadcast on port 3000
  await sudpee.receive(msg => console.log(msg), 3000)
  // send UDP broadcast to port 3000
  sudpee.send('Hello World', 3000)  
})()

// > Hello World
```

## Advanced Example
```javascript
const sudpee = require('sudpee');

(async () => {
  const end = 3

  const receiver = await sudpee.receive(msg => {
    console.log(msg)
    // automatically parses JSON
    // .finish() closes the underlying socket
    if (msg.counter === end) receiver.finish()
  }, 3000, '192.168.0.107')

  receiver.on('error', err => console.error(err))

  for (let i = 1; i <= end; i++) {
    // automatically stringifies JSON
    await sudpee.send({ counter: i }, 3000, '192.168.0.107')
  }
})()

// > { counter: 1 }
// > { counter: 2 }
// > { counter: 3 }
```

## CLI Tool

### Install

`npm i sudpee -g`

### Receving Data

`sudpee receive <options>`
* `-p` port (default: 2020)
* `-a` address (default: 0.0.0.0)
* `-t` print timestamp
* `-s` print sender address
* `--help` print help

### Sending Data

`sudpee send <options>`
* `-p` Port (default: 2020)
* `-a` address (default=broadcast: 255.255.255.255)
* `-m` the message to be sent
* `-i` read message from stdin (alternative to `-m`)
* `--help` print help