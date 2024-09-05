import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function executeStateCreateQuery(properties, geoJsonData) {
  const query = `
      INSERT INTO "State" ("state_code",
                           "state_name",
                           "metadata",
                           "geometry")
      VALUES ('${properties.STCODE11}',
              '${properties.STNAME}',
              jsonb_build_object(
                'levelLocationName', '${properties.levelLocationName}',
                'stname_sh', '${properties.STNAME_SH}',
                'shape_length', ${properties.Shape_Length},
                'shape_area', ${properties.Shape_Area},
                'state_lgd', ${properties.State_LGD},
                'max_simp_tol', ${properties.MaxSimpTol},
                'min_simp_tol', ${properties.MinSimpTol}
              ),
              ST_SetSRID(ST_GeomFromGeoJSON('${geoJsonData}'), 4326));
  `;

  await prisma.$executeRawUnsafe(query);
}


export async function findState(state_name) {
  return prisma.$queryRawUnsafe(`
      WITH input AS (SELECT '${state_name}'::VARCHAR AS input_name)
      SELECT st.state_name, st.state_code, levenshtein(i.input_name, st.state_name) as levenshtein
      FROM "State" st,
           input i
      WHERE levenshtein(i.input_name, st.state_name) <= 5
      ORDER BY levenshtein LIMIT 1;
  `);
}


export async function executeDistrictCreateQuery(properties, geoJsonData, state) {
  const query = `
      INSERT INTO "District" ("district_code",
                              "district_name",
                              "metadata",
                              "geometry",
                              "state_id")
      VALUES ('${properties.dtcode11}',
              '${properties.dtname}',
              jsonb_build_object(
                'levelLocationName', '${properties.levelLocationName}',
                'year_stat', '${properties.year_stat}',
                'shape_length', ${properties.SHAPE_Length},
                'shape_area', ${properties.SHAPE_Area},
                'dist_lgd', ${properties.Dist_LGD}
              ),
              ST_SetSRID(ST_GeomFromGeoJSON('${geoJsonData}'), 4326),
              ${state.state_code});
  `;
  await prisma.$executeRawUnsafe(query);
}


export async function findDistrict(district_name) {
  return prisma.$queryRawUnsafe(`
      WITH input AS (SELECT '${district_name}'::VARCHAR AS input_name)
      SELECT dt.district_name, dt.district_code, levenshtein(i.input_name, dt.district_name) as levenshtein
      FROM "District" dt,
           input i
      WHERE levenshtein(i.input_name, dt.district_name) <= 5
       OR i.input_name ILIKE '%' || dt.district_name || '%'
       OR dt.district_name ILIKE '%' || i.input_name || '%'
      ORDER BY levenshtein LIMIT 1;
  `);
}


export async function executeSubDistrictCreateQuery(properties, geoJsonData, state, district) {
  const query = `
      INSERT INTO "SubDistrict" ("subdistrict_code",
                                 "subdistrict_name",
                                 "metadata",
                                 "geometry",
                                 "state_id",
                                 "district_id")
      VALUES ('${properties.sdtcode11}',
              '${properties.sdtname}',
              jsonb_build_object(
                'levelLocationName', '${properties.levelLocationName}',
                'Shape_Length', ${properties.Shape_Length},
                'Shape_Area', ${properties.Shape_Area},
                'Subdt_LGD', ${properties.Subdt_LGD}
              ),
              ST_SetSRID(ST_GeomFromGeoJSON('${geoJsonData}'), 4326),
              ${state.state_code},
              ${district.district_code});
  `;
  await prisma.$executeRawUnsafe(query);
}


export async function findSubDistrict(subdistrict_name) {
  return prisma.$queryRawUnsafe(`
      WITH input AS (SELECT '${subdistrict_name}'::VARCHAR AS input_name)
      SELECT dt.subdistrict_name, dt.subdistrict_code, levenshtein(i.input_name, dt.subdistrict_name) as levenshtein
      FROM "SubDistrict" dt,
           input i
      WHERE levenshtein(i.input_name, dt.subdistrict_name) <= 5
      ORDER BY levenshtein LIMIT 1;
  `);
}


export async function executeVillageCreateQuery(properties, geoJsonData, state, district, subDistrict) {
  const query = `
      INSERT INTO "Village" (
                             "village_name",
                             "metadata",
                             "geometry",
                             "state_id",
                             "district_id",
                             "subdistrict_id")
      VALUES (
              '${properties.NAME}',
              jsonb_build_object(),
              ST_SetSRID(ST_GeomFromGeoJSON('${geoJsonData}'), 4326),
              ${state.state_code},
              ${district.district_code},
              ${subDistrict.subdistrict_code});
  `;
  await prisma.$executeRawUnsafe(query);
}
