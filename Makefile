# -*- coding: utf-8-unix -*-

EXTENSION := panel-color-matcher@otsaloma.io
PACK_FILE := $(EXTENSION).shell-extension.zip
INSTALL_DIR := ~/.local/share/gnome-shell/extensions/$(EXTENSION)

check:
	jshint *.js

clean:
	rm -f $(PACK_FILE)

install:
	mkdir -p $(INSTALL_DIR)
	cp -f extension.js $(INSTALL_DIR)
	cp -f metadata.json $(INSTALL_DIR)

pack: clean
	gnome-extensions pack

run:
	dbus-run-session gnome-shell --devkit --wayland

.PHONY: check clean install pack run
