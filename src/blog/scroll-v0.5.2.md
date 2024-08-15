---
title: ":scroll: **scroll** backup system updated to `v0.5.2`"
desc: Windows fixed and updates, including robocopy support.
date: 2024-06-02T10:00:00.000-05:00
tags:
  - update
  - project update
  - scroll
---

Updated :scroll: :gh[|0E9B061F/scroll] to `v0.5.2`. This is includes fixes and
improvments for Windows. `sync` backends now work under windows, using
`robocopy` behind the scenes to replace `rsync`. A bug related to handling
Windows paths was also fixed. Finally, all backends were normalized such that
they record and restore the absolute paths of backup targets.

For more information about **ghast.js**, see :gh[the README|0E9B061F/scroll#readme].

# CHANGES

* `robocopy` support
* `sync` backends for Windows
* Fixed Windows path handling
* Made path handling consistent accross all backends

# LINKS

* :e[npm: scroll|https://www.npmjs.com/package/scroll-backup]
