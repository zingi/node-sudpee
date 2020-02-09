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
* Sending and receiving unicast/broadcast messages via UDP.
* CLI Tool

## Basic Example

```javascript
const sudpee = require('sudpee');

(async () => {
  await sudpee.receive(msg => console.log(msg))
  sudpee.send('Hello World')  
})()

// > Hello World
```
