import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import Gio from "gi://Gio";
import GLib from "gi://GLib";

interface WorkspaceInfo {
    name: string;
    output: string;
    focused: boolean;
}

export default function Workspaces({ output }: { output?: string }) {
    return (
        <box spacing={6} onRealize={(self: Gtk.Box) => {
            const buttons = new Map<string, Gtk.Button>();
            let updatePending = false;
            let destroyed = false;

            const update = () => {
                if (updatePending || destroyed) return;
                updatePending = true;

                execAsync("swaymsg -t get_workspaces")
                    .then(out => {
                        if (destroyed) return;
                        updatePending = false;

                        let workspaces: WorkspaceInfo[];
                        try {
                            workspaces = JSON.parse(out);
                        } catch {
                            console.error("Failed to parse workspace JSON");
                            return;
                        }

                        // Filter by output if specified (multi-monitor)
                        if (output) {
                            workspaces = workspaces.filter(w => w.output === output);
                        }

                        // Sort by name for consistent ordering
                        workspaces.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

                        // Track which workspaces still exist
                        const current = new Set<string>();

                        // Add or update buttons
                        workspaces.forEach((w, i) => {
                            current.add(w.name);
                            const existing = buttons.get(w.name);

                            if (existing) {
                                // Update focus state only
                                existing.css_classes = w.focused ? ["ws", "focused"] : ["ws"];
                                // Reorder if needed
                                self.reorder_child_after(existing, i > 0 ? buttons.get(workspaces[i - 1].name) ?? null : null);
                            } else {
                                // Create new button
                                const btn = new Gtk.Button({
                                    label: w.name,
                                    css_classes: w.focused ? ["ws", "focused"] : ["ws"],
                                });
                                btn.connect("clicked", () => {
                                    execAsync(`swaymsg workspace "${w.name}"`).catch(console.error);
                                });
                                buttons.set(w.name, btn);
                                self.append(btn);
                            }
                        });

                        // Remove buttons for workspaces that no longer exist
                        for (const [name, btn] of buttons) {
                            if (!current.has(name)) {
                                self.remove(btn);
                                buttons.delete(name);
                            }
                        }
                    })
                    .catch(e => {
                        updatePending = false;
                        console.error(e);
                    });
            };

            update();

            // Subscribe to workspace events
            let proc: Gio.Subprocess | null = null;

            const startSubscription = () => {
                if (destroyed) return;

                proc = new Gio.Subprocess({
                    argv: ["swaymsg", "-t", "subscribe", "-m", '["workspace"]'],
                    flags: Gio.SubprocessFlags.STDOUT_PIPE,
                });
                proc.init(null);

                const stdout = new Gio.DataInputStream({
                    base_stream: proc.get_stdout_pipe()!,
                });

                const readLoop = () => {
                    if (destroyed) return;
                    stdout.read_line_async(GLib.PRIORITY_DEFAULT, null, (stream, res) => {
                        try {
                            const [line] = stream!.read_line_finish(res);
                            if (line && !destroyed) {
                                update();
                                readLoop();
                            } else if (!destroyed) {
                                // Stream ended unexpectedly, restart
                                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
                                    startSubscription();
                                    return GLib.SOURCE_REMOVE;
                                });
                            }
                        } catch (e) {
                            if (!destroyed) {
                                console.error("Workspace subscription error:", e);
                                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
                                    startSubscription();
                                    return GLib.SOURCE_REMOVE;
                                });
                            }
                        }
                    });
                };
                readLoop();
            };

            startSubscription();

            self.connect("destroy", () => {
                destroyed = true;
                if (proc) {
                    proc.force_exit();
                    proc = null;
                }
            });
        }}>
        </box>
    );
}
