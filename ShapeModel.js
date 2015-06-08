function ShapeModel(svgPane) {
    if (svgPane) {
        if (window === this) {
            return new ShapeModel(svgPane);
        }

        this.svgPane = svgPane;
        return this;

    } else {
        return undefined;
    }
}

ShapeModel.prototype = {

    drawHorizontalSVGBox: function(linesToDraw, boxBaseX, boxBaseY,
                                  boxSizeX, boxSizeY, lineColor) {

        for(var lineNumber = 0; lineNumber < linesToDraw; lineNumber++) {
            var lineStartX = boxBaseX;
            var lineStartY = boxBaseY + ((lineNumber / (linesToDraw - 1)) * boxSizeY);
            var lineEndX = boxBaseX + boxSizeX;
            var lineEndY = lineStartY;

            this.svgPane.drawSVGLine(lineStartX, lineStartY, lineEndX, lineEndY, lineColor);
        }
    },

    drawVerticalSVGBox: function(linesToDraw, boxBaseX, boxBaseY,
                                boxSizeX, boxSizeY, lineColor) {

        for(var lineNumber = 0; lineNumber < linesToDraw; lineNumber++) {
            var lineStartX = boxBaseX + ((lineNumber / (linesToDraw - 1)) * boxSizeX);
            var lineStartY = boxBaseY;
            var lineEndX = lineStartX;
            var lineEndY = boxBaseY + boxSizeY;

            this.svgPane.drawSVGLine(lineStartX, lineStartY, lineEndX, lineEndY, lineColor);
        }
    },

    drawForwardDiagonalSVGBox: function(linesToDraw, boxBaseX, boxBaseY,
                                       boxSizeX, boxSizeY, lineColor) {

        var boxHypoLength = Math.sqrt((boxSizeX * boxSizeX) + (boxSizeY * boxSizeY));

        for(var lineNumber = 0; lineNumber < linesToDraw; lineNumber++) {
            var hypoIntersection = ((lineNumber + 1) / (linesToDraw + 1)) * boxHypoLength;

            // Calculate endpoint offset along X axis ("end" of forward slash)
            var xBoxHypoAngle = Math.atan(boxSizeY/boxSizeX);
            var leftPartOfXOffset = Math.cos(xBoxHypoAngle) * hypoIntersection;
            var rightPartOfXOffset = Math.tan(Math.PI / 4) * Math.sin(xBoxHypoAngle) * hypoIntersection;
            var lineEndpointXOffset = leftPartOfXOffset + rightPartOfXOffset;

            // Calculate endpoint offset along Y axis ("start" of forward slash)
            var yBoxHypoAngle = Math.atan(boxSizeX/boxSizeY);
            var topPartOfYOffset = Math.cos(yBoxHypoAngle) * hypoIntersection;
            var bottomPartOfYOffset = Math.tan(Math.PI / 4) * Math.sin(yBoxHypoAngle) * hypoIntersection;
            var lineEndpointYOffset = topPartOfYOffset + bottomPartOfYOffset;

            var lineStartX = boxBaseX;
            var lineStartY = boxBaseY + lineEndpointYOffset;
            var lineEndX = boxBaseX + lineEndpointXOffset;
            var lineEndY = boxBaseY;

            // Modify lines starting below the allowed box
            if(lineStartY > (boxSizeY + boxBaseY)) {
                lineStartX += (lineStartY - (boxSizeY + boxBaseY));
                lineStartY = (boxSizeY + boxBaseY);
            }

            // Modify lines ending to the right of the allowed box
            if(lineEndX > (boxSizeX + boxBaseX)) {
                lineEndY += (lineEndX - (boxSizeX + boxBaseX));
                lineEndX = (boxSizeX + boxBaseX);
            }

            this.svgPane.drawSVGLine(lineStartX, lineStartY, lineEndX, lineEndY, lineColor);
        }
    },

    drawBackwardDiagonalSVGBox: function(linesToDraw, boxBaseX, boxBaseY,
                                        boxSizeX, boxSizeY, lineColor) {

        var boxHypoLength = Math.sqrt((boxSizeX * boxSizeX) + (boxSizeY * boxSizeY));

        for(var lineNumber = 0; lineNumber < linesToDraw; lineNumber++) {
            var hypoIntersection = ((lineNumber + 1) / (linesToDraw + 1)) * boxHypoLength;

            // Calculate endpoint offset along X axis ("end" of backslash)
            var xBoxHypoAngle = Math.atan(boxSizeY/boxSizeX);
            var leftPartOfXOffset  = Math.cos(xBoxHypoAngle) * hypoIntersection;
            var rightPartOfXOffset = Math.tan(Math.PI / 4) * Math.sin(xBoxHypoAngle) * hypoIntersection;
            var lineEndpointXOffset = leftPartOfXOffset + rightPartOfXOffset;

            // Calculate endpoint offset along Y axis ("start" of backslash)
            var yBoxHypoAngle = Math.atan(boxSizeX/boxSizeY);
            var topPartOfYOffset    = Math.cos(yBoxHypoAngle) * hypoIntersection;
            var bottomPartOfYOffset = Math.tan(Math.PI / 4) * Math.sin(yBoxHypoAngle) * hypoIntersection;
            var lineEndpointYOffset = topPartOfYOffset + bottomPartOfYOffset;

            var lineStartX = boxBaseX;
            var lineStartY = (boxBaseY + boxSizeY) - lineEndpointYOffset;
            var lineEndX = boxBaseX + lineEndpointXOffset;
            var lineEndY = boxBaseY + boxSizeY;

            // Modify lines beginning above the allowed box
            if(lineStartY < boxBaseY) {
                lineStartX += (boxBaseY - lineStartY);
                lineStartY = boxBaseY;
            }

            // Modify lines ending to the right of the allowed box
            if(lineEndX > (boxSizeX + boxBaseX)) {
                lineEndY -= (lineEndX - (boxSizeX + boxBaseX));
                lineEndX = (boxSizeX + boxBaseX);
            }

            this.svgPane.drawSVGLine(lineStartX, lineStartY, lineEndX, lineEndY, lineColor);
        }
    },

    drawBoxBasedOnCommand: function(command,
                                   linesToDraw, boxBaseX, boxBaseY,
                                   boxSizeX, boxSizeY, lineColor) {
        switch (command.toLowerCase()) {
            case 'h':
                this.drawHorizontalSVGBox(linesToDraw, boxBaseX, boxBaseY,
                                          boxSizeX, boxSizeY, lineColor);
                break;
            case 'v':
                this.drawVerticalSVGBox(linesToDraw, boxBaseX, boxBaseY,
                                        boxSizeX, boxSizeY, lineColor);
                break;
            case 'f':
                this.drawForwardDiagonalSVGBox(linesToDraw, boxBaseX, boxBaseY,
                                               boxSizeX, boxSizeY, lineColor);
                break;
            case 'b':
                this.drawBackwardDiagonalSVGBox(linesToDraw, boxBaseX, boxBaseY,
                                                boxSizeX, boxSizeY, lineColor);
                break;
            case 'n': // The 'no-op' box
            case ' ':
                break;
            default:
                console.error("NOT A VALID OPERATION");
        }
    },

    drawCursor: function(x, y, length, lineColor) {
        var line = this.svgPane.drawSVGLine(x, y, x, y + length, lineColor);
        line.id = "cursor";
    }
}
