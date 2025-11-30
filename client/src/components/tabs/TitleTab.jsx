import React, { useMemo } from 'react';
import { Empty, Tree } from 'antd';

function TitleTab({ result }) {
  const titleTree = useMemo(() => {
    try {
      if (!result || !result.jsonContent || !result.jsonContent.pages) {
        return [];
      }

      // 收集所有标题
      const titleMap = new Map();
      const processedIds = new Set(); // 防止循环引用

      result.jsonContent.pages.forEach((page) => {
        if (page.layouts && Array.isArray(page.layouts)) {
          page.layouts.forEach((layout) => {
            if (layout && layout.type === 'title' && layout.layout_id) {
              titleMap.set(layout.layout_id, {
                ...layout,
                pageNum: page.page_num || page.pageNum || 1
              });
            }
          });
        }
      });

      if (titleMap.size === 0) {
        return [];
      }

      // 构建树结构
      const buildTree = (parentId, depth = 0) => {
        // 防止无限递归
        if (depth > 100) {
          console.warn('标题层级过深，可能存在循环引用');
          return [];
        }

        const children = [];
        titleMap.forEach((title, id) => {
          // 检查是否已经处理过（防止循环引用）
          if (processedIds.has(id)) {
            return;
          }

          const isChild = parentId === 'root' 
            ? (!title.parent || title.parent === 'root' || title.parent === '')
            : (title.parent === parentId);

          if (isChild) {
            processedIds.add(id);
            const childNodes = buildTree(id, depth + 1);
            const node = {
              title: title.text || `标题 (${title.sub_type || '未知级别'})`,
              key: id || `title-${Math.random()}`,
              pageNum: title.pageNum || 1,
              children: childNodes && childNodes.length > 0 ? childNodes : undefined
            };
            children.push(node);
          }
        });
        return children.length > 0 ? children : [];
      };

      const tree = buildTree('root');
      return Array.isArray(tree) ? tree : [];
    } catch (error) {
      console.error('构建标题树时出错:', error);
      return [];
    }
  }, [result]);

  if (!titleTree || titleTree.length === 0) {
    return <Empty description="暂无标题数据" />;
  }

  return (
    <div style={{ padding: '16px' }}>
      <Tree
        treeData={titleTree}
        defaultExpandAll
        titleRender={(node) => {
          const pageNum = node.pageNum || node.page_num || '?';
          return (
            <span>
              {node.title || '未命名标题'}
              <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>
                (第 {pageNum} 页)
              </span>
            </span>
          );
        }}
      />
    </div>
  );
}

export default TitleTab;

