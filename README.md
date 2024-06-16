# Interactive Visual Analysis of Spatial Sensitivities
This visual analysis tool supports the investigation of spatial variations of parameter sensitivities.

More information can be found in the paper "Interactive Visual Analysis of Spatial Sensitivities" by Marina Evers, Simon Leistikow, Hennes Rave and Lars Linsen.

If you use our approach, please cite our paper:
(to be added)

## Computation of data-driven space-filling curve for multidimensional data
The code for computing the space-filling curve can be found in the folder `SFC`. Build the C++ code using
```
g++ -shared -fPIC -std=c++17 space_filling_curve.cpp -o space_filling_curve.so
```

You can access the SFC computation as shown in the script `main.py`.

## Installations
Before running our program, the visualizations need to be build and installed. Our program was tested on Windows and Linux.
Create a new virtual environment:
```
python -m venv venv
```
Activate the environment (Windows):
```
venv\Scripts\activate
```
Activate the environment (Linux):
```
source venv/bin/activate
```
Install the visualizations:
```
cd sensitivity_parallel_coordinates; pip install -r requirements.txt; npm install; npm run build; pip install .; cd ..
```
```
cd horizon_graph; pip install -r requirements.txt; npm install; npm run build; pip install .; cd ..
```
Install the other requirements for the tool:
```
pip install -r requirements.txt
```

## How to Run?
### Preprocessing
We included an artificial dataset such that the tool can be executed and tested directly.
The ensemble data should be in a folder where each subfolder contains a single ensemble member's data. Inside each folder, there is a single file containing the simulation output.

TODO: Script for computing the sensitivity

### Start the backend
```
python start.py
```
When shown on the console, open http://127.0.0.1:8050

## How to Use?
### Load the data
Set all required paths in the config.py file. Adapt this file when using own datasets.

### Parallel Coordinates
The parallel coordinates plot provides an overview about the sensitivity values in the dataset. The axes can be reordered via drag and drop on the axes labels. Selections, that are linked to the other views, are possible via brushing. The number of samples and the distance between the axes can be modified in the settings. The axes can be filtered by setting a threshold.

### Spatial Sensitivity Visualization
The spatial sensitivity visualization shows the sensitivity values over the space filling curve. The number of horizon graphs can be set in the settings. The remaining parameters (that are not filtered out) are shown in a line graph. This visualizations also supports brushing. When brushing multiple times, the union of the brushes is used for the other visualizations. All selections can be deleted by pressing Shift while clicking somewhere in the plot with the mouse.

### Parameter Dependency Visualization
The parameter dependency visualization shows the variation of the simulation output over the variation of a parameter. Using gaps to encode missing values can be toggled in the top of the visualization. This plot shows the data selected in the parallel coordinates or the spatial sensitivity visualization. The parameter shown on the horizontal axis can be selected in the dropdown below the plot. This plot supports zooming by using the standard Plotly interactions.

### Spatial Selection
When selecting data in the parallel coordinates or the spatial sensitivity visualization, the corresponding voxels are shown in a semi-transparent surface visualization. The transparency can be adapted in the settings. This renderings supports rotations and zooming using the mouse. It is also possible to show contextual information which can be selected in the settings.

If you have further questions, please do not hesitate to contact us.