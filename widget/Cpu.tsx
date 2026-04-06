import { Gtk } from "ags/gtk4";
import GLib from "gi://GLib";

function readCpuTimes(): [number, number] {
    const [ok, contents] = GLib.file_get_contents("/proc/stat");
    if (!ok || !contents) return [0, 0];
    const line = new TextDecoder().decode(contents).split("\n")[0];
    const parts = line.split(/\s+/).slice(1).map(Number);
    const idle = parts[3] + (parts[4] ?? 0); // idle + iowait
    const total = parts.reduce((a, b) => a + b, 0);
    return [idle, total];
}

export default function Cpu() {
    return (
        <box class="cpu" spacing={2} onRealize={(self: Gtk.Box) => {
            const image = new Gtk.Image({ iconName: "system-run-symbolic" });
            const label = new Gtk.Label({ label: "0%" });
            self.append(image);
            self.append(label);

            let [prevIdle, prevTotal] = readCpuTimes();

            const sourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, () => {
                const [idle, total] = readCpuTimes();
                const dIdle = idle - prevIdle;
                const dTotal = total - prevTotal;
                const usage = dTotal > 0 ? Math.round(((dTotal - dIdle) / dTotal) * 100) : 0;
                label.label = `${usage}%`;
                prevIdle = idle;
                prevTotal = total;
                return GLib.SOURCE_CONTINUE;
            });

            self.connect("destroy", () => GLib.source_remove(sourceId));
        }} />
    );
}
