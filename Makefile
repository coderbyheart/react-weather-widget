.DEFAULT_GOAL := help
.PHONY: help

dist/main.min.js: dist/main.js
	@mkdir -p $(dir $@)
	./node_modules/.bin/uglifyjs $< -o $@

dist/main.js: src/main.js
	@mkdir -p $(dir $@)
	./node_modules/.bin/browserify $< -o $@ -t [ babelify ]

dist/index.html: src/index.html
	cp $< $@

dist/vær-trondheim-yr.json:
	curl -s http://www.yr.no/sted/Norge/S%C3%B8r-Tr%C3%B8ndelag/Trondheim/Trondheim_sentrum/varsel.xml | ./node_modules/.bin/babel-node src/xml2json.js > $@

dist/vær-trondheim-met.json:
	curl -s 'https://www.met.no/_/service/no.met.metno/yr?id=52bde27b-996a-a27d-93cd-8df75889c112&language=no&mode=forecast' > $@

iconssrc := $(shell find node_modules/@yr/weather-symbols/dist/png/100/*.png -type f)
iconsdist := $(subst node_modules/@yr/weather-symbols/dist/png/100/,dist/icon/,$(iconssrc))
dist/icon/%: node_modules/@yr/weather-symbols/dist/png/100/%
	@mkdir -p $(dir $@)
	cp $< $@

dist: dist/main.min.js dist/index.html dist/vær-trondheim-yr.json dist/vær-trondheim-met.json $(iconsdist) ## Build for release

# HELPERS

.SECONDARY: dist/main.js # So they don't get deleted every run

help: ## (default), display the list of make commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
