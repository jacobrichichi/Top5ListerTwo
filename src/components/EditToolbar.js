import React from "react";

export default class EditToolbar extends React.Component {
    render() {        
        return (
            <div id="edit-toolbar">
                <button
                    id='undo-button' 
                    className="top5-button"
                    onClick = {this.props.undoCallback}
                    disabled = {!this.props.undoEnabled}>
                        &#x21B6;
                </button>
                <button
                    id='redo-button'
                    className="top5-button"
                    onClick = {this.props.redoCallback}
                    disabled = {!this.props.redoEnabled}>
                        &#x21B7;
                </button>
                <button
                    id='close-button'
                    className="top5-button"
                    disabled = {!this.props.closeListEnabled}
                    onClick = {this.props.closeCallback}>
                        &#x24E7;
                </button>
            </div>
        )
    }
}