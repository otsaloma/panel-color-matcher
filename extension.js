// -*- coding: utf-8-unix -*-

import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Shell from "gi://Shell";
import St from "gi://St";

import {Extension} from "resource:///org/gnome/shell/extensions/extension.js";

export default class PanelColorMatcher extends Extension {

    enable() {
        this._displayIds = ["focus-window"]
            .map(signal => global.display.connect(
                signal, () => this._update()));

        this._windowManagerIds = ["size-changed"]
            .map(signal => global.window_manager.connect(
                signal, () => this._updateDelayed()));

        this._stylesheet = null;
        this._updateTimeout = null;
    }

    disable() {
        this._displayIds.map(id => global.display.disconnect(id));
        this._windowManagerIds.map(id => global.window_manager.disconnect(id));
        this._updateTimeout && GLib.source_remove(this._updateTimeout);
        this._unloadStyle();
        this._stylesheet && this._stylesheet.delete(null);
    }

    async _sampleColor(x, y) {
        // XXX: global.stage.read_pixels would be more appropriate.
        // https://gitlab.gnome.org/GNOME/mutter/-/issues/3622
        let screenshot = new Shell.Screenshot();
        let [content, scale] = await screenshot.screenshot_stage_to_content();
        let texture = content.get_texture();
        let stream = Gio.MemoryOutputStream.new_resizable();
        let pixbuf = await Shell.Screenshot.composite_to_stream(
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
        let pixels = pixbuf.get_pixels();
        return {r: pixels[0], g: pixels[1], b: pixels[2]};
    }

    _applyStyle(bg, fg) {
        let css = `
          #panel { background-color: ${bg}; }
          #panel * { color: ${fg}; }`;
        let theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
        if (this._stylesheet) {
            theme.unload_stylesheet(this._stylesheet);
        } else {
            let [file, stream] = Gio.File.new_tmp("panel-color-matcher-XXXXXX.css");
            stream.close(null);
            this._stylesheet = file;
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
        let theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
        this._stylesheet && theme.unload_stylesheet(this._stylesheet);
    }

    _update() {
        let win = global.display.focus_window;
        if (win && (win.fullscreen ||
                    win.maximized_horizontally ||
                    win.maximized_vertically)) {
            let rect = win.get_frame_rect();
            let x = rect.x + Math.floor(rect.width / 2);
            let y = rect.y + 3;
            this._sampleColor(x, y).then(color => {
                let bg = `rgb(${color.r}, ${color.g}, ${color.b})`;
                let fg = `rgb(${255-color.r}, ${255-color.g}, ${255-color.b})`;
                this._applyStyle(bg, fg);
            }).catch(e => {
                console.error("Color sampling failed:", e);
            });
        } else {
            this._unloadStyle();
        }
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
