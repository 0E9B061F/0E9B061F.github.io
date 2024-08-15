---
title: ":partying_face: Site Update: Improved Layout, Plus Observations and Plans"
desc: Visual improvements and one man's struggle for tasteful emojis.
date: 2023-03-25T05:00:00.000-05:00
tags:
  - update
  - site update
---

:tada: :e[|https://0E9B061F.github.io] has been updated. This
update adds minor visual improvements. Support for inline markdown in titles was
added. Support for emojis in markdown was added :grin:. Emojis are displayed
using the monochrome :e[Noto
Emoji|https://fonts.google.com/noto/specimen/Noto+Emoji] for better consistency
with the design. Minor tweaks and improvements to the layout were also made. 

# Observations

I'm unhappy with my options for emoji support in markdown. My goal was to add
emoji support using monochrome emojis, with support for my own custom emojis.
This turned out to be more difficult than I had hoped.

Using `markdown-it` the only real option is `markdown-it-emoji`. This works well
enough, but restricts you to three hardcoded sets of emoji names --- there seems
to be no way to add your own custom emojis. It does allow you to customize its
output, but I didn't have much luck with this. The icon fonts I looked at used
different naming schemes (`mega` vs `megaphone`) making usage difficult, and
while I liked fontawesome's emojis many of them are paywalled. The documentation
mentions using twemoji but twemoji offers no monochrome option and similar
offerings seem to be the same. There are a couple of little-used plugins for
`markdown-it` that add direct support for fontawesome, but the paywall issue
remains, and I'd prefer to use normal emoji names.

I haven't researched or tried every available option. The `marked` ecosystem
appears to be even more limited --- the only available package for handling
emojis is new and little-used. The `openmoji` set appears promising and offers a
monochrome option but these are outlines rather than filled, which I would
prefer.

For now I'll be using `markdown-it-emoji` and Google's monochrome Noto Emoji
webfont to display emojis. This approach means I have no custom emoji support,
and I'd prefer solid emojis rather than lineart, but its otherwise suitable. In
the future I may make my own plugin for `markdown-it` emojis with support for
custom emojis.

# Plans

* My next goal is to add a persistent pages feature. This will create a
  hierarchy of "persistent" posts that will be linked from the main menu (I'll
  probably replace the docs link). This will allow me to highlight chosen posts
  and prevents them from getting lost in the blog index as it grows. Posts will
  be made persistent by assigning them a path in their frontmatter.
* I need to add a TOC to posts.
* I'm not entirely happy with my current font selections.