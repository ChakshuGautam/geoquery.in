import { Module } from '@nestjs/common';
import { CityModule } from './modules/city/city.module';
import { GeorevModule } from './modules/georev/georev.module';
import { LocationModule } from './modules/location/location.module';
import { ConfigModule } from '@nestjs/config';
import { config } from './config/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    CityModule,
    GeorevModule,
    LocationModule,
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV || 'default'}.env`,
      load: [config],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
