PACKAGE_VERSION = $(shell node -p "require('./package.json').version")

all: build

build:
	npm install
	npm run build
	git archive -o web-ext-artifacts/wowpedia_editor_s_toolkit-$(PACKAGE_VERSION)-src.zip HEAD

run:
	web-ext run -s dist

watch:
	npm start
