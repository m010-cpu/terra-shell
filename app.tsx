import app from "ags/gtk4/app";
import Bar from "./widget/Bar";
import { Gtk } from "ags/gtk4";

Gtk.Settings.get_default().gtk_icon_theme_name = "Adwaita";

app.start({
  css: "./style.css",
  main() {
    Bar(0);
  },
});
