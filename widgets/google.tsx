import { createState } from "ags";
import { GoogleApi } from "../api/google";

type Props<T extends GoogleApi> = {
  api: T;
  onAuthenticate?: () => Promise<void>;
};

export const GoogleApiAuthenticationButton = <T extends GoogleApi>({
  api,
}: Props<T>) => {
  const [authenticated, setAuthenticated] = createState(api.isAuthenticated);

  const authenticate = async () => {
    const success = await api.authenticate();
    setAuthenticated(success);
  };

  const label = authenticated.as((a) =>
    a ? "Connect to Google" : "Connected to Google",
  );

  return (
    <togglebutton
      onClicked={() => authenticate()}
      active={authenticated}
      label={label}
    />
  );
};
