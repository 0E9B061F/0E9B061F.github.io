#!/usr/bin/env node

import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { execSync } from "node:child_process"

const __dirname = dirname(fileURLToPath(import.meta.url))
const build = join(__dirname, "..", "docs")
const rcfile = join(__dirname, "..", "remote.json")

if (!existsSync(rcfile)) {
  throw new Error("remote.json missing")
} else if (!existsSync(build)) {
  throw new Error("build is missing, nothing to publish")
} else {
  const conf = JSON.parse(await readFile(rcfile))
  const cmd = `rsync -av --delete -e "ssh -p ${conf.port}" dist/* "${conf.dest}"`
  console.log(`>>> ${cmd}`)
  const res = execSync(cmd, {encoding: "utf-8"})
  console.log(res)
}
