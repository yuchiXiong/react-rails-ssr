import React from 'react';
import mineStyle from './index.css';
import withStyles from "../../containers/withIsomorphicStyle";

// @withStyles(mineStyle)
class Mine extends React.Component {
    render() {
        return <div className={mineStyle.mineContainer}>
            <h1>mine</h1>
        </div>
    }
}

export default withStyles(Mine, mineStyle);