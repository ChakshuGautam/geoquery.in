import { Injectable, Logger } from "@nestjs/common";
import { CreatePlaceDto, SearchPlaceDto } from "./dto/place.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PlaceService {
    private readonly logger = new Logger(PlaceService.name);

    constructor(private readonly prisma: PrismaService) { }

    async createPlace(createPlaceDto: CreatePlaceDto): Promise<any> {
        const { name, type, tag, lat, lon } = createPlaceDto;
        const point = `ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)`;
        this.logger.debug(`Adding place ${createPlaceDto}`)
        return this.prisma.$executeRawUnsafe(
            `INSERT INTO "Place" (name, type, tag, location) VALUES ($1, $2, $3, ${point})`,
            name,
            type,
            tag,
        );
    }

    async searchPlaces(searchPlaceDto: SearchPlaceDto): Promise<any> {
        const { geofenceBoundary, name, tag, type } = searchPlaceDto;

        // Create a polygon for the geofence
        const polygon = `ST_MakePolygon(ST_GeomFromText('LINESTRING(${geofenceBoundary
            .map((point) => point.join(' '))
            .join(', ')}, ${geofenceBoundary[0].join(' ')})', 4326))`;

        // Base query for filtering places
        let query = `
            SELECT id, name, type, tag, ST_AsText(location::geometry) as location
            FROM "Place"
            WHERE ST_Within(location, ${polygon})
        `;

        // Add optional filters
        if (name) {
            query += ` AND name ILIKE '%${name}%'`;
        }
        else if (tag) {
            query += ` AND tag ILIKE '%${tag}%'`;
        }
        else if (type) {
            query += ` AND type ILIKE '%${type}%'`;
        }

        // Execute the query
        return this.prisma.$queryRawUnsafe(query);
    }
}
