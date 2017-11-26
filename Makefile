all: build

build:
	web-ext build -s dist --overwrite-dest

run:
	web-ext run -s dist

watch:
	webpack --watch-stdin
