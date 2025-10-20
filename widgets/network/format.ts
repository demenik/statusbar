import AstalNetwork from "gi://AstalNetwork";

export const formatState = (state: AstalNetwork.DeviceState): string => {
  switch (state) {
    case AstalNetwork.DeviceState.DISCONNECTED:
      return "Not connected";
    case AstalNetwork.DeviceState.ACTIVATED:
      return "Connected";
    case AstalNetwork.DeviceState.PREPARE:
      return "Preparing connection...";
    case AstalNetwork.DeviceState.IP_CHECK:
      return "Checking IP...";
    case AstalNetwork.DeviceState.NEED_AUTH:
      return "Not authorized";
    case AstalNetwork.DeviceState.UNAVAILABLE:
      return "Unvavailable";
    case AstalNetwork.DeviceState.DEACTIVATING:
      return "Deactivating...";
    case AstalNetwork.DeviceState.FAILED:
      return "Failed to connect";
    case AstalNetwork.DeviceState.IP_CONFIG:
      return "Configuring IPv4/IPv6...";
    case AstalNetwork.DeviceState.CONFIG:
      return "Configuring...";
    case AstalNetwork.DeviceState.UNMANAGED:
      return "Unmanaged";
    case AstalNetwork.DeviceState.SECONDARIES:
      return "Connecting VPN...";
    case AstalNetwork.DeviceState.UNKNOWN:
      return "Unknown state";
  }
};

export const formatInternet = (internet: AstalNetwork.Internet): string => {
  switch (internet) {
    case AstalNetwork.Internet.CONNECTED:
      return "Internet";
    case AstalNetwork.Internet.CONNECTING:
      return "Internet connecting...";
    case AstalNetwork.Internet.DISCONNECTED:
      return "No internet";
  }
};

export const getInternetIcon = (internet: AstalNetwork.Internet): string => {
  switch (internet) {
    case AstalNetwork.Internet.CONNECTED:
      return "globe-symbolic";
    case AstalNetwork.Internet.CONNECTING:
      return "emblem-synchronizing-symbolic";
    case AstalNetwork.Internet.DISCONNECTED:
      return "network-offline-symbolic";
  }
};

export const formatFrequency = (f: number): string => {
  if (f >= 2400 && f <= 3000) {
    return "2,4GHz";
  } else if (f >= 5000 && f <= 6000) {
    return "5GHz";
  } else if (f >= 6000 && f <= 7200) {
    return "6GHz";
  }

  return `@${(f / 1000).toFixed(1).replace(".", ",")}GHz`;
};
