function InputManager() {
    if (window === this) {
        return new InputManager();
    }

    this.DEFAULT_COMMANDS = [['h', 'v', 'f', 'b'], ['v', 'f', 'b', 'h'], ['f', 'b', 'h', 'v'], ['b', 'h', 'v', 'f']];
    this.DEFAULT_DRAW_STRING = 'hvfb,vfbh,fbhv,bhvf';
    this.drawCommands = this.DEFAULT_COMMANDS;
    this.urlFriendlyDrawString = this.DEFAULT_DRAW_STRING;

    this.cursorLocation = [3,4];

    return this;
}

InputManager.prototype = {

    handleKeyPress: function(keyCode) {
        switch(keyCode) {
            case 72: /* h */
            case 86: /* v */
            case 70: /* f */
            case 66: /* b */
                this.insertControlCharacter(String.fromCharCode(keyCode).toLowerCase());
                this.cursorLocation[1]++;
                break;
            case 188: /* comma */
                this.insertControlCharacter(",");
                this.cursorLocation[0]++;
                this.cursorLocation[1] = 0;
                break;
            case 67: /* c */
                this.resetInput();
                break;
            case 37: /* LEFT */
                this.moveCursorLeft();
                break;
            case 39: /* RIGHT */
                this.moveCursorRight();
                break;
            case 8: /* BACKSPACE */
                this.removeControlCharacter();
                break;
            default:
                console.log("Invalid key, inserting null");
            case 78: /* n */
                this.insertControlCharacter("n");
                this.cursorLocation[1]++;
                break;
        }

        this.updateDrawCommands(document.getElementById("draw_controls").value);
    },

    moveCursorLeft: function() {
        console.log(this.drawCommands);
        var gridY = this.cursorLocation[0];
        var gridX = this.cursorLocation[1];

        if (gridX <= 0) {
            if (gridY > 0) {
                gridY--;
                gridX = this.drawCommands[gridY].length;
            }
        } else {
            gridX--;
        }

        this.cursorLocation[0] = gridY;
        this.cursorLocation[1] = gridX;
        console.log(this.cursorLocation);
    },

    moveCursorRight: function() {
        console.log(this.drawCommands);
        var gridY = this.cursorLocation[0];
        var gridX = this.cursorLocation[1];

        if (gridX >= this.drawCommands[gridY].length) {
            if (gridY < this.drawCommands.length - 1) {
                gridY++;
                gridX = 0;
            }
        } else {
            gridX++;
        }

        this.cursorLocation[0] = gridY;
        this.cursorLocation[1] = gridX;
        console.log(this.cursorLocation);
    },

    resetInput: function() {
        this.drawCommands = this.DEFAULT_COMMANDS;
        this.urlFriendlyDrawString = this.DEFAULT_DRAW_STRING;
        this.cursorLocation = [3, 4]; // Yes, yes, this is bad. I have my reasons.
        document.getElementById("draw_controls").value = this.DEFAULT_DRAW_STRING;
    },

    /* Here we harmonize the need to represent the controls minimally in the URL/input-div and
     * maximally in the back-end array. 'n' characters are input as necessary to match the cursor location */
    insertControlCharacter: function(character) {
        var currentControlRows = this.urlFriendlyDrawString.split(",");
        var controlStringRow = currentControlRows[this.cursorLocation[0]];

        var blanksToInsert = this.cursorLocation[1] - controlStringRow.length;
        if (blanksToInsert < 0)
            blanksToInsert = 0;

        controlStringRow = controlStringRow.slice(0, this.cursorLocation[1])
                               + 'n'.repeat(blanksToInsert)
                               + character
                               + controlStringRow.slice(this.cursorLocation[1]);

        currentControlRows[this.cursorLocation[0]] = controlStringRow;

        var newControlString = "";
        for (var index = 0; index < currentControlRows.length; index++) {
            newControlString += currentControlRows[index];

            if (index != currentControlRows.length - 1)
                newControlString += ','
        }

        document.getElementById("draw_controls").value = newControlString;
    },

    removeControlCharacter: function() {
        if (this.cursorLocation[1] == 0) {
            // Case 1: Return because there is nothing to remove
            if (this.cursorLocation[0] == 0)
                return;

            // Case 2: Append current line to previous line
            var currentControlRows = this.urlFriendlyDrawString.split(",");
            var prevIndex = this.cursorLocation[0] - 1;
            var newCursorIndexX = currentControlRows[prevIndex].length;

            currentControlRows[prevIndex] = currentControlRows[prevIndex]
                                                + 'n'.repeat(this.drawCommands[prevIndex].length - currentControlRows[prevIndex].length)
                                                + currentControlRows[this.cursorLocation[0]];

            var newControlString = "";
            for (var index = 0; index < currentControlRows.length; index++) {
                if (index != this.cursorLocation[0])
                    newControlString += currentControlRows[index];

                if (index != this.cursorLocation[0] - 1 && index != currentControlRows.length - 1)
                    newControlString += ',';
            }

            document.getElementById("draw_controls").value = newControlString;
            this.cursorLocation[0]--;
            this.cursorLocation[1] = newCursorIndexX;
        } else {
            // Case 3: Remove current character
            var currentControlRows = this.urlFriendlyDrawString.split(",");
            var controlStringRow = currentControlRows[this.cursorLocation[0]];

            controlStringRow = controlStringRow.slice(0, this.cursorLocation[1] - 1)
                                   + controlStringRow.slice(this.cursorLocation[1]);
            currentControlRows[this.cursorLocation[0]] = controlStringRow;

            var newControlString = "";
            for (var index = 0; index < currentControlRows.length; index++) {
                newControlString += currentControlRows[index];

                if (index != currentControlRows.length - 1)
                    newControlString += ',';
            }

            document.getElementById("draw_controls").value = newControlString;
            this.cursorLocation[1]--;
        }

        return;
    },

    updateDrawCommands: function(newCommandText) {
        var newDrawCommands = [[]];
        var row = 0;
        var rowLength = 0;
        var maxRowLength = 0;
        this.urlFriendlyDrawString = '';

        // For compatibility's sake...
        newCommandText = this.translateUrlCharacters(newCommandText);

        for (var index = 0; index < newCommandText.length; index++) {
            switch (newCommandText[index].toLowerCase()) {
                case 'h':
                case 'v':
                case 'f':
                case 'b':
                case 'n':
                    newDrawCommands[row].push(newCommandText[index]);
                    this.urlFriendlyDrawString += newCommandText[index];
                    rowLength++;
                    break;
                case ',':
                    newDrawCommands.push([]);
                    this.urlFriendlyDrawString += ',';
                    rowLength = 0;
                    row++;
                    break;
                case ' ':
                    newDrawCommands[row].push('n');
                    this.urlFriendlyDrawString += 'n';
                    rowLength++;
                    break;
                default:
                    console.error("Invalid character: " + newCommandText[index]);
			}

            maxRowLength = Math.max(maxRowLength, rowLength);
        }

        // Even out the rows if left uneven
        for (var row = 0; row < newDrawCommands.length; row++) {
            for (var unfilledColumn = maxRowLength - newDrawCommands[row].length;
                                    unfilledColumn > 0; unfilledColumn--) {
                newDrawCommands[row].push(' ');
            }
        }

        this.drawCommands = newDrawCommands;
    },

    ingestUrlParameters: function() {
        if (location.search != "") {
            var newCommandText = this.translateUrlCharacters(location.search.slice(1, location.search.length));
            console.log("Commands ingested from URL: " + newCommandText);

            this.updateDrawCommands(newCommandText);
            document.getElementById("draw_controls").value = newCommandText;

            var newCommandRows = newCommandText.split(",");
            this.cursorLocation[0] = newCommandRows.length - 1;
            this.cursorLocation[1] = newCommandRows[this.cursorLocation[0]].length - 1;
        }
    },

    translateUrlCharacters: function(commandText) {
        commandText = commandText.replace(/%2C/g, ",");
		commandText = commandText.replace(/%20/g, " ");
		return commandText;
	}
}
