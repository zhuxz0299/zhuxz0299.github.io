/**
 * scripts/category_card_injector.js
 * Version 6.0 (Final Clean): 
 * 1. 移除全局 CSS 冗余，直接复用你 _config.yml 里定义的变量
 * 2. 包含 Category 卡片的所有美化 (居中、胶囊数字、点击代理)
 * 3. 包含 Category 卡片的深色模式适配
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
      /* ==============================
         Part 1: Category 卡片核心样式
         ============================== */
      
      /* 网格布局 */
      .category-lists .category-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
        list-style: none;
        padding: 0;
      }

      /* --- 卡片基础 (浅色模式默认) --- */
      .category-lists .category-list > .category-list-item {
        position: relative;
        /* 直接使用你全局定义的变量，如果没定义则回退到 #fff */
        background-color: var(--trans-light, #fff); 
        border: 1px solid #e3e8f7;
        border-radius: 12px;
        overflow: hidden;
        height: 100px; 
        transition: all 0.3s ease-in-out;
        display: flex;
        flex-direction: column;
        justify-content: center; 
        align-items: center;     
        text-align: center;
        box-shadow: 0 8px 16px -4px rgba(44, 45, 48, 0.05);
        background-clip: padding-box;
        cursor: pointer;
        padding: 0 10px;
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

      /* 链接文字 (浅色模式) */
      .category-lists .category-list > .category-list-item a {
        position: relative;
        z-index: 2;
        color: #4c4948 !important;
        font-weight: bold;
        font-size: 1.2em;
        text-decoration: none;
        transition: color 0.3s;
        line-height: 1.2;
        margin-bottom: 5px;
      }

      /* 数字胶囊 (浅色模式) */
      .category-lists .category-list-count {
        position: relative;
        z-index: 2;
        color: #858585;
        font-size: 0.85em; 
        background: #f2f3f5; 
        padding: 2px 10px;   
        border-radius: 20px; 
        transition: all 0.3s;
        pointer-events: none;
        &::before, &::after { display: inline; } 
      }
      /* 自动添加括号和文本 */
      .category-lists .category-list-count::before { content: '('; margin-right: 2px; }
      .category-lists .category-list-count::after { content: ' 篇)'; margin-left: 2px; }

      /* --- 展开后的修正 --- */
      .category-lists .category-list > .category-list-item.expanded {
        height: auto !important;
        padding-bottom: 15px;
        background-color: #f9f9f9;
        cursor: default;
      }

      /* ==============================
         Part 2: 深色模式适配 (Category 专用)
         ============================== */
      
      [data-theme="dark"] .category-lists .category-list > .category-list-item {
        /* 直接引用你 inject 中定义的 --trans-dark */
        background-color: var(--trans-dark, rgba(25, 25, 25, 0.88)); 
        border-color: rgba(255, 255, 255, 0.1); 
        box-shadow: none;
      }

      /* 深色模式：文字变白 */
      [data-theme="dark"] .category-lists .category-list > .category-list-item a {
        color: #ddd !important;
      }

      /* 深色模式：数字胶囊背景变深 */
      [data-theme="dark"] .category-lists .category-list-count {
        background: rgba(255, 255, 255, 0.1);
        color: #bbb;
      }

      /* 深色模式：悬停效果 */
      [data-theme="dark"] .category-lists .category-list > .category-list-item:hover {
         border-color: #49b1f5;
         background-color: rgba(0, 0, 0, 0.8);
         box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.5);
      }

      /* 深色模式：展开状态背景 */
      [data-theme="dark"] .category-lists .category-list > .category-list-item.expanded {
        background-color: rgba(0, 0, 0, 0.6);
      }


      /* ==============================
         Part 3: 特殊状态 - 背景图模式
         ============================== */
         
      /* 无论深浅模式，有图时背景透明，边框移除 */
      .category-lists .category-list > .category-list-item.item-has-image {
        border: none !important; 
        background-color: transparent !important;
        background-size: cover;
        background-position: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
      }

      /* 遮罩 */
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

      /* 有图时强制白字 */
      .category-lists .category-list > .category-list-item.item-has-image a {
        color: #fff !important;
        text-shadow: 0 2px 4px rgba(0,0,0,0.6);
      }
      
      /* 有图时数字胶囊：磨砂白 */
      .category-lists .category-list > .category-list-item.item-has-image .category-list-count {
        color: #fff;
        background: rgba(255, 255, 255, 0.2); 
        backdrop-filter: blur(4px); 
      }
    </style>
  `;

  // 3. JS 逻辑定义 (保持不变)
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