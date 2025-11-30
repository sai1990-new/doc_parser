import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Empty } from 'antd';
import remarkGfm from 'remark-gfm';
import { convertHtmlBreaks } from '../../utils/htmlUtils';

function MarkdownTab({ result }) {
  if (!result.markdownContent) {
    return <Empty description="暂无Markdown内容" />;
  }

  // 如果内容是字符串，直接使用；如果是对象，转换为字符串
  // 处理HTML转义符号
  const markdownText = typeof result.markdownContent === 'string' 
    ? convertHtmlBreaks(result.markdownContent)
    : JSON.stringify(result.markdownContent, null, 2);

  return (
    <div className="markdown-viewer">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定义表格样式
          table: ({ node, ...props }) => (
            <div style={{ overflowX: 'auto', margin: '16px 0' }}>
              <table {...props} className="markdown-table" />
            </div>
          ),
          // 自定义表格单元格，处理\n换行符和HTML转义符号
          td: ({ node, children, ...props }) => {
            const processChildren = (children) => {
              return React.Children.map(children, (child) => {
                if (typeof child === 'string') {
                  // 先处理HTML转义符号，再处理\n
                  const processed = convertHtmlBreaks(child);
                  return processed.split('\\n').map((line, index, array) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </React.Fragment>
                  ));
                }
                return child;
              });
            };
            return (
              <td {...props} style={{ whiteSpace: 'pre-wrap', ...props.style }}>
                {processChildren(children)}
              </td>
            );
          },
          th: ({ node, children, ...props }) => {
            const processChildren = (children) => {
              return React.Children.map(children, (child) => {
                if (typeof child === 'string') {
                  const processed = convertHtmlBreaks(child);
                  return processed.split('\\n').map((line, index, array) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </React.Fragment>
                  ));
                }
                return child;
              });
            };
            return (
              <th {...props} style={{ whiteSpace: 'pre-wrap', ...props.style }}>
                {processChildren(children)}
              </th>
            );
          },
          // 处理段落中的HTML转义符号
          p: ({ node, children, ...props }) => {
            const processChildren = (children) => {
              return React.Children.map(children, (child) => {
                if (typeof child === 'string') {
                  const processed = convertHtmlBreaks(child);
                  return processed.split('\n').map((line, index, array) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </React.Fragment>
                  ));
                }
                return child;
              });
            };
            return <p {...props}>{processChildren(children)}</p>;
          },
          // 自定义代码块
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className={className} style={{ 
                background: '#f5f5f5', 
                padding: '2px 4px', 
                borderRadius: '2px',
                fontSize: '14px'
              }} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {markdownText}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownTab;

