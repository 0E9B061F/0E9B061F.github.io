---
title: "Introducing the :scroll: **scroll** backup system (`v0.4.6`)"
desc: restic and rsync backups made easy and configurable.
date: 2024-05-23T10:00:00.000-05:00
tags:
  - update
  - project update
  - scroll
---

:scroll: **[scroll][repo]** is a configurable, cross-platform backup system with support for `restic` and `rsync` backends. It currently runs under Windows and should run on most flavors of Linux. So far it's in use on Windows, Arch Linux and OpenWrt machines. 

For more information about **scroll**, see [the README][readme].

# CHANGES

* Fixed Windows installation (with a workaround, for now)
* Added `rsync` backends
* Added configurable, compound commands called plans. They can be run with the `plan` command.
* Added README
* Updated dependencies and improved packaging
* Now available on [npm][npm]

# LINKS

* [npm: scroll][npm]

[repo]:https://github.com/0E9B061F/scroll
[readme]:https://github.com/0E9B061F/scroll#readme
[npm]:https://www.npmjs.com/package/scroll-backup
