import { createPoll } from "ags/time";

// Using vmstat 1 2 to get current usage (second line of output)
const cpu = createPoll(0, 30000, ["bash", "-c", "vmstat 1 2 | tail -1 | awk '{print 100 - $15}'"], (out) => Math.round(Number(out)));

export default function Cpu() {
    return (
        <box class="cpu" spacing={2}>
            <image iconName="system-run-symbolic" />
            <label label={cpu((p: number) => `${p}%`)} />
        </box>
    );
}
