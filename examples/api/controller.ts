import {
  Auth, BodyParam, DController, Param,
  Post} from 'expressjs-framework'

@DController('/example')
export class ExampleController {
  @Post('param_example/:id/:user_name')
  @Auth('public')
  async paramExample(
    @Param('id') id: number,
    @BodyParam('user_name') user_name: string  ) {
    return {id, user_name}
  }
}