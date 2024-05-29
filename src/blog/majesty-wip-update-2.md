---
title: "Majesty WIP Update #2: Traversability & Color"
desc: "Adventures with gradients and the Sobel filter."
date: 2023-05-14T05:00:00.000-05:00
tags:
  - update
  - project update
  - majesty
  - game dev
  - svelte
  - phaser
---

Work is continuing on **Majesty**. Changes since the last update:

* **A complete rewrite** of the code now that I'm a bit more familiar with Phaser
  * Got the GUI working on a second camera
* Added **a class for generating and handling heightmaps** more efficiently, with a
  variety of methods for transforming them
  * Realized I can use **easing functions** to transform heightmaps, and implemented
    those
* Added heightmap **color mapping** and a Gradient class to define these mappings
* **Implemented the Sobel filter** with central differencing to calculate terrain
  steepness, used in calculating traversability and site suitability maps

# Traversability

These were generated while working on the traversability map. The last two
represent its current state.

:::gal
::fig{#mj-dev-015}
::fig{#mj-dev-016}
::fig{#mj-dev-017}
::fig{#mj-dev-018}
::fig{#mj-dev-019}
::fig{#mj-dev-020}
::fig{#mj-dev-021}
:::

# Color

Examples of the new terrain color mapping, including some bugs.

:::gal
::fig{#mj-dev-023}
::fig{#mj-dev-024}
::fig{#mj-dev-025}
::fig{#mj-dev-026}
::fig{#mj-dev-027}
::fig{#mj-dev-028}
:::
