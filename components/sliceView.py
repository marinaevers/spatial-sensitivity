import data
import plotly.express as px
import numpy as np

def createSliceView():
    print("Slice View")
    values = np.ones(data.ensemble.resolution)
    for dimension in data.selections.ranges.keys():
        if (data.selections.axis_order != {}):
            index = data.sv.map[data.selections.axis_order[dimension]]
        else:
            index = dimension
        dataInRange = np.logical_and(data.sv.volumes[index] > data.selections.ranges[dimension][0],
                                     data.sv.volumes[index] < data.selections.ranges[dimension][1])
        values = np.logical_and(values, dataInRange)
    if(len(values)==1):
        values = values[0]
    if(np.sum(data.selections.spatialSelection) > 0):
        values = np.logical_and(values, data.selections.spatialSelection)
    fig = px.imshow(values)
    #fig = px.scatter(x=[0, 1, 2, 3, 4], y=[0, 1, 4, 9, 16])
    return fig