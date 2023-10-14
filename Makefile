PACKAGE_VERSION = $(shell node -p "require('./dist/manifest.json').version")

all: build

build:
	npm install
	npm run build
	[ ! -d .git ] || git archive -o web-ext-artifacts/warcraft_wiki_editors_toolkit-$(PACKAGE_VERSION)-src.zip HEAD

run:
	npx web-ext run -s dist

watch:
	npm start
