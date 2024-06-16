# AUTO GENERATED FILE - DO NOT EDIT

#' @export
'hg'HorizonGraph <- function(id=NULL, bands=NULL, bgcolor=NULL, fontSize=NULL, height=NULL, legendOffset=NULL, names=NULL, numBrushes=NULL, numberHorizons=NULL, padding=NULL, redraw=NULL, selectedRanges=NULL, threshold=NULL, width=NULL, x=NULL, xLabel=NULL, y=NULL, yLabel=NULL) {
    
    props <- list(id=id, bands=bands, bgcolor=bgcolor, fontSize=fontSize, height=height, legendOffset=legendOffset, names=names, numBrushes=numBrushes, numberHorizons=numberHorizons, padding=padding, redraw=redraw, selectedRanges=selectedRanges, threshold=threshold, width=width, x=x, xLabel=xLabel, y=y, yLabel=yLabel)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'HorizonGraph',
        namespace = 'horizon_graph',
        propNames = c('id', 'bands', 'bgcolor', 'fontSize', 'height', 'legendOffset', 'names', 'numBrushes', 'numberHorizons', 'padding', 'redraw', 'selectedRanges', 'threshold', 'width', 'x', 'xLabel', 'y', 'yLabel'),
        package = 'horizonGraph'
        )

    structure(component, class = c('dash_component', 'list'))
}
