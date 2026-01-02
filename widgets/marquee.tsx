import { Gtk } from "ags/gtk4";
import { Accessor, createEffect, createMemo, createState } from "gnim";
import { Props } from "../utils/types";
import { isAccessor } from "../utils/accessor";
import Pango from "gi://Pango?version=1.0";
import { timeout, Timer } from "ags/time";
import { FadeBox } from "./fade";

type MarqueeProps = {
  label: string | Accessor<string>;
  marqueeSpeed?: number;
  marqueePause?: number;
  marqueeGap?: number;
  maxWidth?: number;
  labelProps?: Props<Gtk.Label, Gtk.Label.ConstructorProps>;
} & Props<Gtk.Box, Gtk.Box.ConstructorProps>;

export const MarqueeLabel = ({
  marqueeSpeed = 25,
  marqueePause = 3000,
  marqueeGap = 30,
  maxWidth,

  label: text,
  labelProps = {},
  ...rest
}: MarqueeProps) => {
  console.log("INIT MarqueeLabel");

  let timer: Timer | null = null;
  let fadeTimer: Timer | null = null;
  let labelWidget: Gtk.Label | null = null;

  const cleanup = () => {
    timer?.cancel();
    timer = null;
    fadeTimer?.cancel();
    fadeTimer = null;
  };

  const value = isAccessor(text) ? text : () => text as string;

  const [labelWidth, setLabelWidth] = createState(maxWidth ?? -1);
  const [labelHeight, setLabelHeight] = createState(-1);
  const updateLabelWidth = (label: Gtk.Label) => {
    const pangoCtx = label.get_pango_context();
    const layout = Pango.Layout.new(pangoCtx);
    layout.set_text(value(), -1);

    const [w, h] = layout.get_pixel_size();
    if (w > 0) setLabelWidth(w);
    if (h > 0) setLabelHeight(h);
  };

  const [containerWidth, setContainerWidth] = createState(maxWidth ?? -1);
  const updateContainerWidth = (container: Gtk.Overlay) => {
    const w = container.get_allocated_width();
    if (w > 0) setContainerWidth(w);
  };

  const shouldScroll = createMemo(() => labelWidth() > containerWidth());
  const width = createMemo(() =>
    shouldScroll() ? containerWidth() : labelWidth(),
  );

  const [isScrolling, setIsScrolling] = createState(false);
  const [isNearEnd, setIsNearEnd] = createState(true);

  const fadeSides = createMemo(() => {
    let sides: Gtk.PositionType[] = [];
    if (shouldScroll()) sides.push(Gtk.PositionType.RIGHT);
    if (isScrolling() && !isNearEnd()) sides.push(Gtk.PositionType.LEFT);
    return sides;
  });

  const scrollAmount = labelWidth.as((value) => value + marqueeGap);
  const duration = scrollAmount.as((value) =>
    Math.round((value / marqueeSpeed) * 1000),
  );
  const boxCss = createMemo(() =>
    isScrolling()
      ? `transition: transform ${duration()}ms linear; transform: translateX(-${scrollAmount()}px);`
      : "transition: none; transform: translateX(0);",
  );

  const startMarquee = () => {
    cleanup();
    console.log(`[MarqueeLabel] ${value()} is waiting`);
    timer = timeout(marqueePause, () => {
      console.log(`[MarqueeLabel] ${value()} is scrolling`);
      setIsNearEnd(false);
      setIsScrolling(true);

      timer = timeout(duration(), () => {
        setIsScrolling(false);
        startMarquee();
      });

      fadeTimer = timeout(duration() * 0.95, () => {
        setIsNearEnd(true);
      });
    });
  };

  createEffect(() => {
    value();
    if (labelWidget) updateLabelWidth(labelWidget);
  });

  createEffect(() => {
    if (shouldScroll()) {
      startMarquee();
    } else {
      cleanup();
      setIsScrolling(false);
      setIsNearEnd(true);
    }
  });

  createEffect(() => {
    console.log(
      `[MarqueeLabel] ${JSON.stringify(
        {
          value: value(),
          labelWidth: labelWidth(),
          labelHeight: labelHeight(),
          containerWidth: containerWidth(),
          shouldScroll: shouldScroll(),
          scrollAmount: scrollAmount(),
          duration: duration(),
        },
        null,
        2,
      )}`,
    );
  });

  return (
    <FadeBox fadeSides={[]} fadeWidth={20} {...rest}>
      <overlay
        class="marquee-container"
        css="min-width: 0;"
        overflow={Gtk.Overflow.HIDDEN}
        halign={Gtk.Align.BASELINE_CENTER}
        onMap={(self) => updateContainerWidth(self)}
        onDestroy={() => cleanup()}
      >
        <box widthRequest={width} heightRequest={labelHeight} vexpand={true} />
        <box $type="overlay" css={boxCss}>
          <label
            {...labelProps}
            label={text}
            onMap={(self) => {
              labelWidget = self;
              updateLabelWidth(self);
            }}
          />
          <box widthRequest={marqueeGap} />
          <label {...labelProps} label={text} />
        </box>
      </overlay>
    </FadeBox>
  );
};
