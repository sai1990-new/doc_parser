import React, { useMemo } from 'react';
import { Empty, Card } from 'antd';
import { InlineMath, BlockMath } from 'react-katex';

function FormulaTab({ result }) {
  const formulas = useMemo(() => {
    if (!result.jsonContent || !result.jsonContent.pages) {
      return [];
    }

    const allFormulas = [];
    result.jsonContent.pages.forEach((page, pageIndex) => {
      if (page.layouts) {
        page.layouts.forEach((layout) => {
          if (layout.type === 'formula') {
            allFormulas.push({
              ...layout,
              pageNum: page.page_num || pageIndex + 1
            });
          }
        });
      }
    });

    return allFormulas;
  }, [result.jsonContent]);

  if (formulas.length === 0) {
    return <Empty description="暂无公式数据" />;
  }

  const renderFormula = (latex) => {
    if (!latex) return null;
    
    try {
      // 尝试渲染为块级公式
      return <BlockMath math={latex} />;
    } catch (error) {
      // 如果渲染失败，显示原始文本
      return <code>{latex}</code>;
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      {formulas.map((formula, index) => (
        <Card
          key={index}
          title={`公式 ${index + 1} (第 ${formula.pageNum} 页)`}
          style={{ marginBottom: 16 }}
        >
          <div className="formula-item">
            {formula.text ? (
              renderFormula(formula.text)
            ) : (
              <div style={{ color: '#999' }}>公式内容为空</div>
            )}
            {formula.position && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                位置: [{formula.position.join(', ')}]
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default FormulaTab;

