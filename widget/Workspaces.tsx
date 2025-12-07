export default function Workspaces() {
    return (
        <box spacing={6}>
            <button class="ws focused">
                <label label="1" />
            </button>
            <button class="ws">
                <label label="2" />
            </button>
            <button class="ws">
                <label label="3" />
            </button>
        </box>
    );
}
