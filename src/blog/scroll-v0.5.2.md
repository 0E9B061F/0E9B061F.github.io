---
title: ":scroll: **scroll** backup system updated to `v0.5.2`"
desc: Windows fixed and updates, including robocopy support.
date: 2024-06-02T10:00:00.000-05:00
tags:
  - update
  - project update
  - scroll
---

Updated :scroll: [scroll][repo] to `v0.5.2`. This is includes fixes and improvments for Windows. `sync` backends now work under windows, using `robocopy` behind the scenes to replace `rsync`. A bug related to handling Windows paths was also fixed. Finally, all backends were normalized such that they record and restore the absolute paths of backup targets.

For more information about **ghast.js**, see [the README][readme].

# CHANGES

* `robocopy` support
* `sync` backends for Windows
* Fixed Windows path handling
* Made path handling consistent accross all backends

# LINKS

* [npm: scroll][npm]

[repo]:https://github.com/0E9B061F/scroll
[readme]:https://github.com/0E9B061F/scroll#readme
[npm]:https://www.npmjs.com/package/scroll
