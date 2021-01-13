import React from 'react';
import {default as IsomorphicWithStyle} from 'isomorphic-style-loader/withStyles'

function withStyles(WrappedComponent, style) {
    return IsomorphicWithStyle(style)(props => <>
        <WrappedComponent {...props}/>
        <style>
            {style._getCss()}
        </style>
    </>)
}


export default withStyles;