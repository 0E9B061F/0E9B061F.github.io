---
title: "Majesty WIP Update #3: (Intelligent) Agents"
desc: "Not-so-intelligent agents navigating bitmaps on the road to roads."
tags:
  - update
  - project update
  - majesty
  - game dev
  - svelte
  - phaser
---

Since the last update I've refined the terrain generator a bit more,
re-implemented city spawning and made some preparations for spawning forests
later. I feel like the terrain is good enough now so I've shifted my attention
elsewhere and implemented agents which traverse the map and collide with
impassable terrain. I intend to use these as the basis for everything that moves
across the map, including the player and NPCs, but I'll also be experimenting
with using them to generate the road network between cities by some
slime-mold-like approach. To that end I've designed them to be simulated
independently of the renderer if need be, although they can also have an in-game
"pawn" for characters and NPCs on the map. Currently they aren't very
intelligent --- they just bounce around like a roomba --- so my next goal will
be adding some intelligence to my intelligent agents, as well as a cost function
for the terrain they pass over.

# Terrain Work

General refinements to the terrain generator and color mapping.

:::gal
::fig{#mj-03-001}
::fig{#mj-03-002}
::fig{#mj-03-003}
::fig[Here I started combining two fractal Perlin terrains at different scales to create distinct large- and small-scale features.]{#mj-03-004}
::fig{#mj-03-005}
::fig[Slight mishap when working on color mapping.]{#mj-03-006}
::fig[Current state of the terrain.]{#mj-03-007}
:::

# Site Suitability

These maps record how suitable a site is for spawning a city. Currently they're
entirely based on terrain height and flatness, but in the future other factors
will be considered. I initially tried to use the Sobel filter for this but I
didn't like the results and implemented my own "flatness" filter.

:::gal
::fig[First attempts at my flatness filter. It seemed to be approximating an inverse Sobel filter, so I wasn't happy with the results.]{#mj-03-008}
::fig[First successful results. I thought this one looked kind of like an abstract watercolor with a hint of iron filings in a magnetic field.]{#mj-03-009}
::fig[Current suitability map example. Minor adjustments.]{#mj-03-010}
:::

# Mining

Despite the topic of the post I only have a couple screenshots of my agents --- I'll upload some screen recordings next time. For fun I made it so the agents "mine" terrain on collisions, making that terrain passable. Gray pixels in the following pictures have been mined and are no longer collidable:

:::gal
::fig[Shortly after spawning the agents in the mined-out gray area in the upper right.]{#mj-03-011}
::fig[After letting the simulation progress for several minutes.]{#mj-03-012}
:::
