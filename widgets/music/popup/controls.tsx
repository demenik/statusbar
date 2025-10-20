import Mpris from "gi://AstalMpris?version=0.1";
import { createBinding, createComputed } from "ags";
import { formatSec } from "../../../utils/formatSec";

type Props = {
  player: Mpris.Player;
};

export const MusicPopupControls = ({ player }: Props) => {
  const positionSec = createBinding(player, "position");
  const lengthSec = createBinding(player, "length");
  const progress = createComputed((get) => get(positionSec) / get(lengthSec));

  const needHours = lengthSec.as((len) => len >= 3600);
  const needMinPad = lengthSec.as((len) => len >= 600);
  const position = createComputed((get) =>
    formatSec(get(positionSec), get(needMinPad), get(needHours)),
  );
  const length = createComputed((get) =>
    formatSec(get(lengthSec), get(needMinPad), get(needHours)),
  );

  const onSeek = (percent: number) => {
    const position = percent * lengthSec.get();
    player.set_position(position);
  };

  const shuffle = createBinding(player, "shuffleStatus");
  const toggleShuffle = () =>
    player.set_shuffle_status(
      shuffle.get() == Mpris.Shuffle.OFF ? Mpris.Shuffle.ON : Mpris.Shuffle.OFF,
    );

  const playPauseIcon = createBinding(player, "playbackStatus").as((status) =>
    status == Mpris.PlaybackStatus.PLAYING
      ? "media-playback-pause"
      : "media-playback-start",
  );

  return (
    <>
      <box>
        <label label={position} css="font-size: 12px;" />
        <slider
          hexpand={true}
          min={0}
          max={1}
          value={progress}
          onChangeValue={({ value }) => onSeek(value)}
          class="hide-slider"
        />
        <label label={length} css="font-size: 12px;" />
      </box>
      <box>
        <box hexpand={true} />
        <togglebutton
          class="small invisible icon"
          iconName="media-playlist-shuffle"
          sensitive={shuffle.as((s) => s != Mpris.Shuffle.UNSUPPORTED)}
          active={shuffle.as((s) => s == Mpris.Shuffle.ON)}
          onClicked={() => toggleShuffle()}
        />
        <box hexpand={true} />
        <button
          class="small invisible icon"
          iconName="media-skip-backward"
          onClicked={() => player.previous()}
        />
        <box hexpand={true} />
        <button
          class="small invisible icon"
          iconName={playPauseIcon}
          onClicked={() => player.play_pause()}
        />
        <box hexpand={true} />
        <button
          class="small invisible icon"
          iconName="media-skip-forward"
          onClicked={() => player.next()}
        />
        <box hexpand={true} />
        <LoopButton player={player} />
        <box hexpand={true} />
      </box>
    </>
  );
};

const LoopButton = ({ player }: Props) => {
  const loop = createBinding(player, "loopStatus");
  const active = loop.as((loop) =>
    [Mpris.Loop.TRACK, Mpris.Loop.PLAYLIST].includes(loop),
  );

  const icon = loop.as((l) =>
    l == Mpris.Loop.TRACK
      ? "media-playlist-repeat-song"
      : "media-playlist-repeat",
  );

  const toggleLoop = () => {
    switch (loop.get()) {
      case Mpris.Loop.NONE:
        player.set_loop_status(Mpris.Loop.PLAYLIST);
        break;
      case Mpris.Loop.PLAYLIST:
        player.set_loop_status(Mpris.Loop.TRACK);
        break;
      case Mpris.Loop.TRACK:
        player.set_loop_status(Mpris.Loop.NONE);
        break;
    }
  };

  return (
    <togglebutton
      class="small invisible icon"
      iconName={icon}
      sensitive={loop.as((l) => l != Mpris.Loop.UNSUPPORTED)}
      active={active}
      onClicked={() => toggleLoop()}
    />
  );
};
