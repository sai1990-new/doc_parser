import React, { useMemo } from 'react';
import { Empty, Card, Image } from 'antd';

function SealTab({ result }) {
  const seals = useMemo(() => {
    if (!result.jsonContent || !result.jsonContent.pages) {
      return [];
    }

    const allSeals = [];
    result.jsonContent.pages.forEach((page, pageIndex) => {
      if (page.layouts) {
        page.layouts.forEach((layout) => {
          if (layout.type === 'seal') {
            // 查找对应的图片
            let imageUrl = null;
            if (page.images) {
              const relatedImage = page.images.find(img => 
                img.layout_id === layout.layout_id || 
                img.content_layouts?.some(cl => cl.layout_id === layout.layout_id)
              );
              if (relatedImage && relatedImage.data_url) {
                imageUrl = relatedImage.data_url;
              }
            }

            allSeals.push({
              ...layout,
              pageNum: page.page_num || pageIndex + 1,
              imageUrl
            });
          }
        });
      }
    });

    return allSeals;
  }, [result.jsonContent]);

  if (seals.length === 0) {
    return <Empty description="暂无印章数据" />;
  }

  return (
    <div className="seal-container" style={{ padding: '16px' }}>
      {seals.map((seal, index) => (
        <Card
          key={index}
          title={`印章 ${index + 1} (第 ${seal.pageNum} 页)`}
          style={{ width: '100%', marginBottom: 16 }}
        >
          {seal.imageUrl ? (
            <div className="seal-item">
              <Image
                src={seal.imageUrl}
                alt="印章"
                style={{ maxWidth: '100%' }}
              />
            </div>
          ) : (
            <div style={{ color: '#999' }}>暂无图片</div>
          )}
          {seal.text && (
            <div style={{ marginTop: 8 }}>
              <strong>文本内容:</strong> {seal.text}
            </div>
          )}
          {seal.position && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              位置: [{seal.position.join(', ')}]
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export default SealTab;

