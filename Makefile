.PHONY: compile
compile:

.DELETE_ON_ERROR:

pp-%:
	@echo "$(strip $($*))" | tr ' ' \\n

src := $(dir $(realpath $(lastword $(MAKEFILE_LIST))))


node_modules: package.json
	npm install --loglevel=error --depth=0 $(NPM_OPT)
	touch $@


mocha := node_modules/.bin/mocha
.PHONY: test
test: node_modules
	$(mocha) -u tdd $(TEST_OPT) $(src)/test/test_*.js


js.src := $(wildcard *.js)
js.dest := $(patsubst %.js, dist/%.js, $(js.src))

babel := node_modules/.bin/babel
dist/%.js: %.js
	$(babel) --presets es2015 $(BABEL_OPT) $< -o $@

$(js.dest): node_modules
compile: $(js.dest)


dist/treeview.css: treeview.css
	cp $< $@

compile: dist/treeview.css


bundles.src := $(filter-out %.browserify.js, $(wildcard test/example*.js))
es5.dest := $(patsubst %.js, %.es5, $(bundles.src))
bundles.dest := $(patsubst %.es5, %.browserify.js, $(es5.dest))

%.es5: %.js
	$(babel) --presets es2015 $(BABEL_OPT) $< -o $@

browserify := node_modules/.bin/browserify
%.browserify.js: %.es5
	$(browserify) $(BROWSERIFY_OPT) $< -o $@

$(bundles.dest): node_modules $(js.src)
compile: $(bundles.dest)
