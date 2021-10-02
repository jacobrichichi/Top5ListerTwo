import React from "react";
import ItemCard from "./ItemCard";

export default class Workspace extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            sourceItemIndex: -1,
            targetItemIndex: -1
        }
    }

    setSourceItemIndex = (index) => {
        this.setState({sourceItemIndex: index});
    }

    setTargetItemIndex = (index) => {
        this.setState({targetItemIndex: index});
    }

    dragEnded = () => {
        if(this.state.targetItemIndex !== -1){
            this.props.moveListItemsCallback(this.state.sourceItemIndex, this.state.targetItemIndex);
        }
        this.setState({sourceItemIndex: -1, targetItemIndex: -1})
    }

    render() {
        let jsx = '';
        if(this.props.currentList!==null){
            jsx = 
                this.props.currentList.items.map((item, index)=> 
                    (
                        <div className = "item-row">
                            <div className = "item-number">{index + 1}.</div>
                            <ItemCard 
                            index= {index} 
                            text = {item}
                            renameItemCallback = {this.props.renameItemCallback}
                            sourceItemCallback = {this.setSourceItemIndex}
                            targetItemCallback = {this.setTargetItemIndex}
                            dragEndedCallback = {this.dragEnded}
                            toggleEditCallback = {this.props.toggleEditCallback}></ItemCard>
                        </div>
                    )
                )
            }    
        return (
            <div id="top5-workspace">
                <div id="workspace-edit">
                    <div id="edit-numbering">
                       {jsx}
                    </div>    
                </div>
            </div>
        )
    }
}