export const config = () => ({
    NODE_ENV: process.env.NODE_ENV || 'default',
    port: process.env.PORT,
    requiredGeoLocationLevels: [
      "SUBDISTRICT",
      "DISTRICT",
      "STATE"
    ],
    geoLocationLevels: {
      VILLAGE: 'VILLAGE',
      SUBDISTRICT: 'SUBDISTRICT',
      DISTRICT: 'DISTRICT',
      STATE: 'STATE'
    },
    levelsMapping: {
      STATE: {
        name: 'state',
        path: 'state',
        depth: 0,
      },
      DISTRICT: {
        name: 'district',
        path: 'state->district',
        depth: 1,
      },
      SUBDISTRICT: {
        name: 'subDistrict',
        path: 'state->district->subDistrict',
        depth: 2,
      },
      VILLAGE: {
        name: 'village',
        path: 'state->district->subDistrict->village',
        depth: 3,
      },
    },
    country: "INDIA"
  });