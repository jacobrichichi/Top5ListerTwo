import React from 'react';
import './App.css';

import jsTPS from "./common/jsTPS";
import ChangeItem_Transaction from "./transactions/ChangeItem_Transaction.js";
import MoveItem_Transaction from "./transactions/MoveItem_Transaction.js";
// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js'

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        this.tps = new jsTPS();

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            sessionData : loadedSessionData,
            listKeyPairMarkedForDeletion : null,
            editing: false,
            undoEnabled: false,
            redoEnabled: false,
            closeListEnabled: false,
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
        });
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    confirmedListDeletion = () => {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
        let pairToBeDeleted = this.state.listKeyPairMarkedForDeletion;
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            if (newKeyNamePairs[i].key === pairToBeDeleted.key) {
                newKeyNamePairs.splice(i, 1);
            }
        }
        if(this.state.currentList.key===pairToBeDeleted.key){
            this.closeCurrentList();
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            this.db.mutationUpdateSessionData(this.state.sessionData);
        }
        )

    }


    addRenameItemTransaction = (index, oldName, newName) => {
        let transaction = new ChangeItem_Transaction(this, index, oldName, newName);
        this.tps.addTransaction(transaction);
        this.updateEditToolbarVariables();
        
    }

    renameItem = (index, newName) => {
        let newList = this.state.currentList;

        newList.items[index] = newName;
        this.setState(prevState => ({
            currentList: newList,
            sessionData: prevState.sessionData

        }), () => {
            let list = this.db.queryGetList(newList.key);
            list.items[index] = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        })
    }

    addMoveItemsTransaction = (source, target) => {
        let transaction = new MoveItem_Transaction(this, source, target);
        this.tps.addTransaction(transaction);
        this.updateEditToolbarVariables();
    }

    moveListItems = (source, target) => {
        let list = this.state.currentList;
        let items = list.items;
        let sourceItem = items[source];

        if(source>target){
            for(let i = source-1; i>=target; i--){
               items[i+1] = items[i];
            }
        }

        else{
            for(let i = source+1; i<=target; i++){
                items[i-1] = items[i];
            }
        }
        items[target] = sourceItem;
        list.items = items;

        this.setState(prevState => ({
            currentList: list,
            sessionData: prevState.sessionData

        }), () => {
            let newList = this.db.queryGetList(list.key);
            newList.items = items;
            this.db.mutationUpdateList(newList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        })

    }

    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            currentList: newCurrentList,
            sessionData: prevState.sessionData
        }), () => {
            this.setState({closeListEnabled: true})
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData
        }), () => {
            this.setState({closeListEnabled: false});
            this.tps.clearAllTransactions();
            this.updateEditToolbarVariables();
        });
    }
    deleteList = (keyPair) => {
        // SOMEHOW YOU ARE GOING TO HAVE TO FIGURE OUT
        // WHICH LIST IT IS THAT THE USER WANTS TO
        // DELETE AND MAKE THAT CONNECTION SO THAT THE
        // NAME PROPERLY DISPLAYS INSIDE THE MODAL
        this.setState(prevState => ({ 
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: keyPair,
            sessionData: prevState.sessionData
        }))
        this.showDeleteListModal();
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal = (event) => {
        this.setState(prevState => ({ 
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: null,
            sessionData: prevState.sessionData
        }))
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }

    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.updateEditToolbarVariables();
        }
    }

    redo = () => {
        if (this.tps.hasTransactionToRedo()){
            this.tps.doTransaction();
            this.updateEditToolbarVariables();
        }
    }

    toggleEdit = (isEditing) => {
        this.setState({
            editing: isEditing
        })
    }

    updateEditToolbarVariables = () => {
        this.setState({
            undoEnabled: this.tps.hasTransactionToUndo(),
            redoEnabled: this.tps.hasTransactionToRedo()});
    }



    render() {
        document.addEventListener('keydown', (event) => {
            if(!this.state.editing){
                console.log('hi')
                if (event.keyCode === 88) {
                    this.undo();
                }
                else if(event.keyCode === 89){
                    this.redo();
                }
            }
        })

        return (
            <div id="app-root">
                <Banner 
                    title='Top 5 Lister'
                    closeCallback={this.closeCurrentList}
                    undoCallback = {this.undo}
                    redoCallback = {this.redo}
                    undoEnabled = {this.state.undoEnabled}
                    redoEnabled = {this.state.redoEnabled}
                    closeListEnabled = {this.state.closeListEnabled} />
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                    toggleEditCallback = {this.toggleEdit}
                    addListEnabled = {!this.state.closeListEnabled}
                />
                <Workspace
                    currentList={this.state.currentList}
                    renameItemCallback={this.addRenameItemTransaction}
                    moveListItemsCallback = {this.addMoveItemsTransaction}
                    toggleEditCallback = {this.toggleEdit} />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    confirmDeleteListCallback = {this.confirmedListDeletion}
                    listKeyPair = {this.state.listKeyPairMarkedForDeletion}
                />
            </div>
        );
    }
}

export default App;
