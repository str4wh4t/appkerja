#!/bin/sh
set -e

echo "🚀 Starting NestJS Application Entrypoint..."

# Default values
RUN_MIGRATIONS=${RUN_MIGRATIONS:-false}
RUN_SEEDERS=${RUN_SEEDERS:-true}
DB_MAX_RETRIES=${DB_MAX_RETRIES:-30}
DB_RETRY_INTERVAL=${DB_RETRY_INTERVAL:-2}

# Auto-detect environment
if [ "$NODE_ENV" = "development" ]; then
  RUN_MIGRATIONS=${RUN_MIGRATIONS:-true}
  RUN_SEEDERS=${RUN_SEEDERS:-true}
  echo "📦 Development mode detected"
elif [ "$NODE_ENV" = "production" ]; then
  RUN_MIGRATIONS=${RUN_MIGRATIONS:-false}
  RUN_SEEDERS=${RUN_SEEDERS:-true}
  echo "🏭 Production mode detected"
fi

echo "⚙️  Configuration:"
echo "   - RUN_MIGRATIONS: $RUN_MIGRATIONS"
echo "   - RUN_SEEDERS: $RUN_SEEDERS"
echo "   - DB_HOST: ${DB_HOST:-localhost}"
echo "   - DB_NAME: ${DB_NAME:-nestapi}"
echo "   - SCRIPT_RUNNER: bun"

# Bun install
echo "📦 bun install..."
bun install

# Function to wait for database
wait_for_database() {
  echo "⏳ Waiting for database to be ready..."
  
  retries=0
  while [ $retries -lt $DB_MAX_RETRIES ]; do
    if bun -e "
      const mysql = require('mysql2/promise');
      (async () => {
        try {
          const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            user: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'nestapi',
            connectTimeout: 2000,
          });
          await connection.query('SELECT 1');
          await connection.end();
          process.exit(0);
        } catch (error) {
          console.error(error?.message || error);
          process.exit(1);
        }
      })();
    " >/tmp/db-check.log 2>&1; then
      echo "✅ Database is ready!"
      return 0
    fi
    
    retries=$((retries + 1))
    if [ $retries -lt $DB_MAX_RETRIES ]; then
      last_error=$(tail -n 1 /tmp/db-check.log 2>/dev/null || true)
      if [ -n "$last_error" ]; then
        echo "   • DB check error: $last_error"
      fi
      echo "   ⏳ Retry $retries/$DB_MAX_RETRIES in ${DB_RETRY_INTERVAL}s..."
      sleep $DB_RETRY_INTERVAL
    fi
  done
  
  tail -n 3 /tmp/db-check.log 2>/dev/null || true
  echo "❌ Database connection failed after $DB_MAX_RETRIES retries"
  return 1
}

# Function to run migrations
run_migrations() {
  if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "🔄 Running database migrations..."
    bun run migration:run
    if [ $? -eq 0 ]; then
      echo "✅ Migrations completed successfully"
    else
      echo "❌ Migration failed!"
      exit 1
    fi
  else
    echo "⏭️  Skipping migrations (RUN_MIGRATIONS=false)"
  fi
}

# Function to run seeders
run_seeders() {
  if [ "$RUN_SEEDERS" = "true" ]; then
    echo "🌱 Running database seeders..."
    bun run seed:all
    if [ $? -eq 0 ]; then
      echo "✅ Seeders completed successfully"
    else
      echo "⚠️  Seeder failed, but continuing (non-critical)"
    fi
  else
    echo "⏭️  Skipping seeders (RUN_SEEDERS=false)"
  fi
}

# Function to prepare production env file via SCP
setup_production_env() {
  if [ "$NODE_ENV" != "production" ]; then
    return 0
  fi

  # echo "🔐 Menyiapkan SSH key untuk production..."
  # mkdir -p /root/.ssh
  # chmod 700 /root/.ssh

  # if [ -f /run/secrets/id_ed25519 ]; then
  #   cp /run/secrets/id_ed25519 /root/.ssh/id_ed25519
  #   chmod 600 /root/.ssh/id_ed25519
  # else
  #   echo "❌ Secret /run/secrets/id_ed25519 tidak ditemukan"
  #   exit 1
  # fi

  # echo "📥 Mengunduh .env dari server..."
  # scp -P 1160 -i /root/.ssh/id_ed25519 -o StrictHostKeyChecking=no \
  #   undip@10.169.0.106:/home/undip/pres-api.env /app/.env
  # echo "✅ .env berhasil diunduh ke /app/.env"
}

# Main execution
main() {
  # Prepare production environment file
  setup_production_env

  # Wait for database
  if ! wait_for_database; then
    echo "❌ Cannot proceed without database connection"
    exit 1
  fi
  
  # Run migrations
  run_migrations
  
  # Run seeders
  run_seeders
  
  echo "✅ Entrypoint completed successfully"
  echo "🚀 Starting application..."
  
  # Execute the main command
  exec "$@"
}

# Run main function
main "$@"
