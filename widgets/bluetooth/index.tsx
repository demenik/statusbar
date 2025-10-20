import { Gtk } from "ags/gtk4";
import AstalBluetooth from "gi://AstalBluetooth";
import { createBinding, createComputed, For, With } from "ags";
import { HSeparator } from "../separator";
import { BluetoothDevice } from "./device";
import { timeout, Timer } from "ags/time";

export const Bluetooth = () => {
  const bluetooth = AstalBluetooth.get_default();

  const isPowered = createBinding(bluetooth, "isPowered");
  const isConnected = createBinding(bluetooth, "isConnected");
  const iconName = createComputed((get) => {
    const powered = get(isPowered);
    const connected = get(isConnected);

    if (powered && connected) return "bluetooth-active-symbolic";
    else if (powered && !connected) return "bluetooth-symbolic";
    else return "bluetooth-disabled-symbolic";
  });

  const isDiscoverable = createBinding(bluetooth.adapter, "discoverable");
  const isDiscovering = createBinding(bluetooth.adapter, "discovering");

  const devices = createBinding(bluetooth, "devices").as((devices) =>
    devices.filter(
      (device) => /^([A-Za-z0-9]{2}-?){6}$/.test(device.alias) === false,
    ),
  );
  const paired = devices.as((devices) =>
    devices.filter((device) => device.paired),
  );
  const discovered = devices.as((devices) =>
    devices.filter((device) => !device.paired),
  );

  let timer: Timer | null = null;
  const startDiscovery = (time = 10 * 1000) => {
    if (timer) {
      timer.cancel();
      timer = null;
    }
    bluetooth.adapter.start_discovery();
    timer = timeout(time, () => bluetooth.adapter.stop_discovery());
  };

  const toggleDiscovery = () => {
    if (timer) {
      timer.cancel();
      timer = null;
    }

    if (!bluetooth.adapter.discovering) {
      startDiscovery();
    } else {
      bluetooth.adapter.stop_discovery();
    }
  };

  return (
    <menubutton class="invisible" onRealize={() => startDiscovery()}>
      <image iconName={iconName} iconSize={Gtk.IconSize.NORMAL} />
      <popover hasArrow={false}>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
          <box spacing={4} halign={Gtk.Align.START}>
            <image iconName={iconName} iconSize={Gtk.IconSize.NORMAL} />
            <label label="Bluetooth" class="title" />
          </box>

          <box>
            <label label="Powered" />
            <box hexpand />
            <switch
              active={isPowered}
              onNotifyActive={({ active }) =>
                bluetooth.adapter.set_powered(active)
              }
            />
          </box>

          <box spacing={4}>
            <label label="Discoverable" />
            <box hexpand />
            <switch
              active={isDiscoverable}
              onNotifyActive={({ active }) =>
                bluetooth.adapter.set_discoverable(active)
              }
            />
          </box>

          <HSeparator />

          <box spacing={4}>
            <image
              iconName="bluetooth-symbolic"
              iconSize={Gtk.IconSize.NORMAL}
            />
            <label label="Paired devices" class="title" />
          </box>

          <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
            <For each={paired}>
              {(device) => <BluetoothDevice device={device} />}
            </For>
            <With value={paired}>
              {(devices) =>
                devices.length === 0 ? (
                  <label halign={Gtk.Align.START} label="No devices found" />
                ) : null
              }
            </With>
          </box>

          <HSeparator />

          <box spacing={4}>
            <button
              iconName="view-refresh-symbolic"
              class={isDiscovering.as((val) => (val ? "refreshing" : ""))}
              onClicked={toggleDiscovery}
            />
            <label label="Discovered devices" class="title" />
          </box>

          <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
            <For each={discovered}>
              {(device) => <BluetoothDevice device={device} />}
            </For>
            <With value={discovered}>
              {(devices) =>
                devices.length === 0 ? (
                  <label halign={Gtk.Align.START} label="No devices found" />
                ) : null
              }
            </With>
          </box>
        </box>
      </popover>
    </menubutton>
  );
};
