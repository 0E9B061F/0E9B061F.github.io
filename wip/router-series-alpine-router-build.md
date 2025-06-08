---
title: "Router Series --- **Alpine Router Build**"
desc: "Building a router from scratch using Alpine Linux. Part of a series on Linux- and BSD-based router builds."
date: 2024-08-20T05:26:57.397225724-04:00
draft: true
tags:
  - router series
  - linux
  - alpine linux
  - networking
---

::fig[An Alpine Ibex :dec[(:e[Robert J Heath|https://www.flickr.com/photos/67769979@N06/53328822912/])]{#small}]{#alpine-ibex-001 pos=right}

::dec[This article is the first in :i[a series on Linux- and BSD-based router builds|tags>router_series].]{#notice}

Last year I put together my own router for the first time, using :e[OpenWrt on
x86|https://openwrt.org/docs/guide-user/installation/openwrt_x86] and an old
office PC, with a ZyXEL access point (also running OpenWrt). It was a fun
project and I'm very happy with the setup. Installation and configuration was a
breeze and the OpenWrt repositories have almost everything I wanted.

When I decided to play around with some new distros recently, routers naturally
came mind. Specifically I was interested in more obscure or atypical distros,
and I settled on :e[Alpine|https://alpinelinux.org/] and :e[Void
Linux|https://voidlinux.org/], both small and well-suited for router builds,
with some other interesting and atypical features. I may give
:e[OpenBSD|https://www.openbsd.org] a shot after these two.

I decided to start with Alpine Linux and to document the process as I go. This
will be a guide of sorts but it assumes some familiarity with Linux.

# Phase 1: Installation media & a virtualized test run

You may want to check out the :e[Alpine Wiki|https://wiki.alpinelinux.org/wiki/Main_Page]
before proceding (and as you follow along), especially the
:e[installation guide|https://wiki.alpinelinux.org/wiki/Installation].

## Choosing our installation media

::fig[Illustration of an Ibex, from *The Black Wedding* :dec[(:e[Jože Beranek|https://commons.wikimedia.org/wiki/File:%C4%8Crni_svatje27.jpg])]{#small}]{#alpine-ibex-002 pos=right}

Alpine installation media can be found :e[here|https://alpinelinux.org/downloads/].

For my purposes I chose the :e[Extended image
(x86_64)|https://dl-cdn.alpinelinux.org/alpine/v3.20/releases/x86_64/alpine-extended-3.20.2-x86_64.iso].
Alpine notes that this image is "suitable for routers and servers".
It includes common packages and microcode updates and runs from RAM.

Burning the installation media and booting from it is beyond the scope of this
guide, but the :e[installation guide|https://wiki.alpinelinux.org/wiki/Installation#Preparing_for_the_installation]
has a section on this topic.

## Virtual test run

After booting into the installation medium, you should see something like this:

::fig{#router-alpine-001 pos=center}

Login as `root` to get started, which has no password in the installation environment:

::fig{#router-alpine-002 pos=center}

From here we'll run the install script. Per the helpful :abbr[MOTD]{def="Message of the Day"}, this is
`setup-alpine`. Run `setup-alpine` and you should see this:

# Phase 2: Installation on real hardware


# Phase 3: Configuration and routing
