from dash import html
from dash import dcc
import dash_vtk
import dash_daq as daq

# Plots
import components.pcp as pcp
import components.parameterDependencySFC as parameterDependencySFC
import components.volumeRenderingVTK as vtkRendering
import components.sensitivityVis as sensitivityVis
import components.sliceView as sliceView

import data


def getSpatialView():
    if (data.ensemble.dimension == 2):
        return dcc.Graph(figure=sliceView.createSliceView(), id='slice-view')  # Return slice view
    else:
        view = dash_vtk.View([
            dash_vtk.VolumeRepresentation([
                # GUI to control Volume Rendering
                # + Setup good default at startup
                dash_vtk.VolumeController(),
                # Actual volume
                dash_vtk.ImageData(
                    id='vtk-image-data',
                    dimensions=list(data.ensemble.resolution),
                    origin=[0, 0, 0],
                    spacing=[1, 1, 1],
                    children=[
                        dash_vtk.PointData([
                            dash_vtk.DataArray(
                                id='vtk-data-array',
                                registration="setScalars",
                                values=list(vtkRendering.createVTKInputData())
                            )
                        ])
                    ]
                )
            ])
        ],
            id='vtk-view', style={"height": "400px"},
            background=[1, 1, 1])
        return view


layout = html.Div(children=[
    html.Div([html.Div([
        html.Div([
            html.H4("Sensitivity (Parallel Coordinates)"),
            html.Div(children=[
                pcp.createFancyPCP()
            ], id='pcp_all')
        ])
    ], style={'width': '50%', 'float': 'left'}),
        html.Div([
            html.H4("Sensitivity (over Space)"),
            html.Div(children=[
                sensitivityVis.createSensitivityVis()
            ], id='sfc_all')
        ], style={'width': '50%', 'float': 'left'}),
    ], style={'height': '500px'}),
    html.Div([
        html.Div([
            html.H4("Parameter Dependency", style={'width': '50%', 'float': 'left'}),
            daq.ToggleSwitch(id='shrink_toggle', value=True, label="Shrink"),
            dcc.Graph(figure=parameterDependencySFC.createDependencyPlot(), id='parameterDependency'),
            dcc.Dropdown(id='parameter-selection', options=[{'label': parameter, 'value': parameter} for parameter in
                                                            data.ensemble.parameterNames],
                         value=data.ensemble.parameterNames[0]),
        ], style={'width': '50%', 'float': 'left'}),
        html.Div([
            dcc.Tabs(id='tabs', value='volume-rendering', children=[
                dcc.Tab(label="Spatial Selection", value="volume-rendering", children=[
                    dash_vtk.View(children = [
                        vtkRendering.createVTKSurfaceRendering(20)
                    ],
                        id='vtk-view',
                        style={"height": "400px"},
                        background=[1, 1, 1])
                ]),
                dcc.Tab(label="Settings", value="settings", children=[
                    html.Div([html.Div(["Number of Samples: 8000"], id='text-num-samples'),
                              dcc.Slider(id='slider-num-samples', min=0, max=32000, step=100, value=8000)]),
                    html.Div([html.Div(["Number of Graphs: 4"], id='text-num-graphs'),
                              dcc.Slider(id='slider-num-graphs', min=0, max=15, step=1, value=4)]),
                    html.Div([html.Div(["Sensitivity Threshold: 0"], id='text-threshold'),
                              dcc.Slider(id='slider-threshold', min=0, max=1, step=0.05, value=0)]),
                    html.Div([html.Div(["PCP Axis width: 50px"], id='text-pcp-width'),
                              dcc.Slider(id='slider-pcp-width', min=50, max=300, step=10, value=150)]),
                    html.Div([html.Div(["Opacity: 20%"], id='text-transparency'),
                              dcc.Slider(id='slider-transparency', min=0, max=100, step=5, value=20)]),
                    html.Div([html.Div(["Show volume rendering of sensitivity value"], id='text-dvr'),
                              daq.ToggleSwitch(id='switch-dvr', value=False)], style={"display":"none"}),
                    html.Div([html.Div(["Show context"], id='text-context'),
                              daq.ToggleSwitch(id='switch-context', value=False)]),
                    html.Div([dcc.Dropdown(id='selection-parameter', options=[
                         {'label': name, 'value': name} for name in data.ensemble.parameterNames
                    ], value=data.ensemble.parameterNames[0])], style={"display":"none"}),
                    html.Div([dcc.Dropdown(id='selection-context', options=[
                         {'label': name, 'value': name} for name in ["No tags", "Liver", "Galbladder", "Tumor", "HV", "PV", "HA", "Kidneys", "Cartilage", "Bones", "Lung", "Air", "Needle"]
                    ], value="Tumor")])
                ])
            ])
        ], style={"width": "50%", "height": "400px", 'float': 'left'}, id='vtk-volume-rendering')
    ]),
    dcc.Store(id='store')
])
