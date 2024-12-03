import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PlaceService } from "./place.service";
import { CreatePlaceDto, SearchPlaceDto } from "./dto/place.dto";

@ApiTags('/place')
@Controller('place')
export class PlaceController {
    constructor(private readonly placeService: PlaceService) {}
    
    @Post('search')
    async searchPlace(@Body() searchPlaceDto: SearchPlaceDto) {
        return this.placeService.searchPlaces(searchPlaceDto);
    }

    @Post()
    async addPlace(@Body() createPlaceDto: CreatePlaceDto) {
        return this.placeService.createPlace(createPlaceDto);
    }
}