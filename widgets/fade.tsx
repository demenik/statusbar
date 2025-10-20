import Gtk from "gi://Gtk";
import Gsk from "gi://Gsk";
import GObject from "gi://GObject";
import { Gdk } from "ags/gtk4";
import Graphene from "gi://Graphene";
import {
  getOptionalAccessor,
  isAccessor,
  OptionalAccessor,
} from "../utils/accessor";
import type { Node } from "ags";
import { Props } from "../utils/types";

type _FadeBoxProps = {
  fadeWidth?: number;
  fadeSides?: Gtk.PositionType[];
} & Partial<Gtk.Box.ConstructorProps>;

export const _FadeBox = GObject.registerClass(
  {
    GTypeName: "FadeContainer",
    Properties: {
      "fade-width": GObject.ParamSpec.int(
        "fade-width",
        "Fade Width",
        "The width of the fade gradient in pixels",
        GObject.ParamFlags.READWRITE,
        0,
        200,
        40,
      ),
      "fade-sides": GObject.ParamSpec.jsobject<Gtk.PositionType[]>(
        "fade-sides",
        "Fade Sides",
        "The sides which to apply a fade to",
        GObject.ParamFlags.READWRITE,
      ),
    },
  },
  class FadeBox extends Gtk.Box {
    get fadeWidth() {
      return this._fadeWidth;
    }
    set fadeWidth(value: number) {
      if (this._fadeWidth === value) return;
      this._fadeWidth = value;
      this.notify("fade-width");
      this.queue_draw();
    }
    private _fadeWidth = 40;

    get fadeSides() {
      return this._fadeSides;
    }
    set fadeSides(value: Gtk.PositionType[]) {
      if (this._fadeSides === value) return;
      this._fadeSides = value;
      this.notify("fade-sides");
      this.queue_draw();
    }
    private _fadeSides = [Gtk.PositionType.RIGHT];

    constructor(params: _FadeBoxProps) {
      super(params);
      if (params.fadeWidth) this._fadeWidth = params.fadeWidth;
    }

    vfunc_snapshot(snapshot: Gtk.Snapshot) {
      const child = this.get_first_child();
      if (!child) return super.vfunc_snapshot(snapshot);

      const childSnapshot = new Gtk.Snapshot();
      this.snapshot_child(child, childSnapshot);
      let childNode = childSnapshot.to_node();
      if (!childNode) return;

      const width = this.get_allocated_width();
      const height = this.get_allocated_height();

      const opaque = new Gdk.RGBA({ red: 1, green: 1, blue: 1, alpha: 1 });
      const transparent = new Gdk.RGBA({ red: 1, green: 1, blue: 1, alpha: 0 });
      const colorStops = [
        new Gsk.ColorStop({ offset: 0, color: opaque }),
        new Gsk.ColorStop({ offset: 1, color: transparent }),
      ];

      const bounds = new Graphene.Rect({
        origin: new Graphene.Point({ x: 0, y: 0 }),
        size: new Graphene.Size({ width, height }),
      });

      for (const side of this._fadeSides) {
        let gradientNode;
        switch (side) {
          case Gtk.PositionType.RIGHT:
            gradientNode = Gsk.LinearGradientNode.new(
              bounds,
              new Graphene.Point({ x: width - this._fadeWidth, y: 0 }),
              new Graphene.Point({ x: width, y: 0 }),
              colorStops,
            );
            break;
          case Gtk.PositionType.LEFT:
            gradientNode = Gsk.LinearGradientNode.new(
              bounds,
              new Graphene.Point({ x: this._fadeWidth, y: 0 }),
              new Graphene.Point({ x: 0, y: 0 }),
              colorStops,
            );
            break;
          case Gtk.PositionType.TOP:
            gradientNode = Gsk.LinearGradientNode.new(
              bounds,
              new Graphene.Point({ x: 0, y: this._fadeWidth }),
              new Graphene.Point({ x: 0, y: 0 }),
              colorStops,
            );
            break;
          case Gtk.PositionType.BOTTOM:
            gradientNode = Gsk.LinearGradientNode.new(
              bounds,
              new Graphene.Point({ x: 0, y: height - this._fadeWidth }),
              new Graphene.Point({ x: 0, y: height }),
              colorStops,
            );
            break;
        }

        if (gradientNode) {
          childNode = Gsk.MaskNode.new(
            childNode,
            gradientNode,
            Gsk.MaskMode.ALPHA,
          );
        }
      }

      snapshot.append_node(childNode);
    }
  },
);

type FadeBoxProps = {
  children: Array<Node> | Node;
  fadeWidth?: OptionalAccessor<number>;
  fadeSides?: OptionalAccessor<Gtk.PositionType[]>;
} & Props<Gtk.Box, Gtk.Box.ConstructorProps>;

export const FadeBox = ({
  children,
  fadeWidth,
  fadeSides,
  ...props
}: FadeBoxProps) => {
  return (
    <box {...props}>
      <_FadeBox
        $={(self) => {
          self.fadeWidth = getOptionalAccessor(fadeWidth, 40);
          self.fadeSides = getOptionalAccessor(fadeSides, [
            Gtk.PositionType.RIGHT,
          ]);

          if (isAccessor(fadeWidth)) {
            fadeWidth.subscribe(() => {
              self.fadeWidth = fadeWidth.get();
            });
          }
          if (isAccessor(fadeSides)) {
            fadeSides.subscribe(() => {
              self.fadeSides = fadeSides.get();
            });
          }
        }}
      >
        {children}
      </_FadeBox>
    </box>
  );
};
