.DEFAULT_GOAL := help
.PHONY: help

dist/main.min.js: dist/main.js
	@mkdir -p $(dir $@)
	./node_modules/.bin/uglifyjs $< -o $@

dist/main.js: src/main.js
	@mkdir -p $(dir $@)
	./node_modules/.bin/browserify $< -o $@ -t [ babelify ]

dist/xml2json.js: src/xml2json.js
	@mkdir -p $(dir $@)
	./node_modules/.bin/browserify $< -o $@ -t [ babelify ]

dist/index.html: src/index.html
	cp $< $@

dist/vær-trondheim.json: src/vær-trondheim.json
	cp $< $@

iconssrc := $(shell find node_modules/@yr/weather-symbols/dist/png/100/*.png -type f)
iconsdist := $(subst node_modules/@yr/weather-symbols/dist/png/100/,dist/icon/,$(iconssrc))
dist/icon/%: node_modules/@yr/weather-symbols/dist/png/100/%
	@mkdir -p $(dir $@)
	cp $< $@

dist: dist/main.min.js dist/index.html dist/vær-trondheim.json dist/xml2json.js $(iconsdist) ## Build for release

# HELPERS

.SECONDARY: dist/main.js # So they don't get deleted every run

help: ## (default), display the list of make commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
