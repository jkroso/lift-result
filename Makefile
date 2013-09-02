REPORTER=dot

serve: node_modules
	@node_modules/serve/bin/serve -Sloj

test: node_modules
	@node_modules/mocha/bin/_mocha test/*.test.js \
		--reporter $(REPORTER) \
		--timeout 500 \
		--check-leaks \
		--bail

node_modules: component.json package.json
	@packin install \
		--meta package.json,component.json,deps.json \
		--folder node_modules \
		--executables \
		--no-retrace

bench: node_modules
	@for dir in bench/*; do \
		printf "\033[4;36m\n%s\n\033[0m" $$dir; \
		node_modules/b/bin/bench $$dir \
			--implementations "$$dir/imps" \
			--cycles 10000 \
			--reporter table; \
	done;

.PHONY: serve test bench