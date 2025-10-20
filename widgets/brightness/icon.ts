export const getBrightnessIcon = (brightness: number) => {
  if (brightness <= 0.33) {
    return "display-brightness-low-symbolic";
  } else if (brightness <= 0.66) {
    return "display-brightness-medium-symbolic";
  } else {
    return "display-brightness-high-symbolic";
  }
};
