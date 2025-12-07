import { Gtk } from "ags/gtk4";
import Network from "gi://AstalNetwork";

export default function NetworkWidget() {
    const network = Network.get_default();

    return (
        <box class="network" spacing={4}>
            <image
                onRealize={(self: Gtk.Image) => {
                    const update = () => {
                        // 1. Wired connected
                        if (network.wired && network.wired.enabled &&
                            network.wired.internet === Network.Internet.CONNECTED) {
                            self.icon_name = network.wired.iconName;
                            return;
                        }

                        // 2. WiFi connected
                        if (network.wifi && network.wifi.enabled &&
                            network.wifi.internet === Network.Internet.CONNECTED) {
                            self.icon_name = network.wifi.iconName;
                            return;
                        }

                        // 3. WiFi disconnected
                        if (network.wifi && network.wifi.enabled &&
                            network.wifi.internet === Network.Internet.DISCONNECTED) {
                            self.icon_name = "network-wireless-disconnected-symbolic";
                            return;
                        }

                        // 4. Wired disconnected
                        if (network.wired && network.wired.enabled &&
                            network.wired.internet === Network.Internet.DISCONNECTED) {
                            self.icon_name = "network-wired-disconnected-symbolic";
                            return;
                        }

                        // 5. Fallback: airplane mode / no radios
                        self.icon_name = "airplane-mode-symbolic";
                    };

                    // Connect to signals
                    const wifiSignals: number[] = [];
                    const wiredSignals: number[] = [];

                    if (network.wifi) {
                        wifiSignals.push(network.wifi.connect("notify::icon-name", update));
                        wifiSignals.push(network.wifi.connect("notify::enabled", update));
                        wifiSignals.push(network.wifi.connect("notify::internet", update));
                    }
                    if (network.wired) {
                        wiredSignals.push(network.wired.connect("notify::icon-name", update));
                        wiredSignals.push(network.wired.connect("notify::internet", update));
                    }

                    update();

                    self.connect("destroy", () => {
                        if (network.wifi) wifiSignals.forEach(id => network.wifi.disconnect(id));
                        if (network.wired) wiredSignals.forEach(id => network.wired.disconnect(id));
                    });
                }}
            />
        </box>
    );
}
