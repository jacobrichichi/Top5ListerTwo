import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * MoveItem_Transaction
 * 
 * This class represents a transaction that works with drag
 * and drop. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class MoveItem_Transaction extends jsTPS_Transaction {
    constructor(initApp, initSource, initTarget) {
        super();
        this.app = initApp;
        this.sourceItemIndex = initSource;
        this.targetItemIndex = initTarget;
    }

    doTransaction() {
        this.app.moveListItems(this.sourceItemIndex, this.targetItemIndex);
    }
    
    undoTransaction() {
        this.app.moveListItems(this.targetItemIndex, this.sourceItemIndex);
    }
}