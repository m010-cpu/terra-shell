import { Gtk } from "ags/gtk4";
import App from "ags/gtk4/app";
import Tray from "gi://AstalTray";

export default function TrayWidget() {
    const tray = Tray.get_default();
    let revealer: Gtk.Revealer | null = null;
    let icon: Gtk.Image | null = null;

    const toggle = () => {
        if (revealer && icon) {
            revealer.reveal_child = !revealer.reveal_child;
            icon.icon_name = revealer.reveal_child ? "pan-end-symbolic" : "pan-start-symbolic";
        }
    };

    return (
        <box class="tray-container">
            <button
                class="tray-toggle"
                onClicked={toggle}
            >
                <image
                    iconName="pan-start-symbolic"
                    onRealize={(self: Gtk.Image) => icon = self}
                />
            </button>
            <revealer
                revealChild={false}
                transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
                transitionDuration={300}
                onRealize={(self: Gtk.Revealer) => revealer = self}
            >
                <box class="tray" onRealize={(self: Gtk.Box) => {
                    const itemButtons = new Map<string, {
                        btn: Gtk.Button;
                        iconId: number;
                        tooltipId: number;
                        popover: Gtk.PopoverMenu | null;
                    }>();
                    const addedIconPaths = new Set<string>();

                    const update = () => {
                        const items = tray.get_items();
                        const currentIds = new Set(items.map(item => item.itemId));

                        // Remove buttons for items that no longer exist
                        for (const [id, entry] of itemButtons) {
                            if (!currentIds.has(id)) {
                                const item = items.find(i => i.itemId === id);
                                // Disconnect signals safely — item may be finalized
                                try {
                                    if (item) {
                                        item.disconnect(entry.iconId);
                                        item.disconnect(entry.tooltipId);
                                    }
                                } catch { /* item already finalized */ }
                                if (entry.popover) {
                                    entry.popover.unparent();
                                    entry.popover.run_dispose();
                                }
                                self.remove(entry.btn);
                                itemButtons.delete(id);
                            }
                        }

                        // Add buttons for new items
                        items.forEach(item => {
                            if (itemButtons.has(item.itemId)) return;

                            if (item.iconThemePath && !addedIconPaths.has(item.iconThemePath)) {
                                App.add_icons(item.iconThemePath);
                                addedIconPaths.add(item.iconThemePath);
                            }

                            const image = new Gtk.Image();
                            const updateIcon = () => { image.gicon = item.gicon; };
                            const iconId = item.connect("notify::gicon", updateIcon);
                            updateIcon();

                            const btn = new Gtk.Button();
                            btn.child = image;
                            btn.connect("clicked", () => item.activate(0, 0));

                            const updateTooltip = () => { btn.tooltip_markup = item.tooltipMarkup; };
                            const tooltipId = item.connect("notify::tooltip-markup", updateTooltip);
                            updateTooltip();

                            const group = item.actionGroup;
                            if (group) {
                                btn.insert_action_group("dbusmenu", group);
                            }

                            let popover: Gtk.PopoverMenu | null = null;
                            if (item.menuModel) {
                                popover = Gtk.PopoverMenu.new_from_model(item.menuModel);
                                popover.set_parent(btn);
                                popover.set_has_arrow(false);
                                popover.set_position(Gtk.PositionType.BOTTOM);

                                const click = Gtk.GestureClick.new();
                                click.set_button(3);
                                click.connect("pressed", () => popover!.popup());
                                btn.add_controller(click);
                            }

                            self.append(btn);
                            itemButtons.set(item.itemId, { btn, iconId, tooltipId, popover });
                        });
                    };

                    const id = tray.connect("notify::items", update);
                    update();

                    self.connect("destroy", () => {
                        tray.disconnect(id);
                        // Clean up all remaining entries
                        for (const [, entry] of itemButtons) {
                            if (entry.popover) {
                                entry.popover.unparent();
                                entry.popover.run_dispose();
                            }
                        }
                        itemButtons.clear();
                    });
                }} />
            </revealer>
        </box>
    );
}
