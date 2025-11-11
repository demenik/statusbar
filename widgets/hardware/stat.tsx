import { Accessor } from "ags";

type Props = {
  icon: string;
  value: Accessor<string>;
};

export const SystemStat = ({ icon, value }: Props) => {
  return (
    <box spacing={4}>
      <label label={icon} />
      <label css="font-size: 14px;" label={value} />
    </box>
  );
};
