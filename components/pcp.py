import plotly.graph_objects as go
import data
import numpy as np
import config

import fancy_parallel_coordinates as fpc

def createOwnPCP():
    dataPCP = []
    min = 10
    max = 0
    toDraw = np.array(data.sv.names.copy())[data.selections.sorting].tolist() + config.NO_SENSITIVITY_AXES
    for name in toDraw:
        i = data.sv.map[name]
        if (data.ensemble.dimension == 3):
            values = data.sv.volumes[i].ravel()[data.selections.samples]
        sensitivity = not name in config.NO_SENSITIVITY_AXES
        dataPCP.append({'label': name, 'range': [0,0], 'values': values, 'sensitivity': sensitivity, 'sfc': False})
        if (not name in config.NO_SENSITIVITY_AXES):
            if (np.min(values) < min):
                min = np.min(values)
            if (np.max(values) > max):
                max = np.max(values)
        else:
            dataPCP[-1]['range'] = [np.min(values), np.max(values)]

    for i, name in enumerate(toDraw):
        if(name in config.NO_SENSITIVITY_AXES):
            continue
        dataPCP[i]['range'] = [min, max]
    return dataPCP

def createFancyPCP(pcpWidth=150):
    pcpData = createOwnPCP()
    dataWidth = len(pcpData)*pcpWidth
    labels = None
    if "Labels" in config.NO_SENSITIVITY_AXES:
        labels = ["No tags", "Liver", "Galbladder", "Tumor", "HV", "PV", "HA", "Kidneys", "Cartilage", "Bones", "Lung", "Air", "Needle"]
    return fpc.FancyParallelCoordinates(
        id='pcp',#+str(len(pcpData))+str(dataWidth),
        data=pcpData,
        dataWidth=dataWidth,
        fontSize=config.FONTSIZE,
        labels=labels
    )