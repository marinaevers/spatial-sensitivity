# AUTO GENERATED FILE - DO NOT EDIT

export 'hg'_horizongraph

"""
    'hg'_horizongraph(;kwargs...)

A HorizonGraph component.
ExampleComponent is an example component.
It takes a property, `label`, and
displays it.
It renders an input with the property `value`
which is editable by the user.
Keyword arguments:
- `id` (String; optional): The ID used to identify this component in Dash callbacks.
- `bands` (Real; optional)
- `bgcolor` (String; optional)
- `fontSize` (Real; optional)
- `height` (Real; optional)
- `legendOffset` (Real; optional)
- `names` (Array; optional)
- `numBrushes` (Real; optional)
- `numberHorizons` (Real; optional)
- `padding` (Real; optional)
- `redraw` (Bool; optional)
- `selectedRanges` (Array; optional)
- `threshold` (Real; optional)
- `width` (Real; optional)
- `x` (Array; required)
- `xLabel` (String; optional)
- `y` (Array; required)
- `yLabel` (String; optional)
"""
function 'hg'_horizongraph(; kwargs...)
        available_props = Symbol[:id, :bands, :bgcolor, :fontSize, :height, :legendOffset, :names, :numBrushes, :numberHorizons, :padding, :redraw, :selectedRanges, :threshold, :width, :x, :xLabel, :y, :yLabel]
        wild_props = Symbol[]
        return Component("'hg'_horizongraph", "HorizonGraph", "horizon_graph", available_props, wild_props; kwargs...)
end

