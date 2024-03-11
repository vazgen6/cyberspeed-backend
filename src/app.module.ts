import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { MongoSanitizeMiddleware } from './middlewares/mongo-sanitize.middleware';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentPaths } from './environments';
import { UserMiddleware } from './middlewares/user.middleware';
import { WebsocketsModule } from './websockets/websockets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: EnvironmentPaths[process.env.NODE_ENV],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    AuthModule,
    UsersModule,
    ChatModule,
    WebsocketsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: MongoSanitizeMiddleware,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MongoSanitizeMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer.apply(UserMiddleware).exclude('/auth/(.*)').forRoutes('');
  }
}
