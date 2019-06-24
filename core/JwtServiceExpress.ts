import { Request, Response, NextFunction, RequestHandler } from "express";
import express_jwt from 'express-jwt'
import jsonwebtoken from 'jsonwebtoken'

import {rd} from '../lib/redis'

import { AuthTimeoutError, MissingParamError } from '../lib/error';

export class JwtService {

  private readonly _key: string;
  private readonly _secret: string;
  private readonly _middleware: RequestHandler;

  constructor(key: string, secret: string) {
      this._key = key;
      this._secret = secret;
      this._middleware = express_jwt({
        secret: this._secret,
        userProperty: 'payload',
        getToken: this.fromHeaderOrQuerystring
      })
  }

  getMiddleware(): RequestHandler {
    return this._middleware
  }

  fromHeaderOrQuerystring = (req: Request): String  =>{
    let token = null
    if (req.headers.authorization) {
      const authString = req.headers.authorization.split(' ')
      if(authString[0] === this._key)
        token = authString[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }
    return token;
  }

  getJwtPayload(req: Request) {
    const token = this.fromHeaderOrQuerystring(req)
    const decoded = jsonwebtoken.verify(token, this._secret)
    return decoded
  }

  async checkSession(req: Request) {
    const tok = this.fromHeaderOrQuerystring(req)
    if(!tok) {
      throw new MissingParamError()
    }
    const data = await rd.get(tok)
    if (data) {
      // token 在 redis 中存在，延长过期时间
      rd.updateExpire(tok)
      return true
    } else {
      return false
    }
  }

  checkSessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const session = this.checkSession(req)
    if(session) {
      next()
    }
    else {
      next(new AuthTimeoutError())
    }
  }

  jwtsign(data) {
    return jsonwebtoken.sign(data, this._secret)
  }
  
  addSession(tok: String): void {
    tok && rd.set(tok)
  }
  
  removeSession(req: Request): void {
    const tok = this.fromHeaderOrQuerystring(req)
    tok && rd.remove(tok)
  }

}
