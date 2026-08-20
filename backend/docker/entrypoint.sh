#!/bin/sh
set -e

php artisan config:cache
php artisan migrate --force

php artisan schedule:work &

exec php artisan serve --host=0.0.0.0 --port=8000