import React from 'react';
import ReactJsonView from 'react-json-view';
import { Empty } from 'antd';

function JsonTab({ result }) {
  if (!result.jsonContent) {
    return <Empty description="暂无JSON内容" />;
  }

  return (
    <div className="json-viewer">
      <ReactJsonView
        src={result.jsonContent}
        theme="monokai"
        collapsed={2}
        displayDataTypes={false}
        displayObjectSize={false}
        enableClipboard={true}
        style={{ backgroundColor: '#272822' }}
      />
    </div>
  );
}

export default JsonTab;

