{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  outputs = {
    self,
    nixpkgs,
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    packages.${system}.default = pkgs.stdenv.mkDerivation (finalAttrs: {
      pname = "mypage";
      version = "0.0.1";
      src = pkgs.lib.cleanSource ./.;

      CI = "true";

      nativeBuildInputs = [
        pkgs.pnpm
        pkgs.nodejs_22
        pkgs.pnpmConfigHook
      ];

      pnpmDeps = pkgs.fetchPnpmDeps {
        inherit (finalAttrs) pname version src;
        hash = "sha256-QHI6ygQQbwRtm4vglEzSkbS4SlPNMjK0cP8SciEXr/Y=";
        fetcherVersion = 3;
      };

      buildPhase = ''
        pnpm build
      '';

      installPhase = ''
        mkdir -p $out
        cp -r build $out/build
        cp -r node_modules $out/node_modules
        cp package.json $out/package.json
      '';
    });

    devShells.${system}.default = pkgs.mkShell {
      buildInputs = [pkgs.nodejs_22 pkgs.nodePackages.pnpm];
    };
  };
}
