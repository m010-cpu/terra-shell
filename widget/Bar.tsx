import { Astal } from "ags/gtk4";
import Workspaces from "./Workspaces";
import Clock from "./Clock";
import Battery from "./Battery";
import Network from "./Network";
import Bluetooth from "./Bluetooth";
import Tray from "./Tray";
import Microphone from "./Microphone";
import Ram from "./Ram";
import Cpu from "./Cpu";
import Disk from "./Disk";
import Audio from "./Audio";

const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

export default function Bar(monitor: number = 0) {
    return (
        <window
            visible
            layer="top"
            anchor={TOP | LEFT | RIGHT}
            exclusivity="exclusive"
            class="bar-window"
            monitor={monitor}
        >
            <box class="bar-container" hexpand>
                <centerbox
                    hexpand
                    startWidget={
                        <box hexpand halign="start">
                            <Workspaces />
                        </box>
                    }
                    centerWidget={
                        <box hexpand halign="center" />
                    }
                    endWidget={
                        <box halign="end" spacing={4}>
                            <Tray />
                            <Microphone />
                            <Audio />
                            <Disk />
                            <Ram />
                            <Cpu />
                            <Battery />
                            <Bluetooth />
                            <Network />
                            <Clock />
                        </box>
                    }
                />
            </box>
        </window>
    );
}
