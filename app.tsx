import app from "ags/gtk4/app";
import Bar from "./widget/Bar";
import { Gtk, Gdk } from "ags/gtk4";

import style from "./style.css";

Gtk.Settings.get_default().gtk_icon_theme_name = "Adwaita";

app.start({
  css: style,
  main() {
    const bars = new Map<Gdk.Monitor, Gtk.Widget>();
    const display = Gdk.Display.get_default();
    const monitors = display?.get_monitors();

    const updateBars = () => {
      if (!monitors) return;

      const current = new Set<Gdk.Monitor>();
      for (let i = 0; i < monitors.get_n_items(); i++) {
        const mon = monitors.get_item(i) as Gdk.Monitor;
        current.add(mon);
        if (!bars.has(mon)) {
          bars.set(mon, Bar(mon));
        }
      }

      for (const [mon, bar] of bars) {
        if (!current.has(mon)) {
          bar.destroy();
          bars.delete(mon);
        }
      }
    };

    updateBars();
    monitors?.connect("items-changed", updateBars);
  },
});
