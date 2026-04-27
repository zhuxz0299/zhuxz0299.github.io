#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'source');
const postsDir = path.join(sourceDir, '_posts');
const figureDir = path.join(sourceDir, 'figure');

const convertibleExts = new Set(['.png', '.jpg', '.jpeg']);
const imageExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif']);

function usage() {
  console.log(`Usage:
  node scripts/blog_image.js add <post.md> <image...> [--width N] [--quality N] [--max-width N]
  node scripts/blog_image.js optimize [--post <post.md>] [--delete-originals] [--quality N] [--max-width N] [--dry-run]
  node scripts/blog_image.js migrate [--post <post.md>] [--convert-webp] [--delete-originals] [--quality N] [--max-width N] [--dry-run]

Examples:
  npm run img:add -- source/_posts/latex/test.md ~/Pictures/a.png
  npm run img:post -- source/_posts/latex/test.md --delete-originals
  npm run img:migrate -- --dry-run
  npm run img:migrate -- --convert-webp --delete-originals
`);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith('--')) {
      args._.push(item);
      continue;
    }

    const key = item.slice(2);
    if (['delete-originals', 'dry-run', 'convert-webp'].includes(key)) {
      args[key] = true;
      continue;
    }

    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    args[key] = value;
    i += 1;
  }
  return args;
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function ensureInside(file, dir, label) {
  const rel = path.relative(dir, file);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`${label} must be inside ${path.relative(root, dir)}`);
  }
}

function assertPost(post) {
  ensureInside(post, postsDir, 'Post');
  if (!fs.existsSync(post)) throw new Error(`Post not found: ${path.relative(root, post)}`);
  if (path.extname(post).toLowerCase() !== '.md') throw new Error('Post must be a markdown file');
}

function walk(dir, predicate, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, predicate, out);
    } else if (!predicate || predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

function postFigureDir(post) {
  const postRelDir = path.relative(postsDir, path.dirname(post));
  const postBase = path.basename(post, path.extname(post));
  return postRelDir
    ? path.join(figureDir, postRelDir, postBase)
    : path.join(figureDir, postBase);
}

function relativeForMarkdown(post, target) {
  return toPosix(path.relative(path.dirname(post), target));
}

function isConvertible(file) {
  return convertibleExts.has(path.extname(file).toLowerCase());
}

function isImage(file) {
  return imageExts.has(path.extname(file).toLowerCase());
}

function findMagick() {
  for (const cmd of ['magick', 'convert']) {
    const result = spawnSync('sh', ['-lc', `command -v ${cmd}`], { encoding: 'utf8' });
    if (result.status === 0) return cmd;
  }
  throw new Error('ImageMagick is required. Install it or make sure magick/convert is in PATH.');
}

function convertToWebp(input, output, options) {
  const magick = findMagick();
  fs.mkdirSync(path.dirname(output), { recursive: true });

  const maxWidth = String(options['max-width'] || options.maxWidth || 1800);
  const quality = String(options.quality || 88);
  const args = [
    input,
    '-auto-orient',
    '-resize',
    `${maxWidth}x${maxWidth}>`,
    '-quality',
    quality,
    output,
  ];

  const result = spawnSync(magick, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`Failed to convert ${path.relative(root, input)}\n${result.stderr || result.stdout}`);
  }
}

function uniquePath(filePath, reserved = new Set(), sourcePath = null) {
  const normalized = path.normalize(filePath);
  if ((!fs.existsSync(normalized) || path.normalize(sourcePath || '') === normalized) && !reserved.has(normalized)) {
    reserved.add(normalized);
    return normalized;
  }

  const dir = path.dirname(normalized);
  const ext = path.extname(normalized);
  const base = path.basename(normalized, ext);
  for (let i = 1; ; i += 1) {
    const candidate = path.join(dir, `${base}-${i}${ext}`);
    if (!fs.existsSync(candidate) && !reserved.has(candidate)) {
      reserved.add(candidate);
      return candidate;
    }
  }
}

