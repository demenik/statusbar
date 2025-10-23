{
  description = "Statusbar";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ags,
  }:
    {
      nixosModules = rec {
        statusbar = {
          lib,
          pkgs,
          ...
        }: {
          config = {
            environment.systemPackages = [
              self.packages.${pkgs.system}.default
            ];

            services = {
              # required for mpris cover art
              gvfs.enable = true;
              # required for battery menu
              upower.enable = true;
              tlp.enable = true;
            };

            security.sudo-rs.extraRules = [
              # required for battery menu
              {
                groups = ["tlp"];
                commands = [
                  {
                    command = "${lib.getExe pkgs.tlp}";
                    options = ["SETENV" "NOPASSWD"];
                  }
                ];
              }
            ];
          };
        };

        default = statusbar;
      };
    }
    // flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};

      pname = "my-shell";
      version = "0.0.1";
      entry = "main.tsx";

      watchScript = pkgs.writeShellScriptBin "watch" ''
        set -euo pipefail

        export FILES=$(find . -not \( -path "./node_modules*" -o -path "./@girs*" \) -type f -name "*.ts*")
        echo "$FILES" | ${pkgs.lib.getExe pkgs.entr} -crs 'echo "Change detected, restarting..." && ags run ./main.tsx'
      '';

      astalPackages = with ags.packages.${system}; [
        io
        astal4

        hyprland
        mpris
        cava
        battery
        wireplumber
        network
        tray
        bluetooth
      ];

      buildInputs = with pkgs; [
        gjs
        watchScript

        brightnessctl
      ];

      extraPackages = with pkgs; [
        libadwaita
        libsoup_3
      ];
    in {
      packages.default = pkgs.stdenv.mkDerivation {
        name = pname;
        inherit version;
        src = ./.;

        nativeBuildInputs = with pkgs; [
          wrapGAppsHook
          gobject-introspection
          ags.packages.${system}.default
        ];

        buildInputs =
          astalPackages
          ++ buildInputs
          ++ extraPackages;

        installPhase = ''
          runHook preInstall

          mkdir -p $out/bin
          mkdir -p $out/share
          cp -r * $out/share
          ags bundle ${entry} $out/bin/${pname} -d "SRC='$out/share'"

          runHook postInstall
        '';
      };

      apps.default = flake-utils.lib.mkApp {
        drv = self.packages.${system}.default;
      };

      devShells.default = pkgs.mkShell {
        buildInputs =
          [
            (ags.packages.${system}.default.override {
              extraPackages = astalPackages ++ extraPackages;
            })

            pkgs.zsh
          ]
          ++ buildInputs;

        shellHook = with pkgs; ''
          export SHELL="${lib.getExe zsh}"
          ${lib.getExe zsh}
          exit
        '';
      };
    });
}
