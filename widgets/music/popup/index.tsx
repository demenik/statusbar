import { Gtk } from "ags/gtk4";
import Mpris from "gi://AstalMpris?version=0.1";
import { Accessor, createBinding, With } from "gnim";
import { getAppIcon } from "../../../utils/icons";
import { MarqueeLabel } from "../../marquee";
import { MusicPopupControls } from "./controls";
import { capitalizeAll } from "../../../utils/capitalize";

type Props = {
  player: Mpris.Player;
  nextPlayer: () => void;
  prevPlayer: () => void;
  hasOther: Accessor<boolean>;
};

export const PlayerPopup = ({
  player,
  nextPlayer,
  prevPlayer,
  hasOther,
}: Props) => {
  const playerName = createBinding(player, "identity").as((name) =>
    capitalizeAll(name ?? "Unknown Player"),
  );
  const playerIcon = createBinding(player, "entry").as(
    (name) => getAppIcon(name) ?? "",
  );

  const artUrl = createBinding(player, "coverArt");

  const title = createBinding(player, "title").as(
    (title) => title ?? "Unknown title",
  );
  const artist = createBinding(player, "artist").as(
    (artist) => artist ?? "Unknown artist",
  );

  return (
    <box
      class="player-popup"
      orientation={Gtk.Orientation.VERTICAL}
      halign={Gtk.Align.CENTER}
      css="min-width: 100px;"
      spacing={8}
      widthRequest={250}
    >
      <box spacing={4} halign={Gtk.Align.CENTER}>
        <With value={hasOther}>
          {(value) =>
            value && (
              <button
                class="invisible small"
                css="padding: 4px 8px;"
                iconName="pan-start-symbolic"
                onClicked={prevPlayer}
              />
            )
          }
        </With>

        <image
          iconName={playerIcon}
          iconSize={Gtk.IconSize.NORMAL}
          class="color-icon"
        />
        <MarqueeLabel
          label={playerName}
          maxWidth={100}
          css="font-weight: 500; font-size: 14px;"
        />

        <With value={hasOther}>
          {(value) =>
            value && (
              <button
                class="invisible small"
                css="padding: 4px 8px;"
                iconName="pan-end-symbolic"
                onClicked={nextPlayer}
              />
            )
          }
        </With>
      </box>

      <box hexpand={true} halign={Gtk.Align.CENTER}>
        <With value={artUrl}>
          {(value) =>
            value && (
              <image
                class="popup-cover-art rounded"
                overflow={Gtk.Overflow.HIDDEN}
                file={artUrl}
                pixelSize={250}
              />
            )
          }
        </With>
      </box>

      <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
        <MarqueeLabel
          class="title"
          label={title}
          maxWidth={250}
          halign={Gtk.Align.CENTER}
        />
        <MarqueeLabel
          css="font-size: 16px;"
          label={artist}
          maxWidth={250}
          halign={Gtk.Align.CENTER}
        />
      </box>

      <MusicPopupControls player={player} />
    </box>
  );
};
