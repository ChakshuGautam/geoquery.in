import swaggerJsdoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";
import yaml from "js-yaml";
import fs from "fs";
import logger from "./logger";

const version = process.env.npm_package_version;

const definition = yaml.load(fs.readFileSync("./spec.yaml", "utf8"));
const schemas = yaml.load(fs.readFileSync("./schemas.yaml", "utf8"));

definition.components.schemas = schemas.components.schemas;
const options = {
  definition: definition,
  apis: ["./app.js"],
};

const specs = swaggerJsdoc(options);

console.log(Response.json(serve));
console.log(new Response(setup(specs)).formData);

function swagger(app) {
  // Swagger Page
  app.use("/docs", serve, setup(specs));
  logger.info("Swagger documentation set up at /docs");
  // app.get('/docs.json', (ctx) => {
  //     ctx.headers.set('content-type','application/json');
  //     return Response.json(specs);
  // });
}

export default swagger;
