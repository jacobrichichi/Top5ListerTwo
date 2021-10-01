import React from "react";

export default class ItemCard extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            editing: false,
            text: this.props.name,
            index: this.props.index
            
        }
    }

    handleClick = (event) => {
        if(event.detail === 2){
            this.handleToggleEdit()
        }
    }

    handleToggleEdit = () => {
        this.setState({
            editing: !this.state.editing
        });
    }

    handleUpdate = (event) => {
        this.setState({ text: event.target.value });
    }

    handleKeyPress = (event) => {
        if(event.code === "Enter"){
            this.handleBlur();
        }
    }

    handleBlur = () => {
        this.props.renameItemCallback(this.props.index, this.state.text)
        this.handleToggleEdit();
    }

    handleDragStart = (event) => {
        this.props.sourceItemCallback(this.state.index);
    }

    handleDragOver = (event) => {
        event.preventDefault();
        this.props.targetItemCallback(this.state.index);
    }

    handleDragLeave = (event) => {
        event.preventDefault();
        this.props.targetItemCallback(-1);
    }

    handleDrop = (event) => {
        this.props.dragEndedCallback();
    }

    render(){
        if(this.state.editing){
            return(
                <div className = "top5-item">  
                    <input 
                        type = "text"
                        onKeyPress={this.handleKeyPress}
                        onBlur = {this.handleBlur}
                        onChange ={this.handleUpdate}
                        defaultValue = {this.props.text}
                        draggable = "false">

                    </input>


                </div>

            )
        }
        else{
            return (
                <div className = "top5-item" 
                onClick ={this.handleClick}
                draggable = "true"
                onDragStart = {this.handleDragStart}
                onDragOver = {this.handleDragOver}
                onDragLeave = {this.handleDragLeave}
                onDrop = {this.handleDrop}
                >
                    {this.props.text}
                </div>    
            )
        }
    }
}