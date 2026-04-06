import { Gtk } from "ags/gtk4";
import GLib from "gi://GLib";

function readRamUsage(): number {
    const [ok, contents] = GLib.file_get_contents("/proc/meminfo");
    if (!ok || !contents) return 0;
    const text = new TextDecoder().decode(contents);
    let total = 0, available = 0;
    for (const line of text.split("\n")) {
        if (line.startsWith("MemTotal:")) total = parseInt(line.split(/\s+/)[1]);
        else if (line.startsWith("MemAvailable:")) available = parseInt(line.split(/\s+/)[1]);
        if (total && available) break;
    }
    return total > 0 ? Math.round(((total - available) / total) * 100) : 0;
}

export default function Ram() {
    return (
        <box class="ram" spacing={2} onRealize={(self: Gtk.Box) => {
            const image = new Gtk.Image({ iconName: "open-menu-symbolic" });
            const label = new Gtk.Label({ label: `${readRamUsage()}%` });
            self.append(image);
            self.append(label);

            const sourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 30000, () => {
                label.label = `${readRamUsage()}%`;
                return GLib.SOURCE_CONTINUE;
            });

            self.connect("destroy", () => GLib.source_remove(sourceId));
        }} />
    );
}
