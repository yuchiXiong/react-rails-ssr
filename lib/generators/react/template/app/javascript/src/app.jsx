import React from 'react';
import {Route, Switch, BrowserRouter, StaticRouter, Link} from "react-router-dom";

import Home from './pages/home';
import About from './pages/about';

const IsomorphicRouter = props => {
    const renderRouter = () => {
        if (typeof window !== 'undefined') {
            return <BrowserRouter>{props.children}</BrowserRouter>;
        } else {
            return (
                <StaticRouter location={props.path} context={props.context}>
                    {props.children}
                </StaticRouter>
            );
        }
    };
    return renderRouter();
}

const App = props => (
    <IsomorphicRouter path={props.path} context={props.react_props}>
        <div id="app">
            <div id="nav">
                <Link to='/'>首页</Link>
                &nbsp;|&nbsp;
                <Link to='/about'>关于</Link>
                <Switch>
                    <Route exact path='/' component={Home}/>
                    <Route path='/about' component={About}/>
                </Switch>
            </div>
        </div>
    </IsomorphicRouter>
)

export default App;