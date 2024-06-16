# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class FancyParallelCoordinates(Component):
    """A FancyParallelCoordinates component.
ExampleComponent is an example component.
It takes a property, `label`, and
displays it.
It renders an input with the property `value`
which is editable by the user.

Keyword arguments:

- id (string; optional):
    The ID used to identify this component in Dash callbacks.

- axes (list; optional)

- data (list; required)

- dataWidth (number; default 1600)

- dimensions (list; optional)

- draggedElement (string; optional)

- fontSize (number; default 12)

- height (number; default 400)

- labels (list; optional)

- redraw (boolean; default True)

- selection (list; default [3])

- width (number; default 800)"""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'fancy_parallel_coordinates'
    _type = 'FancyParallelCoordinates'
    @_explicitize_args
    def __init__(self, id=Component.UNDEFINED, data=Component.REQUIRED, fontSize=Component.UNDEFINED, width=Component.UNDEFINED, height=Component.UNDEFINED, dataWidth=Component.UNDEFINED, selection=Component.UNDEFINED, redraw=Component.UNDEFINED, axes=Component.UNDEFINED, dimensions=Component.UNDEFINED, draggedElement=Component.UNDEFINED, labels=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'axes', 'data', 'dataWidth', 'dimensions', 'draggedElement', 'fontSize', 'height', 'labels', 'redraw', 'selection', 'width']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'axes', 'data', 'dataWidth', 'dimensions', 'draggedElement', 'fontSize', 'height', 'labels', 'redraw', 'selection', 'width']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        for k in ['data']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')

        super(FancyParallelCoordinates, self).__init__(**args)
