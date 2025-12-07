import { createBinding } from "ags";
import Bluetooth from "gi://AstalBluetooth";

export default function BluetoothWidget() {
    const bluetooth = Bluetooth.get_default();
    const devices = createBinding(bluetooth, "devices");

    return (
        <button onClicked={() => bluetooth.toggle()}>
            <box>
                <image
                    iconName="bluetooth-disabled-symbolic"
                    visible={createBinding(bluetooth, "isPowered").as((p: boolean) => !p)}
                />
                <image
                    iconName={devices.as((d: any[]) => d.length > 0 ? "bluetooth-active-symbolic" : "bluetooth-symbolic")}
                    visible={createBinding(bluetooth, "isPowered")}
                />
            </box>
        </button>
    );
}
