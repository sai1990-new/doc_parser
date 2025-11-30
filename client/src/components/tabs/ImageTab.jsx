import React, { useMemo } from 'react';
import { Empty, Card, Image, Row, Col } from 'antd';

function ImageTab({ result }) {
  const images = useMemo(() => {
    if (!result.jsonContent || !result.jsonContent.pages) {
      return [];
    }

    const allImages = [];
    result.jsonContent.pages.forEach((page, pageIndex) => {
      if (page.images && page.images.length > 0) {
        page.images.forEach((image) => {
          // 排除图表（图表在ChartTab中显示）
          let isChart = false;
          if (page.layouts) {
            const relatedLayout = page.layouts.find(
              layout => layout.layout_id === image.layout_id && layout.type === 'image'
            );
            if (relatedLayout && relatedLayout.sub_type === 'chart') {
              isChart = true;
            }
          }
          
          if (!isChart && image.data_url) {
            allImages.push({
              ...image,
              pageNum: page.page_num || pageIndex + 1
            });
          }
        });
      }
    });

    return allImages;
  }, [result.jsonContent]);

  if (images.length === 0) {
    return <Empty description="暂无图片数据" />;
  }

  return (
    <div style={{ padding: '16px' }}>
      <Row gutter={[16, 16]}>
        {images.map((image, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={`图片 ${index + 1} (第 ${image.pageNum} 页)`}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <div style={{ marginBottom: 8 }}>
                <Image
                  src={image.data_url}
                  alt={`图片 ${index + 1}`}
                  style={{ width: '100%' }}
                  preview={{
                    mask: '查看大图'
                  }}
                />
              </div>
              
              {image.image_title_id && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  图片标题ID: {image.image_title_id}
                </div>
              )}

              {image.position && (
                <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                  位置: [{image.position.join(', ')}]
                </div>
              )}

              {image.image_description && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  描述: {typeof image.image_description === 'string' 
                    ? image.image_description.substring(0, 50) + '...'
                    : '已解析'}
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default ImageTab;

