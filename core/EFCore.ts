import 'reflect-metadata'
import http from 'http'
import { AddressInfo } from 'net'
import express, {  Application, Request, Response, NextFunction, Router, RequestHandler, ErrorRequestHandler  } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import {JwtService} from './JwtServiceExpress'
import {logger} from '../lib/logger'
import { controllerList, controllerActionList, authList, middlewareList, paramsList } from '../lib/decorator'
import { EFError } from '../lib/error';

export class EFCore {
  private readonly app: Application;
  private developmentMode: boolean;
  private _jwtService: JwtService;
  
  constructor({
    env,
    jwtServiceInstance,
    public_dir
  }) {
    const {bodyLimit, corsHeaders} = env
    this._jwtService = jwtServiceInstance

    this.developmentMode = process.env.NODE_ENV !== "production";
    let app = this.app = express()
    app.disable('x-powered-by')

    // logger
    app.use(morgan('combined'))

    app.use(cors({
      exposedHeaders: corsHeaders
    }))

    app.use(bodyParser.json({
      limit : bodyLimit
    }))
    app.use(cookieParser())
    app.use('/static', express.static(public_dir))

    this.initController()

    this.addErrorHandler()
  }

  private initController() {
    // logger.info('mmm', 'controllerList', controllerList)
    controllerList.forEach((controllerItem) => {
      const {basePath, Cls} = controllerItem
      
      type Constructor<T = any> = new (...args: any[]) => T;
      const Factory = <T>(target: Constructor<T>): T => {
        // 获取所有注入的服务
        const providers = Reflect.getMetadata('design:paramtypes', target); // [OtherService]
        if(!providers) {
          return new target()
        }
        const args = providers.map((provider: Constructor) => {
          switch (provider) {
            // case JwtService:
            //   return this._jwtService
            //   break;
          
            default:
              break;
          }
          return new provider()
        });
        return new target(...args);
      };

      const controller = Factory(Cls)
      const actions = controllerActionList.filter(item => item.target.name === Cls.name)
      // console.log('mmm', 'clsname', Cls.name, actions)
      // console.log('mmm', 'authList', authList)
      
      const router: Router = Router()
      actions.forEach(controllerAction => {
        const {method, httpVerb, path} = controllerAction
        const findFunc = (item) => item.target.name === Cls.name && method === item.method
        const authOption = authList.find(findFunc)
        // const roleOption = roleList.find(findFunc)
        const middlewareOption = middlewareList.find(findFunc)
        const routeHandler = async (req: Request, res: Response, next: NextFunction) => {
          const paramOptions = paramsList.filter(findFunc)
          const routeFunc = controller[method]
          let arg = []
          if(paramOptions) {
            paramOptions.forEach(paramOption => {
              let value
              if (paramOption.paramType === "currentUser") {
                value = this._jwtService.getJwtPayload(req);
              }
              else if (paramOption.paramType === "request")
                value = req;
              else if (paramOption.paramType === "response")
                value = res;
              else if (paramOption.paramType === "next")
                value = next;
              else
                value = this.getParamFromRequest(req, paramOption)
              arg.unshift(value)
            })
          }
          
          const result = routeFunc.apply(controller, arg)
          if(result && result.then) {
            const data = await result.catch((error) => {
              next(error)
            })
            res.json(data)
          }
          else {
            res.json(result)
          }
        }

        let curMiddlewareList = []

        if(!authOption || authOption.authType !== 'public') {
          curMiddlewareList.push(
            this._jwtService.getMiddleware(), 
            this._jwtService.checkSessionMiddleware
          )
        }
        // if(roleOption && roleOption.roleName) {
        //   curMiddlewareList.push(checkRoleMiddleware(roleOption.roleName))
        // }

        // Middleware decorator
        if(middlewareOption && middlewareOption.middleware) {
          if(Array.isArray(middlewareOption.middleware)) {
            curMiddlewareList = curMiddlewareList.concat(middlewareOption.middleware)
          }
          else
            curMiddlewareList.push(middlewareOption.middleware)
        }

        if (curMiddlewareList.length) {
          router[httpVerb](path, curMiddlewareList, routeHandler);
        } else {
          router[httpVerb](path, routeHandler);
        }

      })
      this.app.use(basePath, router)
    })
  }

  private addErrorHandler() {
    // catch 404 and forward to error handler
    const handle404: RequestHandler = function (req, res, next) {
      let err = new EFError('Not Found')
      err.status = 404
      next(err)
    }

    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
      if(this.developmentMode)
        console.log('mmm', 'err', err)

      res.status(err.status || 500)

      if (err instanceof Error) {
        res.json({
          name: err.name,
          message: err.message
        })
        return
      }

      res.json({
        message: 'server internal error'
      })
    }

    // error handler
    this.app.use([handle404, errorHandler])
    return this
  }
  
  /**
   * Gets param from the request.
   */
  getParamFromRequest(request: Request, param: any): any {
    switch (param.paramType) {
      case "body":
        return request.body;

      case "body-param":
        return request.body[param.paramName];

      case "param":
        return request.params[param.paramName];

      case "params":
        return request.params;

      case "query":
        return request.query[param.paramName];

      case "queries":
        return request.query;

      case "header":
        return request.headers[param.paramName.toLowerCase()];

      case "headers":
        return request.headers;

      case "file":
        return request.file;

      case "files":
        return request.files;
    }
  }

  startServer(PORT) {
    const server = http.createServer(this.app)
    server.listen(PORT, () => {
      const { port } = server.address() as AddressInfo;
      logger.info(`Started on port ${port}`)
    })
  }
}
