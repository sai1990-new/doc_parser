import React, { useMemo } from 'react';
import { Empty, Card, Image, Collapse } from 'antd';

const { Panel } = Collapse;

function ChartTab({ result }) {
  const charts = useMemo(() => {
    if (!result.jsonContent || !result.jsonContent.pages) {
      return [];
    }

    const allCharts = [];
    result.jsonContent.pages.forEach((page, pageIndex) => {
      if (page.images) {
        page.images.forEach((image) => {
          // 查找对应的layout，检查是否为chart类型
          let isChart = false;
          if (page.layouts) {
            const relatedLayout = page.layouts.find(
              layout => layout.layout_id === image.layout_id && layout.type === 'image'
            );
            if (relatedLayout && relatedLayout.sub_type === 'chart') {
              isChart = true;
            }
          }
          
          // 检查image的content_layouts中是否有chart
          if (image.content_layouts && image.content_layouts.length > 0) {
            const hasChart = image.content_layouts.some(
              layout => layout.sub_type === 'chart'
            );
            if (hasChart) {
              isChart = true;
            }
          }

          // 如果开启了图表解析，image_description存在也认为是图表
          if (!isChart && image.image_description) {
            isChart = true;
          }

          if (isChart && image.data_url) {
            let chartDescription = null;
            if (image.image_description) {
              try {
                chartDescription = typeof image.image_description === 'string' 
                  ? JSON.parse(image.image_description)
                  : image.image_description;
              } catch (e) {
                chartDescription = { raw: image.image_description };
              }
            }

            allCharts.push({
              ...image,
              pageNum: page.page_num || pageIndex + 1,
              chartDescription
            });
          }
        });
      }
    });

    return allCharts;
  }, [result.jsonContent]);

  if (charts.length === 0) {
    return <Empty description="暂无图表数据（请确保已开启图表解析功能）" />;
  }

  return (
    <div style={{ padding: '16px' }}>
      {charts.map((chart, index) => (
        <Card
          key={index}
          title={`图表 ${index + 1} (第 ${chart.pageNum} 页)`}
          style={{ marginBottom: 16 }}
        >
          <div style={{ marginBottom: 16 }}>
            <Image
              src={chart.data_url}
              alt="图表"
              style={{ maxWidth: '100%' }}
            />
          </div>
          
          {chart.image_title_id && (
            <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
              图表标题ID: {chart.image_title_id}
            </div>
          )}

          {chart.chartDescription && (
            <Collapse>
              <Panel header="图表解析内容" key="description">
                <div className="chart-description">
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word',
                    margin: 0,
                    padding: 12,
                    background: '#f5f5f5',
                    borderRadius: 4
                  }}>
                    {JSON.stringify(chart.chartDescription, null, 2)}
                  </pre>
                </div>
              </Panel>
            </Collapse>
          )}

          {chart.position && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              位置: [{chart.position.join(', ')}]
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export default ChartTab;

