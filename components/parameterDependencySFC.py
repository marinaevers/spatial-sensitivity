import data
import numpy as np
import pandas as pd
import datashader as ds
import plotly.graph_objects as go
import plotly.express as px
import config
import math

def createDependencyPlot():
    print("Parameter Dependency")
    # Create pandas dataframe
    small_dfs = []
    paramIndex = data.ensemble.parameterNames.index(data.selections.parameter)
    samples = np.sort(np.copy(data.selections.samples))
    indices = data.ensemble.sfc[samples]
    toDraw = np.ones(data.ensemble.resolution)
    for dimension in data.selections.ranges.keys():
        if (data.selections.axis_order != {}):
            index = data.sv.map[data.selections.axis_order[dimension]]
        else:
            index = dimension
        dataInRange = np.logical_and(data.sv.volumes[index] > data.selections.ranges[dimension][0],
                                     data.sv.volumes[index] < data.selections.ranges[dimension][1])
        if (data.ensemble.dimension == 3):
            toDraw = np.logical_and(toDraw, dataInRange)
        else:
            toDraw = np.logical_and(toDraw, dataInRange)
    if (np.sum(data.selections.spatialSelection) > 0):
        if (data.ensemble.dimension == 3):
            toDraw = np.logical_and(toDraw, data.selections.spatialSelection)
        else:
            toDraw = np.logical_and(toDraw, data.selections.spatialSelection)

    if(np.sum(toDraw) < 20000):
        sfcSelection = np.nonzero(toDraw.astype(int))
        sfcSelection = np.array([sfcSelection[0], sfcSelection[1], sfcSelection[2]]).T
        sfcIndices = data.ensemble.inverseSFC[sfcSelection[:,0], sfcSelection[:,1], sfcSelection[:,2]]
    else:
        sfcIndices = samples
        sfcSelection = indices

    for i in range(len(data.ensemble.volumes)):
        # Reorder values based on SFC
        if(data.ensemble.dimension==2):
            runData = (data.ensemble.volumes[i][sfcSelection[:,0], sfcSelection[:,1]]).flatten()
        else:
            runData = (data.ensemble.volumes[i][sfcSelection[:,0], sfcSelection[:,1], sfcSelection[:,2]])
        df_run = pd.DataFrame(runData, columns=['Values'])
        df_run[data.selections.parameter] = np.ones(len(runData)) * data.ensemble.parameters[i][paramIndex]
        df_run["Space Filling Curve"] = sfcIndices
        small_dfs.append(df_run)
    df = pd.concat(small_dfs, ignore_index=True)
    cvs = ds.Canvas(plot_width=150, plot_height=500)
    agg = cvs.points(df, data.selections.parameter, 'Space Filling Curve', ds.mean("Values"))
    if(data.selections.shrink):
        agg = agg.dropna('Space Filling Curve', how='all')
        agg = agg.dropna(data.selections.parameter, how='all')
    fig = px.imshow(agg, origin="lower", color_continuous_scale='Magma', labels={'color': config.FIELD_NAME})
    fig.update_traces(hoverongaps=False)
    fig.update_layout({'plot_bgcolor': 'rgba(0,0,0,0)'})
    return fig