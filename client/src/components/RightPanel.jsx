import React from 'react';
import { Tabs, Empty } from 'antd';
import MarkdownTab from './tabs/MarkdownTab';
import JsonTab from './tabs/JsonTab';
import TableTab from './tabs/TableTab';
import SealTab from './tabs/SealTab';
import FormulaTab from './tabs/FormulaTab';
import TitleTab from './tabs/TitleTab';
import ChartTab from './tabs/ChartTab';
import ImageTab from './tabs/ImageTab';

function RightPanel({ selectedFile, parseResults }) {
  if (!selectedFile) {
    return (
      <div className="right-panel">
        <Empty description="请选择文件查看解析结果" />
      </div>
    );
  }

  const result = parseResults[selectedFile.id];

  if (!result) {
    return (
      <div className="right-panel">
        <Empty description="暂无解析结果" />
      </div>
    );
  }

  const items = [
    {
      key: 'markdown',
      label: 'Markdown',
      children: <MarkdownTab result={result} />
    },
    {
      key: 'json',
      label: 'JSON',
      children: <JsonTab result={result} />
    },
    {
      key: 'table',
      label: '表格',
      children: <TableTab result={result} />
    },
    {
      key: 'chart',
      label: '图表',
      children: <ChartTab result={result} />
    },
    {
      key: 'seal',
      label: '印章手写',
      children: <SealTab result={result} />
    },
    {
      key: 'formula',
      label: '公式',
      children: <FormulaTab result={result} />
    },
    {
      key: 'title',
      label: '标题层级',
      children: <TitleTab result={result} />
    },
    {
      key: 'image',
      label: '图片',
      children: <ImageTab result={result} />
    }
  ];

  return (
    <div className="right-panel">
      <Tabs
        defaultActiveKey="markdown"
        items={items}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      />
    </div>
  );
}

export default RightPanel;

