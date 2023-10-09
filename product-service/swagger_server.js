const express = require("express");
const fs = require("fs");
const app = express();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");

const file = fs.readFileSync("./swagger.yml", "utf8");
const swaggerDocument = YAML.parse(file);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen("4500", () =>
  console.log("Serving swagger at http://localhost:4500")
);
