const server = require('./app').server

server
  .start()
  .then(() => console.log(`Server is running on http://localhost:4000`))
