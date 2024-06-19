import numpy as np
import h5py
import vtk
import config
import os
import random
import netCDF4
import os.path
import xml.etree.ElementTree as xml
from skimage.transform import resize

class Volume:

    def __init__(self, filename, timestep=0, modality=None):
        self.filename = filename
        self.data = None
        self.channels = 0
        if filename.endswith('.vvd'):
            self.__readVvd(filename)
        else:
            raise Exception('File format not supported')

    def __parse_meta_data(self, meta_data):
        for item in meta_data:
            if item.get('name') == 'Offset':
                value = item.find('value')
                self.offset = (float(value.get('x')), float(value.get('y')), float(value.get('z')))
            elif item.get('name') == 'Spacing':
                value = item.find('value')
                self.spacing = (float(value.get('x')), float(value.get('y')), float(value.get('z')))
            elif item.get('name') == 'Modality' or item.get('name') == 'name':
                value = item.find('value')
                self.modality = value
                self.modalities = [self.modality]

    def __readVvd(self, filename):

        root = xml.parse(filename).getroot().findall('Volumes/Volume/')

        for element in root:
            if element.tag == 'RawData':

                self.format = str(element.get('format'))
                if self.format.find('float') >= 0:
                    self.base_type = np.float32
                elif self.format.find('double') >= 0:
                    self.base_type = np.float64
                elif self.format.find('uint8') >= 0:
                    self.base_type = np.uint8
                elif self.format.find('uint16') >= 0:
                    self.base_type = np.uint16
                elif self.format.find('uint32') >= 0:
                    self.base_type = np.uint32
                elif self.format.find('uint64') >= 0:
                    self.base_type = np.uint64
                elif self.format.find('int8') >= 0:
                    self.base_type = np.int8
                elif self.format.find('int16') >= 0:
                    self.base_type = np.int16
                elif self.format.find('int32') >= 0:
                    self.base_type = np.int32
                elif self.format.find('int64') >= 0:
                    self.base_type = np.int64
                else:
                    self.base_type = None
                    raise Exception('Unsupported data type')

                if self.format.find('Vector2') >= 0:
                    self.channels = 2
                elif self.format.find('Vector3') >= 0:
                    self.channels = 3
                elif self.format.find('Vector4') >= 0:
                    self.channels = 4
                else:
                    self.channels = 1

                self.dimensions = (int(element.get('x')), int(element.get('y')), int(element.get('z')))

                rawDataPaths = []
                for path in element.findall('Paths/paths/item'):
                    rawDataPaths.append(path.get('value'))

                if len(rawDataPaths) == 0:
                    rawDataPaths.append(element.get('filename'))

                cwd = os.getcwd()
                os.chdir(os.path.dirname(filename))
                self.data = None

                for path in rawDataPaths:
                    if os.path.exists(path):
                        with open(path, mode='rb') as file:
                            self.data = np.fromfile(file, self.base_type,
                                                    self.dimensions[0] * self.dimensions[1] * self.dimensions[
                                                        2] * self.channels)
                        break
                os.chdir(cwd)

                if self.data is None:
                    print('Data file could not be loaded!')
                else:
                    self.data = np.reshape(self.data,
                                           (self.dimensions[2], self.dimensions[1], self.dimensions[0], self.channels))
                    self.data = self.data.transpose((0, 1, 2, 3))

            elif element.tag == 'MetaData':
                self.__parse_meta_data(element.findall('MetaItem'))

def load_vvd(path):
    return Volume(path).data[:,:,:,0]

class SensitivityVolumes():
    names = []
    volumes = []
    map = {}
    sensitiveVoxels = []

    def loadData(self, names):
        self.names = names
        data = netCDF4.Dataset(config.PATH_SENSITIVITY)
        for i, n in enumerate(names):
            self.volumes += [np.array(data[n])]
            if(not self.names[i] in config.NO_SENSITIVITY_AXES):
                self.volumes[-1][self.volumes[-1]>1] = 1
                print(self.names[i] + ": " + str(np.max(self.volumes[i])))
                self.sensitiveVoxels += [np.sum(self.volumes[i])/np.sum(np.ones(self.volumes[i].shape))]#[np.count_nonzero(self.volumes[i]>0)]
            if 'HeatCapacity' in n:
                names[i] = n.replace('HeatCapacity', 'HC')
            if 'ThermalConductivity' in n:
                names[i] = n.replace('ThermalConductivity', 'TC')
            if 'BloodPerfusionRate' in n:
                names[i] = n.replace('BloodPerfusionRate', 'BPR')
            n = names[i]
            self.map[n] = i
        self.volumes = np.array(self.volumes)
        print(self.volumes.shape)

class Selections():
    ranges = {} # key: dimension, value: range (as array)
    sorting = []
    num_samples = 8000
    samples = []
    parameter = ''
    spatialSelection = []
    spatialSelectionSFC = [[0,0]]
    selectedParameters = []
    renderedParameter = 0
    automaticFiltering = False
    shrink = True
    sfcSamples = []

    def __init__(self, parameter, resolution):
        self.parameter = parameter
        self.spatialSelection = np.ones(resolution)
        print("Resolution: " + str(resolution))
        if(len(resolution) == 3):
            numVoxels = resolution[0] * resolution[1] * resolution[2] - 1
        else:
            numVoxels = resolution[0] * resolution[1] - 1
        if(self.num_samples > numVoxels):
            self.num_samples = numVoxels
        random.seed(0)
        self.samples = random.sample(
            range(0, numVoxels),
            self.num_samples)

