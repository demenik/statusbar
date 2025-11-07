import Mpris from "gi://AstalMpris";
import { createBinding, createComputed, createState, With } from "ags";
import { Player } from "./player";
import { PlayerControls } from "./controls";

const createPlayersBinding = (mpris: Mpris.Mpris) => {
  const _players = createBinding(mpris, "players");
  const [players, setPlayers] = createState<Mpris.Player[]>(
    _players
      .get()
      .filter(
        (player) => player.playbackStatus !== Mpris.PlaybackStatus.STOPPED,
      ),
  );

  let disposeFuncs: (() => void)[] = [];
  _players.subscribe(() => {
    disposeFuncs.forEach((dispose) => dispose());

    setPlayers(
      _players
        .get()
        .filter(
          (player) => player.playbackStatus !== Mpris.PlaybackStatus.STOPPED,
        ),
    );

    disposeFuncs = _players.get().map((player) =>
      createBinding(player, "playbackStatus").subscribe(() => {
        if (player.playbackStatus === Mpris.PlaybackStatus.STOPPED) {
          setPlayers((players) =>
            players.filter((p) => p.identity !== player.identity),
          );
        } else {
          setPlayers((players) => [...players, player]);
        }
      }),
    );
  });

  return players;
};

export const Music = () => {
  const mpris = Mpris.get_default();
  const players = createPlayersBinding(mpris).as((players) =>
    players.reduce<Mpris.Player[]>((acc, curr) => {
      if (!acc.find((p) => p.identity === curr.identity)) {
        acc.push(curr);
      }
      return acc;
    }, []),
  );

  const [index, setIndex] = createState(0);
  const player = createComputed((get) => {
    const _players = get(players);
    const _index = get(index);

    if (_players.length === 0) return null;
    if (_index >= _players.length) return _players[_players.length - 1];
    return _players[_index];
  });

  const nextPlayer = () => {
    if (index.get() >= players.get().length - 1) setIndex(0);
    else setIndex(index.get() + 1);
  };
  const prevPlayer = () => {
    if (index.get() <= 0) setIndex(players.get().length - 1);
    else setIndex(index.get() - 1);
  };
  const hasOther = players.as((players) => players.length > 1);

  return (
    <box class="music" spacing={4}>
      <box spacing={4}>
        <With value={player}>
          {(value) =>
            value && (
              <Player
                player={value}
                nextPlayer={nextPlayer}
                prevPlayer={prevPlayer}
                hasOther={hasOther}
              />
            )
          }
        </With>
      </box>
      <With value={player}>
        {(value) => value && <PlayerControls player={value} />}
      </With>
    </box>
  );
};
