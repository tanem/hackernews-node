const start = require('./server').start

;(async () => {
  const { httpServerUrl } = await start()
  console.log(`Server is running on ${httpServerUrl}`)
})()
