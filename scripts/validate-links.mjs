#!/usr/bin/env node
// Validates src/links.json before it can break a build or a deployment.
//
// Checks performed:
//   1. The file is valid JSON and a flat object of string -> string.
//   2. The two special keys ("/" and "new-key") come first, in that order.
//   3. No two keys collide case-insensitively (links live at case-insensitive
//      paths on GitHub Pages, so "Foo" and "foo" would clash).
//   4. Every key is a safe single path segment.
//   5. Every value is an absolute http(s) URL.
//   6. The remaining keys are in natural, case-insensitive order, matching the
//      ordering documented in AGENTS.md (so diffs stay small and predictable).
//
// Uses only Node built-ins so it can run in CI, in a git hook, or locally
// without installing anything.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const LINKS_PATH = process.argv[2] ?? join(HERE, '..', 'src', 'links.json')

// Pinned, in order, at the top of the file.
const SPECIAL_KEYS = ['/', 'new-key']

// A single, filesystem-/URL-safe path segment (the special "/" key aside).
const KEY_PATTERN = /^[A-Za-z0-9._-]+$/

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

/** Natural, case-insensitive comparison used to order ad-hoc keys. */
const compareKeys = (a, b) => collator.compare(a, b)

const errors = []
const fail = (message) => errors.push(message)

let raw
try {
  raw = readFileSync(LINKS_PATH, 'utf8')
} catch (error) {
  console.error(`Could not read ${LINKS_PATH}: ${error.message}`)
  process.exit(1)
}

let links
try {
  links = JSON.parse(raw)
} catch (error) {
  console.error(`src/links.json is not valid JSON: ${error.message}`)
  process.exit(1)
}

if (links === null || typeof links !== 'object' || Array.isArray(links)) {
  console.error('src/links.json must be a JSON object of "key": "url" pairs.')
  process.exit(1)
}

const keys = Object.keys(links)

// 1. Values must all be absolute http(s) URLs.
for (const [key, value] of Object.entries(links)) {
  if (typeof value !== 'string') {
    fail(`"${key}": value must be a string, got ${typeof value}.`)
    continue
  }
  let url
  try {
    url = new URL(value)
  } catch {
    fail(`"${key}": "${value}" is not a valid absolute URL.`)
    continue
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    fail(`"${key}": URL must use http or https, got "${url.protocol}".`)
  }
}

// 2. Special keys pinned at the top, in order.
SPECIAL_KEYS.forEach((expected, index) => {
  if (keys[index] !== expected) {
    fail(
      `Expected key #${index + 1} to be "${expected}" but found "${keys[index] ?? '(missing)'}". ` +
        `The special keys ${SPECIAL_KEYS.map((k) => `"${k}"`).join(' and ')} must stay at the top, in order.`,
    )
  }
})

// 3. Key format (special "/" excepted).
for (const key of keys) {
  if (key === '/') continue
  if (!KEY_PATTERN.test(key)) {
    fail(`"${key}": key may only contain letters, digits, ".", "_" and "-".`)
  }
}

// 4. Case-insensitive duplicate keys.
const seen = new Map()
for (const key of keys) {
  const lower = key.toLowerCase()
  if (seen.has(lower)) {
    fail(`"${key}" collides case-insensitively with "${seen.get(lower)}".`)
  } else {
    seen.set(lower, key)
  }
}

// 5. Ordering of the ad-hoc keys (everything after the special ones).
const adHoc = keys.filter((key) => !SPECIAL_KEYS.includes(key))
const sorted = [...adHoc].sort(compareKeys)
for (let i = 0; i < adHoc.length; i++) {
  if (adHoc[i] !== sorted[i]) {
    fail(
      `Keys are not in natural, case-insensitive order. ` +
        `Expected "${sorted[i]}" but found "${adHoc[i]}" at position ${i + 1}. ` +
        `Run the keys through a case-insensitive natural sort (see AGENTS.md).`,
    )
    break
  }
}

if (errors.length > 0) {
  console.error(`src/links.json failed validation (${errors.length} issue(s)):`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log(`src/links.json is valid: ${keys.length} links, all checks passed.`)
