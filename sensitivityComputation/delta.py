from scipy.stats import norm, gaussian_kde, rankdata
import numpy as np
import os
import h5py
from joblib import Parallel, delayed
from netCDF4 import Dataset
from skimage.transform import resize

def calc_delta(Y, Ygrid, X, m):
    """Plischke et al. (2013) delta index estimator (eqn 26) for d_hat."""
    # Number of samples
    N = len(Y) 
    # Estimate density function by using kernel-density estimations
    fy = gaussian_kde(Y, bw_method="silverman")(Ygrid)
    # Sort input parameters?
    xr = rankdata(X, method="ordinal")

    d_hat = 0.0
    l_m = len(m) - 1
    for j in range(l_m):
        ix = np.where((xr > m[j]) & (xr <= m[j + 1]))[0]
        nm = len(ix)

        # if not np.all(np.equal(Y_ix, Y_ix[0])):
        Y_ix = Y[ix]
        if Y_ix.ptp() != 0.0:
            fyc = gaussian_kde(Y_ix, bw_method="silverman")(Ygrid)
            fy_ = np.abs(fy - fyc)
        else:
            fy_ = np.abs(fy)

        d_hat += (nm / (2 * N)) * np.trapz(fy_, Ygrid)

    return d_hat

def myDelta(X, Y):
    D = len(X[0])
    N = Y.size
    
    # equal frequency partition
    exp = 2.0 / (7.0 + np.tanh((1500.0 - N) / 500.0))
    M = int(np.round(min(int(np.ceil(N**exp)), 48)))
    m = np.linspace(0, N, M + 1)
    Ygrid = np.linspace(np.min(Y), np.max(Y), 100)
    
    S = np.zeros(D)
    for i in range(D):
        X_i = X[:, i]
        S[i] = calc_delta(Y, Ygrid, X_i, m)
        
    return S

def calcSensitivitySliceDelta(i, Y, param_values):
    print(i)
    Si = [[]]
    for j in range(len(Y[0,0])):
        Si += [[]]
        for k in range(len(Y[0,0,0])):
            Si[j] += [myDelta(param_values, Y[:,i, j, k])]
    return Si

def loadParameters(paramPath):
    f = open(paramPath, 'r')
    parameterNames = []
    parameters = []
    for x in f:
        if(parameterNames == []):
            parameterNames = x.split()[1:]
        else:
            parameters += [[float(p) for p in x.split()[1:]]]
    f.close()
    print("Parameters loaded")
    return parameterNames, np.array(parameters)

def loadData(PATH, x, y, z):
    numberOfRuns = len(list(os.listdir(PATH)))-1 # Reduce 1 to not count parameter.dat
    Y = np.zeros((numberOfRuns, x, y, z))
    for i, run in enumerate(sorted(os.listdir(PATH))):
        if('.dat' in run):
            continue
        path = os.path.join(os.path.join(PATH, run), sorted(os.listdir(os.path.join(PATH, run)))[-1])
        try:
            if(path[-2:]=="h5"):
                f = h5py.File(path, 'r')
                try:
                    data = np.array(f["data"])
                except Exception as e:
                    data = np.array(f[list(f.keys())[0]])
            else: # nc
                print("Unknown file format!")
            Y[i] = data
        except Exception as e:
            print(e)
            print(run)
    return Y

def createMultiFieldVolume(Si, outpath, parameterPath, res, sobol = False):
    if not sobol:
        for i in range(len(Si)):
            Si[i].pop()
        Si = np.array(Si)
        Si = resize(Si, res)
        print(Si.shape)
    names, _ = loadParameters(parameterPath)
    # Create nc
    ncout = Dataset(outpath,'w','NETCDF3')
    ncout.createDimension('x', res[0])
    ncout.createDimension('y', res[1])
    ncout.createDimension('z', res[2])
    xvar = ncout.createVariable('x','float32',('x'));xvar[:] = np.arange(res[0])
    yvar = ncout.createVariable('y','float32',('y'));yvar[:] = np.arange(res[1])
    zvar = ncout.createVariable('z','float32',('z'));zvar[:] = np.arange(res[2])
    for i, n in enumerate(names):
        print(i)
        field = ncout.createVariable(n,'float32',('x','y','z'));field[:] = Si[:,:,:,i]
    ncout.close()
    print("Saving done.")

PATH_PARAMETERS_ARTIFICIAL = "../data/4096Runs/parameters.dat"

names, parameters = loadParameters(PATH_PARAMETERS_ARTIFICIAL)
bounds = []
for i in range(len(names)):
    bounds += [[np.min(parameters[:,i]), np.max(parameters[:,i])]]
# Define the model inputs
problem = {
    'num_vars': len(names),
    'names': names,
    'bounds': bounds
}
Y = loadData("../data/4096Runs", 32, 32, 32)

Si = Parallel(n_jobs=8)(delayed(calcSensitivitySliceDelta)(i, Y, parameters) for i in range(len(Y[0])))
#print(Si)
createMultiFieldVolume(Si, "../data/syntheticDelta.nc", PATH_PARAMETERS_ARTIFICIAL, (32, 32, 32))