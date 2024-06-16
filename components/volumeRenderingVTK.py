import dash_vtk
from dash_vtk.utils import to_volume_state
import numpy as np
import data
import vtk
from vtk.util import numpy_support

try:
    # VTK 9+
    from vtkmodules.vtkImagingCore import vtkRTAnalyticSource
except ImportError:
    # VTK =< 8
    print("Update your VTK")


def createVTKInputData():
    values = np.ones(data.ensemble.resolution)
    if (np.sum(data.selections.spatialSelection) > 0):
        values = np.logical_and(values, data.selections.spatialSelection)
    return values.astype(float) 

def createVTKBoundingBox():
    binaryData = np.ones(data.ensemble.resolution)
    binaryData = binaryData.transpose(1, 0, 2)
    vtkData = numpy_support.numpy_to_vtk(num_array=binaryData.ravel(), deep=True, array_type=vtk.VTK_FLOAT)
    imdata = vtk.vtkImageData()
    imdata.SetDimensions([2,2,2])
    spacing = np.array(binaryData.shape)#-1
    imdata.SetSpacing(spacing)
    imdata.SetOrigin([0, 0, 0])
    imdata.GetPointData().SetScalars(vtkData)
    return dash_vtk.GeometryRepresentation([
        dash_vtk.Mesh(state=dash_vtk.utils.to_mesh_state(imdata))
    ], property={'representation': 1, 'color':(0, 0, 0)})

def createVTKSurfaceRendering(opacityValue):
    # Get the binary data (Reshaping just to keep compatibility alive, remove flatten later
    binaryData = data.selections.spatialSelection.copy()
    binaryData = binaryData.transpose(1, 0, 2)
    binaryData = np.pad(binaryData, 1)
    vtkData = numpy_support.numpy_to_vtk(num_array=binaryData.ravel(), deep=True, array_type=vtk.VTK_FLOAT)
    imdata = vtk.vtkImageData()
    imdata.SetDimensions(binaryData.shape)
    imdata.SetSpacing([1, 1, 1])
    imdata.SetOrigin([0, 0, 0])
    imdata.GetPointData().SetScalars(vtkData)
    pad = vtk.vtkImageWrapPad()
    pad.SetInputData(imdata)
    extent = imdata.GetExtent()
    pad.SetOutputWholeExtent(extent[0], extent[1] + 1, extent[2], extent[3] + 1, extent[4], extent[5] + 1)
    pad.Update()
    pad.GetOutput().GetCellData().SetScalars(imdata.GetPointData().GetScalars())

    # Copy the scalar point data of the volume into the scalar cell data
    selector = vtk.vtkThreshold()
    selector.SetInputArrayToProcess(0, 0, 0, vtk.vtkDataObject().FIELD_ASSOCIATION_CELLS,
                                    vtk.vtkDataSetAttributes().SCALARS)
    selector.SetInputConnection(pad.GetOutputPort())
    selector.SetLowerThreshold(0.5)
    selector.SetUpperThreshold(1.5)
    selector.Update()

    # Shift the geometry by 1/2
    transform = vtk.vtkTransform()
    transform.Translate(-1, -1, -1)

    transform_model = vtk.vtkTransformFilter()
    transform_model.SetTransform(transform)
    transform_model.SetInputConnection(selector.GetOutputPort())
    transform_model.Update()

    geometry = vtk.vtkGeometryFilter()
    geometry.SetInputConnection(transform_model.GetOutputPort())
    geometry.Update()
    surface = geometry.GetOutput()
    return dash_vtk.GeometryRepresentation([
        dash_vtk.Mesh(state=dash_vtk.utils.to_mesh_state(surface))
    ], property={'color':(0, 1, 1), 'specularPower':0.2,
                 'specular':0.05, 'ambient':0.5, 'diffuse': 0.45,
                 'specularColor': (1,1,1), 'opacity': 0.01*opacityValue})

