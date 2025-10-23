import Mpris from "gi://AstalMpris?version=0.1";
import { Accessor, createBinding, createComputed } from "ags";
import { Gtk } from "ags/gtk4";
import { PlayerPopup } from "./popup";
import { getAppIcon } from "../../utils/icons";
import { MarqueeLabel } from "../marquee";

type Props = {
  player: Mpris.Player;
  nextPlayer: () => void;
  prevPlayer: () => void;
  hasOther: Accessor<boolean>;
};

export const Player = ({ player, nextPlayer, prevPlayer, hasOther }: Props) => {
  const playerIcon = createBinding(player, "entry").as(
    (name) => getAppIcon(name) ?? "",
  );

  const artist = createBinding(player, "artist");
  const title = createBinding(player, "title");
  const label = createComputed((get) => {
    let result = "";
    const a = get(artist);
    const t = get(title);

    if (a.trim() !== "") result += a;
    if (t.trim() !== "") {
      if (result !== "") result += " ‒ ";
      result += t;
    }

    if (result === "") result = "Unknown media";
    return result;
  });

  return (
    <box>
      <menubutton
        class="invisible small"
        css="padding-left: 0; padding-right: 0;"
      >
        <box spacing={4}>
          <image
            iconName={playerIcon}
            iconSize={Gtk.IconSize.NORMAL}
            class="color-icon"
          />

          <MarqueeLabel label={label} maxWidth={200} />
        </box>
        <popover hasArrow={false}>
          <PlayerPopup
            player={player}
            nextPlayer={nextPlayer}
            prevPlayer={prevPlayer}
            hasOther={hasOther}
          />
        </popover>
      </menubutton>
    </box>
  );
};
