const mongoose = require("mongoose");
const createIndexesMigration = require("./001-create-indexes");

const migrations = [createIndexesMigration];

const runMigrations = async () => {
  const db = mongoose.connection.db;
  const migrationsCollection = db.collection("migrations");

  for (const migration of migrations) {
    const existingMigration = await migrationsCollection.findOne({
      name: migration.migrationName,
    });

    if (existingMigration) {
      continue;
    }

    console.log(`Running migration: ${migration.migrationName}`);

    await migration.up();

    await migrationsCollection.insertOne({
      name: migration.migrationName,
      executedAt: new Date(),
    });

    console.log(`Migration completed: ${migration.migrationName}`);
  }
};

module.exports = {
  runMigrations,
};