def createVTKContextRendering(segmentName):
    labels = ["No tags", "Liver", "Galbladder", "Tumor", "HV", "PV", "HA", "Kidneys", "Cartilage", "Bones", "Lung", "Air", "Needle"]
    index = labels.index(segmentName)+1
    # Get the binary data (Reshaping just to keep compatibility alive, remove flatten later
    binaryData = np.zeros(data.sv.volumes[data.sv.map["Labels"]].shape)
    binaryData[data.sv.volumes[data.sv.map["Labels"]].astype(int)==index] = 1
    binaryData = binaryData.transpose(1, 0, 2)
    binaryData = np.pad(binaryData, 1)
    vtkData = numpy_support.numpy_to_vtk(num_array=binaryData.ravel(), deep=True, array_type=vtk.VTK_FLOAT)
    imdata = vtk.vtkImageData()
    imdata.SetDimensions(binaryData.shape)
    imdata.SetSpacing([1, 1, 1])
    imdata.SetOrigin([0, 0, 0])
    imdata.GetPointData().SetScalars(vtkData)
    pad = vtk.vtkImageWrapPad()
    pad.SetInputData(imdata)
    extent = imdata.GetExtent()
    pad.SetOutputWholeExtent(extent[0], extent[1] + 1, extent[2], extent[3] + 1, extent[4], extent[5] + 1)
    pad.Update()
    pad.GetOutput().GetCellData().SetScalars(imdata.GetPointData().GetScalars())

    # Copy the scalar point data of the volume into the scalar cell data
    selector = vtk.vtkThreshold()
    selector.SetInputArrayToProcess(0, 0, 0, vtk.vtkDataObject().FIELD_ASSOCIATION_CELLS,
                                    vtk.vtkDataSetAttributes().SCALARS)
    selector.SetInputConnection(pad.GetOutputPort())
    selector.SetLowerThreshold(0.5)
    selector.SetUpperThreshold(1.5)
    selector.Update()

    # Shift the geometry by 1/2
    transform = vtk.vtkTransform()
    transform.Translate(-1, -1, -1)

    transform_model = vtk.vtkTransformFilter()
    transform_model.SetTransform(transform)
    transform_model.SetInputConnection(selector.GetOutputPort())
    transform_model.Update()

    geometry = vtk.vtkGeometryFilter()
    geometry.SetInputConnection(transform_model.GetOutputPort())
    geometry.Update()
    surface = geometry.GetOutput()
    return dash_vtk.GeometryRepresentation([
        dash_vtk.Mesh(state=dash_vtk.utils.to_mesh_state(surface))
    ], property={'color':(0, 0.4, 0), 'specularPower':0.2,
                 'specular':0.05, 'ambient':0.5, 'diffuse': 0.45,
                 'specularColor': (1,1,1), 'opacity': 0.5})

def createVTKVolumeRendering(opacityValue):
    # Get the binary data (Reshaping just to keep compatibility alive, remove flatten later
    binaryData = data.selections.spatialSelection.copy()
    binaryData = binaryData.transpose(1, 0, 2)
    # get the sensitivity data
    sensitivityData = np.copy(data.sv.volumes[data.selections.renderedParameter])
    sensitivityData[np.logical_not(binaryData)] = 0
    vtkData = numpy_support.numpy_to_vtk(num_array=sensitivityData.ravel(), deep=True, array_type=vtk.VTK_FLOAT)
    imdata = vtk.vtkImageData()
    imdata.SetDimensions(binaryData.shape)
    imdata.SetSpacing([1, 1, 1])
    imdata.SetOrigin([0, 0, 0])
    imdata.GetPointData().SetScalars(vtkData)
    pad = vtk.vtkImageWrapPad()
    pad.SetInputData(imdata)
    extent = imdata.GetExtent()
    pad.SetOutputWholeExtent(extent[0], extent[1] + 1, extent[2], extent[3] + 1, extent[4], extent[5] + 1)
    pad.Update()
    pad.GetOutput().GetCellData().SetScalars(imdata.GetPointData().GetScalars())

    # Shift the geometry by 1/2
    transform = vtk.vtkTransform()
    transform.Translate(-1, -1, -1)

    transform_model = vtk.vtkTransformFilter()
    transform_model.SetTransform(transform)
    transform_model.SetInputConnection(pad.GetOutputPort())
    transform_model.Update()
    
    return dash_vtk.VolumeRepresentation(id="...", children=[
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
                                values=list(sensitivityData.astype(float).flatten())
                            )
                        ])
                    ]
                )
            ])
