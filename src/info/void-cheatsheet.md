---
title: "Void Linux Cheatsheet 📝"
desc: "Useful commands and notes for starting out with Void Linux."
date: 2024-09-13T15:26:57.397225724-04:00
url:
  void: "https://voidlinux.org/"
  xbps: "https://docs.voidlinux.org/xbps/index.html"
tags:
  - linux
  - void linux
  - guides
---

::fig{#galactic-filament pos=center}

This cheatsheet collects commands and tools you might find useful when starting out with :e[Void Linux|{{url.void}}]. This guide will be updated as I learn .

# XBPS Package Manager

The Void package manager is :e[XBPS --- the X Binary Package System|{{url.xbps}}]. It was written from scratch for use with Void. Common commands:

* `xbps-install -Su` --- update the system
* `xbps-install PACKAGE` --- install PACKAGE
* `xbps-install -A` --- install a package temporarily, for evaluation. this package and its dependencies will be removed when `xbps-remove -o` is run
* `xbps-query -Rs QUERY` --- search repositories for packages
* `xbps-query -f PACKAGE` --- list files provided by PACKAGE
* `xbps-query -l` --- list all packages with versions and descriptions
* `xbps-query -l | cut -d " " -f 2 | sed "s/^\(.*\)-.*$/\1/"` --- list all package names (might want to alias this)
* `xbps-remove -R PACKAGE` --- remove a package and any of its dependendcies that are no longer needed
* `xbps-remove -Oo` --- remove orphan packages and clean the cache. will also remove packages installed with `xbps-install -A`

Install `xtools` for additional tools:

* `xlocate -S | QUERY` --- search for paths within all packages. Useful to find which package a command is in, etc.
  * Run `xlocate -S` first to cache package data. Run occasionally to keep the cache updated
  * Use like `xlocate /usr/bin/dig`. Absolute paths work best; `xlocate npm` returns 2716 results, `xlocate /usr/bin/npm` returns one.
* `xcheckrestart [-v]` --- XBPS does not restart services when they're updated. Run this to check for services that need to be restarted.

# Service Management

Services are managed with the `sv` command. Usage examples:

* `ln -s /etc/sv/SERVICE /var/service/` --- start a service now and configure it to start at boot
* `rm /var/service/SERVICE` --- stop a service now and prevent it from starting at boot
* `sv up SERVICES` --- start a service now and re-start it if it stops, but don't configure it to start at boot
* `sv down SERVICES` --- stop a service now and do not restart it. doesn't prevent a service from re-starting at boot
* `sv restart SERVICES`
* `sv status SERVICES`
* `ls /var/service` --- contains symlinks for all running services
* `sv s /var/service/*` --- show status of all running services

Install :gh[|rubyists/sv-helper] for some additional tools:

* `sv-list` --- list all available services
* `svls SERVICE` --- like `sv-list` but you can limit output to a single SERVICE
* `sv-enable SERVICE` -- enable a service to start at boot, and start it now
* `sv-disable SERVICE` -- stop a service from starting at boot, and stop it now

# Managing old kernels

Old kernels are not removed when new ones are built, to allow you rollback to previous versions. This will eventually cause your `/boot` partition to run out of space, causing update errors and kernel panics.

You can manage old kernel versions using `vkpurge`:

* `vkpurge list` --- list unused, removable kernels
* `vkpurge rm all` --- remove all removable kernels
* `vkpurge rm '2.6.*' 4.3.4_1` --- remove all removable kernels matching a pattern, and remove a specific version
