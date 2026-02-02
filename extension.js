// -*- coding: utf-8-unix -*-
/* globals TextEncoder */

import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Shell from "gi://Shell";
import St from "gi://St";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import {Extension} from "resource:///org/gnome/shell/extensions/extension.js";

export default class PanelColorMatcher extends Extension {

    enable() {
        // XXX: We need some more signal connections here. Maybe we need to
        // iterate over windows and connect to signals of individual windows?
        // https://mutter.gnome.org/meta/class.Display.html#signals
        this._displayIds = ["focus-window"]
            .map(signal => global.display.connect(
                signal, () => this._update()));

        // https://github.com/GNOME/gnome-shell/blob/main/js/ui/windowManager.js
        this._windowManagerIds = ["size-changed"]
            .map(signal => global.window_manager.connect(
                signal, () => this._updateDelayed()));

        this._stylesheet = null;
        this._updateTimeout = null;
        this._update();
    }

    disable() {
        if (this._displayIds) {
            this._displayIds.map(id => global.display.disconnect(id));
            this._displayIds = null;
        }
        if (this._windowManagerIds) {
            this._windowManagerIds.map(id => global.window_manager.disconnect(id));
            this._windowManagerIds = null;
        }
        if (this._updateTimeout) {
            GLib.source_remove(this._updateTimeout);
            this._updateTimeout = null;
        }
        if (this._stylesheet) {
            this._unloadStyle();
            this._stylesheet.delete(null);
            this._stylesheet = null;
        }
    }

    async _sampleColor(x, y) {
        // XXX: global.stage.read_pixels would be more appropriate.
        // https://gitlab.gnome.org/GNOME/mutter/-/issues/3622
        const screenshot = new Shell.Screenshot();
        const [content, scale] = await screenshot.screenshot_stage_to_content();
        const texture = content.get_texture();
        const stream = Gio.MemoryOutputStream.new_resizable();
        const pixbuf = await Shell.Screenshot.composite_to_stream(
            texture,
            x * scale,
            y * scale,
            1,
            1,
            scale,
            null,
            0,
            0,
            1,
            stream,
        );
        const pixels = pixbuf.get_pixels();
        return {r: pixels[0], g: pixels[1], b: pixels[2]};
    }

    _applyStyle(bg, fg) {
        const css = [
            // XXX: This is not yet quite enough to affect all panel widgets.
            // https://github.com/GNOME/gnome-shell/blob/main/data/theme/gnome-shell-sass/widgets/_panel.scss
            `#panel { background-color: ${bg}; }`,
            `#panel * { color: ${fg}; }`,
        ].join("\n");
        const theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
        if (this._stylesheet) {
            theme.unload_stylesheet(this._stylesheet);
        } else {
            this._stylesheet = Gio.File.new_for_path("/tmp/panel-color-matcher.css");
        }
        this._stylesheet.replace_contents(
            new TextEncoder().encode(css),
            null,
            false,
            Gio.FileCreateFlags.NONE,
            null
        );
        theme.load_stylesheet(this._stylesheet);
    }

    _unloadStyle() {
        const theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
        this._stylesheet && theme.unload_stylesheet(this._stylesheet);
    }

    _update() {
        const index = global.display.get_primary_monitor();
        const monitor = global.display.get_monitor_geometry(index);
        // Sample at 25% and 75% to detect half-maximized windows.
        const x1 = monitor.x + Math.floor(monitor.width * 0.25);
        const x2 = monitor.x + Math.floor(monitor.width * 0.75);
        const y  = monitor.y + Main.panel.height + 3;
        Promise.all([
            this._sampleColor(x1, y),
            this._sampleColor(x2, y),
        ]).then(([color1, color2]) => {
            // In case one window is half-maximized either on the left or the
            // right side, find the side where the color is lightest or darkest,
            // since windows tend to be either light or dark and wallpapers
            // between. Also, note the chosen midpoint, which controls what
            // happens when one light window and one dark window are
            // half-maximized. Raising that value above 128 favors dark.
            const dist1 = Math.abs(color1.r-155) + Math.abs(color1.g-155) + Math.abs(color1.b-155);
            const dist2 = Math.abs(color2.r-155) + Math.abs(color2.g-155) + Math.abs(color2.b-155);
            const color = dist1 > dist2 ? color1 : color2;
            const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
            const bg = `rgb(${color.r}, ${color.g}, ${color.b})`;
            const fg = luminance > 128 ? "rgba(0, 0, 0, 0.9)" : "rgba(255, 255, 255, 0.9)";
            this._applyStyle(bg, fg);
        }).catch(e => {
            console.error("Color sampling failed:", e);
        });
    }

    _updateDelayed() {
        this._updateTimeout && GLib.source_remove(this._updateTimeout);
        this._updateTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
            this._update();
            this._updateTimeout = null;
            return GLib.SOURCE_REMOVE;
        });
    }

}
