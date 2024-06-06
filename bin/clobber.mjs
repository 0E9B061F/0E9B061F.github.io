#!/usr/bin/env node

import { existsSync } from "node:fs"
import { rm } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { parseArgs } from "node:util"

let {
  positionals,
} = parseArgs({
  allowPositionals: true,
})

const name = positionals[0] || "docs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const build = join(__dirname, "..", name)

if (existsSync(build)) {
  await rm(build, {recursive: true})
  console.log(`removed ${build}`)
}
