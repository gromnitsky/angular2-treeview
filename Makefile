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


# produce UMD
js.src := $(wildcard *.js)
es5.dest := $(patsubst %.js, %.es5, $(js.src))
umd.dest := $(patsubst %.es5, dist/%.umd.js, $(es5.dest))

%.es5: %.js
	node_modules/.bin/babel --presets es2015 $(BABEL_OPT) $< -o $@

dist/%.umd.js: %.es5
	node_modules/.bin/browserify -s $(notdir $(basename $<)) $< -o $@

$(umd.dest): node_modules
compile: $(umd.dest)

# minify
umd.min.dest := $(patsubst %.umd.js, %.umd.min.js, $(umd.dest))

UGLIFYJS_OPT := --screw-ie8 -m -c
%.min.js: %.js
	node_modules/.bin/uglifyjs $(UGLIFYJS_OPT) -o $@ -- $<

compile: $(umd.min.dest)


dist/treeview.css: treeview.css
	cp $< $@

compile: dist/treeview.css
