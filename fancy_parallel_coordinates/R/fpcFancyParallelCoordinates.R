# AUTO GENERATED FILE - DO NOT EDIT

#' @export
fpcFancyParallelCoordinates <- function(id=NULL, axes=NULL, data=NULL, dataWidth=NULL, dimensions=NULL, draggedElement=NULL, fontSize=NULL, height=NULL, redraw=NULL, selection=NULL, width=NULL) {
    
    props <- list(id=id, axes=axes, data=data, dataWidth=dataWidth, dimensions=dimensions, draggedElement=draggedElement, fontSize=fontSize, height=height, redraw=redraw, selection=selection, width=width)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'FancyParallelCoordinates',
        namespace = 'fancy_parallel_coordinates',
        propNames = c('id', 'axes', 'data', 'dataWidth', 'dimensions', 'draggedElement', 'fontSize', 'height', 'redraw', 'selection', 'width'),
        package = 'fancyParallelCoordinates'
        )

    structure(component, class = c('dash_component', 'list'))
}
