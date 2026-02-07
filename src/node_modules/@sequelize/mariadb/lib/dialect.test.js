"use strict";
var import_core = require("@sequelize/core");
var import_mariadb = require("@sequelize/mariadb");
var import_chai = require("chai");
describe("MariaDbDialect#parseConnectionUrl", () => {
  const dialect = new import_core.Sequelize({ dialect: import_mariadb.MariaDbDialect }).dialect;
  it("parses connection URL", () => {
    const options = dialect.parseConnectionUrl(
      "mariadb://user:password@localhost:1234/dbname?charset=utf8mb4"
    );
    (0, import_chai.expect)(options).to.deep.eq({
      host: "localhost",
      port: 1234,
      user: "user",
      password: "password",
      database: "dbname",
      charset: "utf8mb4"
    });
  });
});
//# sourceMappingURL=dialect.test.js.map
