# Database migrations

`001_initial_schema.sql` is the versioned baseline for MySQL 8. Run it with `npm run db:migrate --workspace backend` after creating the database. The runner records applied filenames in `schema_migrations` and applies only missing migrations.

For disposable local development only, `DB_AUTO_SYNC=true` can create missing Sequelize tables at API startup. Do not use Sequelize `sync` to evolve a production database; add a numbered SQL migration and run the migration command during deployment.
