REPORTER=dot

serve: node_modules
	@node_modules/serve/bin/serve -Sloj

test: node_modules
	@node_modules/mocha/bin/_mocha test/*.test.js \
		--reporter $(REPORTER) \
		--timeout 500 \
		--check-leaks \
		--bail
	@sed 's/lift-result/.\//' < Readme.md | jsmd

node_modules: *.json
	@packin install -Re \
		--meta package.json,component.json,deps.json \
		--folder node_modules

bench: node_modules
	@for dir in bench/*; do \
		printf "\033[4;36m\n%s\n\033[0m" $$dir; \
		node_modules/b/bin/bench $$dir \
			--implementations "$$dir/imps" \
			--cycles 10000 \
			--reporter table; \
	done;

.PHONY: serve test bench