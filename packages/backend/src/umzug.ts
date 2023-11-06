import { dbConfig } from "@infrastructure/config/database-config.js";
import { getUmzugInstance } from "@infrastructure/umzug/umzug-instance.js";
import getSlonikInstance from "./slonik/slonik-instance.js";
import { logger } from "./utils/logger.js";

void getSlonikInstance({ dbConfig, logger }).then((slonik) => {
  void getUmzugInstance({
    slonik,
  }).runAsCLI();
});
