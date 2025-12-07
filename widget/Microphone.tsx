import { createBinding } from "ags";
import Wp from "gi://AstalWp";

export default function Microphone() {
    const wp = Wp.get_default();
    const mic = wp?.audio.defaultMicrophone;

    if (!mic) return <box />;

    const mute = createBinding(mic, "mute");

    return (
        <box class="microphone" spacing={4}>
            <button
                onClicked={() => mic.set_mute(!mic.mute)}
            >
                <image iconName={mute((m: boolean) =>
                    m ? "microphone-sensitivity-muted-symbolic" : "microphone-sensitivity-high-symbolic"
                )} />
            </button>
        </box>
    );
}
