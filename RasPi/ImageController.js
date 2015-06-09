function ImageController() {
    if (window === this) {
        return new ImageController();
    }

    return this;
}

ImageController.prototype = {

    // Primary draw function
    drawImage: function(drawCommands, cursorLocation, shapeModel) {

        // User defined constants
        var numberOfLinesPerBox = 50;
        var numberOfBoxesX = drawCommands[0].length;
        var numberOfBoxesY = drawCommands.length;
        var lineColor = "#000";

        // Image constants
        var minBlankWindowSpaceXPercent = 0.1;
        var minBlankWindowSpaceYPercent = 0.1;
        var spaceBetweenBoxesPercent = 0.03;

        var browserWindowWidth = window.innerWidth;
        var browserWindowHeight = window.innerHeight;
        var startOfImageX = minBlankWindowSpaceXPercent * browserWindowWidth;
        var startOfImageY = minBlankWindowSpaceYPercent * browserWindowHeight;

        // Box Definition
        var spaceBetweenBoxesX = spaceBetweenBoxesPercent * browserWindowWidth;
        var spaceBetweenBoxesY = spaceBetweenBoxesPercent * browserWindowHeight;
        var spaceBetweenBoxes = Math.min(spaceBetweenBoxesX, spaceBetweenBoxesY);

        var sizeOfBoxX = (browserWindowWidth -
                         (browserWindowWidth * minBlankWindowSpaceXPercent * 2) -
                         (spaceBetweenBoxes * (numberOfBoxesX - 1))) /
                         numberOfBoxesX;

        var sizeOfBoxY = (browserWindowHeight -
                         (browserWindowHeight * minBlankWindowSpaceYPercent * 2) -
                         (spaceBetweenBoxes * (numberOfBoxesY - 1))) /
                         numberOfBoxesY;

        var sizeOfBox = Math.min(sizeOfBoxX, sizeOfBoxY);

        // Center the image in the SVG window
        var blankSpaceRight = browserWindowWidth -
                              (numberOfBoxesX * sizeOfBox) -
                              ((numberOfBoxesX - 1) * spaceBetweenBoxes) -
                              (startOfImageX * 2);

        var blankSpaceBottom = browserWindowHeight -
                               (numberOfBoxesY * sizeOfBox) -
                               ((numberOfBoxesY - 1) * spaceBetweenBoxes) -
                               (startOfImageY * 2);

        startOfImageX += blankSpaceRight / 2;
        startOfImageY += blankSpaceBottom / 2;

        // Determine location of boxes & draw them
        for (var row = 0; row < numberOfBoxesY; row++) {
            for (var column = 0; column < numberOfBoxesX; column++) {
                var boxXCoordinate = startOfImageX + (column * (sizeOfBox + spaceBetweenBoxes));
                var boxYCoordinate = startOfImageY + (row * (sizeOfBox + spaceBetweenBoxes));

                shapeModel.drawBoxBasedOnCommand(drawCommands[row][column], numberOfLinesPerBox,
                                      boxXCoordinate, boxYCoordinate, sizeOfBox, sizeOfBox, lineColor);

                // TODO: his needs to be moved elsewhere.
                if (row == cursorLocation[0]) {
                    if (column == cursorLocation[1]) {
                        shapeModel.drawCursor(boxXCoordinate - spaceBetweenBoxes / 2,
                                              boxYCoordinate, sizeOfBox, lineColor);
                    } else if (column == (numberOfBoxesX - 1) && cursorLocation[1] == numberOfBoxesX) {
                        shapeModel.drawCursor(boxXCoordinate + sizeOfBox + spaceBetweenBoxes / 2,
                                              boxYCoordinate, sizeOfBox, lineColor);
                    }
                }
            }
        }
    }
}
