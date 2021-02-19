# README

`react-rails-ssr` 是一个简单快速的生成器。 它基于 `react-rails` 快速在 `Rails` 上搭建一个同构渲染的应用。

这篇文章基本描述了该扩展的实现思路：[2020世代的现代前端——在Rails上搭建同构渲染](https://burogu.bubuyu.top/blogs/47)。

目前已经支持：

- [x] 基于 `react-dom/react-server-dom` 的服务端渲染。
- [x] 开箱即用的 `react-router` 支持。
- [x] 开箱即用的模块化 `css/scss` 支持。
- [x] `redux` 集成向导。

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
对象的，**这是您在使用 `prerender: true` 后引入样式文件会报错的根本原因**。

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

为保证服务端渲染与客户端二次渲染的数据一致性，基于 `react-rails-ssr` 的落地页需要提前在 `Controller` 层准备好数据：

```ruby

class ExampleController < ApplicationController
  def index
    # ...
    @react_props = {
      blogs: blogs,
      total: total
    }
  end
end
```

然后在入口页中注入它：

```erb
<%= react_component 'app', { path: request.path, react_props: @react_props }, { prerender: true } %>
```

最后您可以在对应组件中获取并初始化状态：

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

## Redux 集成向导

派生状态也许不是您想要的，推荐您使用 `redux` 来统一数据的分发与管理。

但无论如何都需要强调： 您应该更理性的考虑您的需求，**大部分 `SPA` 是不需要服务端渲染的**。

安装 `JavaScript` 依赖：

```bash
$ yarn add redux react-redux
```

然后调整入口组件，使用服务端数据初始化 `store`：

```jsx
// ...
export default props => {
    let initState = null;
    if (typeof window === 'undefined') {
        initState = props.react_props;
    } else {
        initState = window.__REACT_RAILS_SSR__;
        window.__REACT_RAILS_SSR__ = props.path;
    }

    const store = createStore(initState);
    return <Provider store={store}>
        <IsomorphicRouter path={props.path}>
            {/*  your app components  */}
        </IsomorphicRouter>
    </Provider>
}
```

分发数据至消费组件，：

```jsx
// ...
class Home extends React.Component {

    render() {
        const {title} = this.props;
        return <h1>{title}</h1>
    }
}

export default connect(state => state.blogPage)(Home);
```

当渲染的页面不是落地页时，需要从服务器拉取数据，可参考如下代码：

```jsx
// ...
class Home extends React.Component {

    componentDidMount() {
        if (window.__REACT_RAILS_SSR__ !== this.props.match.url) {
            this.props.fetchTitle(id);
        }
    }

    render() {
        const {title} = this.props;
        return <h1>{title}</h1>
    }
}

export default connect(state => state.blogPage,
    dispatch => {
        return {
            fetchTitle: id => dispatch(fetchTitle(id)),
        }
    })(Home);
```
