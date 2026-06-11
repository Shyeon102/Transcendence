import time

from django.core.cache import cache
from django.db import connections
from django.http import JsonResponse

from project.celery import app as celery_app


def _check_database():
    try:
        with connections["default"].cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return {"ok": True}
    except Exception as exc:
        return {"ok": False, "error": str(exc)}


def _check_redis():
    key = "healthcheck:redis"
    try:
        cache.set(key, "ok", timeout=5)
        value = cache.get(key)
        cache.delete(key)
        return {"ok": value == "ok"}
    except Exception as exc:
        return {"ok": False, "error": str(exc)}


def _check_celery():
    try:
        inspector = celery_app.control.inspect(timeout=1)
        response = inspector.ping() or {}
        return {
            "ok": bool(response),
            "workers": list(response.keys()),
        }
    except Exception as exc:
        return {"ok": False, "error": str(exc)}


def health(request):
    started_at = time.monotonic()

    checks = {
        "database": _check_database(),
        "redis": _check_redis(),
        "health": _check_celery(),
    }

    ok = all(check["ok"] for check in checks.values())
    status_code = 200 if ok else 503

    return JsonResponse(
        {
            "ok": ok,
            "checks": checks,
            "duration_ms": round((time.monotonic() - started_at) * 1000, 2),
        },
        status=status_code,
    )


def live(request):
    return JsonResponse({"ok": True})
