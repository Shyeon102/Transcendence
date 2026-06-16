SHELL := /bin/bash
COMPOSE := docker compose

.PHONY: help up start migrate seed_media load_media stop fclean logs

help:
	@echo "Available targets:"
	@echo "  make up         - build and start services, then migrate and seed media"
	@echo "  make start      - alias for make up"
	@echo "  make migrate    - run Django migrations in the backend container"
	@echo "  make seed_media - seed example media data in the backend container"
	@echo "  make load_media - load external media data in the backend container"
	@echo "  make stop       - stop containers"
	@echo "  make fclean     - stop containers, remove volumes, and prune Docker resources"
	@echo "  make logs       - follow compose logs"

up: start

start:
	$(COMPOSE) up --build -d
	$(MAKE) migrate
	$(MAKE) seed_media
	$(MAKE) load_media

migrate:
	$(COMPOSE) exec backend python manage.py migrate

seed_media:
	$(COMPOSE) exec backend python manage.py seed_media

load_media:
	$(COMPOSE) exec backend python manage.py load_media

stop:
	$(COMPOSE) down

fclean:
	$(COMPOSE) down -v --remove-orphans
	docker system prune -af --volumes

logs:
	$(COMPOSE) logs -f
