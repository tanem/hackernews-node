import { start } from './server'

;(async () => {
  const { httpServerUrl } = await start()
  console.log(`Server is running on ${httpServerUrl}`)
})()
