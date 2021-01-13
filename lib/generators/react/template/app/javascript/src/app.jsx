import React from 'react';
import {Route, Switch, Link} from "react-router-dom";
import StyleContext from 'isomorphic-style-loader/StyleContext';
import IsomorphicRouter from './routes';
import withStyles from "./containers/withIsomorphicStyle";

import Home from './pages/home';
import About from './pages/about';
import Mine from './pages/mine';

import appStyle from './app.scss';

const App = withStyles(props => <IsomorphicRouter path={props.path} context={props.react_props}>
    <div id={appStyle.app}>
        <div id={appStyle.nav}>
            <Link to='/'>首页</Link>
            &nbsp;|&nbsp;
            <Link to='/about'>关于</Link>
            &nbsp;|&nbsp;
            <Link to='/mine'>我的</Link>
            <Switch>
                <Route exact path='/' component={Home}/>
                <Route path='/about' component={About}/>
                <Route path='/mine' component={Mine}/>
            </Switch>
        </div>
    </div>
</IsomorphicRouter>, appStyle);

const insertCss = typeof window !== "undefined" ? (...styles) => {
    const removeCss = styles.map(style => style._insertCss())
    return () => removeCss.forEach(dispose => dispose())
} : () => {
};

const Application = props => {
    return <StyleContext.Provider value={{insertCss}}>
        <App {...props}/>
    </StyleContext.Provider>
};

export default Application;