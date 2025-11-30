import React, { useState, useEffect } from 'react';
import { Layout, message } from 'antd';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import './App.css';

const { Content } = Layout;

function App() {
  const [accessToken, setAccessToken] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parseResults, setParseResults] = useState({});
  const [config, setConfig] = useState({
    language_type: 'CHN_ENG',
    recognize_formula: false,
    analysis_chart: false,
    angle_adjust: false,
    parse_image_layout: false,
    switch_digital_width: 'auto'
  });

  // 加载保存的Token
  useEffect(() => {
    fetch('/api/token')
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          setAccessToken(data.token);
          setTokenValid(true);
        }
      })
      .catch(err => console.error('加载Token失败:', err));
  }, []);

  return (
    <Layout className="app-layout">
      <Content className="app-content">
        <div className="app-container">
          <LeftPanel
            accessToken={accessToken}
            setAccessToken={setAccessToken}
            tokenValid={tokenValid}
            setTokenValid={setTokenValid}
            files={files}
            setFiles={setFiles}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            config={config}
            setConfig={setConfig}
            parseResults={parseResults}
            setParseResults={setParseResults}
          />
          <CenterPanel
            selectedFile={selectedFile}
            files={files}
          />
          <RightPanel
            selectedFile={selectedFile}
            parseResults={parseResults}
          />
        </div>
      </Content>
    </Layout>
  );
}

export default App;

