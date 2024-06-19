FONTSIZE = 16

# Synthetic Data
# PATH_SENSITIVITY = "data/syntheticDelta32.nc"
# PATH_ENSEMBLE = "data/4096Runs/"
# PATH_PARAMETERS = "data/4096Runs/parameters.dat"
# PATH_SFC = "data/SyntheticDeltaDifference.npy"
# NO_SENSITIVITY_AXES = []
# INVERSE_SFC = "syntheticSFC.npy"
# USE_PARAMETERS = ["P1", "P2", "P3"]
# FIELD_TO_LOAD = "data"
# FIELD_NAME = "data"
# RESHAPE = False

# Ablation Data
PATH_SENSITIVITY = "data/ablationDeltaWithProb.nc"
PATH_ENSEMBLE = "D:/Datasets/AblationSobol"
PATH_PARAMETERS = "D:/Datasets/AblationSobol/parameters.dat"
PATH_SFC = "data/ablationDeltaDifference.npy"
NO_SENSITIVITY_AXES = ["Ablation Probability", "Labels"]
INVERSE_SFC = "data/ablationSFC.npy"
USE_PARAMETERS = ["Density_Vessel", "Density_Liver", "Density_Tumor", "HeatCapacity_Vessel", "HeatCapacity_Liver", "HeatCapacity_Tumor", "ThermalConductivity_Vessel", "ThermalConductivity_Liver", "ThermalConductivity_Tumor", "BloodPerfusionRate_Vessel", "BloodPerfusionRate_Liver", "BloodPerfusionRate_Tumor"]#, "SpeedOfSound_Vessel", "SpeedOfSound_Liver", "SpeedOfSound_Tumor"]
FIELD_TO_LOAD = "data"
FIELD_NAME = "data"
RESHAPE = False

# # Aneurysm Data
# PATH_SENSITIVITY = "D:/sensitivityResults/final/aneurysmDelta128.nc"
# PATH_ENSEMBLE = "D:/Datasets/SimonFlow/aneurysm"
# PATH_PARAMETERS = "D:/Datasets/SimonFlow/aneurysm/parameters.dat"
# PATH_SFC = "data/aneurysmDeltaDifference.npy"
# NO_SENSITIVITY_AXES = []
# INVERSE_SFC = "data/ablationSFC.npy"
# USE_PARAMETERS = ["Viscosity", "Density", "Smagorinsky", "Inlet_velocity"]
# FIELD_TO_LOAD = "data"
# FIELD_NAME = "data"
# RESHAPE = True
# RES = (128, 64, 64)