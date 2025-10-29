import { Accessor } from "gnim";

type Props = {
  icon: string;
  value: Accessor<string>;
};

export const SystemStat = ({ icon, value }: Props) => {
  return (
    <box spacing={2}>
      <label label={icon} />
      <label css="font-size: 14px;" label={value} />
    </box>
  );
};
