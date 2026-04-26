import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const layoutPath = join(__dirname, '..', 'app', 'dashboard', 'layout.tsx')
const globalsPath = join(__dirname, '..', 'app', 'globals.css')

const layout = readFileSync(layoutPath, 'utf8')
const globals = readFileSync(globalsPath, 'utf8')

assert.match(layout, /pulsewave-theme/, 'dashboard theme should persist to localStorage with a stable key')
assert.match(layout, /data-pw-theme=\{theme\}/, 'dashboard body should expose the active theme for CSS overrides')
assert.match(layout, /aria-label=\{`Switch to \$\{theme === 'dark' \? 'light' : 'dark'\} mode`\}/, 'theme toggle needs an accessible dynamic label')
assert.match(layout, /LIGHT|DARK/, 'theme toggle should show the current mode state')

assert.match(globals, /:root\s*\{[\s\S]*--bg:\s*#0f1115/, 'default dark background should be lightened from near-black')
assert.match(globals, /\[data-pw-theme="light"\]/, 'light theme CSS overrides should be defined')
assert.match(globals, /--pw-light-bg:\s*#f4f6f8/, 'light mode should use a soft off-white background, not pure white')
assert.ok(globals.includes('.bg-\\[\\#0a0a0a\\]'), 'theme CSS should override legacy hard-coded dark dashboard classes')

console.log('dashboard theme toggle tests passed')
