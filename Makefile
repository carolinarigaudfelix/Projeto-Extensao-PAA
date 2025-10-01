# Makefile

install:
	npm install

start:
	npm run dev

build:
	npm run build

lint:
	npm run lint

format:
	npm run format

clean:
	rm -rf .next node_modules yarn.lock package-lock.json
