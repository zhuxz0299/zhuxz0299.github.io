document.addEventListener('DOMContentLoaded', function () {
  
  // === 配置区域：在这里定义你的分类背景图 ===
  const categoryImages = {
    'Operating system': 'https://source.fomal.cc/img/default_cover_7.webp',
    'blog': 'https://source.fomal.cc/img/default_cover_8.webp',
    'artificial intelligence': 'https://source.fomal.cc/img/default_cover_9.webp',
    // 如果没有配置的，会保持 CSS 中的默认背景
  };

  // 1. 获取所有顶级分类项
  const listItems = document.querySelectorAll('.category-lists .category-list > .category-list-item');

  listItems.forEach(item => {
    const link = item.querySelector('a.category-list-link');
    const categoryName = link.innerText.trim();
    const childList = item.querySelector('.category-list-child');

    // === 功能 A: 注入背景图 ===
    if (categoryImages[categoryName]) {
      item.style.backgroundImage = `url('${categoryImages[categoryName]}')`;
    }

    // === 功能 B: 折叠/展开逻辑 ===
    if (childList) {
      // 1. 默认隐藏子菜单
      childList.style.display = 'none';
      childList.style.width = '100%';
      childList.style.marginTop = '10px';
      childList.style.zIndex = '3';
      childList.style.position = 'relative'; // 确保在卡片内部流式布局
      
      // 2. 修改卡片样式以适应展开（移除固定高度，改为自动）
      // 我们需要动态控制，平时固定高度，展开时自动高度
      
      // 3. 绑定点击事件
      // 注意：Butterfly 默认点击 a 标签会跳转。
      // 如果你想“点击只展开，不跳转”，需要阻止默认事件。
      link.addEventListener('click', function(e) {
        e.preventDefault(); // 阻止跳转页面
        
        const isVisible = childList.style.display === 'block';
        
        if (isVisible) {
          // 收起
          childList.style.display = 'none';
          item.style.height = '120px'; // 恢复卡片初始高度
        } else {
          // 展开
          childList.style.display = 'block';
          item.style.height = 'auto'; // 高度自适应
          item.style.paddingBottom = '15px';
        }
      });

      // (可选) 如果你希望给可展开的项加个小图标提示
      link.innerHTML += ' <i class="fas fa-caret-down" style="font-size:0.8em; margin-left:5px;"></i>';
    }
  });
});
