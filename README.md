## Features

 - JWT + Redis 验证请求
 - 使用 Decorator 开发 Controller Action
 - Controller Action 采用类似 Koa 的简洁语法，`return` 内容即可，不需要写 `res.json` `res.send` 等。
语法示例：
```js
  @Get('logout')
  async logout(
    @Req() req: Request
  ) {
    await jwtServiceInstance.removeSession(req)
    return {
      error: 0,
      message: '成功退出'
    }
  }
```
 - 良好的错误处理机制，Action 中 `throw new Error()` 即可
 - 内部定义了大量常用错误类，如
 ```js
let result: UserModel = await UserService.getOneByUserName(req.body.user_name)
if(!result) {
  throw new ResourceNotFoundError(`user_name=${req.body.user_name}`)
}
// 接口返回“找不到 user_name=xxx 的资源"
 ```


## 开发约定

### API 规范

 - 接口输出按照以下格式   

```json
{
  "error_code": 10004, // 成功返回为 0
  "message": "状态说明.",
  // other payload
}
```


## decorator 说明

### Auth

ControllerAction 的访问权限控制范围，所有 Action 默认开启了 jwt，需要验证登录状态

 - Auth('public') 为不验证 jwt，即所有请求都可以通过
