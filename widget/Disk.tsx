import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import GLib from "gi://GLib";

export default function Disk() {
    return (
        <box class="disk" spacing={2} onRealize={(self: Gtk.Box) => {
            const image = new Gtk.Image({ iconName: "drive-harddisk-symbolic" });
            const label = new Gtk.Label({ label: "" });
            self.append(image);
            self.append(label);

            const update = () => {
                execAsync(["bash", "-c", "df -h / | awk 'NR==2 {print $4}'"])
                    .then(out => { label.label = out.trim(); })
                    .catch(console.error);
            };

            update();
            const sourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 60000, () => {
                update();
                return GLib.SOURCE_CONTINUE;
            });

            self.connect("destroy", () => GLib.source_remove(sourceId));
        }} />
    );
}
