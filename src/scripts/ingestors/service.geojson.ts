import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function executeStateCreateQuery(properties, geoJsonData) {
  const query = `
      INSERT INTO "State" ("stcode11",
                           "stname",
                           "levelLocationName",
                           "stname_sh",
                           "shape_length",
                           "shape_area",
                           "state_lgd",
                           "max_simp_tol",
                           "min_simp_tol",
                           "geometry")
      VALUES ('${properties.STCODE11}',
              '${properties.STNAME}',
              '${properties.levelLocationName}',
              '${properties.STNAME_SH}',
              ${properties.Shape_Length},
              ${properties.Shape_Area},
              ${properties.State_LGD},
              ${properties.MaxSimpTol},
              ${properties.MinSimpTol},
              ST_SetSRID(ST_GeomFromGeoJSON('${geoJsonData}'), 4326));
  `;

  await prisma.$executeRawUnsafe(query);
}


export async function findState(stname) {
  return prisma.$queryRawUnsafe(`
      WITH input AS (SELECT '${stname}'::VARCHAR AS input_name)
      SELECT st.stname, st.stcode11, levenshtein(i.input_name, st.stname) as levenshtein
      FROM "State" st,
           input i
      WHERE levenshtein(i.input_name, st.stname) <= 5
      ORDER BY levenshtein LIMIT 1;
  `);
  // return prisma.state.findUnique({
  //   where: {
  //     // stcode11_stname: {
  //     //   stcode11: stcode11,
  //       stname: stname,
  //     // },
  //   },
  // });
}


export async function executeDistrictCreateQuery(properties, geoJsonData, state) {
  const query = `
      INSERT INTO "District" ("dtcode11",
                              "dtname",
                              "levelLocationName",
                              "year_stat",
                              "shape_length",
                              "shape_area",
                              "dist_lgd",
                              "geometry",
                              "stateId")
      VALUES ('${properties.dtcode11}',
              '${properties.dtname}',
              '${properties.levelLocationName}',
              '${properties.year_stat}',
              ${properties.SHAPE_Length},
              ${properties.SHAPE_Area},
              ${properties.Dist_LGD},
              ST_SetSRID(ST_GeomFromGeoJSON('${geoJsonData}'), 4326),
              ${state.stcode11});
  `;

  // console.log(query);

  // try {
  await prisma.$executeRawUnsafe(query);
  // console.log(`Ingested: ${properties.dtname}`);
  // } catch (error) {
  //   console.error(`Error inserting ${properties.dtname}:`, error);
  // }
}


export async function findDistrict(dtname) {
  return prisma.$queryRawUnsafe(`
      WITH input AS (SELECT '${dtname}'::VARCHAR AS input_name)
      SELECT dt.dtname, dt.dtcode11, levenshtein(i.input_name, dt.dtname) as levenshtein
      FROM "District" dt,
           input i
      WHERE levenshtein(i.input_name, dt.dtname) <= 5
       OR i.input_name ILIKE '%' || dt.dtname || '%'
       OR dt.dtname ILIKE '%' || i.input_name || '%'
      ORDER BY levenshtein LIMIT 1;
  `);
  // return prisma.district.findUnique({
  //   where: {
  //     // stcode11_stname: {
  //     //   stcode11: stcode11,
  //     dtname: dtname,
  //     // },
  //   },
  // });
}


export async function executeSubDistrictCreateQuery(properties, geoJsonData, state, district) {
  const query = `
      INSERT INTO "SubDistrict" ("sdtcode11",
                                 "sdtname",
                                 "levelLocationName",
                                 "Shape_Length",
                                 "Shape_Area",
                                 "Subdt_LGD",
                                 "geometry",
                                 "stateId",
                                 "districtId")
      VALUES ('${properties.sdtcode11}',
              '${properties.sdtname}',
              '${properties.levelLocationName}',
              ${properties.Shape_Length},
              ${properties.Shape_Area},
              ${properties.Subdt_LGD},
              ST_SetSRID(ST_GeomFromGeoJSON('${geoJsonData}'), 4326),
              ${state.stcode11},
              ${district.dtcode11});
  `;
  await prisma.$executeRawUnsafe(query);
}

export async function findSubDistrict(dtname) {
  return prisma.$queryRawUnsafe(`
      WITH input AS (SELECT '${dtname}'::VARCHAR AS input_name)
      SELECT dt.sdtname, dt.sdtcode11, levenshtein(i.input_name, dt.sdtname) as levenshtein
      FROM "SubDistrict" dt,
           input i
      WHERE levenshtein(i.input_name, dt.sdtname) <= 5
      ORDER BY levenshtein LIMIT 1;
  `);
}


export async function executeVillageCreateQuery(properties, geoJsonData, state, district, subDistrict) {
  const query = `
      INSERT INTO "Village" (
                             "vgname",
                             "geometry",
                             "stateId",
                             "districtId",
                             "subDistrictId")
      VALUES (
              '${properties.NAME}',
              ST_SetSRID(ST_GeomFromGeoJSON('${geoJsonData}'), 4326),
              ${state.stcode11},
              ${district.dtcode11},
              ${subDistrict.sdtcode11});
  `;
  // console.log(query);
  await prisma.$executeRawUnsafe(query);
}
