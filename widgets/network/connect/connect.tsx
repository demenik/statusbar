import AstalNetwork from "gi://AstalNetwork?version=0.1";
import { PasswordEntry } from "../../entry";
import { createBinding, createState, With } from "ags";
import { Gtk } from "ags/gtk4";

type Props = {
  ap: AstalNetwork.AccessPoint;
  close: () => void;
};

enum ConnectingState {
  PASSWORD_INPUT,
  CONNECTING,
  FAILED,
}

export const WifiAPConnect = ({ ap, close: _close }: Props) => {
  const [state, setState] = createState(ConnectingState.PASSWORD_INPUT);
  const needsPass = createBinding(ap, "requiresPassword");
  const [password, setPassword] = createState("");

  const notConnecting = state.as(
    (state) => state !== ConnectingState.CONNECTING,
  );
  const notFailed = state.as((state) => state !== ConnectingState.FAILED);

  const connect = async () => {
    if (needsPass.get() && password.get().trim() == "") {
      setState(ConnectingState.FAILED);
      return;
    }

    try {
      setState(ConnectingState.CONNECTING);
      await ap.activate(needsPass.get() ? password.get().trim() : null);

      setState(ConnectingState.PASSWORD_INPUT);
      setPassword("");
      close();
    } catch (error) {
      setState(ConnectingState.FAILED);
    }
  };
  const close = () => notConnecting.get() && _close();

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
      <With value={needsPass}>
        {(value) =>
          value && (
            <PasswordEntry
              placeholderText="Password"
              onNotifyText={(self) => {
                setState(ConnectingState.PASSWORD_INPUT);
                setPassword(self.text);
              }}
              halign={Gtk.Align.FILL}
              sensitive={notConnecting}
              valid={notFailed}
            />
          )
        }
      </With>
      <box spacing={4} halign={Gtk.Align.START}>
        <button label="Connect" onClicked={connect} sensitive={notConnecting} />
        <button label="Cancel" onClicked={close} sensitive={notConnecting} />
      </box>
    </box>
  );
};
