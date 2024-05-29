#!/usr/bin/env node

import { existsSync } from "node:fs"
import { rm } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const build = join(__dirname, "..", "docs")

if (existsSync(build)) {
  await rm(build, {recursive: true})
}
