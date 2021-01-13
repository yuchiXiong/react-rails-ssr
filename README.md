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

`react-rails` 仅提供了最基础的 `prerender` 方案用来将 `React` 组件预渲染为静态 `HTML` 标签。由于服务端无法识别样式文件，因而当组件开启 `prerender` 时引入样式文件会报错。

`react-rails-ssr` 在 `react-rails` 的基础上配置了 [isomorphic-style-loader](https://github.com/kriasoft/isomorphic-style-loader)
，使之能够解析并注入样式到静态 `HTML` 字符串模板上，就像 `style-loader` 一样。

> 不过由于 `react_component view helper` 方法仅预渲染了组件，因而 `react-rails-ssr`
找不到合适的时机将提取到的 `css` 字符串注入到页面的 `head` 标签中，目前只能在渲染首屏时将样式注入到 `body` 标签中。二次渲染时这些样式标签将被利用客户端 `API` 添加到 `head`
标签中，它带来的副作用是您可能会在控制台看到服务端模板与客户端模板不一致的警告。

无需 `*.module.scss` 即可直接使用模块特性：

```jsx
import homeStyles from 'home.scss';
```

为了使样式能在首屏更好的被注入到页面中，您需要配合使用 `withStyles` 高阶组件，它与 `cssModule` 等高阶组件类似：

```jsx
import homeStyles from 'home.scss';
import withStyles from 'containers/withIsomorphicStyle';

class Home extends React.Component {
    //  ...
}

export default withStyles(Home, homeStyles);
```

您也可以使用装饰器用法，不过前提是您需要在项目中配置，将下面内容加入到项目根目录下的 `babel.config.js` 中的 `plugins` 数组中：

```js
["@babel/plugin-proposal-decorators", {"legacy": true}]
```

然后安装依赖

```shell
$ npm install --save-dev @babel/plugin-proposal-decorators
# or
$ yarn add -D @babel/plugin-proposal-decorators
```

此时您可以以一种更清晰的方式组织您的组件：

```jsx
import React from 'react';
import {connect} from 'react-redux';
import withStyles from 'containers/withIsomorphicStyle';
import homeStyles from 'home.scss';

@withStyles(homeStyles)
@connect(stat => {
}, dispatch => {
})
class Home extends React.Component {
}

export default Home
```

## 数据注水与脱水

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