import app from "ags/gtk4/app";
import Bar from "./widget/Bar";
import { Gtk } from "ags/gtk4";

import style from "./style.css";

Gtk.Settings.get_default().gtk_icon_theme_name = "Adwaita";

app.start({
  css: style,
  main() {
    Bar(0);
  },
});
