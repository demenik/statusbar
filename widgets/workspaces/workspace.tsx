import { Accessor } from "gnim";

type Props = {
  isFocused: Accessor<boolean>;
};

export const Workspace = ({ isFocused }: Props) => {
  const className = isFocused.as((f) =>
    f ? "workspace focused" : "workspace",
  );

  return <box class={className} />;
};
