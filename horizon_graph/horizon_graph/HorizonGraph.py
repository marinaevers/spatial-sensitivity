# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class HorizonGraph(Component):
    """A HorizonGraph component.
ExampleComponent is an example component.
It takes a property, `label`, and
displays it.
It renders an input with the property `value`
which is editable by the user.

Keyword arguments:

- id (string; optional):
    The ID used to identify this component in Dash callbacks.

- bands (number; default 2)

- bgcolor (string; default "#969696")

- fontSize (number; default 12)

- height (number; default 400)

- legendOffset (number; default 20)

- names (list; optional)

- numBrushes (number; optional)

- numberHorizons (number; default 3)

- padding (number; default 2)

- redraw (boolean; default True)

- selectedRanges (list; optional)

- threshold (number; default 0.2)

- width (number; default 800)

- x (list; required)

- xLabel (string; default "x-Label")

- y (list; required)

- yLabel (string; default "y-Label")"""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'horizon_graph'
    _type = 'HorizonGraph'
    @_explicitize_args
    def __init__(self, id=Component.UNDEFINED, width=Component.UNDEFINED, height=Component.UNDEFINED, x=Component.REQUIRED, y=Component.REQUIRED, names=Component.UNDEFINED, padding=Component.UNDEFINED, bands=Component.UNDEFINED, bgcolor=Component.UNDEFINED, numberHorizons=Component.UNDEFINED, fontSize=Component.UNDEFINED, selectedRanges=Component.UNDEFINED, xLabel=Component.UNDEFINED, yLabel=Component.UNDEFINED, legendOffset=Component.UNDEFINED, redraw=Component.UNDEFINED, numBrushes=Component.UNDEFINED, threshold=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'bands', 'bgcolor', 'fontSize', 'height', 'legendOffset', 'names', 'numBrushes', 'numberHorizons', 'padding', 'redraw', 'selectedRanges', 'threshold', 'width', 'x', 'xLabel', 'y', 'yLabel']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'bands', 'bgcolor', 'fontSize', 'height', 'legendOffset', 'names', 'numBrushes', 'numberHorizons', 'padding', 'redraw', 'selectedRanges', 'threshold', 'width', 'x', 'xLabel', 'y', 'yLabel']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        for k in ['x', 'y']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')

        super(HorizonGraph, self).__init__(**args)
