import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const fs = require('fs')
const keyFile  = fs.readFileSync('../key.pem');
const certFile  = fs.readFileSync('../cert.pem');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: keyFile,
      cert: certFile
    }
  });
  await app.listen(3002);
}
bootstrap();
