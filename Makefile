# MegaBerg: Słowiańskie Bory - skróty do najczęstszych komend.
# `make run` wystarczy, żeby zagrać: sam doinstaluje zależności, jeśli trzeba.

.DEFAULT_GOAL := run
.PHONY: run build preview test help

# Znacznik instalacji: npm zapisuje ten plik przy każdym `npm install`,
# więc zależności instalują się ponownie tylko po zmianie package*.json.
DEPS := node_modules/.package-lock.json

$(DEPS): package.json package-lock.json
	npm install
	@touch $@

run: $(DEPS) ## uruchamia grę (serwer deweloperski) i otwiera ją w przeglądarce
	npm run dev -- --open

build: $(DEPS) ## buduje wersję produkcyjną do dist/
	npm run build

preview: build ## buduje i serwuje wersję produkcyjną
	npm run preview -- --open

test: $(DEPS) ## testy logiki (Vitest)
	npm test

help: ## lista komend
	@grep -E '^[a-z]+:.*##' $(MAKEFILE_LIST) | sed -E 's/:.*## /\t/' | expand -t 10
