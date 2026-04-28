#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const MarkdownIt = require('markdown-it')
const katex = require('katex')
const markdownItKatex = require('@renbaoshuo/markdown-it-katex')

const repoRoot = path.resolve(__dirname, '..')
const targets = process.argv.slice(2)
const scanRoots = targets.length ? targets : ['source/_posts']
const md = new MarkdownIt({ html: true }).use(markdownItKatex)
const markdownFiles = []

function walk (target) {
  const absolute = path.resolve(repoRoot, target)
  if (!fs.existsSync(absolute)) {
    console.error(`Path not found: ${target}`)
    process.exitCode = 2
    return
  }

  const stat = fs.statSync(absolute)
  if (stat.isDirectory()) {
    fs.readdirSync(absolute, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(entry => walk(path.relative(repoRoot, path.join(absolute, entry.name))))
    return
  }

  if (stat.isFile() && absolute.endsWith('.md')) {
    markdownFiles.push(absolute)
  }
}

function hasBareDisplayNewline (content) {
  let found = false
  const originalWarn = console.warn

  try {
    console.warn = () => {}
    katex.renderToString(content, {
      displayMode: true,
      throwOnError: false,
      strict: code => {
        if (code === 'newLineInDisplayMode') found = true
        return 'ignore'
      }
    })
  } finally {
    console.warn = originalWarn
  }

  return found
}

function isWrappedInGather (content) {
  const trimmed = content.trim()
  return /^\\begin\{gather\*?\}[\s\S]*\\end\{gather\*?\}$/.test(trimmed)
}

function wrapContent (content) {
  const trimmed = content.trim()
  return `\\begin{gather*}\n${trimmed}\n\\end{gather*}`
}

function replaceMathBlock (source, token) {
  const lines = source.split(/\r?\n/)
  const newline = source.includes('\r\n') ? '\r\n' : '\n'
  const [start, end] = token.map
  const indent = (lines[start].match(/^\s*/) || [''])[0]
  const replacement = [
    `${indent}$$`,
    `${indent}${wrapContent(token.content).split('\n').join(`\n${indent}`)}`,
    `${indent}$$`
  ].join(newline)

  lines.splice(start, end - start, replacement)
  return lines.join(newline)
}

function processFile (file) {
  let source = fs.readFileSync(file, 'utf8')
  let changed = 0

  while (true) {
    const tokens = md.parse(source, {})
    const token = tokens.find(item =>
      item.type === 'math_block' &&
      item.map &&
      !isWrappedInGather(item.content) &&
      hasBareDisplayNewline(item.content)
    )

    if (!token) break
    source = replaceMathBlock(source, token)
    changed++
  }

  if (changed) {
    fs.writeFileSync(file, source)
  }

  return changed
}

scanRoots.forEach(walk)

let changedFiles = 0
let changedBlocks = 0

for (const file of markdownFiles) {
  const changed = processFile(file)
  if (!changed) continue
  changedFiles++
  changedBlocks += changed
  console.log(`${path.relative(repoRoot, file)}: wrapped ${changed} block(s)`)
}

console.log(`Done. Wrapped ${changedBlocks} math block(s) in ${changedFiles} file(s).`)
