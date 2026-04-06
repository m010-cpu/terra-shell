import { createBinding } from "ags";
import Battery from "gi://AstalBattery";

export default function BatteryWidget() {
    const bat = Battery.get_default();
    if (!bat) return <box />;

    const percentage = createBinding(bat, "percentage");
    const iconName = createBinding(bat, "icon-name");
    const isPresent = createBinding(bat, "isPresent");

    return (
        <box class="battery" spacing={2} visible={isPresent}>
            <image iconName={iconName} />
            <label label={percentage((p) => `${Math.round(p * 100)}%`)} />
        </box>
    );
}
