import { Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp";

export default function Microphone() {
    const wp = Wp.get_default();
    if (!wp) return <box />;

    return (
        <box class="microphone" spacing={4}>
            <button onRealize={(self: Gtk.Button) => {
                let mic = wp.audio.defaultMicrophone;
                let micSignals: number[] = [];

                const image = new Gtk.Image();
                self.child = image;

                const updateMic = () => {
                    if (!mic) return;
                    image.icon_name = mic.mute
                        ? "microphone-sensitivity-muted-symbolic"
                        : "microphone-sensitivity-high-symbolic";
                };

                const connectMic = () => {
                    micSignals.forEach(id => mic?.disconnect(id));
                    micSignals = [];
                    mic = wp.audio.defaultMicrophone;
                    if (!mic) return;
                    micSignals.push(mic.connect("notify::mute", updateMic));
                    updateMic();
                };

                const audioId = wp.audio.connect("notify::default-microphone", connectMic);
                connectMic();

                self.connect("clicked", () => {
                    if (mic) mic.set_mute(!mic.mute);
                });

                self.connect("destroy", () => {
                    micSignals.forEach(id => mic?.disconnect(id));
                    wp.audio.disconnect(audioId);
                });
            }} />
        </box>
    );
}
