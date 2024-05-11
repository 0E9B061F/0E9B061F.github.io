---
title: Introducing Weatherman (v0.2.2)
desc: TUI widget to display current weather information for one or more locations.
date: 2023-05-04T05:00:00.000-05:00
tags:
  - update
  - project update
  - weatherman
---

I have a monitor hooked up to a ~headless~ server to passively display some
information on the console. I decided I wanted to add weather information to it,
so I created **[weatherman](https://github.com/0E9B061F/weatherman)**.

::fig{#weatherman pos=center}

**weatherman** is a simple console widget implemented in node.js with the
[blessed](https://github.com/chjj/blessed) TUI library. It displays the current
weather for one or more configurable locations.

Currently I'm using [wttr.in](https://wttr.in) as a backend, which I'd like to
move away from; the service experiences outages and the weather information
itself seems to be unreliable. The **blessed**&nbsp;:angel: library is great, on
the other hand --- building the interface was completely painless and I'll
probably use it again in the future.

This is also my first project built from the ground up using ES modules
:partying_face:
