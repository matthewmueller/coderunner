SRC = $(wildcard lib/*/*.js)
JSON = $(wildcard lib/*/component.json)
IMAGES = $(wildcard images/*)

install: components $(SRC)
	@mkdir -p ~/data ~/scripts
	@mkdir -p pids logs cids
	@npm -s install
	@./lib/build/builder

components: component.json $(JSON)
	@component install

images: $(IMAGES)
	@docker build -t node-runner images/node-runner
	@docker build -t node-installer images/node-installer

minify: minify-js

minify-js: build/build.js
	curl -s \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_format=text \
		-d output_info=compiled_code \
		--data-urlencode "js_code@$<" \
		http://closure-compiler.appspot.com/compile \
		> $<.tmp
	mv $<.tmp $<

clean:
	rm -fr components node_modules build

production:
	@git pull origin master
	@npm update --production --loglevel warn
	@rm -rf components
	@component install
	@./lib/build/builder

mount:
	sshfs vagrant@127.0.0.1:/home/vagrant/coderunner ./ \
		-o IdentityFile=~/.vagrant.d/insecure_private_key \
		-p $$(vagrant ssh-config | grep Port | sed 's/Port //')

.PHONY: images build clean minify production

