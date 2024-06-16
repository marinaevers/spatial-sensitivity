# AUTO GENERATED FILE - DO NOT EDIT

export 'fpc'_fancyparallelcoordinates

"""
    'fpc'_fancyparallelcoordinates(;kwargs...)

A FancyParallelCoordinates component.
ExampleComponent is an example component.
It takes a property, `label`, and
displays it.
It renders an input with the property `value`
which is editable by the user.
Keyword arguments:
- `id` (String; optional): The ID used to identify this component in Dash callbacks.
- `axes` (Array; optional)
- `data` (Array; required)
- `dataWidth` (Real; optional)
- `dimensions` (Array; optional)
- `draggedElement` (String; optional)
- `fontSize` (Real; optional)
- `height` (Real; optional)
- `labels` (Array; optional)
- `redraw` (Bool; optional)
- `selection` (Array; optional)
- `width` (Real; optional)
"""
function 'fpc'_fancyparallelcoordinates(; kwargs...)
        available_props = Symbol[:id, :axes, :data, :dataWidth, :dimensions, :draggedElement, :fontSize, :height, :labels, :redraw, :selection, :width]
        wild_props = Symbol[]
        return Component("'fpc'_fancyparallelcoordinates", "FancyParallelCoordinates", "fancy_parallel_coordinates", available_props, wild_props; kwargs...)
end

