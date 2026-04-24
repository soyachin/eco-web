# Entorno Nix — ecomecanico blog
{
  description = "Entorno de desarrollo — ecomecanico blog (Astro 5 + Svelte 5)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in {
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.nodejs_22
            pkgs.pnpm
            pkgs.git
          ];
          shellHook = ''
            echo "🌱 ecomecanico — entorno listo."
            echo "  pnpm install         — instalar dependencias"
            echo "  pnpm dev             — servidor de desarrollo"
            echo "  bash scripts/build.sh — build + indexar búsqueda"
          '';
        };
      }
    );
}
