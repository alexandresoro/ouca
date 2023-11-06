export type DbConfig = {
  url: string;
  migrator: {
    runMigrations: boolean;
    migrationTableSchema: string;
    migrationTableName: string;
    migrationsPath: string;
  };
};
