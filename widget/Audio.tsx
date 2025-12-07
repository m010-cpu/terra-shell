import { createBinding } from "ags";
import Wp from "gi://AstalWp";

export default function Audio() {
    const wp = Wp.get_default();
    const speaker = wp?.audio.defaultSpeaker;

    if (!speaker) return <box />;

    const volume = createBinding(speaker, "volume");
    const icon = createBinding(speaker, "volumeIcon");

    return (
        <box class="audio" spacing={2}>
            <button onClicked={() => speaker.set_mute(!speaker.mute)}>
                <box spacing={2}>
                    <image iconName={icon} />
                    <label
                        label={volume((v) => `${Math.round(v * 100)}%`)}
                        visible={createBinding(speaker, "mute").as(m => !m)}
                    />
                </box>
            </button>
        </box>
    );
}
