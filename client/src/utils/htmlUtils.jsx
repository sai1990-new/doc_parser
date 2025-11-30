import React from 'react';

// 处理HTML转义符号的工具函数

/**
 * 将HTML转义符号转换为实际换行
 * 处理 <br>, </br>, <br/>, <BR>, <Br> 等变体
 */
export function convertHtmlBreaks(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // 替换各种形式的<br>标签为换行符
  return text
    .replace(/<br\s*\/?>/gi, '\n')  // <br>, <br/>, <BR>, <Br/>
    .replace(/<\/br>/gi, '\n')       // </br>
    .replace(/&nbsp;/gi, ' ')       // &nbsp; 转换为空格
    .replace(/&lt;/g, '<')          // &lt; 转换为 <
    .replace(/&gt;/g, '>')          // &gt; 转换为 >
    .replace(/&amp;/g, '&')         // &amp; 转换为 &
    .replace(/&quot;/g, '"')        // &quot; 转换为 "
    .replace(/&#39;/g, "'")         // &#39; 转换为 '
    .trim();
}

/**
 * 将文本中的换行符转换为React元素（带<br />标签）
 */
export function textToReact(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // 先处理HTML转义符号
  const processedText = convertHtmlBreaks(text);
  
  // 将换行符转换为React Fragment
  return processedText.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
}

/**
 * 清理HTML标签（保留文本内容）
 */
export function stripHtmlTags(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  return text.replace(/<[^>]*>/g, '');
}

