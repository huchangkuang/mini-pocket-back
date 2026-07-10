import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      name: "mini-pocket-api",
      version: "0.0.1",
    };
  }
}
