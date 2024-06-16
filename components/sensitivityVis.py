import config
import data
import numpy as np
import plotly.express as px
import horizon_graph as hg

def to_string(color):
    return str(color[0])+","+str(color[1])+","+str(color[2])

def createSensitivityVis(numHorizons = 4):
    if(config.PATH_SFC == ""):
        return px.scatter(x=[0, 1, 2, 3, 4], y=[0, 1, 4, 9, 16])
    values = []
    samples = np.copy(data.selections.samples)
    indices = data.ensemble.sfc[np.sort(data.selections.samples)]
    sortedSamplesIdx = np.argsort(samples)
    sortedSamples = samples[sortedSamplesIdx]
    indices = data.ensemble.sfc[sortedSamples]
    for key in list(data.sv.map.keys()):
        if(key in config.NO_SENSITIVITY_AXES):
            continue
        if(data.ensemble.dimension == 3):
            values += [data.sv.volumes[data.sv.map[key]][indices[:,0],indices[:,1],indices[:,2]]]
        else:
            values += [data.sv.volumes[data.sv.map[key]][0,indices[:, 0], indices[:, 1]]]
    drawing_order =data.selections.sorting

    drawing_order_clean = []
    for key in drawing_order:
        if (data.sv.names[key] in config.NO_SENSITIVITY_AXES):
            continue
        drawing_order_clean.append(key)
    drawing_order = drawing_order_clean

    gg = hg.HorizonGraph(x = sortedSamples,
                    y=np.array(values)[drawing_order],
                    names = np.array(data.sv.names)[drawing_order],
                    id = 'sensitivity-vis',#+str(numHorizons),
                    padding = 0,
                    numberHorizons = numHorizons,
                    xLabel="Space Filling Curve",
                    yLabel = "Sensitivity",
                    width=918,
                    height=400)
    return gg
