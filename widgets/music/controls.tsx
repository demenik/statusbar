import AstalMpris from "gi://AstalMpris";
import { createBinding } from "ags";

type Props = {
  player: AstalMpris.Player;
};

export const PlayerControls = ({ player }: Props) => {
  const playPauseIcon = createBinding(player, "playbackStatus").as((status) =>
    status == AstalMpris.PlaybackStatus.PLAYING
      ? "media-playback-pause"
      : "media-playback-start",
  );

  return (
    <box spacing={4}>
      <button
        class="invisible icon"
        iconName="media-skip-backward"
        onClicked={() => player.previous()}
      />
      <button
        class="invisible icon"
        iconName={playPauseIcon}
        onClicked={() => player.play_pause()}
      />
      <button
        class="invisible icon"
        iconName="media-skip-forward"
        onClicked={() => player.next()}
      />
    </box>
  );
};