function resolveRef(ref, post) {
  const raw = ref.trim();
  if (!raw || /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('#')) return null;

  const clean = raw.split(/[?#]/)[0].trim();
  const resolved = clean.startsWith('/')
    ? path.normalize(path.join(sourceDir, clean.slice(1)))
    : path.normalize(path.resolve(path.dirname(post), clean));

  return resolved;
}

function collectImageRefs(post) {
  const content = fs.readFileSync(post, 'utf8');
  const refs = [];

  for (const match of content.matchAll(/src\s*=\s*(['"])([^'"]+)\1/gi)) {
    refs.push(match[2]);
  }

  for (const match of content.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)) {
    refs.push(match[1]);
  }

  return refs;
}

function updateRefs(post, replacements) {
  let content = fs.readFileSync(post, 'utf8');
  let changed = false;

  function replace(ref) {
    const resolved = resolveRef(ref, post);
    if (!resolved) return ref;
    const target = replacements.get(path.normalize(resolved));
    if (!target) return ref;
    changed = true;
    return relativeForMarkdown(post, target);
  }

  content = content.replace(/(src\s*=\s*['"])([^'"]+)(['"])/gi, (match, prefix, ref, suffix) => {
    return `${prefix}${replace(ref)}${suffix}`;
  });

  content = content.replace(/(!\[[^\]]*\]\()([^)]+?)(\))/g, (match, prefix, ref, suffix) => {
    const parts = ref.match(/^([^\s]+)(\s+["'][^"']*["'])?$/);
    if (!parts) return match;
    return `${prefix}${replace(parts[1])}${parts[2] || ''}${suffix}`;
  });

  if (changed) fs.writeFileSync(post, content);
  return changed;
}

function allPosts(postArg) {
  if (postArg) {
    const post = path.resolve(root, postArg);
    assertPost(post);
    return [post];
  }
  return walk(postsDir, file => path.extname(file).toLowerCase() === '.md');
}

function addImages(args) {
  const [postArg, ...imageArgs] = args._;
  if (!postArg || imageArgs.length === 0) {
    usage();
    process.exit(1);
  }

  const post = path.resolve(root, postArg);
  assertPost(post);

  const destDir = postFigureDir(post);
  const snippets = [];
  const reserved = new Set();

  for (const imageArg of imageArgs) {
    const input = path.resolve(imageArg);
    if (!fs.existsSync(input)) throw new Error(`Image not found: ${imageArg}`);
    if (!isImage(input)) throw new Error(`Unsupported image type: ${imageArg}`);

    const ext = path.extname(input).toLowerCase();
    const output = uniquePath(path.join(destDir, `${path.basename(input, ext)}.webp`), reserved);

    if (ext === '.webp') {
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.copyFileSync(input, output);
    } else if (isConvertible(input)) {
      convertToWebp(input, output, args);
    } else {
      throw new Error(`Cannot convert ${imageArg} to WebP automatically`);
    }

    const ref = relativeForMarkdown(post, output);
    snippets.push(args.width ? `<img src="${ref}" width="${args.width}">` : `![](${ref})`);
  }

  console.log(snippets.join('\n'));
}

function optimizeImages(args) {
  const post = args.post || args._[0];
  const posts = allPosts(post);
  const imageRoot = post ? postFigureDir(posts[0]) : figureDir;
  const images = walk(imageRoot, isConvertible);
  const replacements = new Map();

  for (const input of images) {
    const output = path.join(path.dirname(input), `${path.basename(input, path.extname(input))}.webp`);
    replacements.set(path.normalize(input), output);
    if (!args['dry-run']) convertToWebp(input, output, args);
  }

  let changedPosts = 0;
  if (!args['dry-run']) {
    for (const md of posts) {
      if (updateRefs(md, replacements)) changedPosts += 1;
    }
    if (args['delete-originals']) {
      for (const input of replacements.keys()) {
        if (fs.existsSync(input)) fs.unlinkSync(input);
      }
    }
  }

  console.log(`Images matched: ${images.length}`);
  console.log(`Posts updated: ${changedPosts}`);
  if (args['dry-run']) console.log('Dry run only; no files were changed.');
  if (!args['delete-originals'] && !args['dry-run']) {
    console.log('Original files kept. Add --delete-originals after checking the result.');
  }
}

function planMigration(args) {
  const posts = allPosts(args.post || args._[0]);
  const reserved = new Set();
  const plans = [];

  for (const post of posts) {
    const perPost = new Map();
    for (const ref of collectImageRefs(post)) {
      const source = resolveRef(ref, post);
      if (!source || perPost.has(path.normalize(source))) continue;
      if (!fs.existsSync(source) || !isImage(source)) continue;

      const sourceNorm = path.normalize(source);
      const underFigure = !path.relative(figureDir, sourceNorm).startsWith('..') && !path.isAbsolute(path.relative(figureDir, sourceNorm));
      if (!underFigure) continue;

      const sourceExt = path.extname(sourceNorm).toLowerCase();
      const targetExt = args['convert-webp'] && isConvertible(sourceNorm) ? '.webp' : sourceExt;
      const targetBase = `${path.basename(sourceNorm, sourceExt)}${targetExt}`;
      const target = uniquePath(path.join(postFigureDir(post), targetBase), reserved, sourceNorm);
      perPost.set(sourceNorm, target);

      if (sourceNorm !== target || sourceExt !== targetExt) {
        plans.push({ post, source: sourceNorm, target, convert: targetExt === '.webp' && sourceExt !== '.webp' });
      }
    }
  }

  return plans;
}

function migrateImages(args) {
  const plans = planMigration(args);
  const replacementsByPost = new Map();

  for (const plan of plans) {
    const postKey = path.normalize(plan.post);
    if (!replacementsByPost.has(postKey)) replacementsByPost.set(postKey, { post: plan.post, replacements: new Map() });
    replacementsByPost.get(postKey).replacements.set(path.normalize(plan.source), plan.target);
  }

  console.log(`Images to move/convert: ${plans.length}`);
  for (const plan of plans.slice(0, 30)) {
    console.log(`${toPosix(path.relative(root, plan.source))} -> ${toPosix(path.relative(root, plan.target))}`);
  }
  if (plans.length > 30) console.log(`... ${plans.length - 30} more`);

  if (args['dry-run']) {
    console.log('Dry run only; no files were changed.');
    return;
  }

  for (const plan of plans) {
    fs.mkdirSync(path.dirname(plan.target), { recursive: true });
    if (path.normalize(plan.source) === path.normalize(plan.target)) {
      if (plan.convert) convertToWebp(plan.source, plan.target, args);
      continue;
    }
    if (plan.convert) {
      convertToWebp(plan.source, plan.target, args);
    } else {
      fs.copyFileSync(plan.source, plan.target);
    }
  }

  let changedPosts = 0;
  for (const { post, replacements } of replacementsByPost.values()) {
    if (updateRefs(post, replacements)) changedPosts += 1;
  }

  if (args['delete-originals']) {
    const sources = [...new Set(plans.map(plan => path.normalize(plan.source)))];
    for (const source of sources) {
      const stillTarget = plans.some(plan => path.normalize(plan.target) === source);
      if (!stillTarget && fs.existsSync(source)) fs.unlinkSync(source);
    }
  }

  console.log(`Posts updated: ${changedPosts}`);
  if (!args['delete-originals']) {
    console.log('Original files kept. Add --delete-originals after checking the result.');
  }
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || ['-h', '--help', 'help'].includes(command)) {
    usage();
    return;
  }

  const args = parseArgs(rest);
  if (command === 'add') return addImages(args);
  if (command === 'optimize') return optimizeImages(args);
  if (command === 'migrate') return migrateImages(args);

  usage();
  process.exit(1);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
