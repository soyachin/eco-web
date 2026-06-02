---
title: "problemas MT7921 en nixos: diagnóstico y solución"
date: 2026-05-28
tags:
  - learning
  - nixos
draft: false
---

> notas al debuggear error en nixos 

---

## síntomas

blueman abre pero no muestra dispositivos y el botón "Search" no responde. `bluetoothctl show` devuelve `"No default controller available"`. el adaptador no aparece en `lsusb | grep -i bluetooth`, aunque sí en `lsusb` completo.

---

## diagnóstico

#### 1. verificar servicio y bloqueos de hardware

```bash
systemctl status bluetooth
rfkill list
```

si el servicio está `active (running)` y ambos campos de `rfkill` dicen `no`, el problema no es de software ni de bloqueo físico.

#### 2. verificar si el kernel reconoce el adaptador

```bash
bluetoothctl show
lsusb
```

`bluetoothctl show` dice `"No default controller available"` pero `lsusb` muestra el adaptador -> el driver está fallando al inicializarlo.

#### 3. ver errores del kernel

```bash
sudo dmesg | grep -i bluetooth | tail -20
```

el error en este caso:

```
Bluetooth: hci0: HW/SW Version: 0x008a008a, Build Time: 20260224111243
Bluetooth: hci0: Failed to send wmt func ctrl (-22)
Bluetooth: hci0: HCI Enhanced Setup Synchronous Connection command is advertised, but not supported.
```

`wmt func ctrl (-22)` ocurre durante la inicialización del chip, antes de cualquier carga de firmware. señal de regresión en el driver `btmtk`.

#### 4. verificar que el firmware existe

el kernel busca el firmware en un path específico:

```bash
cat /sys/module/firmware_class/parameters/path
# ejemplo: /nix/store/4dngjv98j2g6pqjdc8i38fbwbwsysqrc-firmware/lib/firmware

ls <path>/mediatek/ | grep -i bt
```

para el MT7921 el archivo necesario es `BT_RAM_CODE_MT7961_1_2_hdr.bin`. si existe, el firmware no es el problema.

en nixos el firmware se habilita con:

```nix
hardware.enableRedistributableFirmware = true;
```

#### 5. identificar la regresión del kernel

```bash
nixos-rebuild list-generations | head -10
```

```
433  2026-05-27  25.11.20260522.b77b3de  6.12.90  <- roto
431  2026-05-21  25.11.20260514.d7a713c  6.12.87  <- funciona
```

bootear en la generación con `6.12.87` y probar bluetooth confirma que el problema es específico de `6.12.90`.

---

## solución: pinear el kernel a la versión funcional :p

#### verificar el commit y la versión del kernel

```bash
nix eval github:NixOS/nixpkgs/d7a713c#linuxPackages_6_12.kernel.version
# "6.12.87"
```

#### agregar el input en `flake.nix`

```nix
inputs = {
  nixpkgs.url        = "github:NixOS/nixpkgs/nixos-25.11";
  nixpkgs-kernel.url = "github:NixOS/nixpkgs/d7a713c";  # kernel 6.12.87
  ...
};
```

#### instanciar con `allowUnfree` en `hosts/default.nix`

```nix
let
  kernel-pkgs = import inputs.nixpkgs-kernel {
    inherit system;
    config.allowUnfree = true;
  };
in
lib.nixosSystem {
  specialArgs = {
    inherit inputs unstable kernel-pkgs ...;
  };
  ...
};
```

#### usar el kernel en la config del host

```nix
{ kernel-pkgs, ... }:
{
  boot.kernelPackages = kernel-pkgs.linuxPackages_6_12;
  hardware.enableRedistributableFirmware = true;
  hardware.bluetooth.enable              = true;
  hardware.bluetooth.powerOnBoot         = true;
  services.blueman.enable                = true;
}
```

---

## causa raíz

una regresión en el driver `btmtk` introducida entre `6.12.87` y `6.12.90`. el chip es detectado por el kernel y el firmware existe, pero la secuencia de inicialización del chip falla. el mismo problema fue reportado en otros chips mediatek (MT7922) con kernels más recientes en otras distribuciones.

---

## referencia rápida

| objetivo | comando |
| -------- | ------- |
| estado del servicio | `systemctl status bluetooth` |
| bloqueos de hardware | `rfkill list` |
| reconocimiento del adaptador | `bluetoothctl show` |
| identificar el chip | `lsusb` |
| errores del kernel | `sudo dmesg \| grep -i bluetooth \| tail -20` |
| path del firmware | `cat /sys/module/firmware_class/parameters/path` |
| versión del kernel por commit | `nix eval github:NixOS/nixpkgs/<commit>#linuxPackages_6_12.kernel.version` |
| historial de generaciones | `nixos-rebuild list-generations` |
