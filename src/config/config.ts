export const config = () => ({
  NODE_ENV: process.env.NODE_ENV || 'default',
  port: parseInt(process.env.PORT) || 3000,
  tableLevels: [],
  tableMeta: {
    "STATE": {
      tname: "State",
      fname: "state_name"
    },
    "DISTRICT": {
      tname: "District",
      fname: "district_name",
    },
    "SUBDISTRICT": {
      tname: "SubDistrict",
      fname: "subdistrict_name",
    },
    "VILLAGE": {
      tname: "Village",
      fname: "village_name",
    }
  }
});
