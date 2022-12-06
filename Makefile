PACKAGE_VERSION = $(shell node -p "require('./dist/manifest.json').version")

all: build

build:
	npm install
	npm run build
	[ ! -d .git ] || git archive -o web-ext-artifacts/wowpedia_editor_s_toolkit-$(PACKAGE_VERSION)-src.zip HEAD

run:
	npx web-ext run -s dist

watch:
	npm start
