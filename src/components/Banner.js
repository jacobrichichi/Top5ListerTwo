import React from "react";
import EditToolbar from "./EditToolbar";

export default class Banner extends React.Component {
    render() {
        return (
            <div id="top5-banner">
                {this.props.title}
                <EditToolbar
                closeCallback = {this.props.closeCallback}
                undoCallback = {this.props.undoCallback}
                redoCallback = {this.props.redoCallback}
                undoEnabled = {this.props.undoEnabled}
                redoEnabled = {this.props.redoEnabled}
                closeListEnabled = {this.props.closeListEnabled}/>
            </div>
        );
    }
}