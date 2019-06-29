
import {JwtService} from 'expressjs-framework'
import env from './config'

const {JWTKEY, JWTSECRET} = env
export const jwtServiceInstance = new JwtService(JWTKEY, JWTSECRET)