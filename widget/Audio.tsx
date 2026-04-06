import { Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp";

export default function Audio() {
    const wp = Wp.get_default();
    if (!wp) return <box />;

    return (
        <box class="audio" spacing={2}>
            <button onRealize={(self: Gtk.Button) => {
                let speaker = wp.audio.defaultSpeaker;
                let speakerSignals: number[] = [];

                const box = new Gtk.Box({ spacing: 2 });
                const image = new Gtk.Image();
                const label = new Gtk.Label();
                box.append(image);
                box.append(label);
                self.child = box;

                const updateSpeaker = () => {
                    if (!speaker) return;
                    image.icon_name = speaker.volumeIcon;
                    label.label = `${Math.round(speaker.volume * 100)}%`;
                    label.visible = !speaker.mute;
                };

                const connectSpeaker = () => {
                    speakerSignals.forEach(id => speaker?.disconnect(id));
                    speakerSignals = [];
                    speaker = wp.audio.defaultSpeaker;
                    if (!speaker) return;
                    speakerSignals.push(speaker.connect("notify::volume", updateSpeaker));
                    speakerSignals.push(speaker.connect("notify::volume-icon", updateSpeaker));
                    speakerSignals.push(speaker.connect("notify::mute", updateSpeaker));
                    updateSpeaker();
                };

                const audioId = wp.audio.connect("notify::default-speaker", connectSpeaker);
                connectSpeaker();

                self.connect("clicked", () => {
                    if (speaker) speaker.set_mute(!speaker.mute);
                });

                self.connect("destroy", () => {
                    speakerSignals.forEach(id => speaker?.disconnect(id));
                    wp.audio.disconnect(audioId);
                });
            }} />
        </box>
    );
}
