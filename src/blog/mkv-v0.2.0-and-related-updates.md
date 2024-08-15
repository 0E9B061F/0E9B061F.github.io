---
title: "Introducing :hammer: **mkv** (`v0.2.0`)"
desc: A simple versioning helper mostly for use with my own projects.
date: 2024-05-30T10:00:00.000-05:00
tags:
  - update
  - project update
  - mkv
  - fantasma
  - waxwing
  - ghast
  - heretag
  - scroll
---

I've created and published :hammer: **:gh[|0E9B061F/mkv]** `v0.2.0`, a small
versioning tool I use in my own projects. It may not be of much use to others,
but who knows. It's available on npm as
:e[@0e9b061f/mkv|https://www.npmjs.com/package/@0e9b061f/mkv], published as a
scoped package because **mkv** is taken and this is mostly for my own use.
Previously **mkv** was a script I'd copy-pasted between a few projects. I
created this package mostly to make that more maintainable.

**mkv** updates the version number in `package.json`, replaces the first line of
`README` with a configurable line which includes the new version number, and
selects a series name from `series.json`, if present. `series.json` should be an
array of strings. The series name changes whenever the major or minor version
changes. Selecting the series name relies on version tags in the git repo. They
should be formatted like `v0.1.0`. The "v" is important.

For more information about `mkv`, see :gh[the README|0E9B061F/mkv#readme].

# Related Updates

:ghost: :bird: :european_castle: :scroll:

I've also updated :gh[|0E9B061F/fantasma.js], :gh[|0E9B061F/waxwing.js],
:gh[|0E9B061F/ghast.js], :gh[|0E9B061F/heretag] and :gh[|0E9B061F/scroll] to use
the new `@0e9b061f/mkv` package.

# LINKS

* :e[npm: @0e9b061f/mkv|https://www.npmjs.com/package/@0e9b061f/mkv]
