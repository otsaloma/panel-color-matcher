Panel Color Matcher GNOME Shell Extension
=========================================

[![Downloads](https://img.shields.io/gnome-extensions/dt/panel-color-matcher@otsaloma.io)](https://extensions.gnome.org/extension/9260/panel-color-matcher/)

Panel Color Matcher is a GNOME Shell extension to dynamically change the
top panel color to match the wallpaper or a maximized window.

## Installing

Panel Color Matcher is available at ego:
https://extensions.gnome.org/extension/9260/panel-color-matcher/

### Developers

To install from the source repository during development, run

```bash
make install
```

Activate in the GNOME Extensions app.

## Known Issues

This extension uses programmatic single-pixel screenshots to sample
colors right below the panel. When that color is different than before,
CSS is generated and loaded into the theme. This works, but has some
minor problems.

* Dash to Dock seems to "tremble" when the theming update is done, which
  is when the focus window changes or a window is resized and the color
  has changed. See micheleg/dash-to-dock#2383

* The color sampling uses more CPU than we'd like. It shouldn't be an
  issue on any modern multi-core system, but if you have a very
  low-power system, you might want to avoid this.

## Screenshots

Color from wallpaper:
![screenshot](screenshots/screenshot-desktop.png)

Light window maximized:
![screenshot](screenshots/screenshot-light.png)

Dark window maximized:
![screenshot](screenshots/screenshot-dark.png)

Any color window maximized:
![screenshot](screenshots/screenshot-gimp.png)
![screenshot](screenshots/screenshot-brave.png)
