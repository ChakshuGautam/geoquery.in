import { Module } from '@nestjs/common';
import { CityModule } from './modules/city/city.module';
import { GeorevModule } from './modules/georev/georev.module';
import { LocationModule } from './modules/location/location.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { config } from './config/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlaceModule } from './modules/place/place.module';

@Module({
  imports: [
    CityModule,
    GeorevModule,
    LocationModule,
    PlaceModule,
    PrismaModule,
    ConfigModule.forRoot({
      envFilePath: `.env`,
      load: [config],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
