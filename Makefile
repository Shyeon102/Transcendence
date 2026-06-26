SHELL := /bin/bash
OS_ID := $(shell . /etc/os-release 2>/dev/null && echo $$ID)
CONTAINER_ENGINE := $(if $(filter fedora,$(OS_ID)),podman,docker)
COMPOSE := $(CONTAINER_ENGINE) compose

.PHONY: help up start migrate load_media media_embedding stop fclean logs backup restore

help:
	@echo "Available targets:"
	@echo "  Container engine: $(CONTAINER_ENGINE)"
	@echo "  make up               - build and start services, then migrate and load media"
	@echo "  make start            - alias for make up"
	@echo "  make migrate          - run Django migrations in the backend container"
	@echo "  make load_media       - load external media data in the backend container"
	@echo "  make backup           - create PostgreSQL backup"
	@echo "  make restore FILE=... - restore PostgreSQL backup"
	@echo "  make stop             - stop containers"
	@echo "  make fclean           - stop containers, remove volumes, and prune container resources"
	@echo "  make logs              - follow compose logs"

up: start

start:
	$(COMPOSE) up --build -d
	$(MAKE) migrate
	$(MAKE) load_media
# 	$(MAKE) media_embedding

migrate:
	$(COMPOSE) exec backend python manage.py migrate

load_media:
	$(COMPOSE) exec backend python manage.py load_media

media_embedding:
	$(COMPOSE) exec backend python manage.py media_embedding

backup:
	./scripts/backup_postgres.sh

restore:
	@test -n "$(FILE)" || (echo "Usage: make restore FILE=backups/postgres_xxx.dump" && exit 1)
	CONFIRM_RESTORE=YES ./scripts/restore_postgres.sh "$(FILE)"

stop:
	$(COMPOSE) down

fclean:
	$(COMPOSE) down -v --remove-orphans
	$(CONTAINER_ENGINE) system prune -af --volumes

logs:
	$(COMPOSE) logs -f
