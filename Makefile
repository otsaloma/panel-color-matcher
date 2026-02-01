# -*- coding: utf-8-unix -*-

EXTENSION := panel-color-matcher@otsaloma.io
INSTALL_DIR := ~/.local/share/gnome-shell/extensions/$(EXTENSION)

check:
	jshint *.js

clean:
	rm -f $(EXTENSION).shell-extension.zip

install:
	mkdir -p $(INSTALL_DIR)
	cp -f extension.js $(INSTALL_DIR)
	cp -f metadata.json $(INSTALL_DIR)

pack:
	gnome-extensions pack --force

run:
	dbus-run-session gnome-shell --devkit --wayland

.PHONY: check clean install pack run
