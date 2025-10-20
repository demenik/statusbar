import Mpris from "gi://AstalMpris";
import { createBinding, createState, With } from "ags";
import { Player } from "./player";

const createPlayerBinding = (mpris: Mpris.Mpris) => {
  const players = createBinding(mpris, "players");
  const [player, setPlayer] = createState<Mpris.Player | undefined>(
    players
      .get()
      .find((player) => player.playbackStatus !== Mpris.PlaybackStatus.STOPPED),
  );

  let disposeFuncs: (() => void)[] = [];
  players.subscribe(() => {
    disposeFuncs.forEach((dispose) => dispose());

    disposeFuncs = players.get().map((player) =>
      createBinding(player, "playbackStatus").subscribe(() => {
        if (player.playbackStatus !== Mpris.PlaybackStatus.STOPPED) {
          setPlayer(player);
        }
      }),
    );
  });

  return player;
};

export const Music = () => {
  const mpris = Mpris.get_default();
  const player = createPlayerBinding(mpris);

  return (
    <box class="music">
      <With value={player}>
        {(value) => value && <Player player={value} />}
      </With>
    </box>
  );
};
