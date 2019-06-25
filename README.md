## 说明

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


## decorator instructions

### Auth

ControllerAction 的访问范围

 - Auth('public') 为不验证 jwt，即所有请求都可以通过
