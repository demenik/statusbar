import AstalCava from "gi://AstalCava?version=0.1";
import { Accessor, createState } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import Gsk from "gi://Gsk?version=4.0";
import GLib from "gi://GLib?version=2.0";
import Graphene from "gi://Graphene?version=1.0";
import GObject from "gi://GObject?version=2.0";

const SHADER_SOURCE = `
#version 460

layout(location = 0) in vec2 v_tex_coord;
layout(location = 0) out vec4 outColor;
layout(binding = 0) uniform sampler2D tex;
layout(binding = 0) uniform UBO {
  float blur_size;
  float zoom_factor;
  float brightness_val;
  vec2 tex_size;
} ubo;

void main() {
  vec2 pix_size = 1.0 / ubo.tex_size;
  vec4 color = vec4(0.0);
  int samples = 0;

  vec2 uv = v_tex_coord - vec2(0.5);
  uv /= ubo.zoom_factor;
  uv += vec2(0.5);

  for (int x = -int(ubo.blur_size); x <= int(ubo.blur_size); x++) {
    for (int y = -int(ubo.blur_size); y <= int(ubo.blur_size); y++) {
      if (uv.x + float(x) * pix_size.x >= 0.0 && uv.x + float(x) * pix_size.x <= 1.0 &&
          uv.y + float(y) * pix_size.y >= 0.0 && uv.y + float(y) * pix_size.y <= 1.0)
      {
        color += texture(tex, uv + vec2(float(x), float(y)) * pix_size);
        samples++;
      }
    }
  }

  if (samples > 0) {
    color /= float(samples);
  }
  color.rgb *= ubo.brightness_val;

  outColor = color;
}
`;
const SHADER_BYTES = new TextEncoder().encode(SHADER_SOURCE);

type _ShaderWidgetProps = {
  artUrl: string;
  blur?: number;
  zoom?: number;
  brightness?: number;
} & Partial<Gtk.Box.ConstructorProps>;

const _ShaderWidget = GObject.registerClass(
  {
    GTypeName: "ShaderWidget",
    Properties: {
      "art-url": GObject.ParamSpec.string(
        "art-url",
        "Art url",
        "",
        GObject.ParamFlags.READWRITE,
        "",
      ),
      blur: GObject.ParamSpec.float(
        "blur",
        "Blur",
        "",
        GObject.ParamFlags.READWRITE,
        0,
        100,
        0,
      ),
      zoom: GObject.ParamSpec.float(
        "zoom",
        "Zoom",
        "",
        GObject.ParamFlags.READWRITE,
        0,
        10,
        1,
      ),
      brightness: GObject.ParamSpec.float(
        "brightness",
        "Brightness",
        "",
        GObject.ParamFlags.READWRITE,
        0,
        10,
        1,
      ),
    },
  },
  class ShaderWidget extends Gtk.Box {
    get artUrl() {
      return this._artUrl;
    }
    set artUrl(value: string) {
      if (this._artUrl === value) return;
      this._artUrl = value;
      this.notify("imageUrl");
      this.queue_draw();
    }
    private _artUrl = "";

    get blur() {
      return this._blur;
    }
    set blur(value: number) {
      if (this._blur === value) return;
      this._blur = value;
      this.notify("blur");
      this.queue_draw();
    }
    private _blur = 0;

    get zoom() {
      return this._zoom;
    }
    set zoom(value: number) {
      if (this._zoom === value) return;
      this._zoom = value;
      this.notify("zoom");
      this.queue_draw();
    }
    private _zoom = 1;

    get brightness() {
      return this._brightness;
    }
    set brightness(value: number) {
      if (this._brightness === value) return;
      this._brightness = value;
      this.notify("brightness");
      this.queue_draw();
    }
    private _brightness = 1;

    _init(params: _ShaderWidgetProps) {
      super._init(params);
      this._artUrl = params.artUrl;
      this._blur = params.blur ?? 0;
      this._zoom = params.zoom ?? 1;
      this._brightness = params.brightness ?? 1;
    }

    vfunc_snapshot(snapshot: Gtk.Snapshot): void {
      const shader = Gsk.GLShader.new_from_bytes(SHADER_BYTES);

      const texture = Gdk.Texture.new_from_filename(this._artUrl);

      const w = this.get_allocated_width();
      const h = this.get_allocated_height();
      if (!w || !h || !texture) return;

      const floatArray = new Float32Array([
        this._blur,
        this._zoom,
        this._brightness,
        texture.get_width(),
        texture.get_height(),
      ]);
      const args = new GLib.Bytes(new Uint8Array(floatArray.buffer));

      const rect = new Graphene.Rect({
        origin: new Graphene.Point({ x: 0, y: 0 }),
        size: new Graphene.Size({ width: w, height: h }),
      });

      const node = Gsk.GLShaderNode.new(shader, rect, args, [
        Gsk.TextureNode.new(texture, rect),
      ]);

      snapshot.append_node(node);
    }
  },
);

type Props = {
  artUrl: Accessor<string>;
} & Partial<Gtk.Box.ConstructorProps>;

export const MusicPopupCoverArt = ({ artUrl, ...props }: Props) => {
  const [blur, setBlur] = createState(8);
  const [zoom, setZoom] = createState(1);
  const [brightness, setBrightness] = createState(1);

  return (
    <_ShaderWidget
      $={(self) => {
        self.artUrl = artUrl.get();
        self.blur = blur.get();
        self.zoom = zoom.get();
        self.brightness = brightness.get();

        artUrl.subscribe(() => (self.artUrl = artUrl.get()));
        blur.subscribe(() => (self.blur = blur.get()));
        zoom.subscribe(() => (self.zoom = zoom.get()));
        brightness.subscribe(() => (self.brightness = brightness.get()));
      }}
      {...props}
    />
  );
};
