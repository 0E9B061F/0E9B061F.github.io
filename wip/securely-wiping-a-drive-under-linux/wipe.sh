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
