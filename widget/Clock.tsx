import { Gtk } from "ags/gtk4";
import GLib from "gi://GLib";

export default function Clock() {
    return (
        <label class="clock" onRealize={(self: Gtk.Label) => {
            const update = () => {
                const now = GLib.DateTime.new_now_local();
                self.label = now?.format("%H:%M") ?? "";
            };

            update();
            const sourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
                update();
                return GLib.SOURCE_CONTINUE;
            });

            self.connect("destroy", () => GLib.source_remove(sourceId));
        }} />
    );
}
