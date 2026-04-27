'use strict'

const escapeHtml = value => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const formatDate = date => {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const getNames = collection => {
  if (!collection) return []
  if (Array.isArray(collection)) return collection.map(item => typeof item === 'string' ? item : item.name).filter(Boolean)
  if (collection.data) return collection.data.map(item => item.name).filter(Boolean)
  return []
}

function buildWidget (hexo) {
  const posts = hexo.locals.get('posts')
    .filter(post => post.published !== false)
    .sort('-date')
    .toArray()
    .map(post => ({
      title: post.title || post.slug,
      url: hexo.config.root.replace(/\/$/, '') + '/' + post.path,
      date: formatDate(post.date),
      description: post.description || '',
      tags: getNames(post.tags),
      categories: getNames(post.categories)
    }))

  const tagCount = new Map()
  posts.forEach(post => post.tags.forEach(tag => tagCount.set(tag, (tagCount.get(tag) || 0) + 1)))
  const tags = [...tagCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const payload = Buffer.from(JSON.stringify({ tags, posts }), 'utf8').toString('base64')

  return `
    <section class="tag-filter" data-tag-filter>
      <div class="tag-filter__toolbar">
        <input class="tag-filter__input" type="search" placeholder="搜索标题、描述、分类或标签" autocomplete="off" aria-label="搜索文章">
        <div class="tag-filter__mode" role="group" aria-label="标签匹配模式">
          <button class="tag-filter__mode-btn is-active" type="button" data-mode="and">AND</button>
          <button class="tag-filter__mode-btn" type="button" data-mode="or">OR</button>
        </div>
      </div>
      <div class="tag-filter__summary">
        <span>共 ${tags.length} 个标签</span>
        <button class="tag-filter__clear" type="button">清除选择</button>
      </div>
      <div class="tag-filter__selected" aria-live="polite"></div>
      <div class="tag-filter__tags"></div>
      <div class="tag-filter__result-meta"></div>
      <div class="tag-filter__results"></div>
      <script type="application/json" id="tag-filter-data">${payload}</script>
    </section>
    <script>
      (() => {
        const root = document.querySelector('[data-tag-filter]')
        const dataEl = document.getElementById('tag-filter-data')
        if (!root || !dataEl) return
        const data = JSON.parse(decodeURIComponent(escape(atob(dataEl.textContent.trim()))))
        const tagsEl = root.querySelector('.tag-filter__tags')
        const resultsEl = root.querySelector('.tag-filter__results')
        const selectedEl = root.querySelector('.tag-filter__selected')
        const metaEl = root.querySelector('.tag-filter__result-meta')
        const inputEl = root.querySelector('.tag-filter__input')
        const clearBtn = root.querySelector('.tag-filter__clear')
        const modeBtns = [...root.querySelectorAll('.tag-filter__mode-btn')]
        const selectedTags = new Set()
        let mode = 'and'
        let query = ''
        const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
        const normalize = value => String(value || '').toLowerCase()
        const writeHash = () => {
          const params = new URLSearchParams()
          if (selectedTags.size) params.set('tags', [...selectedTags].join(','))
          if (mode !== 'and') params.set('mode', mode)
          if (query) params.set('q', query)
          const next = params.toString()
          history.replaceState(null, '', next ? '#' + next : location.pathname + location.search)
        }
        const readHash = () => {
          const params = new URLSearchParams(location.hash.slice(1))
          const hashTags = params.get('tags')
          if (hashTags) hashTags.split(',').filter(Boolean).forEach(tag => selectedTags.add(tag))
          if (params.get('mode') === 'or') mode = 'or'
          query = params.get('q') || ''
          inputEl.value = query
        }
        const postMatchesTags = post => {
          if (!selectedTags.size) return true
          const postTags = new Set(post.tags)
          return mode === 'or'
            ? [...selectedTags].some(tag => postTags.has(tag))
            : [...selectedTags].every(tag => postTags.has(tag))
        }
        const postMatchesQuery = post => {
          if (!query) return true
          return normalize([post.title, post.description, post.date, post.tags.join(' '), post.categories.join(' ')].join(' ')).includes(normalize(query))
        }
        const renderTags = () => {
          tagsEl.innerHTML = data.tags.map(tag => {
            const active = selectedTags.has(tag.name) ? ' is-active' : ''
            return '<button class="tag-filter__tag' + active + '" type="button" data-tag="' + escapeHtml(tag.name) + '"><span>' + escapeHtml(tag.name) + '</span><small>' + tag.count + '</small></button>'
          }).join('')
        }
        const renderSelected = () => {
          selectedEl.innerHTML = selectedTags.size
            ? [...selectedTags].map(tag => '<button class="tag-filter__selected-tag" type="button" data-tag="' + escapeHtml(tag) + '">' + escapeHtml(tag) + '<span aria-hidden="true">x</span></button>').join('')
            : '<span class="tag-filter__empty">未选择标签</span>'
        }
        const renderMode = () => modeBtns.forEach(btn => btn.classList.toggle('is-active', btn.dataset.mode === mode))
        const renderResults = () => {
          const results = data.posts.filter(post => postMatchesTags(post) && postMatchesQuery(post))
          const selected = selectedTags.size ? [...selectedTags].join(mode === 'and' ? ' + ' : ' / ') : '全部标签'
          metaEl.textContent = selected + '，匹配 ' + results.length + ' 篇文章'
          resultsEl.innerHTML = results.map(post => {
            const categories = post.categories.length ? '<div class="tag-filter__categories">' + post.categories.map(escapeHtml).join(' / ') + '</div>' : ''
            const description = post.description ? '<p class="tag-filter__desc">' + escapeHtml(String(post.description).replace(/<[^>]+>/g, '').slice(0, 140)) + '</p>' : ''
            const tags = post.tags.map(tag => '<span>' + escapeHtml(tag) + '</span>').join('')
            return '<article class="tag-filter__post"><a class="tag-filter__title" href="' + escapeHtml(post.url) + '">' + escapeHtml(post.title) + '</a><div class="tag-filter__meta"><time>' + escapeHtml(post.date) + '</time>' + categories + '</div>' + description + '<div class="tag-filter__post-tags">' + tags + '</div></article>'
          }).join('')
        }
        const render = () => {
          renderTags()
          renderSelected()
          renderMode()
          renderResults()
          writeHash()
        }
        readHash()
        render()
        tagsEl.addEventListener('click', event => {
          const btn = event.target.closest('[data-tag]')
          if (!btn) return
          selectedTags.has(btn.dataset.tag) ? selectedTags.delete(btn.dataset.tag) : selectedTags.add(btn.dataset.tag)
          render()
        })
        selectedEl.addEventListener('click', event => {
          const btn = event.target.closest('[data-tag]')
          if (!btn) return
          selectedTags.delete(btn.dataset.tag)
          render()
        })
        modeBtns.forEach(btn => btn.addEventListener('click', () => {
          mode = btn.dataset.mode
          render()
        }))
        clearBtn.addEventListener('click', () => {
          selectedTags.clear()
          query = ''
          inputEl.value = ''
          render()
        })
        inputEl.addEventListener('input', event => {
          query = event.target.value.trim()
          render()
        })
      })()
    </script>`
}

function streamToString (stream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

hexo.extend.filter.register('after_generate', async function () {
  const routePath = 'tags/index.html'
  const stream = hexo.route.get(routePath)
  if (!stream) return

  const html = await streamToString(stream)
  const tagCloudPattern = /<div class="tag-cloud-list text-center">[\s\S]*?<\/div>/
  if (!tagCloudPattern.test(html)) {
    hexo.log.warn('tag_filter_injector: tag cloud container not found')
    return
  }

  hexo.route.set(routePath, html.replace(tagCloudPattern, buildWidget(hexo)))
})
