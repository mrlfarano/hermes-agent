'use strict'

function stripInlineComment(value) {
  let quote = null
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i]
    if ((ch === '"' || ch === "'") && (i === 0 || value[i - 1] !== '\\')) {
      quote = quote === ch ? null : quote || ch
      continue
    }
    if (ch === '#' && quote === null) {
      return value.slice(0, i)
    }
  }
  return value
}

function normalizeUpdateBranch(value, fallback = 'main') {
  let branch = typeof value === 'string' ? value.trim() : ''
  if (
    (branch.startsWith('"') && branch.endsWith('"')) ||
    (branch.startsWith("'") && branch.endsWith("'"))
  ) {
    branch = branch.slice(1, -1).trim()
  }
  return branch || fallback
}

function readUpdateBranchFromHermesConfigText(raw, fallback = 'main') {
  if (!raw) return fallback

  let inUpdates = false
  let updatesIndent = -1

  for (const line of String(raw).split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const indent = line.match(/^\s*/)?.[0].length ?? 0
    if (!inUpdates) {
      if (/^updates\s*:\s*(?:#.*)?$/.test(trimmed)) {
        inUpdates = true
        updatesIndent = indent
      }
      continue
    }

    if (indent <= updatesIndent) break

    const match = trimmed.match(/^branch\s*:\s*(.*?)\s*$/)
    if (match) {
      return normalizeUpdateBranch(stripInlineComment(match[1]), fallback)
    }
  }

  return fallback
}

module.exports = {
  normalizeUpdateBranch,
  readUpdateBranchFromHermesConfigText
}
