import React, { useMemo } from 'react';
import { Empty, Card, Table } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { convertHtmlBreaks, textToReact } from '../../utils/htmlUtils';

function TableTab({ result }) {
  const tables = useMemo(() => {
    if (!result.jsonContent || !result.jsonContent.pages) {
      return [];
    }

    const allTables = [];
    result.jsonContent.pages.forEach((page, pageIndex) => {
      if (page.tables && page.tables.length > 0) {
        page.tables.forEach((table, tableIndex) => {
          allTables.push({
            ...table,
            pageNum: page.page_num || pageIndex + 1,
            tableIndex: tableIndex + 1
          });
        });
      }
    });

    return allTables;
  }, [result.jsonContent]);

  if (tables.length === 0) {
    return <Empty description="暂无表格数据" />;
  }

  // 将Markdown表格转换为Ant Design Table的数据格式
  const parseMarkdownTable = (markdown) => {
    if (!markdown) return null;

    const lines = markdown.trim().split('\n');
    if (lines.length < 3) return null;

    // 解析表头
    const headerLine = lines[0];
    const separatorLine = lines[1];
    
    // 检查是否是有效的Markdown表格
    if (!separatorLine.includes('|') || !separatorLine.includes('-')) {
      return null;
    }

    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
    const data = [];

    // 解析数据行
    for (let i = 2; i < lines.length; i++) {
      const row = lines[i].split('|').map(cell => cell.trim()).filter((cell, idx) => idx > 0 && idx <= headers.length);
      if (row.length === headers.length) {
        const rowData = {};
        headers.forEach((header, idx) => {
          rowData[header] = row[idx] || '';
        });
        data.push(rowData);
      }
    }

    return { headers, data };
  };

  return (
    <div style={{ padding: '16px' }}>
      {tables.map((table, index) => {
        const parsedTable = table.markdown ? parseMarkdownTable(table.markdown) : null;
        const tableColumns = parsedTable ? parsedTable.headers.map(header => ({
          title: header,
          dataIndex: header,
          key: header,
          render: (text) => {
            if (!text) return '-';
            // 先处理HTML转义符号，再处理\n
            const processedText = convertHtmlBreaks(String(text));
            const textWithBreaks = processedText.split('\\n').map((line, index, array) => (
              <React.Fragment key={index}>
                {line}
                {index < array.length - 1 && <br />}
              </React.Fragment>
            ));
            return <div style={{ whiteSpace: 'pre-wrap' }}>{textWithBreaks}</div>;
          }
        })) : [];

        return (
          <Card
            key={index}
            title={`表格 ${table.tableIndex} (第 ${table.pageNum} 页)`}
            style={{ marginBottom: 16 }}
          >
            {table.markdown ? (
              <div>
                {parsedTable && parsedTable.data.length > 0 ? (
                  // 使用Ant Design Table渲染
                  <Table
                    columns={tableColumns}
                    dataSource={parsedTable.data.map((row, idx) => ({ ...row, key: idx }))}
                    pagination={false}
                    size="small"
                    bordered
                    style={{ marginBottom: 16 }}
                  />
                ) : (
                  // 如果解析失败，使用Markdown渲染
                  <div className="table-container">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ node, ...props }) => (
                          <div style={{ overflowX: 'auto', margin: '16px 0' }}>
                            <table {...props} className="markdown-table" />
                          </div>
                        ),
                        td: ({ node, children, ...props }) => {
                          // 处理单元格中的\n换行符
                          const processChildren = (children) => {
                            return React.Children.map(children, (child) => {
                              if (typeof child === 'string') {
                                // 将字符串中的\n转换为换行
                                return child.split('\\n').map((line, index, array) => (
                                  <React.Fragment key={index}>
                                    {line}
                                    {index < array.length - 1 && <br />}
                                  </React.Fragment>
                                ));
                              }
                              if (React.isValidElement(child) && child.props && child.props.children) {
                                // 递归处理子元素
                                return React.cloneElement(child, {
                                  ...child.props,
                                  children: processChildren(child.props.children)
                                });
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
                          // 表头也处理换行和HTML转义符号
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
                              if (React.isValidElement(child) && child.props && child.props.children) {
                                return React.cloneElement(child, {
                                  ...child.props,
                                  children: processChildren(child.props.children)
                                });
                              }
                              return child;
                            });
                          };
                          return (
                            <th {...props} style={{ whiteSpace: 'pre-wrap', ...props.style }}>
                              {processChildren(children)}
                            </th>
                          );
                        }
                      }}
                    >
                      {table.markdown}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#999' }}>表格内容为空</div>
            )}
            {table.table_title_id && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                表格标题ID: {table.table_title_id}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export default TableTab;

