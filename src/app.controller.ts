import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseUtil } from './shared/utils/response.util';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    const result = this.appService.getHello();
    return ResponseUtil.success(result, 'Hello World');
  }
}
