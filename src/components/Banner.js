import React from "react";
import EditToolbar from "./EditToolbar";

export default class Banner extends React.Component {
    render() {
        return (
            <div id="top5-banner">
                {this.props.title}
                <EditToolbar
                undoCallback = {this.props.undoCallback}
                redoCallback = {this.props.redoCallback} />
            </div>
        );
    }
}