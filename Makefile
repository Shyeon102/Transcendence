SHELL := /bin/bash
COMPOSE := podman compose

.PHONY: help up start migrate seed_media load_media stop fclean logs

help:
	@echo "Available targets:"
	@echo "  make up           - build and start services, then migrate and seed media"
	@echo "  make start        - alias for make up"
	@echo "  make migrate      - run Django migrations in the backend container"
	@echo "  make seed_media   - seed example media data in the backend container"
	@echo "  make seed_reviews - seed example reviews in the backend container"
	@echo "  make load_media   - load external media data in the backend container"
	@echo "  make stop         - stop containers"
	@echo "  make fclean       - stop containers, remove volumes, and prune Docker resources"
	@echo "  make logs         - follow compose logs"

up: start

start:
	$(COMPOSE) up --build -d
	$(MAKE) migrate
	$(MAKE) seed_media
	$(MAKE) seed_reviews
	$(MAKE) load_media
	$(MAKE) media_embedding

migrate:
	$(COMPOSE) exec backend python manage.py migrate

seed_media:
	$(COMPOSE) exec backend python manage.py seed_media

seed_reviews:
	$(COMPOSE) exec backend python manage.py seed_reviews

load_media:
	$(COMPOSE) exec backend python manage.py load_media

media_embedding:
	$(COMPOSE) exec backend python manage.py media_embedding

stop:
	$(COMPOSE) down

fclean:
	$(COMPOSE) down -v --remove-orphans
	podman system prune -af --volumes

logs:
	$(COMPOSE) logs -f
