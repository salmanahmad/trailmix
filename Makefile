
all:
	./node_modules/browserify/bin/cmd.js -r ./lib/trailmix -o examples/todo-client/public/javascripts/trailmix.js
	./node_modules/browserify/bin/cmd.js -x ./lib/trailmix -r ./lib/adapters/websql-adapter -o examples/todo-client/public/javascripts/websql-adapter.js