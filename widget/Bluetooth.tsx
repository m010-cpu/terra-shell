import { createBinding } from "ags";
import Bluetooth from "gi://AstalBluetooth";

export default function BluetoothWidget() {
    const bluetooth = Bluetooth.get_default();
    if (!bluetooth) return <box />;

    const isPowered = createBinding(bluetooth, "isPowered");
    const devices = createBinding(bluetooth, "devices");

    return (
        <button onClicked={() => bluetooth.toggle()}>
            <box>
                <image
                    iconName="bluetooth-disabled-symbolic"
                    visible={isPowered.as((p: boolean) => !p)}
                />
                <image
                    iconName={devices.as((d: any[]) =>
                        d.filter(dev => dev.connected).length > 0
                            ? "bluetooth-active-symbolic"
                            : "bluetooth-symbolic"
                    )}
                    visible={isPowered}
                />
            </box>
        </button>
    );
}
