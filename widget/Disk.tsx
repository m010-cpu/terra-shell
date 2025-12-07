import { createPoll } from "ags/time";

const disk = createPoll("", 60000, ["bash", "-c", "df -h / | awk 'NR==2 {print $4}'"]);

export default function Disk() {
    return (
        <box class="disk" spacing={2}>
            <image iconName="drive-harddisk-symbolic" />
            <label label={disk} />
        </box>
    );
}
