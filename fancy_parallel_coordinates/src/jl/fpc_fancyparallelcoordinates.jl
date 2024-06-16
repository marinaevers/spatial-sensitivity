# AUTO GENERATED FILE - DO NOT EDIT

export fpc_fancyparallelcoordinates

"""
    fpc_fancyparallelcoordinates(;kwargs...)

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
- `redraw` (Bool; optional)
- `selection` (Array; optional)
- `width` (Real; optional)
"""
function fpc_fancyparallelcoordinates(; kwargs...)
        available_props = Symbol[:id, :axes, :data, :dataWidth, :dimensions, :draggedElement, :fontSize, :height, :redraw, :selection, :width]
        wild_props = Symbol[]
        return Component("fpc_fancyparallelcoordinates", "FancyParallelCoordinates", "fancy_parallel_coordinates", available_props, wild_props; kwargs...)
end

