# 微博文功能使用说明

## 发布微博文

1. 打开 GitHub 仓库的 Issues 页面
2. 点击 "New Issue"
3. 填写内容：
   - 标题：随意（不会显示在博客）
   - 正文：微博文内容，支持 Markdown 格式
   - 可添加图片：直接拖拽或粘贴图片
4. 添加标签 `moment`（必须）
5. 可选添加其他标签用于分类（如 `技术`、`生活`）
6. 提交 Issue

## 自动同步

提交 Issue 后，GitHub Actions 会自动：
1. 拉取所有带 `moment` 标签的 Issues
2. 生成 `source/_data/shuoshuo.yml` 文件
3. 提交更改到仓库

## 手机发布

### 方式一：GitHub App
1. 下载 GitHub App
2. 进入仓库 → Issues → New Issue
3. 按上述步骤发布

### 方式二：网页
1. 手机浏览器打开 GitHub 仓库
2. 按上述步骤发布

## 评论功能

每条微博文支持独立评论，使用 Waline 评论系统。

## 配置选项

如果需要自定义配置，可以在 workflow 中设置：

```yaml
- name: Sync moments
  uses: panghutx/hexo-moments-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    label: 'shuoshuo'  # 自定义标签名称
    output-path: 'source/_data/moments.yml'  # 自定义输出路径
```

## 故障排查

### Issue 没有同步
- 检查 Issue 是否添加了正确的标签（默认 `moment`）
- 检查 GitHub Actions 是否运行成功
- 查看 Actions 日志获取详细错误信息

### 图片不显示
- 确保图片使用 Markdown 语法：`![alt](url)`
- 确保图片 URL 可访问
- GitHub 上传的图片会自动使用正确的 URL