class Ensemble():
    volumes = []
    parameters = []
    parameterNames = []
    resolution = (0, 0, 0)
    dimension = 3
    sfc = None
    inverseSFC = None
    sfcIndices = []

    def loadVolumes(self):
        if len(self.volumes) > 0:
            self.volumes = []
        for run in sorted(os.listdir(config.PATH_ENSEMBLE)):
            if('.dat' in run):
                continue
            if "aneurysm" in config.PATH_ENSEMBLE:
                path = os.path.join(config.PATH_ENSEMBLE, run)
                path = os.path.join(path, sorted([f for f in os.listdir(path) if 'magnitude' in f])[-1])
            else:
                path = os.path.join(os.path.join(config.PATH_ENSEMBLE, run), sorted(os.listdir(os.path.join(config.PATH_ENSEMBLE, run)))[-1])
            try:
                if(path[-2:]=="h5"):
                    f = h5py.File(path, 'r')
                    try:
                        data = np.array(f[config.FIELD_TO_LOAD])
                    except Exception as e:
                        data = np.array(f[list(f.keys())[0]])
                elif path[-3:]=="vti":
                    reader = vtk.vtkXMLImageDataReader()
                    reader.SetFileName(path)
                    reader.Update()
                    out = reader.GetOutput()
                    x, y, z = out.GetDimensions()
                    data = np.array(out.GetPointData().GetScalars())
                    data = data.reshape(x,y,z)
                elif "vvd" in path:
                    data = Volume(path).data[:,:,:,0]
                else: # nc
                    if not ".nc" in path:
                        continue
                    data = np.array(netCDF4.Dataset(path)[config.FIELD_TO_LOAD])
                if config.RESHAPE:
                    print("Before: " + str(data.shape))
                    data = resize(data, config.RES)
                    print("After: " + str(data.shape))
                self.volumes += [data]
            except Exception as e:
                print(e)
                print(run)
        if len(self.volumes) > 0:
            self.resolution = self.volumes[0].shape
        if len(self.resolution) == 2:
            self.dimension = 2
            self.resolution = (self.resolution[0], self.resolution[1])
        print("Ensemble Volume loaded")

    def loadParameters(self):
        f = open(config.PATH_PARAMETERS, 'r')
        if(len(self.parameterNames) > 0):
            self.parameterNames = []
            self.parameters = [[]]
        for x in f:
            if(self.parameterNames == []):
                self.parameterNames = x.split()[1:]
            else:
                self.parameters += [[float(p) for p in x.split()[1:]]]
        f.close()
        print("Parameters loaded")

    def loadSFC(self):
        if '.vvd' in config.PATH_SFC:
            self.inverseSFC = load_vvd(config.PATH_SFC)
        else:
            self.inverseSFC = np.load(config.PATH_SFC)
        try:
            self.sfc = np.load(config.INVERSE_SFC)
        except:
            self.sfc = np.array([np.argwhere(self.inverseSFC==p)[0] for p in sorted(self.inverseSFC.flatten())])
            np.save(config.INVERSE_SFC, self.sfc)
        print("SFC: " + str(self.sfc.shape))

    def loadData(self):
        self.loadVolumes()
        self.loadParameters()
        if(config.PATH_SFC != ""):
            self.loadSFC()
        print("Ensemble data loaded successfully")

# Load data
ensemble = Ensemble()
ensemble.loadData()

selections = Selections(ensemble.parameterNames[0], ensemble.resolution)
selections.selectedParameters = ensemble.parameterNames.copy()
# Add fields
if config.USE_PARAMETERS:
    selections.selectedParameters = []
    for n in config.USE_PARAMETERS:
        selections.selectedParameters.append(n)
#for i in range(len(ensemble.parameterNames)):
    #selections.selectedParameters[i] = ensemble.parameterNames[i]
# Add interactions
# for p1 in ensemble.parameterNames:
#     for p2 in ensemble.parameterNames:
#         if(p1 != p2):
#             selections.selectedParameters += [p1+"|"+p2]

#for i in range(len(ensemble.parameterNames)):
#    selections.selectedParameters += [ensemble.parameterNames[i] + "_T"]
## Add interactions
#for p1 in ensemble.parameterNames:
#    for p2 in ensemble.parameterNames:
#        if(p1 != p2):
#            selections.selectedParameters += [p1+"_T|"+p2+"_T"]

sv = SensitivityVolumes()
sv.loadData(selections.selectedParameters+config.NO_SENSITIVITY_AXES)

#ensemble.parameterNames = selections.selectedParameters+config.NO_SENSITIVITY_AXES
# Preprocessing

if (len(selections.samples) == 0):
    voxels = ensemble.resolution[0] * ensemble.resolution[1]
    if (ensemble.dimension == 3):
        voxels *= ensemble.resolution[2]
    voxels -= 1
    if (selections.num_samples < voxels):
        random.seed(0)
        selections.samples = random.sample(range(0, voxels),
                                                selections.num_samples)
    else:
        print("All samples used")
        selections.samples = np.arange(0, voxels)

# Order parameter based on number of sensitive voxels
selections.sorting = np.argsort(sv.sensitiveVoxels)[::-1]