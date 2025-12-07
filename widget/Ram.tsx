import { createPoll } from "ags/time";

const ram = createPoll(0, 30000, "awk '/MemTotal/ {t=$2} /MemAvailable/ {a=$2} END {printf \"%.0f\", (t-a)/t*100}' /proc/meminfo", (out) => Number(out));

export default function Ram() {
    return (
        <box class="ram" spacing={2}>
            <image iconName="open-menu-symbolic" />
            <label label={ram((p: number) => `${p}%`)} />
        </box>
    );
}
