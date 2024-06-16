
module FancyParallelCoordinates
using Dash

const resources_path = realpath(joinpath( @__DIR__, "..", "deps"))
const version = "0.0.1"

include("jl/'fpc'_fancyparallelcoordinates.jl")

function __init__()
    DashBase.register_package(
        DashBase.ResourcePkg(
            "fancy_parallel_coordinates",
            resources_path,
            version = version,
            [
                DashBase.Resource(
    relative_package_path = "fancy_parallel_coordinates.min.js",
    external_url = nothing,
    dynamic = nothing,
    async = nothing,
    type = :js
),
DashBase.Resource(
    relative_package_path = "fancy_parallel_coordinates.min.js.map",
    external_url = nothing,
    dynamic = true,
    async = nothing,
    type = :js
)
            ]
        )

    )
end
end
