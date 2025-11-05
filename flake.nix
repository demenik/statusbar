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

            security.sudo-rs.extraRules = let
              mkNoPasswdRule = groups: commands: {
                inherit groups;
                commands =
                  builtins.map (command: {
                    inherit command;
                    options = ["SETENV" "NOPASSWD"];
                  })
                  commands;
              };
            in [
              # required for battery menu
              (mkNoPasswdRule ["tlp"] ["${lib.getExe pkgs.tlp}"])
              # required for power menu
              (mkNoPasswdRule ["power"] ["${lib.getExe' pkgs.systemd "shutdown"}" "${lib.getExe' pkgs.systemd "reboot"}"])
            ];
          };
        };

        default = statusbar;
      };
    }
    // flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};

      name = "statusbar";
      version = "0.0.1";
      entry = "main.tsx";

      watchScript = pkgs.writeShellScriptBin "watch" ''
        set -euo pipefail

        export FILES=$(find . -not \( -path "./node_modules*" -o -path "./@girs*" -o -path "./.git*" \) -type f)
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
        brightnessctl
      ];

      extraPackages = with pkgs; [
        libadwaita
        libsoup_3
      ];
    in {
      packages.default = pkgs.stdenv.mkDerivation {
        inherit name version;
        src = ./.;

        nativeBuildInputs = with pkgs; [
          wrapGAppsHook3
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
          ags bundle ${entry} $out/bin/${name} -d "SRC='$out/share'"

          runHook postInstall
        '';

        postFixup = with pkgs; ''
          wrapProgram $out/bin/${name} \
            --prefix PATH : ${lib.makeBinPath [brightnessctl bash]}
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

            watchScript
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
