# Backup and Disaster Recovery

## Health Check

The backend exposes health check endpoints:

- `/health/live/`: process liveness check
- `/health/`: checks PostgreSQL, Redis, and Celery worker status

After backup or restore operations, verify the system with:

```bash
curl https://localhost:8443/health/