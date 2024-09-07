

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class GeoqueryService {
  private readonly logger = new Logger(GeoqueryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async queryStateContains(lat: number, lon: number) {
    this.logger.log(`Querying state with lat: ${lat}, lon: ${lon}`);

    return this.prisma.$queryRawUnsafe(`
        SELECT s.state_code AS state_code,
               s.state_name AS state_name
        FROM "State" s
        WHERE ST_Contains(s.geometry, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326));
    `);
  }

  async queryDistrictContains(lat: number, lon: number) {
    this.logger.log(`Querying district with lat: ${lat}, lon: ${lon}`);

    return this.prisma.$queryRawUnsafe(`
        SELECT s.state_code AS state_code,
               s.state_name AS state_name,
               d.district_code AS district_code,
               d.district_name AS district_name
        FROM "District" d
        JOIN "State" s ON d.state_id = s.state_code
        WHERE ST_Contains(d.geometry, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326));
    `);
  }

  async querySubDistrictContains(lat: number, lon: number) {
    this.logger.log(`Querying sub-district with lat: ${lat}, lon: ${lon}`);

    return this.prisma.$queryRawUnsafe(`
        SELECT s.state_code AS state_code,
               s.state_name AS state_name,
               d.district_code AS district_code,
               d.district_name AS district_name,
               sd.subdistrict_code AS subdistrict_code,
               sd.subdistrict_name AS subdistrict_name
        FROM "SubDistrict" sd
        JOIN "District" d ON sd.district_id = d.district_code
        JOIN "State" s ON d.state_id = s.state_code
        WHERE ST_Contains(sd.geometry, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326));
    `);
  }

  async queryVillageContains(lat: number, lon: number) {
    this.logger.log(`Querying village with lat: ${lat}, lon: ${lon}`);

    return this.prisma.$queryRawUnsafe(`
        SELECT s.state_code AS state_code,
               s.state_name AS state_name,
               d.district_code AS district_code,
               d.district_name AS district_name,
               sd.subdistrict_code AS subdistrict_code,
               sd.subdistrict_name AS subdistrict_name,
               v.village_code AS village_code,
               v.village_name AS village_name
        FROM "Village" v
        JOIN "SubDistrict" sd ON v.subdistrict_id = sd.subdistrict_code
        JOIN "District" d ON sd.district_id = d.district_code
        JOIN "State" s ON d.state_id = s.state_code
        WHERE ST_Contains(v.geometry, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326));
    `);
  }

  async geometryCentroid(tableMeta: { tname: string; fname: string }, fieldName: string) {
    this.logger.log(`SELECT *, ST_AsGeoJson(ST_Centroid(geometry)) as coordinate
                     FROM "${tableMeta.tname}"
                     WHERE ${tableMeta.fname} ILIKE '${fieldName}';`);
    return this.prisma.$queryRawUnsafe(`
        SELECT ${tableMeta.fname}, ST_AsGeoJson(ST_Centroid(geometry)) as coordinate
        FROM "${tableMeta.tname}"
        WHERE ${tableMeta.fname} ILIKE '${fieldName}' LIMIT 1;
    `);
  }

  async fuzzyStateSearch(state_name: string) {
    return this.prisma.$queryRawUnsafe(`
        WITH input AS (SELECT '${state_name }'::VARCHAR AS input_name)
        SELECT st.name AS state_name, st.code AS state_code, levenshtein(i.input_name, st.name) as levenshtein
        FROM "State" st,
             input i
        WHERE levenshtein(i.input_name, st.name) <= 5
        ORDER BY levenshtein LIMIT 1;
    `);
  }

  async fuzzyDistrictSearch(district_name: string, filter: { state_name?: string }) {
    const { state_name } = filter;

    let whereClause = `
    WHERE (levenshtein(i.input_name, dt.name) <= 5
           OR i.input_name ILIKE '%' || dt.name || '%'
           OR dt.name ILIKE '%' || i.input_name || '%')`;

    if (state_name) {
      whereClause += ` AND st.name ILIKE '${state_name}'`;
    }

    return this.prisma.$queryRawUnsafe(`
        WITH input AS (SELECT '${district_name}'::VARCHAR AS input_name)
        SELECT dt.name AS district_name, dt.code AS district_code, levenshtein(i.input_name, dt.name) as levenshtein, st.name AS state_name
        FROM "District" dt
        JOIN "State" st ON dt.state_id = st.state_code,
        input i ${whereClause}
        ORDER BY levenshtein LIMIT 1;
    `);
  }

  async fuzzySubDistrictSearch(subdistrict_name: string, filter: { state_name?: string, district_name?: string }) {
    const { state_name, district_name } = filter;

    let whereClause = `
    WHERE (levenshtein(i.input_name, sdt.name) <= 5
           OR i.input_name ILIKE '%' || sdt.name || '%'
           OR sdt.name ILIKE '%' || i.input_name || '%')`;

    if (state_name) {
      whereClause += ` AND st.name ILIKE '${state_name}'`;
    }

    if (district_name) {
      whereClause += ` AND dt.name ILIKE '${district_name}'`;
    }

    return this.prisma.$queryRawUnsafe(`
        WITH input AS (SELECT '${subdistrict_name}'::VARCHAR AS input_name)
        SELECT sdt.name AS subdistrict_name, sdt.code AS subdistrict_code, levenshtein(i.input_name, sdt.name) as levenshtein, st.name AS state_name, dt.name AS district_name
        FROM "SubDistrict" sdt
        JOIN "District" dt ON sdt.district_id = dt.district_code
        JOIN "State" st ON dt.state_id = st.state_code,
        input i ${whereClause}
        ORDER BY levenshtein LIMIT 1;
    `);
  }

  async fuzzyVillageSearch(village_name: string, filter: { state_name?: string, district_name?: string, subdistrict_name?: string }) {
    const { state_name, district_name, subdistrict_name } = filter;

    let whereClause = `
    WHERE (levenshtein(i.input_name, v.village_name) <= 5
           OR i.input_name ILIKE '%' || v.village_name || '%'
           OR v.village_name ILIKE '%' || i.input_name || '%')`;

    if (state_name) {
      whereClause += ` AND st.name ILIKE '${state_name}'`;
    }

    if (district_name) {
      whereClause += ` AND dt.name ILIKE '${district_name}'`;
    }

    if (subdistrict_name) {
      whereClause += ` AND sdt.name ILIKE '${subdistrict_name}'`;
    }

    return this.prisma.$queryRawUnsafe(`
        WITH input AS (SELECT '${village_name}'::VARCHAR AS input_name)
        SELECT v.village_name AS village_name, v.village_code AS village_code, levenshtein(i.input_name, v.village_name) as levenshtein, st.name AS state_name, dt.name AS district_name, sdt.name AS subdistrict_name
        FROM "Village" v
        JOIN "SubDistrict" sdt ON v.subdistrict_id = sdt.subdistrict_code
        JOIN "District" dt ON sdt.district_id = dt.district_code
        JOIN "State" st ON dt.state_id = st.state_code,
        input i ${whereClause}
        ORDER BY levenshtein LIMIT 1;
    `);
  }
}
