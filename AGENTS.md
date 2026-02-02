AGENTS.md
=========

Panel Color Matcher is a GNOME Shell extension to dynamically change the
top panel color to match the wallpaper or a maximized window. The main
implementation is in file `extension.js`.

## General instructions

* We're targeting GNOME 49 and later
* We're targeting Wayland only

## JavaScript

* Always use const where applicable
* Indent with four spaces
* Use double-quotes for strings
* Use private underscore-prefixed members

## References

* Clutter interactive canvas: https://mutter.gnome.org/clutter/
* Extensions guide: https://gjs.guide/extensions/
* Mutter display server, window manager and compositor: https://mutter.gnome.org/meta/
* Other extensions on system: /usr/share/gnome-shell/extensions
* Search GNOME discussions: https://discourse.gnome.org/search?q=%s
