import {EFCore, logger} from 'expressjs-framework'

import './controller'

import env from './config'
import {jwtServiceInstance} from './jwt'

const {PORT} = env

const boot = async () => {
  const args: any = {
    env,
    jwtServiceInstance
  }
  const application = new EFCore(args)
  application.startServer(PORT)
}

boot().catch((error) => {
  logger.error(error)
})
