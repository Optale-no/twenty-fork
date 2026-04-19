#!/bin/sh
set -e

inject_runtime_env() {
    INDEX_HTML=/app/packages/twenty-server/dist/front/index.html
    if [ -n "${REACT_APP_SERVER_BASE_URL}" ] && [ -f "${INDEX_HTML}" ]; then
        sed -i "s|// This will be overwritten|REACT_APP_SERVER_BASE_URL: \"${REACT_APP_SERVER_BASE_URL}\"|" "${INDEX_HTML}" || true
    fi
}

setup_and_migrate_db() {
    if [ "${DISABLE_DB_MIGRATIONS}" = "true" ]; then
        echo "Database setup and migrations are disabled, skipping..."
        return
    fi

    echo "Running database setup and migrations..."

    # Run setup and migration scripts
    has_schema=$(psql -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'core')" ${PG_DATABASE_URL})
    if [ "$has_schema" = "f" ]; then
        echo "Database appears to be empty, running migrations."
        yarn database:init:prod
    fi

    yarn command:prod cache:flush
    yarn command:prod upgrade
    yarn command:prod cache:flush

    echo "Successfully migrated DB!"
}

register_background_jobs() {
    if [ "${DISABLE_CRON_JOBS_REGISTRATION}" = "true" ]; then
        echo "Cron job registration is disabled, skipping..."
        return
    fi

    echo "Registering background sync jobs..."
    if yarn command:prod cron:register:all; then
        echo "Successfully registered all background sync jobs!"
    else
        echo "Warning: Failed to register background jobs, but continuing startup..."
    fi
}

inject_runtime_env
setup_and_migrate_db
register_background_jobs

# Continue with the original Docker command
exec "$@"
