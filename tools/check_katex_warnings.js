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

function countNewlines (value) {
  const matches = value.match(/\n/g)
  return matches ? matches.length : 0
}

function lineAtOffset (startLine, content, offset) {
  return startLine + countNewlines(content.slice(0, Math.max(0, offset)))
}

function previewFormula (content) {
  return content.replace(/\s+/g, ' ').trim().slice(0, 120)
}

function formulaContentStartLine (source, token) {
  const start = token.map ? token.map[0] : 0
  const firstLine = source.split(/\r?\n/)[start] || ''
  const openIndex = firstLine.indexOf('$$')
  const firstLineContent = openIndex === -1 ? '' : firstLine.slice(openIndex + 2).replace(/\$\$\s*$/, '')

  return start + (firstLineContent.trim() ? 1 : 2)
}

function collectKatexIssues ({ file, content, displayMode, startLine }) {
  const issues = []
  const originalWarn = console.warn

  try {
    console.warn = (...args) => {
      issues.push({
        file,
        line: startLine,
        code: 'consoleWarn',
        message: args.map(value => String(value)).join(' '),
        displayMode,
        formula: previewFormula(content)
      })
    }

    katex.renderToString(content, {
      displayMode,
      throwOnError: true,
      strict: (code, message, token) => {
        const offset = token && token.loc ? token.loc.start : 0
        issues.push({
          file,
          line: lineAtOffset(startLine, content, offset),
          code,
          message,
          displayMode,
          formula: previewFormula(content)
        })
        return 'ignore'
      }
    })
  } catch (error) {
    issues.push({
      file,
      line: startLine,
      code: error.name || 'KatexError',
      message: error.message || String(error),
      displayMode,
      formula: previewFormula(content)
    })
  } finally {
    console.warn = originalWarn
  }

  return issues
}

function collectMathTokens (file, source) {
  const tokens = md.parse(source, {})
  const mathItems = []

  for (const token of tokens) {
    if (token.type === 'math_block') {
      mathItems.push({
        file,
        content: token.content,
        displayMode: true,
        startLine: formulaContentStartLine(source, token)
      })
      continue
    }

    if (token.type !== 'inline' || !token.children) continue

    let searchOffset = 0
    for (const child of token.children) {
      if (child.type !== 'math_inline') continue

      const wrapped = `$${child.content}$`
      let openIndex = token.content.indexOf(wrapped, searchOffset)
      if (openIndex === -1) {
        const contentIndex = token.content.indexOf(child.content, searchOffset)
        openIndex = contentIndex === -1 ? searchOffset : Math.max(0, contentIndex - 1)
      }

      const mathContentOffset = openIndex + 1
      mathItems.push({
        file,
        content: child.content,
        displayMode: false,
        startLine: lineAtOffset((token.map ? token.map[0] : 0) + 1, token.content, mathContentOffset)
      })
      searchOffset = openIndex + wrapped.length
    }
  }

  return mathItems
}

scanRoots.forEach(walk)

const issues = []
for (const file of markdownFiles) {
  const source = fs.readFileSync(file, 'utf8')
  collectMathTokens(path.relative(repoRoot, file), source)
    .forEach(item => issues.push(...collectKatexIssues(item)))
}

if (!issues.length) {
  console.log(`No KaTeX warnings found in ${markdownFiles.length} Markdown file(s).`)
  process.exit(0)
}

const grouped = new Map()
for (const issue of issues) {
  if (!grouped.has(issue.file)) grouped.set(issue.file, [])
  grouped.get(issue.file).push(issue)
}

console.log(`Found ${issues.length} KaTeX warning/error(s) in ${grouped.size} file(s).\n`)
for (const [file, fileIssues] of grouped) {
  console.log(file)
  for (const issue of fileIssues) {
    const mode = issue.displayMode ? 'display' : 'inline'
    console.log(`  ${issue.line}: [${mode}] ${issue.code}: ${issue.message}`)
    console.log(`      ${issue.formula}`)
  }
}

process.exitCode = 1
