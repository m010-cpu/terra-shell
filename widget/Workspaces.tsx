import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"
import Gio from "gi://Gio"

export default function Workspaces() {
    return (
        <box spacing={6} onRealize={(self: Gtk.Box) => {
            const update = () => execAsync("swaymsg -t get_workspaces")
                .then(out => {
                    const workspaces = JSON.parse(out)

                    // Clear existing
                    let child = self.get_first_child()
                    while (child) {
                        const next = child.get_next_sibling()
                        self.remove(child)
                        child = next
                    }

                    // Add new
                    workspaces.forEach((w: any) => {
                        const btn = new Gtk.Button({
                            label: w.name,
                            css_classes: w.focused ? ["ws", "focused"] : ["ws"]
                        })
                        btn.connect("clicked", () => execAsync(`swaymsg workspace "${w.name}"`))
                        self.append(btn)
                    })
                })
                .catch(console.error)

            update()

            // Subscribe
            const proc = new Gio.Subprocess({
                argv: ['swaymsg', '-t', 'subscribe', '-m', '["workspace"]'],
                flags: Gio.SubprocessFlags.STDOUT_PIPE
            })
            proc.init(null)

            const stdout = new Gio.DataInputStream({
                base_stream: proc.get_stdout_pipe()
            })

            const readLoop = () => {
                stdout.read_line_async(0, null, (stream, res) => {
                    try {
                        const [line] = stream.read_line_finish(res)
                        if (line) {
                            update()
                            readLoop()
                        }
                    } catch (e) {
                        console.error(e)
                    }
                })
            }
            readLoop()

            self.connect("destroy", () => proc.force_exit())
        }}>
        </box>
    )
}
