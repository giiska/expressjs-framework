export const controllerList: any[] = []
export const controllerActionList: any[] = []
export const authList: any[] = []
// export const roleList: any[] = []
export const middlewareList: any[] = []
export const paramsList: any[] = []

export function DController(basePath: string): Function {
  return function controllerDecorator<T extends {new (...args: any[]): {}}>(Cls: T) {
    controllerList.push({
      basePath,
      Cls,
    })
    return Cls
  }
}

export function Get(path?: string): MethodDecorator {
  return helperForRoutes('get', path);
}

export function Post(path?: string): MethodDecorator {
  return helperForRoutes('post', path);
}

export function Put(path?: string): MethodDecorator {
  return helperForRoutes('put', path);
}

export function Delete(path?: string): MethodDecorator {
  return helperForRoutes('delete', path);
}

function helperForRoutes(httpVerb: string, path?: string): MethodDecorator {
  return function(target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    controllerActionList.push({
      method: propertyKey,
      target: target.constructor,
      httpVerb,
      path: path ? ('/' + path) : ''
    })
  }
}

function helperForParam(paramType: string, paramName?: string): Function {
  return function(target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    paramsList.push({
      method: propertyKey,
      target: target.constructor,
      paramName,
      paramType
    })
  }
}

export function Ctx(): Function {
  return helperForParam('context')
}
export function Req(): Function {
  return helperForParam('request')
}
export function Body(): Function {
  return helperForParam('body')
}
export function BodyParam(bodyName: string): Function {
  return helperForParam('body-param', bodyName)
}
export function QueryParams(): Function {
  return helperForParam('queries')
}
export function QueryParam(queryName: string): Function {
  return helperForParam('query', queryName)
}
export function Param(paramName: string): Function {
  return helperForParam('param', paramName)
}
export function Params(): Function {
  return helperForParam('params')
}
export function CurrentUser(): Function {
  return helperForParam('currentUser')
}


export function Auth(authType: string): Function {
  return function DecoratorFunction(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    authList.push({
      method: propertyKey,
      target: target.constructor,
      authType
    })
  }
}


// export function Role(roleName: string): MethodDecorator {
//   return function RoleFunction(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//     roleList.push({
//       method: propertyKey,
//       target: target.constructor,
//       roleName
//     })
//   }
// }

export function Middleware(middleware: Function | Function[]): MethodDecorator {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    middlewareList.push({
      method: propertyKey,
      target: target.constructor,
      middleware
    })
  }
}
