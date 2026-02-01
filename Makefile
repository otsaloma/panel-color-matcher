# -*- coding: utf-8-unix -*-

EXTENSION := panel-color-matcher@otsaloma.io
INSTALL_DIR := ~/.local/share/gnome-shell/extensions/$(EXTENSION)

check:
	jshint *.js

install:
	mkdir -p $(INSTALL_DIR)
	cp -f extension.js $(INSTALL_DIR)
	cp -f metadata.json $(INSTALL_DIR)

run:
	dbus-run-session gnome-shell --devkit --wayland

.PHONY: check install run
