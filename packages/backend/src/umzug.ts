import { getUmzugInstance } from "@infrastructure/umzug/umzug-instance.js";
import { getDbConfig } from "./config.js";
import getSlonikInstance from "./slonik/slonik-instance.js";
import { logger } from "./utils/logger.js";

const dbConfig = getDbConfig();

void getSlonikInstance({ dbConfig, logger }).then((slonik) => {
  void getUmzugInstance({
    slonik,
  }).runAsCLI();
});
