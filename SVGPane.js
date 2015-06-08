function SVGPane(sourceDiv) {
    if (sourceDiv) {
        if (window === this) {
            return new SVGPane(sourceDiv);
        }

        this.sourceDiv = document.getElementById(sourceDiv);
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("version", "1.2");
        this.svg.setAttribute("baseProfile", "tiny");
        this.svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        this.svg.setAttribute("overflow", "visible");
        this.sourceDiv.appendChild(this.svg);

        return this;

    } else {
        return undefined;
    }
}

SVGPane.prototype = {
    LINE_WIDTH: 1,

    clearPane: function() {
        var paneId = this.sourceDiv.id;
        this.sourceDiv.innerHTML = ""; // "nuke" the div to remove all objects

        SVGPane.call(this, paneId);    // Call own constructor
    },

    drawSVGPath: function(pathString, hexColor) {
        var svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

        svgPath.setAttribute("stroke", hexColor);
        svgPath.setAttribute("d", pathString);
        svgPath.setAttribute("stroke-width", this.LINE_WIDTH);

        this.svg.appendChild(svgPath);

        return svgPath;
    },

    drawSVGLine: function(startX, startY, endX, endY, lineColor) {
        return this.drawSVGPath("M" + startX + "," + startY +
                                "L" + endX + "," + endY,
                                lineColor);
    }
}
