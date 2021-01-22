# README

`react-rails-ssr` 是一个简单快速的生成器。 它基于 `react-rails` 快速在 `Rails` 上搭建一个同构渲染的应用。

这篇文章基本描述了该扩展的实现思路：[2020世代的现代前端——在Rails上搭建同构渲染](https://burogu.bubuyu.top/blogs/47)。

目前已经支持：

- [x] 基于 `react-dom/react-server-dom` 的服务端渲染
- [x] 开箱即用的 `react-router` 支持
- [x] 开箱即用的模块化 `css/scss` 支持

后续会补充一些内容，包括但不限于：

- [ ] 自带 `redux` 支持

**该扩展只是一个脚手架工具，您可以在执行安装后卸载它**。

## 安装

对于新项目（rails 5.2 以上）：

```bash
$ rails _your_version_ new your_app --webpack=react
```

将 `react-rails` 和 `react-rails-ssr` 添加到你的 `Gemfile`

```ruby
gem 'react-rails'
gem 'react-rails-ssr', github: 'yuchiXiong/react-rails-ssr'
```

然后执行:

```bash
$ bundle install
$ rails g react:install
$ rails g react:ssr
```

对于已有项目（rails 5.2 以上）：

添加依赖到你的 `Gemfile`

```ruby
gem 'webpacker'
gem 'react-rails'
gem 'react-rails-ssr', github: 'yuchiXiong/react-rails-ssr'
```

然后执行:

```bash
$ bundle install
$ rails webpacker:install
$ rails webpacker:install:react
$ rails g react:install
$ rails g react:ssr
```

它将在您的项目中添加默认路由与视图，完成安装后启动并访问项目根路径即可看到演示应用。

如果您是 `CRuby/MRI Ruby` 的用户，则您可以尝试在 `Gemfile` 中添加 `mini_racer` 来提升服务端渲染的速度，但使用 `CentOS` 的用户可能需要留意，实测该扩展无法在 `CentOS 7` 上安装。

```ruby
gem 'mini_racer'
```

## 样式模块化

`webpacker` 开箱即用的支持 `css/scss/cssModule/scssModule` 。其默认配置遵循如下原则：

- 当 `webpacker.yml` 中的 `extract_css` 为 `false` 时，使用 `style-loader` 动态的将样式注入到页面中。
- 当 `webpacker.yml` 中的 `extract_css` 为 `true` 时，使用 `mini-css-extract-plugin` 提取样式并打包为单文件。

在不讨论渲染环境的情况下，`style-loader` 将样式注入到页面最直接简单的方式就是使用 `DOM` 操作实现，但服务端渲染期是无法访问 `document/window`
对象的，这是您在使用 `prerender: true` 后引入样式文件会报错的根本原因。

`react-rails-ssr` 尝试使用 `isomorphic-style-loader` 来替代 `style-loader` 实现注入，但 `react-rails` 无法干预定义在 `erb/slim/haml`
中的 `head` 标签，因此最终还是选择了基于 `extract_css: true` 的方式来解决样式的问题，这也意味着 `rails g react:ssr` 的环节会自动修改 `webpacker.yml`
的 `extract_css` 为 `true` 。

最后，您可以在组件中自由的引入样式。和 `react-rails` 一样，即便没有使用 `import` 引入样式，位于组件目录（`react-rails` 是 `components` 而 `react-rails-ssr`
是 `src`
）下的样式文件依然会被自动打包。我们推荐使用 `css module` 的方式来引入组件样式：

```jsx
import React from 'react';

// 全局样式直接引入
import './App.css';
import 'antd/dist/antd.css';

// 组件样式使用模块化引入
import styles from './index.scss';

export default () => {
    return <>
        <h1 className={styles.title}>Hello! React Rails SSR!</h1>
    </>
}
```

## 数据注水与脱水

**该方案仅供参考**

如果您希望在首屏渲染时完成数据注入而不是二次渲染组件挂载后再拉取数据，则您可以参考如下几步操作：

#### 1.1 在 `controller` 层准备需要注入的数据

```ruby
class ExampleController < ApplicationController
  def index
  ...
    @react_props = {
      blogs: blogs,
      total: total
    }
  end
end
```

#### 1.2 在入口页将数据传入服务端组件 && 注入数据到页面
**按照下面方法注入时需要对json数据添加 `html_safe`，否则 `JSON` 数据会出现被转义而无法在客户端解析的情况。**
```erb
<%= react_component 'app', { path: request.path, react_props: @react_props }, { prerender: true } %>
<script>
    window.__REACT_RAILS_SSR__ =
    <%= @react_props.to_json.html_safe %>
</script>
```

#### 1.3 在对应组件中获取并初始化状态

```javascript
class Excample extends React.Component {
    constructor(props) {
        if (typeof window === "undefined") {
            this.state = {
                total: props.staticContext.total,
                blogs: props.staticContext.blogs
            }
        } else {
            this.state = {
                total: window.__REACT_RAILS_SSR__.total,
                blogs: window.__REACT_RAILS_SSR__.blogs
            }
        }
    }
}
```
