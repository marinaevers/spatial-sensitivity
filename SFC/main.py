import ctypes
import numpy as np
import platform

# Compile library using
# g++ -shared -fPIC -std=c++17 space_filling_curve.cpp -o space_filling_curve.so
# g++ -shared -fPIC -std=c++17 space_filling_curve.cpp -o space_filling_curve.dll


def space_filling_curve(volumes: np.ndarray, distance_metric: str):
    if len(volumes.shape) != 4:
        raise Exception("volumes.shape must be 4-dimensional")

    if volumes.dtype != np.float64:
        raise Exception("volumes.dtype must be np.float64")

    library = ctypes.CDLL(f"./space_filling_curve.{'dll' if platform.system() == 'Windows' else 'so'}")
    library.space_filling_curve.argtypes = [
        ctypes.c_uint64,  # volume_count
        ctypes.c_uint64,  # dimension_x
        ctypes.c_uint64,  # dimensions_y
        ctypes.c_uint64,  # dimensions_z
        ctypes.POINTER(ctypes.c_double),  # values
        ctypes.c_int32,  # distance_metric
        ctypes.POINTER(ctypes.c_uint64)  # space_filling_curve
    ]

    distance_metric = {
        "euclidean": 0,
        "difference": 1,
        "squared_difference": 2,
        "cosine": 3
    }[distance_metric]

    space_filling_curve = np.zeros(volumes.shape[1:], dtype=np.uint64)

    library.space_filling_curve(
        volumes.shape[0],
        volumes.shape[1],
        volumes.shape[2],
        volumes.shape[3],
        volumes.ctypes.data_as(ctypes.POINTER(ctypes.c_double)),
        distance_metric,
        space_filling_curve.ctypes.data_as(ctypes.POINTER(ctypes.c_uint64)),
    )

    return space_filling_curve


if __name__ == "__main__":
    np.random.seed(42)
    volumes = np.random.normal(0.0, 1.0, (5, 64, 64, 64))
    result = space_filling_curve(volumes, distance_metric="euclidean")
    print("result: " + str(result[:3]))
