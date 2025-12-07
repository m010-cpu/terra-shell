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
                    const update = () => {
                        // Clear existing children
                        let child = self.get_first_child();
                        while (child) {
                            const next = child.get_next_sibling();
                            self.remove(child);
                            child = next;
                        }

                        // Add new children
                        const items = tray.get_items();
                        items.forEach(item => {
                            if (item.iconThemePath) {
                                App.add_icons(item.iconThemePath);
                            }

                            const image = new Gtk.Image();
                            const updateIcon = () => { image.gicon = item.gicon; };
                            const iconId = item.connect("notify::gicon", updateIcon);
                            image.connect("destroy", () => item.disconnect(iconId));
                            updateIcon();

                            const btn = new Gtk.Button();
                            btn.child = image;
                            btn.connect("clicked", () => item.activate(0, 0));

                            // Manual binding for tooltip
                            const updateTooltip = () => { btn.tooltip_markup = item.tooltipMarkup; };
                            const tooltipId = item.connect("notify::tooltip-markup", updateTooltip);
                            btn.connect("destroy", () => item.disconnect(tooltipId));
                            updateTooltip();

                            // Add Action Group
                            const group = item.actionGroup;
                            if (group) {
                                btn.insert_action_group("dbusmenu", group);
                            }

                            // Create Menu Popover
                            if (item.menuModel) {
                                const popover = Gtk.PopoverMenu.new_from_model(item.menuModel);
                                popover.set_parent(btn);
                                popover.set_has_arrow(false);
                                popover.set_position(Gtk.PositionType.BOTTOM);

                                // Right Click Controller
                                const click = Gtk.GestureClick.new();
                                click.set_button(3); // Right click
                                click.connect("pressed", () => {
                                    popover.popup();
                                });
                                btn.add_controller(click);

                                // Cleanup popover
                                btn.connect("destroy", () => popover.unparent());
                            }

                            self.append(btn);
                        });
                    };

                    const id = tray.connect("notify::items", update);
                    update();

                    // Cleanup on destroy
                    self.connect("destroy", () => {
                        tray.disconnect(id);
                    });
                }} />
            </revealer>
        </box>
    );
}
