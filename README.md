# README

`react-rails-ssr` 是一个简单快速的生成器。 它基于 `react-rails` 快速在 `Rails` 上搭建一个同构渲染的应用。

这篇文章基本描述了该扩展的实现思路：[2020世代的现代前端——在Rails上搭建同构渲染](https://burogu.bubuyu.top/blogs/47)。

目前已经支持：

- [x] 基于 `react-dom/react-server-dom` 的服务端渲染
- [x] 自带 `react-router` 支持
- [x] 自带 `Scss` 支持

后续会补充一些内容，包括但不限于：

- [ ] 自带 `redux` 支持
- [ ] 模块化的 `css/scss/less`

**该扩展只是一个脚手架工具，您可以在执行安装后卸载它**。

## 安装

对于新项目（rails 5.2 以上）：

```bash
$ rails _your_version_ new your_app --webpack=react
```

将 `react-rails` 和 `react-rails-ssr` 添加到你的 `Gemfile`

```ruby
gem 'react-rails'
gem 'react-rails-ssr'
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
gem 'react-rails-ssr'
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

如果您是 `CRuby/MRI Ruby` 的用户，则您可以尝试在 `Gemfile` 中添加 `mini_racer` 来提升服务端渲染的速度，但使用 `CentOS` 的用户可能需要留意，实测该扩展无法在 `CentOS` 上安装。

```ruby
gem 'mini_racer'
```

## 其它

### 1. 数据的注水与脱水

在 `router` 的实现中已经加入了数据注入的环节，目前暂未做进一步的调优，如果您希望在首屏渲染时完成数据注入而不是二次渲染再拉取数据，则您可以参考如下几步操作：

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

#### 1.2 在入口页中注入它

```erb
<%= react_component 'app', { path: request.path, react_props: @react_props }, { prerender: true } %>
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
                total: [],
                blogs: []
            }
        }
    }
}
```

## 目前已知的事项

### 1. 无法在 `React` 组件中引入样式文件，以及单独在 `packs/application.scss` 中导入样式会出现首屏闪屏的情况。

由于 `react-rails` 的服务端渲染实现没有对样式等进行处理，渲染 `react` 组件的 `NodeJS`
服务实际被隐藏在了其自有实现中，样式的处理需要使用单独的 [isomorphic-style-loader](https://github.com/kriasoft/isomorphic-style-loader) 来处理。

目前暂时推荐单独引入样式文件到 `packs/application.scss` 。

也正是因为 `react-rails` 服务端首屏仅渲染了最基本的 `HTML`，只有客户端二次渲染时才会将样式注入到页面中。因此您可能在刷新页面时会看到闪屏现象。

在样式问题解决之前一个较为简单粗暴的解决方案是在 `Assets Pipeline` 的 `application.scss` 中加入 `React` 将要使用的样式文件，就像这样:

```scss
// app/assets/stylesheets/application.scss
...

@import "../../javascript/packs/react_ssr.scss";
...
```

