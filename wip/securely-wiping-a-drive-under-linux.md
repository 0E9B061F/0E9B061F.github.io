---
title: "Securely Wiping a Drive Under Linux"
desc: "A concise look at a common procedure."
date: 2024-09-05T17:48:03.814602316-04:00
edited: 2024-09-09T22:42:03.814602316-04:00
url:
  sonnet19: "https://www.poetryfoundation.org/poems/44750/sonnet-19-when-i-consider-how-my-light-is-spent"
  catkipling: "https://en.wikisource.org/wiki/Just_So_Stories/The_Cat_that_Walked_by_Himself"
  diorh: "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/79*.html"
  rfshuttle: "https://www.nasa.gov/history/rogersrep/v2appf.htm"
  ssbirth: "https://www.poetryfoundation.org/poetrymagazine/poems/13952/on-the-birth-of-a-son"
  jdsword: "https://chinesepoemsinenglish.blogspot.com/2015/06/jis-dao-swordsman.html"
tags:
  - personal
  - notes
---

Recently I needed to zero out a drive of mine and ran into some unexpected hicups. In the process I learned some things and decided to write this short guide. This topic may seem trivial, but many suggestions I've found online are incorrect or incomplete, or fail to mention the pitfalls of certain approaches. This guide will look at multiple approaches to zeroing a drive, and compare their relative merits. At the end I also include a script to easily zero drives by my preferred method.

# Wiping by `cat`

In it's basic form, this method looks like this:

`cat /dev/zero > /dev/sdX`

This has the advantage of simplicity, as well as the ubiquity of the `cat` program. However, it has some drawbacks. Firstly, output is limited compared to using `dd`. Secondly, this will write until the block device runs out of space and exit with an error. This may not bother you, but on my machine I've had this error cause the command to hang until I removed the drive. Finally, simplicity comes with some lack of control; `dd` allows you to finetune the process to optimize your writes.

## Pros

* Very simple and easy to remember
* `cat` command is ubiquitous

## Cons

* Limited output
* Limited control over the process
* Will write until device runs out of space and exit with an error
* Won't work if you need to use `sudo` to access `/dev/sdX`

# Wiping by `dd`

Generally, the command will have this form:

```sh
dd if=/dev/zero of=/dev/sdX bs=Y count=Z status=progress
```

The value of count will need to be calculated based on the size of the device and the chosen block size. Here's the command including those calculations, using `blockdev` to get device size:

```sh
block="$((1024 * 1024))"                # 1 MB as bytes
size="$(blockdev --getsize64 /dev/sdX)" # The size of the device in bytes
count="$(("${size}" / "${block}"))"     # The count of blocks we need to fill the device
dd if=/dev/zero of=/dev/sdX bs="${block}" count="${count}" status=progress
```

# Block Size

The block size&nbsp;(`bs`) is the number of bytes that `dd` will write at a time. The default value is 512&nbsp;bytes.

Much has been said about the ideal block size, but generally larger values give better performance than smaller ones. I've seen little performance benefit beyond values of 1&nbsp;MB, and performance may decrease for very large values. For that matter 4&nbsp;KB may perform nearly as well as 1&nbsp;MB. On the other hand, 4&nbsp;K performs much better than the default value of 512&nbsp;bytes, so performance increases rapidly above 512 bytes then plateaus, in my experience.

You can try different values to see what works best on your own hardware, or just pick a value around 1&nbsp;MB. Whatever value you choose, the block size should be a multiple of the device's physical sector size&nbsp;(in bytes), which can be found with&nbsp;`blockdev --getpbsz /dev/sdX`. Typically the value will be 512&nbsp;bytes or 4&nbsp;KB.

## Pros

* Gives the user fine-grained control over the operation
* Works well with sudo
* Good output using `status=progress`
* `dd` is commonly available

## Cons

* More complicated command than other methods
* Requires some simple calculations

# Wiping by `blkdiscard`

# Wiping with secure erase

This is very fast compared to methods based on logical access (`cat` or `dd`, etc.), and is easier on your drive because it writes less. However, not all drives support this method. It works by resetting the drives internal encryption key. In these drives all data is encrypted and decryted seamlessly on writing and reading; so while the data does not appear to be encrypted to the user, it sits on the drive in an enrypted state. Resetting the encryption key renders this data unintelligible. Note however that the data is not zeroed; it will be useless, but if you specifically need the drive to be all zeroes, use another method.

## Pros

* Very fast
* No disk access, so this method is very easy on your drive

## Cons

* Not available on all drives
* Destroys the data, but doesn't zero it specifically

# Conclusion

For general purpose I prefer the `dd` method. It gives you fine-grained control over the write and offers useful output as it writes. I would reccomend using `blkdiscard` or secure erase if either are available, unless you specifically need the drive to contain all zeroes for whatever reason.

Below I describe a Bash script which automates the calculations involved in the `dd` approach, making it simpler to use.

# Automated wipe script

This script uses `dd` and automatically calculates necessary values. It also provides a couple useful options to control the data source (`/dev/zero` or `/dev/urandom`) and set the block size (which defaults to a reasonable 1&nbsp;MB).

```sh
#!/bin/bash
# Wipe a block device using `dd`. Automates calculations involved
# with <3, yours truly, &c., &c.,
# nn <0E9B061F@protonmail.com> 2024

MODE="zero"
BLOCK="4194304"

usage() {
  echo "SYNOPSIS"
  echo "wipe.sh [-z] [-r] [-b BLOCKSIZE] BLOCKDEV"
  echo "  -z"
  echo "    Wipe with zeroes (the default)"
  echo "  -r"
  echo "    Wipe with random values"
  echo "  -b BLOCKSIZE"
  echo "    Set block size in bytes"
  echo "    DEFAULT: 4194304 (4 MB)"
  echo "wipe.sh -h"
  echo "  -h / -?"
  echo "    Show usage information"
  exit 0
}

err() {
  local msg="${1}"
  echo "ERROR: ${msg}"
  exit 1
}

while getopts 'rzb:h?' arg; do
  case "${arg}" in
    r) MODE="urandom" ;;
    z) MODE="zero" ;;
    b) BLOCK="${OPTARG}" ;;
    h|?) usage ;;
    *) err "invalid argument '${arg}'" ;;
  esac
done

shift $((OPTIND - 1))

DISK="${1}"
[[ -z "${DISK}" ]] && err "No block device given"
[[ -b "${DISK}" ]] || err "Given path is not a block device (${DISK})"

size="$(blockdev --getsize64 "${DISK}")"
count="$(("${size}" / "${BLOCK}"))"

dd if="/dev/${MODE}" of="${DISK}" bs="${BLOCK}" count="${count}" status=progress
```
