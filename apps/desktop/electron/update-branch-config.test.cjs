'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')

const {
  normalizeUpdateBranch,
  readUpdateBranchFromHermesConfigText
} = require('./update-branch-config.cjs')

test('normalizeUpdateBranch falls back for empty values', () => {
  assert.equal(normalizeUpdateBranch('', 'main'), 'main')
  assert.equal(normalizeUpdateBranch('   ', 'main'), 'main')
  assert.equal(normalizeUpdateBranch(null, 'main'), 'main')
})

test('normalizeUpdateBranch unwraps simple quoted branch values', () => {
  assert.equal(normalizeUpdateBranch('"codex/patch"', 'main'), 'codex/patch')
  assert.equal(normalizeUpdateBranch("'codex/patch'", 'main'), 'codex/patch')
})

test('readUpdateBranchFromHermesConfigText reads updates.branch', () => {
  assert.equal(readUpdateBranchFromHermesConfigText(`
model:
  default: gpt-5.4
updates:
  branch: "codex/skill-preflight-crash-errors"
  non_interactive_local_changes: stash
`), 'codex/skill-preflight-crash-errors')
})

test('readUpdateBranchFromHermesConfigText ignores branch outside updates', () => {
  assert.equal(readUpdateBranchFromHermesConfigText(`
branch: wrong
model:
  branch: also-wrong
updates:
  non_interactive_local_changes: stash
`), 'main')
})

test('readUpdateBranchFromHermesConfigText strips unquoted inline comments', () => {
  assert.equal(readUpdateBranchFromHermesConfigText(`
updates:
  branch: codex/patch # local fork branch
`), 'codex/patch')
})

test('readUpdateBranchFromHermesConfigText keeps hashes inside quotes', () => {
  assert.equal(readUpdateBranchFromHermesConfigText(`
updates:
  branch: "codex/patch#1"
`), 'codex/patch#1')
})
