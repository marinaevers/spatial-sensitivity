import json
import numpy as np
from dash.dependencies import Input, Output, State

import config
from app import app

import data
import components.pcp as pcp
import components.parameterDependencySFC as parameterDependencySFC
import components.volumeRenderingVTK as vtkRendering
import components.sliceView as sliceView
import components.sensitivityVis as sensitivityVis
import fancy_parallel_coordinates as fpc


@app.callback(
    Output(component_id='pcp_all', component_property='children'),
    Input(component_id='slider-threshold', component_property='value'),
    Input(component_id='slider-pcp-width', component_property='value')
)
def updatePCP(threshold, pcp_width):
    sorting = np.argsort(data.sv.sensitiveVoxels)
    selection = np.array([np.max(data.sv.volumes[i]) for i in range(len(data.sv.sensitiveVoxels))])[sorting]>= threshold
    if(len(config.NO_SENSITIVITY_AXES) > 0):
        upperBound = -len(config.NO_SENSITIVITY_AXES)
    else:
        upperBound = len(data.sv.names)
    data.selections.selectedParameters = np.array(data.sv.names[:upperBound].copy())[selection]
    data.selections.sorting = np.argsort(np.array(data.sv.sensitiveVoxels))[selection][::-1]
    return pcp.createFancyPCP(pcp_width)


@app.callback(
    Output(component_id='sfc_all', component_property='children'),
    [Input(component_id='slider-num-graphs', component_property='value'),
     Input('pcp', 'dimensions'),
     Input('pcp', 'draggedElement')
     ]
)
def updateSFC(numHorizons, dimensions, elem):
    if(dimensions):
        data.selections.sorting = [data.sv.map[d] for d in dimensions]
    return sensitivityVis.createSensitivityVis(numHorizons)


@app.callback(
    Output(component_id='text-num-samples', component_property='children'),
    [Input(component_id='slider-num-samples', component_property='value')]
)
def update_num_samples(input_value):
    data.selections.num_samples = input_value
    return 'Number of Samples: {}'.format(input_value)


@app.callback(
    Output(component_id='text-num-graphs', component_property='children'),
    [Input(component_id='slider-num-graphs', component_property='value')]
)
def update_num_graphs(input_value):
    return 'Number of Graphs: {}'.format(input_value)


@app.callback(
    Output(component_id='text-threshold', component_property='children'),
    [Input(component_id='slider-threshold', component_property='value')]
)
def update_threshold(input_value):
    return 'Sensitivity Threshold: {}%'.format(input_value)


@app.callback(
    Output(component_id='text-pcp-width', component_property='children'),
    [Input(component_id='slider-pcp-width', component_property='value')]
)
def update_threshold(input_value):
    return 'PCP Axis width: {}px'.format(input_value)

@app.callback(
    Output(component_id='text-transparency', component_property='children'),
    [Input(component_id='slider-transparency', component_property='value')]
)
def update_num_samples(input_value):
    return 'Opacity: {}'.format(input_value)

@app.callback(
    Output('pcp', 'selection'),
    Input('sensitivity-vis', 'selectedRanges'),
    Input('sensitivity-vis', 'numBrushes'),
)
def updatePCP(selectedRanges, numBrushes):
    newSelectionPCP = []
    sortedSamples = data.ensemble.inverseSFC.ravel()[data.selections.samples]
    if(selectedRanges):
        for r in selectedRanges:
            newSelectionPCP += np.argwhere(np.logical_and(np.array(sortedSamples) <= r[1],
                                                          r[0] <= np.array(sortedSamples))).flatten().tolist()
    print(newSelectionPCP)
    return newSelectionPCP

@app.callback(
    Output('store', 'data'),
    Input('pcp', 'selection'),
    Input('sensitivity-vis', 'selectedRanges'),
    Input('sensitivity-vis', 'numBrushes'),
    State('pcp', 'axes'),
)
def update_spatialSelection(selection, selectedRanges, numRanges, axes):
    #print("Updating!")
    ranges = {}
    #print(selection)
    print(axes)
    if (selection and axes):
        samples = np.array(data.selections.samples)[selection]
        for ax in axes:
            points = data.sv.volumes[data.sv.map[ax]].ravel()[samples]  # [indices[:, 0], indices[:, 1], indices[:, 2]]

            minR = np.min(points)
            maxR = np.max(points)
            ranges[ax] = [minR, maxR]
        toChange = np.ones(data.ensemble.resolution, dtype=bool)
        newSelection = np.zeros(data.ensemble.resolution)
        for ax in axes:
            vol = data.sv.volumes[data.sv.map[ax]]
            toChange = np.logical_and(toChange, np.logical_and(vol <= ranges[ax][1], ranges[ax][0] <= vol))
        newSelection[toChange] = 1
        data.selections.spatialSelection = newSelection  # np.logical_or(data.selections.spatialSelection, newSelection)
    elif (selectedRanges):
        toChange = np.zeros(data.ensemble.resolution, dtype=bool)
        newSelection = np.zeros(data.ensemble.resolution)
        for r in selectedRanges:
            toChange = np.logical_or(toChange, np.logical_and(data.ensemble.inverseSFC <= r[1], r[0] <= data.ensemble.inverseSFC))
        newSelection[toChange] = 1
        data.selections.spatialSelection = newSelection
    if (axes == [] and numRanges == 0):
        data.selections.spatialSelection = np.ones(data.ensemble.resolution)
    return json.dumps("Done")

@app.callback(
    Output('vtk-view', 'children'),
    Input('store', 'data'),
    Input(component_id='slider-transparency', component_property='value'),
    Input(component_id='switch-dvr', component_property='value'),
    Input(component_id='switch-context', component_property='value'),
    Input(component_id='selection-parameter', component_property='value'),
    Input(component_id='selection-context', component_property='value')
)
def update_volumeRendering(storedData, value, switch_value, switch_context, parameter_name, context_name):
    data.selections.renderedParameter = data.sv.map[parameter_name]
    if switch_value == True:
        return [vtkRendering.createVTKVolumeRendering(value)]
    if switch_context == True:
        return [vtkRendering.createVTKBoundingBox(), vtkRendering.createVTKContextRendering(context_name), vtkRendering.createVTKSurfaceRendering(value)]
    return [vtkRendering.createVTKBoundingBox(), vtkRendering.createVTKSurfaceRendering(value)]

@app.callback(
    Output('parameterDependency', 'figure'),
    [Input('shrink_toggle', 'value'),
     Input('store', 'data'),
     Input('parameter-selection', 'value')]
)
def update_parameterDependency(shrink, storedData, parameter):
    data.selections.shrink = shrink
    data.selections.parameter = parameter
    return parameterDependencySFC.createDependencyPlot()

