import { Gtk } from "ags/gtk4";
import AstalBluetooth from "gi://AstalBluetooth";
import { createBinding, createState } from "ags";
import { MarqueeLabel } from "../marquee";
import { dialogError } from "../../utils/dialog";

type Props = {
  device: AstalBluetooth.Device;
};

export const BTDeviceDetails = ({ device }: Props) => {
  const name = createBinding(device, "name");
  const alias = createBinding(device, "alias");
  const icon = createBinding(device, "icon");

  const [editingState, setEditingState] = createState<"view" | "editing">(
    "view",
  );
  const toggleEditing = () => {
    if (editingState.get() === "view") {
      setEdit(alias.get());

      setEditingState("editing");
    } else {
      setEditingState("view");

      let current = edit.get();
      if (current.trim() === "") current = name.get();
      device.set_alias(current);
    }
  };
  const editingIcon = editingState.as((state) =>
    state === "view" ? "draw-freehand-symbolic" : "emblem-ok-symbolic",
  );
  const [edit, setEdit] = createState(device.alias);

  const connect = () => {
    device.connect_device().catch((e) =>
      dialogError({
        title: "Error while connecting to Bluetooth device",
        text: e,
      }),
    );
  };

  return (
    <box spacing={4} orientation={Gtk.Orientation.VERTICAL}>
      <box spacing={4}>
        <image iconName={icon} class="icon" />
        <stack visibleChildName={editingState}>
          <MarqueeLabel
            $type="named"
            name="view"
            label={alias}
            class="title"
            halign={Gtk.Align.START}
            maxWidth={200}
          />
          <entry
            $type="named"
            name="editing"
            placeholderText={name}
            text={edit}
            onNotifyText={({ text }) => setEdit(text)}
            widthRequest={200}
          />
        </stack>
        <button
          class="invisible"
          iconName={editingIcon}
          onClicked={toggleEditing}
        />
      </box>
      <box spacing={4}>
        <button label="Connect" onClicked={connect} />
      </box>
    </box>
  );
};
