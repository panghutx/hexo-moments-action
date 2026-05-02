#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// 从环境变量读取配置
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const LABEL = process.env.LABEL || 'moment';
const OUTPUT_PATH = process.env.OUTPUT_PATH || 'source/_data/shuoshuo.yml';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// 验证必需的环境变量
if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

if (!REPO_OWNER || !REPO_NAME) {
  console.error('Error: REPO_OWNER and REPO_NAME environment variables are required');
  process.exit(1);
}

// 调用 GitHub API
function fetchIssues() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=${LABEL}&state=open&sort=created&direction=desc&per_page=100`,
      method: 'GET',
      headers: {
        'User-Agent': 'hexo-moments-action',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// 解析 Issue 内容，提取图片
function parseContent(body) {
  if (!body) return { content: '', images: [] };

  // 匹配 Markdown 图片语法: ![alt](url)
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const images = [];
  let match;

  while ((match = imageRegex.exec(body)) !== null) {
    images.push(match[1]);
  }

  // 移除图片语法，保留纯文本
  let content = body.replace(imageRegex, '').trim();

  // 如果有图片，在内容末尾添加图片标签
  if (images.length > 0) {
    const imageTags = images.map(url => `\n<img src="${url}" alt="moment image">`).join('');
    content = content + imageTags;
  }

  return { content, images };
}

// 转换为 shuoshuo.yml 格式
function convertToShuoshuo(issues) {
  return issues.map(issue => {
    const { content } = parseContent(issue.body);

    return {
      date: issue.created_at,
      content: content,
      tags: issue.labels.map(l => l.name).filter(n => n !== LABEL),
      key: `moment-${issue.number}`
    };
  });
}

// 生成 YAML 文件
function generateYaml(data) {
  let yaml = '# 由 GitHub Issues 自动生成，请勿手动编辑\n\n';

  data.forEach(item => {
    yaml += `- date: ${item.date}\n`;
    yaml += `  content: |\n`;
    // 处理多行内容，添加缩进
    const lines = item.content.split('\n');
    lines.forEach(line => {
      yaml += `    ${line}\n`;
    });
    if (item.tags.length > 0) {
      yaml += `  tags:\n`;
      item.tags.forEach(tag => {
        yaml += `    - ${tag}\n`;
      });
    }
    yaml += `  key: ${item.key}\n`;
    yaml += '\n';
  });

  return yaml;
}

// 主函数
async function main() {
  try {
    console.log('Fetching issues from GitHub...');
    const issues = await fetchIssues();
    console.log(`Found ${issues.length} issues with label "${LABEL}"`);

    const shuoshuoData = convertToShuoshuo(issues);
    const yaml = generateYaml(shuoshuoData);

    // 确保输出目录存在
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, yaml, 'utf8');
    console.log(`Generated shuoshuo.yml at ${OUTPUT_PATH}`);
    console.log(`::set-output name=issue_count::${issues.length}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
