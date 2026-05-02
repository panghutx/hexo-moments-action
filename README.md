# Hexo Moments Sync Action

一个 GitHub Action，用于将 GitHub Issues 自动同步为 Hexo 博客的微博文（moments/说说）数据文件。

## ✨ 特性

- 🚀 自动同步 GitHub Issues 到 Hexo 数据文件
- 🏷️ 支持标签过滤和分类
- 🖼️ 支持 Markdown 图片语法
- 📱 支持手机端发布（通过 GitHub App 或网页）
- ⚡ 自动触发，无需手动操作
- 🔧 高度可配置

## 📦 使用方法

### 1. 在你的 Hexo 仓库中创建 workflow

创建文件 `.github/workflows/moments.yml`：

```yaml
name: Sync Moments

on:
  issues:
    types: [opened, edited, closed, reopened, labeled, unlabeled]
  workflow_dispatch:

permissions:
  contents: write
  issues: read

jobs:
  sync:
    runs-on: ubuntu-latest
    if: github.event_name == 'workflow_dispatch' || contains(github.event.issue.labels.*.name, 'moment')

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Sync moments
        uses: panghutx/hexo-moments-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit and push changes
        if: steps.sync.outputs.has-changes == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add source/_data/shuoshuo.yml
          git commit -m "chore: sync moments from issues [skip ci]"
          git push
```

### 2. 发布微博文

1. 打开 GitHub 仓库的 Issues 页面
2. 点击 "New Issue"
3. 填写内容：
   - 标题：随意（不会显示在博客）
   - 正文：微博文内容，支持 Markdown 格式
   - 可添加图片：直接拖拽或粘贴图片
4. 添加标签 `moment`（必须）
5. 可选添加其他标签用于分类（如 `技术`、`生活`）
6. 提交 Issue

### 3. 自动同步

提交 Issue 后，GitHub Actions 会自动：
1. 拉取所有带 `moment` 标签的 Issues
2. 生成 `source/_data/shuoshuo.yml` 文件
3. 提交更改到仓库

## ⚙️ 配置选项

| 参数 | 说明 | 必需 | 默认值 |
|------|------|------|--------|
| `github-token` | GitHub token | 是 | `${{ github.token }}` |
| `repo-owner` | 仓库所有者 | 否 | `${{ github.repository_owner }}` |
| `repo-name` | 仓库名称 | 否 | `${{ github.event.repository.name }}` |
| `label` | 筛选标签 | 否 | `moment` |
| `output-path` | 输出文件路径 | 否 | `source/_data/shuoshuo.yml` |

### 自定义配置示例

```yaml
- name: Sync moments
  uses: panghutx/hexo-moments-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    label: 'shuoshuo'  # 使用自定义标签
    output-path: 'source/_data/moments.yml'  # 自定义输出路径
```

## 📤 输出

| 输出 | 说明 |
|------|------|
| `has-changes` | 是否有变更需要提交 (`true`/`false`) |
| `issue-count` | 同步的 Issue 数量 |

## 📱 手机发布

### 方式一：GitHub App
1. 下载 GitHub App
2. 进入仓库 → Issues → New Issue
3. 按上述步骤发布

### 方式二：网页
1. 手机浏览器打开 GitHub 仓库
2. 按上述步骤发布

## 🔧 工作原理

1. 监听 Issues 的创建、编辑、关闭、重新打开、标签变更事件
2. 筛选带有指定标签（默认 `moment`）的 Issues
3. 提取 Issue 内容和图片
4. 生成 YAML 格式的数据文件
5. 自动提交到仓库

## 📝 生成的数据格式

```yaml
- date: 2024-05-02T08:00:00Z
  content: |
    这是一条微博文内容
    <img src="https://example.com/image.jpg" alt="moment image">
  tags:
    - 技术
    - 生活
  key: moment-123
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
