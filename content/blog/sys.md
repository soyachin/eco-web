---
title: debugging crashes en servicios NixOS con sandboxing
date: 2026-05-23
tags:
  - nixos
  - linux
draft: true
---

Aprendido depurando `urbania-backend.service` — Mayo 2026.

---

## Proceso en orden

### 1. Detener el restart loop primero

```bash
systemctl stop servicio
```

Con el servicio en restart loop el log mezcla crashes de diferentes intentos. Pararlo da un crash limpio para analizar.

### 2. Leer el crash más antiguo, no el más reciente

```bash
journalctl -u servicio | head -50   # no tail
coredumpctl list                     # ver todos los cores en orden
coredumpctl info PID_MAS_ANTIGUO
```

El primer crash es la causa raíz. Los siguientes pueden ser consecuencias o crashes diferentes provocados por estado sucio del restart.

En el caso de urbania, el log mostraba el crash de OpenBLAS repetido (más llamativo, stack trace largo), pero el primer crash era DuckDB con un stack trace más corto y limpio. Leer `tail` llevó al crash equivocado.

### 3. Identificar el signal

```bash
coredumpctl info -1 | grep Signal
```

|Signal|Nombre|Qué hacer|
|---|---|---|
|6|ABRT|Leer el stack trace, buscar qué llamó `abort()`|
|31|SYS|Seccomp — ir directo al audit log|
|11|SEGV|Problema de memoria — leer stack trace|

### 4. Leer el stack trace de arriba hacia abajo

Los frames bajos (`#0`, `#1`, `#2`...) son donde murió. Los frames altos son el contexto. La causa real suele estar en los frames medios-altos.

```
#0  syscall         ← donde murió físicamente
#1  alloc_mmap      ← qué estaba haciendo
#2  blas_thread_init
#3  gotoblas_init   ← causa real: OpenBLAS inicializando
#4  call_init (dlopen constructor)
```

---

## Orden de sospecha para crashes con sandboxing

1. **`SIGSYS`** → seccomp bloqueó una syscall, buscar en audit log
2. **`SIGABRT` con `std::terminate` en stack** → excepción C++ no capturada, leer frames por encima del `terminate`
3. **`SIGABRT` con `abort()` directo** → la librería decidió morir, leer qué función llamó `abort`
4. **Crash en `mmap`/memoria** → puede ser `MemoryMax` demasiado bajo o syscalls de memoria bloqueadas

---

## Flujo para crashes de seccomp (SIGSYS)

```bash
# 1. Ver qué syscall fue bloqueada
journalctl -k | grep "type=1326" | tail -5
# → syscall=NNN (número decimal)

# 2. Traducir el número (en NixOS)
nix shell nixpkgs#libseccomp -c scmp_sys_resolver NNN

# 3. Ver en qué grupos de systemd está esa syscall
systemd-analyze syscall-filter @privileged | grep nombre_syscall
systemd-analyze syscall-filter @resources  | grep nombre_syscall

# 4. Referencia online
# https://filippo.io/linux-syscall-table/
```

### Por qué `ausyscall` y `/usr/include/asm/unistd_64.h` no existen en NixOS

NixOS no tiene paths FHS estándar. Usar `scmp_sys_resolver` de `libseccomp` o buscar online.

---

## SystemCallFilter — orden importa

El filtro es **aditivo y secuencial**. Cada línea modifica la lista acumulada:

```ini
# MAL — mbind se agrega y luego ~@privileged lo quita
SystemCallFilter=@system-service
SystemCallFilter=mbind           # se agrega
SystemCallFilter=~@privileged    # mbind está en @privileged → lo quita aquí
SystemCallFilter=~@resources

# BIEN — mbind se agrega después del deny, nada lo quita
SystemCallFilter=@system-service
SystemCallFilter=~@privileged    # quita mbind entre otras cosas
SystemCallFilter=~@resources
SystemCallFilter=mbind           # re-agrega explícitamente al final
```

`~@grupo` no es una regla permanente de "nunca permitir esto" — es una resta en ese momento. Agregar una syscall individual después la deja en la lista final.

En Nix:

```nix
SystemCallFilter = [ "@system-service" "~@privileged" "~@resources" "mbind" ];
```

---

## Aislar si el problema es sandboxing

```bash
# Reproducir fuera del servicio sin restricciones
systemd-run --uid=usuario --pty \
  -p SystemCallFilter="" \
  -p LockPersonality=false \
  /ruta/al/binario -c "import biblioteca_sospechosa"

# Si funciona sin filtro y falla con él → es seccomp
# Si falla en ambos casos → es otra cosa
```

---

## DuckDB en NixOS — extensiones out-of-tree

Las extensiones `spatial`, `sqlite_scanner` y otras out-of-tree siempre fallan la verificación de firma en NixOS. El binario de nixpkgs tiene build identity diferente a la infraestructura de firma de Motherduck → `CheckExtensionSignature` llama `std::terminate()`.

**Solución limpia:** no usar extensiones runtime — reemplazar con librerías Python nativas del entorno Nix:

|DuckDB spatial|Alternativa Python|
|---|---|
|`ST_Read(gpkg)` + `ST_Union_Agg` + `ST_AsGeoJSON`|`geopandas.read_file()` + `.union_all()` + `.__geo_interface__`|

---

## ReadWritePaths vs ReadOnlyPaths con ProtectSystem=strict

Con `ProtectSystem = "strict"` todo el filesystem es read-only por defecto. Para que un servicio pueda escribir en su directorio de datos:

```nix
# MAL
ReadOnlyPaths = [ cfg.dataDir ];   # redundante y confuso, ya es RO

# BIEN
ReadWritePaths = [ cfg.dataDir ];  # excepción explícita para escritura
```

DuckDB necesita escribir WAL files y hacer checkpoints — sin `ReadWritePaths` falla silenciosamente o con errores de permisos.

---

## Ver qué está realmente activo vs lo que dice el unit file

El unit file puede diferir de lo que systemd tiene en memoria, especialmente si hay drop-ins:

```bash
# Lo que está corriendo
systemctl show servicio | grep SystemCallFilter
systemctl show servicio | grep DropIn

# Lo que dice el archivo
cat /etc/systemd/system/servicio.service | grep SystemCallFilter

# Drop-ins temporales (set-property, etc.)
ls /etc/systemd/system.control/servicio.service.d/

# Limpiar drop-ins temporales
systemctl revert servicio
```

En NixOS, cambios en módulos `.nix` requieren `nixos-rebuild switch` — el deploy via `git pull` solo actualiza el código de la aplicación, no rebuilda el sistema.
