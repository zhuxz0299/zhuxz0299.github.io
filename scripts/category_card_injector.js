/**
 * scripts/category_card_injector.js
 * Version 4.0: 
 * 1. 极简白卡片 + 悬浮微动 + 智能文字变色
 * 2. 自动隐藏丑圆点 + 修复蓝边
 * 3. 全卡片可点击 (点击空白处触发链接)
 * 4. [新增] 文字完美居中 + 数字胶囊化设计 + "(x 篇)" 格式
 */

hexo.extend.filter.register('after_render:html', function (str, data) {
  // 仅在 category 页面生效
  if (!data.path.includes('categories/index.html') && data.page.type !== 'categories') {
    return str;
  }

  // 1. 读取配置
  const categoryImages = hexo.locals.get('data').category_images || {};
  const imagesJson = JSON.stringify(categoryImages);

  // 2. CSS 样式定义
  const css = `
    <style>
      /* 网格布局 */
      .category-lists .category-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
        list-style: none;
        padding: 0;
      }

      /* 卡片基础样式 */
      .category-lists .category-list > .category-list-item {
        position: relative;
        background-color: #fff;
        border: 1px solid #e3e8f7;
        border-radius: 12px;
        overflow: hidden;
        height: 100px; /* 固定高度 */
        transition: all 0.3s ease-in-out;
        display: flex;
        flex-direction: column;
        justify-content: center; /* 垂直居中 */
        align-items: center;     /* 水平居中 (Flex容器层级) */
        text-align: center;      /* 文字层级居中 (防止多行文字靠左) */
        box-shadow: 0 8px 16px -4px rgba(44, 45, 48, 0.05);
        background-clip: padding-box;
        cursor: pointer;
        padding: 0 10px; /* 防止文字紧贴边缘 */
      }

      /* 修复: 强制隐藏默认圆点 */
      .category-lists .category-list > .category-list-item::before {
        display: none !important;
        content: none !important;
        border: none !important;
      }

      /* 鼠标悬停 */
      .category-lists .category-list > .category-list-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 24px -4px rgba(44, 45, 48, 0.1);
        border-color: #49b1f5;
      }

      /* 链接文字 */
      .category-lists .category-list > .category-list-item a {
        position: relative;
        z-index: 2;
        color: #4c4948 !important;
        font-weight: bold;
        font-size: 1.2em; /* 稍微加大一点标题 */
        text-decoration: none;
        transition: color 0.3s;
        line-height: 1.2;
        margin-bottom: 5px; /* 给下面的数字留点距离 */
      }

      /* === 核心修改：数字美化 (胶囊风格) === */
      .category-lists .category-list-count {
        position: relative;
        z-index: 2;
        color: #858585;
        font-size: 0.85em; /* 字体改小一点，更精致 */
        background: #f2f3f5; /* 浅灰色背景胶囊 */
        padding: 2px 10px;   /* 撑开胶囊 */
        border-radius: 20px; /* 圆角 */
        transition: all 0.3s;
        pointer-events: none;
        
        /* 修复: 隐藏可能存在的默认括号 */
        &::before, &::after { display: inline; } 
      }

      /* 使用 CSS 伪元素自动添加括号和“篇” */
      .category-lists .category-list-count::before {
        content: '(';
        margin-right: 2px;
      }
      .category-lists .category-list-count::after {
        content: ' 篇)';
        margin-left: 2px;
      }

      /* === 特殊状态：有背景图 === */
      .category-lists .category-list > .category-list-item.item-has-image {
        border: none !important; 
        background-color: transparent !important;
        background-size: cover;
        background-position: center;
      }

      /* 图片遮罩 */
      .category-lists .category-list > .category-list-item.item-has-image::after {
        content: ''; 
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.35); 
        z-index: 1; 
        transition: background 0.3s;
        pointer-events: none; 
      }
      
      .category-lists .category-list > .category-list-item.item-has-image:hover::after {
        background: rgba(0, 0, 0, 0.1);
      }

      /* 有图时文字变白 */
      .category-lists .category-list > .category-list-item.item-has-image a {
        color: #fff !important;
        text-shadow: 0 2px 4px rgba(0,0,0,0.6);
      }
      
      /* 有图时，数字胶囊变成半透明白色 */
      .category-lists .category-list > .category-list-item.item-has-image .category-list-count {
        color: #fff;
        background: rgba(255, 255, 255, 0.2); /* 磨砂玻璃效果 */
        backdrop-filter: blur(4px); /* 可选：增加一点模糊感 */
      }

      /* 展开后的修正 */
      .category-lists .category-list > .category-list-item.expanded {
        height: auto !important;
        padding-bottom: 15px;
        background-color: #f9f9f9;
        cursor: default;
      }
    </style>
  `;

  // 3. JS 逻辑定义
  const js = `
    <script>
    document.addEventListener('DOMContentLoaded', function () {
      const config = ${imagesJson};
      const listItems = document.querySelectorAll('.category-lists .category-list > .category-list-item');
      
      listItems.forEach(item => {
        const link = item.querySelector('a.category-list-link');
        if(!link) return;
        
        const name = link.innerText.trim();
        const childList = item.querySelector('.category-list-child');

        // === 1. 背景图逻辑 ===
        if (config[name]) {
          item.style.backgroundImage = 'url(' + config[name] + ')';
          item.classList.add('item-has-image');
        }

        // === 2. 全卡片点击代理逻辑 ===
        item.addEventListener('click', function(e) {
          if (e.target.tagName === 'A' || e.target.closest('.category-list-child')) {
            return;
          }
          link.click();
        });

        // === 3. 折叠/展开逻辑 ===
        if (childList) {
          childList.style.display = 'none';
          childList.style.width = '100%';
          childList.style.marginTop = '15px';
          childList.style.position = 'relative';
          childList.style.zIndex = '3';
          // 修正展开后的文字对齐，子菜单还是左对齐比较好看
          childList.style.textAlign = 'left'; 
          
          link.addEventListener('click', function(e) {
            e.preventDefault();
            const isVisible = childList.style.display === 'block';
            if (isVisible) {
              childList.style.display = 'none';
              item.style.height = '100px'; 
              item.classList.remove('expanded');
            } else {
              childList.style.display = 'block';
              item.style.height = 'auto';
              item.classList.add('expanded');
            }
          });
          
          if (!link.querySelector('.fa-caret-down')) {
            link.innerHTML += ' <i class="fas fa-caret-down" style="font-size:0.8em; margin-left:5px;"></i>';
          }
        }
      });
    });
    </script>
  `;

  return str.replace('</body>', css + js + '</body>');
});