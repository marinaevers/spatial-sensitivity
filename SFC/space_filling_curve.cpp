/*
L. Zhou, C. R. Johnson and D. Weiskopf,
"Data-Driven Space-Filling Curves",
in IEEE Transactions on Visualization and Computer Graphics,
doi: 10.1109/TVCG.2020.3030473.

Original code: https://github.com/zhou-l/DataDrivenSpaceFillCurve
*/

#include <array>
#include <chrono>
#include <functional>
#include <iostream>
#include <numeric>
#include <ostream>
#include <random>
#include <stack>

namespace tgt
{
    template<class T> struct Vector3
    {
        T x {}, y {}, z {};

        Vector3() noexcept = default;
        Vector3( T x, T y, T z ) : x { x }, y { y }, z { z } {}
        Vector3( T value ) : x { value }, y { value }, z { value } {}


        template<class U> Vector3<U> cast() const
        {
            return Vector3<U>{ static_cast<U>( x ), static_cast<U>( y ), static_cast<U>( z ) };
        }

        template<class U> operator Vector3<U>() const
        {
            return Vector3<U>{ static_cast<U>( x ), static_cast<U>( y ), static_cast<U>( z ) };
        }

        const T& operator[]( size_t index ) const
        {
            return reinterpret_cast<const T*>( this )[index];
        }

        Vector3 operator+( const Vector3& other ) const
        {
            return Vector3 { x + other.x, y + other.y, z + other.z };
        }
        Vector3 operator-( const Vector3& other ) const
        {
            return Vector3 { x - other.x, y - other.y, z - other.z };
        }

        template<class U> Vector3 operator*( const U& value ) const
        {
            return Vector3 { x * value, y * value, z * value };
        }
        Vector3 operator/( const Vector3& other ) const
        {
            return Vector3 { x / other.x, y / other.y, z / other.z };
        }
    };

    using svec3 = Vector3<size_t>;
    using Vector3d = Vector3<double>;

    template<class T> struct Vector4
    {
        T x {}, y {}, z {}, w {};

        Vector4() noexcept = default;
        Vector4( T x, T y, T z, T w ) : x { x }, y { y }, z { z }, w { w } {}
        Vector4( T value ) : x { value }, y { value }, z { value }, w { value } {}

        Vector4( const Vector3<T>& xyz, T w ) : x { xyz.x }, y { xyz.y }, z { xyz.z }, w { w } {}

        template<class U> operator Vector4<U>() const
        {
            return Vector4<U>{ static_cast<U>( x ), static_cast<U>( y ), static_cast<U>( z ), static_cast<U>( w ) };
        }

        Vector3<T> xyz() const noexcept
        {
            return Vector3<T> { x, y, z };
        }

        const T& operator[]( size_t index ) const
        {
            return reinterpret_cast<const T*>( this )[index];
        }

        Vector4 operator+( const Vector4& other ) const
        {
            return Vector4 { x + other.x, y + other.y, z + other.z, w + other.w };
        }

        template<class U> Vector4 operator/( const U& value ) const
        {
            return Vector4 { x / value, y / value, z / value, w / value };
        }
    };

    using Vector4d = Vector4<double>;

    template<class T> T min( const Vector3<T>& v )
    {
        return std::min( v.x, std::min( v.y, v.z ) );
    }

    template<class T> T max( const Vector3<T>& v )
    {
        return std::max( v.x, std::max( v.y, v.z ) );
    }

    template<class T> Vector3<T> cross( Vector3<T> a, Vector3<T> b )
    {
        return Vector3<T> { a.y* b.z - a.z * b.y, a.z* b.x - a.x * b.z, a.x* b.y - a.y * b.x };
    }

    template<class T> T lengthSq( Vector3<T> v )
    {
        return v.x * v.x + v.y * v.y + v.z * v.z;
    }
    template<class T> double length( Vector3<T> v )
    {
        return std::sqrt( v.x * v.x + v.y * v.y + v.z * v.z );
    }
}

namespace voreen
{
    template<class T> class VolumeAtomic
    {
    public:
        VolumeAtomic( const tgt::svec3& dimensions ) : _dimensions { dimensions }, _values( dimensions.x* dimensions.y* dimensions.z ) {}

        tgt::svec3 getDimensions() const noexcept
        {
            return _dimensions;
        }

        static inline size_t calcPos( const tgt::svec3& dimensions, size_t x, size_t y, size_t z )
        {
            return z * dimensions.x * dimensions.y + y * dimensions.x + x;
        }
        static inline size_t calcPos( const tgt::svec3& dimensions, const tgt::svec3& coordinates )
        {
            return calcPos( dimensions, coordinates.x, coordinates.y, coordinates.z );
        }

        void fill( const T& value )
        {
            std::fill( _values.begin(), _values.end(), value );
        }

        const T& voxel( size_t x, size_t y, size_t z ) const
        {
            return _values[calcPos( _dimensions, x, y, z )];
        }
        T& voxel( size_t x, size_t y, size_t z )
        {
            return _values[calcPos( _dimensions, x, y, z )];
        }

        const T& voxel( const tgt::svec3& coordinates ) const
        {
            return this->voxel( coordinates.x, coordinates.y, coordinates.z );
        }
        T& voxel( const tgt::svec3& coordinates )
        {
            return this->voxel( coordinates.x, coordinates.y, coordinates.z );
        }

    private:
        tgt::svec3 _dimensions {};
        std::vector<T> _values {};
    };
}

struct vec6
{
    vec6( int64_t value = 0 ) : _data { value, value, value, value, value, value }
    {
    }

    operator float() const noexcept
    {
        return 0.0f;
    }

    int64_t& operator[]( size_t index )
    {
        return _data[index];
    }
    int64_t operator[]( size_t index ) const
    {
        return _data[index];
    }

    friend std::ostream& operator<<( std::ostream& stream, const vec6& v )
    {
        return stream << '[' << v[0] << ' ' << v[1] << ' ' << v[2] << ' ' << v[3] << ' ' << v[4] << ' ' << v[5] << ']';
    }

    int64_t _data[6];
};

namespace
{
    const std::string loggerCat_ = "voreen.base.VolumeSpaceFillingCurve_ddsfc";
    auto buildSmallCircsDualGraph3D( tgt::svec3 dimensions, const std::function<double( tgt::Vector3<int64_t>, tgt::Vector3<int64_t> )>& distanceFunc )
    {
        const auto distance = [&distanceFunc] ( int64_t x1, int64_t y1, int64_t z1, int64_t x2, int64_t y2, int64_t z2 )
        {
            return distanceFunc( tgt::Vector3<int64_t>( x1, y1, z1 ), tgt::Vector3<int64_t>( x2, y2, z2 ) );
        };

        // Wp is the matrix representation of weights for the dual graph of
        // small circuits
        const auto IdimY = static_cast<int64_t>( dimensions.x );
        const auto IdimX = static_cast<int64_t>( dimensions.y );
        const auto IdimZ = static_cast<int64_t>( dimensions.z );

        auto WpXR = new voreen::VolumeAtomic<double>( tgt::svec3( IdimY / 2, IdimX / 2 - 1, IdimZ / 2 ) );
        auto WpXL = new voreen::VolumeAtomic<double>( tgt::svec3( IdimY / 2, IdimX / 2 - 1, IdimZ / 2 ) );
        auto WpYU = new voreen::VolumeAtomic<double>( tgt::svec3( IdimY / 2 - 1, IdimX / 2, IdimZ / 2 ) );
        auto WpYD = new voreen::VolumeAtomic<double>( tgt::svec3( IdimY / 2 - 1, IdimX / 2, IdimZ / 2 ) );
        auto WpZF = new voreen::VolumeAtomic<double>( tgt::svec3( IdimY / 2, IdimX / 2, IdimZ / 2 - 1 ) );
        auto WpZB = new voreen::VolumeAtomic<double>( tgt::svec3( IdimY / 2, IdimX / 2, IdimZ / 2 - 1 ) );

        WpXR->fill( 0.0f );
        WpXL->fill( 0.0f );
        WpYU->fill( 0.0f );
        WpYD->fill( 0.0f );
        WpZF->fill( 0.0f );
        WpZB->fill( 0.0f );

        // going right
        for( int64_t z = 0; z < IdimZ / 2; ++z )
        {
            for( int64_t y = 0; y < IdimY / 2; ++y )
            {
                for( int64_t x = 0; x < IdimX / 2 - 1; ++x )
                {
                    // X direction: |u|+|w|+|x|+|y|+|z|-|e|-|f|
                    const auto xx = 2 * x; // index of the original grid
                    const auto yy = 2 * y;
                    auto zz = 2 * z;

                    // going right 
                    // first layer
                    WpXR->voxel( y, x, z ) = WpXR->voxel( y, x, z ) + distance( yy, xx + 2, zz, yy, xx + 1, zz ) + distance( yy + 1, xx + 2, zz, yy + 1, xx + 1, zz ) +
                        distance( yy, xx + 3, zz, yy, xx + 2, zz ) + distance( yy + 1, xx + 3, zz, yy, xx + 3, zz ) + distance( yy + 1, xx + 3, zz, yy + 1, xx + 2, zz ) -
                        distance( yy + 1, xx + 2, zz, yy, xx + 2, zz ) - distance( yy + 1, xx + 1, zz, yy, xx + 1, zz );

                    // second layer
                    zz = zz + 1;
                    WpXR->voxel( y, x, z ) = WpXR->voxel( y, x, z ) + distance( yy, xx + 2, zz, yy, xx + 1, zz ) + distance( yy + 1, xx + 2, zz, yy + 1, xx + 1, zz ) +
                        distance( yy, xx + 3, zz, yy, xx + 2, zz ) + distance( yy + 1, xx + 3, zz, yy, xx + 3, zz ) + distance( yy + 1, xx + 3, zz, yy + 1, xx + 2, zz ) -
                        distance( yy + 1, xx + 2, zz, yy, xx + 2, zz ) - distance( yy + 1, xx + 1, zz, yy, xx + 1, zz );

                    // third layer
                    zz = zz - 1;
                    WpXR->voxel( y, x, z ) = WpXR->voxel( y, x, z ) + distance( yy, xx + 3, zz + 1, yy, xx + 3, zz ) + distance( yy + 1, xx + 3, zz + 1, yy + 1, xx + 3, zz ) -
                        distance( yy, xx + 2, zz + 1, yy, xx + 2, zz ) - distance( yy + 1, xx + 2, zz + 1, yy + 1, xx + 2, zz ) -
                        distance( yy, xx + 1, zz + 1, yy, xx + 1, zz ) - distance( yy + 1, xx + 1, zz + 1, yy + 1, xx + 1, zz );
                }
            }
        }

        // going left
        for( int64_t z = 0; z < IdimZ / 2; ++z )
        {
            for( int64_t y = 0; y < IdimY / 2; ++y )
            {
                for( int64_t x = IdimX / 2 - 2; x >= 0; --x )
                {
                    // X direction: |u|+|w|+|x|+|y|+|z|-|e|-|f|
                    const auto xx = 2 * ( x + 1 ); // index of the original grid
                    const auto yy = 2 * y;
                    auto zz = 2 * z;

                    // going left
                    // first layer
                    WpXL->voxel( y, x, z ) = distance( yy, xx - 1, zz, yy, xx, zz ) + distance( yy + 1, xx - 1, zz, yy + 1, xx, zz ) +
                        distance( yy, xx - 2, zz, yy, xx - 1, zz ) + distance( yy + 1, xx - 2, zz, yy, xx - 2, zz ) + distance( yy + 1, xx - 2, zz, yy + 1, xx - 1, zz ) -
                        distance( yy + 1, xx - 1, zz, yy, xx - 1, zz ) - distance( yy + 1, xx, zz, yy, xx, zz );

                    // second layer      
                    zz = zz + 1;
                    WpXL->voxel( y, x, z ) = WpXL->voxel( y, x, z ) + distance( yy, xx - 1, zz, yy, xx, zz ) + distance( yy + 1, xx - 1, zz, yy + 1, xx, zz ) +
                        distance( yy, xx - 2, zz, yy, xx - 1, zz ) + distance( yy + 1, xx - 2, zz, yy, xx - 2, zz ) + distance( yy + 1, xx - 2, zz, yy + 1, xx - 1, zz ) -
                        distance( yy + 1, xx - 1, zz, yy, xx - 1, zz ) - distance( yy + 1, xx, zz, yy, xx, zz );

                    // third layer
                    zz = zz - 1;
                    WpXL->voxel( y, x, z ) = WpXL->voxel( y, x, z ) + distance( yy, xx - 2, zz + 1, yy, xx - 2, zz ) + distance( yy + 1, xx - 2, zz + 1, yy + 1, xx - 2, zz ) -
                        distance( yy, xx - 1, zz + 1, yy, xx - 1, zz ) - distance( yy + 1, xx - 1, zz + 1, yy + 1, xx - 1, zz ) -
                        distance( yy, xx, zz + 1, yy, xx, zz ) - distance( yy + 1, xx, zz + 1, yy + 1, xx, zz );
                }
            }
        }

        // going down
        for( int64_t z = 0; z < IdimZ / 2; ++z )
        {
            for( int64_t y = 0; y < IdimY / 2 - 1; ++y )
            {
                for( int64_t x = 0; x < IdimX / 2; ++x )
                {
                    const auto xx = 2 * x; // index of the original grid
                    const auto yy = 2 * y;
                    auto zz = 2 * z;

                    // first layer
                    WpYD->voxel( y, x, z ) = distance( yy + 2, xx, zz, yy + 1, xx, zz ) + distance( yy + 2, xx + 1, zz, yy + 1, xx + 1, zz ) +
                        distance( yy + 3, xx, zz, yy + 2, xx, zz ) + distance( yy + 3, xx + 1, zz, yy + 2, xx + 1, zz ) + distance( yy + 3, xx + 1, zz, yy + 3, xx, zz ) -
                        distance( yy + 1, xx + 1, zz, yy + 1, xx, zz ) - distance( yy + 2, xx + 1, zz, yy + 2, xx, zz );

                    // second layer
                    zz = zz + 1;
                    WpYD->voxel( y, x, z ) = WpYD->voxel( y, x, z ) + distance( yy + 2, xx, zz, yy + 1, xx, zz ) + distance( yy + 2, xx + 1, zz, yy + 1, xx + 1, zz ) +
                        distance( yy + 3, xx, zz, yy + 2, xx, zz ) + distance( yy + 3, xx + 1, zz, yy + 2, xx + 1, zz ) + distance( yy + 3, xx + 1, zz, yy + 3, xx, zz ) -
                        distance( yy + 1, xx + 1, zz, yy + 1, xx, zz ) - distance( yy + 2, xx + 1, zz, yy + 2, xx, zz );

                    //third layer
                    zz = zz - 1;
                    WpYD->voxel( y, x, z ) = WpYD->voxel( y, x, z ) + distance( yy + 3, xx, zz + 1, yy + 3, xx, zz ) + distance( yy + 3, xx + 1, zz + 1, yy + 3, xx + 1, zz ) -
                        distance( yy + 2, xx, zz + 1, yy + 2, xx, zz ) - distance( yy + 2, xx + 1, zz + 1, yy + 2, xx + 1, zz ) -
                        distance( yy + 1, xx, zz + 1, yy + 1, xx, zz ) - distance( yy + 1, xx + 1, zz + 1, yy + 1, xx + 1, zz );
                }
            }
        }

        // going up
        for( int64_t z = 0; z < IdimZ / 2; ++z )
        {
            for( int64_t y = IdimY / 2 - 2; y >= 0; --y )
            {
                for( int64_t x = 0; x < IdimX / 2; ++x )
                {
                    const auto xx = 2 * x; // index of the original grid
                    const auto yy = 2 * ( y + 1 );
                    auto zz = 2 * z;

                    // first layer
                    WpYU->voxel( y, x, z ) =
                        distance( yy - 1, xx, zz, yy, xx, zz ) + distance( yy - 1, xx + 1, zz, yy, xx + 1, zz ) +
                        distance( yy - 2, xx, zz, yy - 1, xx, zz ) + distance( yy - 2, xx + 1, zz, yy - 1, xx + 1, zz ) + distance( yy - 2, xx + 1, zz, yy - 2, xx, zz ) -
                        distance( yy, xx + 1, zz, yy, xx, zz ) - distance( yy - 1, xx + 1, zz, yy - 1, xx, zz );

                    // second layer
                    zz = zz + 1;
                    WpYU->voxel( y, x, z ) = WpYU->voxel( y, x, z ) + distance( yy - 1, xx, zz, yy, xx, zz ) + distance( yy - 1, xx + 1, zz, yy, xx + 1, zz ) +
                        distance( yy - 2, xx, zz, yy - 1, xx, zz ) + distance( yy - 2, xx + 1, zz, yy - 1, xx + 1, zz ) + distance( yy - 2, xx + 1, zz, yy - 2, xx, zz ) -
                        distance( yy, xx + 1, zz, yy, xx, zz ) - distance( yy - 1, xx + 1, zz, yy - 1, xx, zz );

                    // third layer
                    zz = zz - 1;
                    WpYU->voxel( y, x, z ) = WpYU->voxel( y, x, z ) + distance( yy - 2, xx, zz + 1, yy - 2, xx, zz ) + distance( yy - 2, xx + 1, zz + 1, yy - 2, xx + 1, zz ) -
                        distance( yy - 1, xx, zz + 1, yy - 1, xx, zz ) - distance( yy - 1, xx + 1, zz + 1, yy - 1, xx + 1, zz ) -
                        distance( yy, xx, zz + 1, yy, xx, zz ) - distance( yy, xx + 1, zz + 1, yy, xx + 1, zz );
                }
            }
        }

        // going forward
        for( int64_t z = IdimZ / 2 - 2; z >= 0; --z )
        {
            for( int64_t y = 0; y < IdimY / 2; ++y )
            {
                for( int64_t x = 0; x < IdimX / 2; ++x )
                {
                    const auto xx = 2 * x; // index of the original grid
                    auto yy = 2 * y;
                    const auto zz = 2 * ( z + 1 );

                    // first layer
                    WpZF->voxel( y, x, z ) = distance( yy, xx, zz - 1, yy, xx, zz ) + distance( yy, xx + 1, zz - 1, yy, xx + 1, zz ) +
                        distance( yy, xx, zz - 2, yy, xx, zz - 1 ) + distance( yy, xx + 1, zz - 2, yy, xx + 1, zz - 1 ) + distance( yy, xx + 1, zz - 2, yy, xx, zz - 2 ) -
                        distance( yy, xx + 1, zz - 1, yy, xx, zz - 1 ) - distance( yy, xx + 1, zz, yy, xx + 1, zz );

                    //second layer
                    yy = yy + 1;
                    WpZF->voxel( y, x, z ) = WpZF->voxel( y, x, z ) + distance( yy, xx, zz - 1, yy, xx, zz ) + distance( yy, xx + 1, zz - 1, yy, xx + 1, zz ) +
                        distance( yy, xx, zz - 2, yy, xx, zz - 1 ) + distance( yy, xx + 1, zz - 2, yy, xx + 1, zz - 1 ) + distance( yy, xx + 1, zz - 2, yy, xx, zz - 2 ) -
                        distance( yy, xx + 1, zz - 1, yy, xx, zz - 1 ) - distance( yy, xx + 1, zz, yy, xx + 1, zz );

                    //third layer
                    yy = yy - 1;
                    WpZF->voxel( y, x, z ) = WpZF->voxel( y, x, z ) + distance( yy + 1, xx, zz - 2, yy, xx, zz - 2 ) + distance( yy + 1, xx + 1, zz - 2, yy, xx + 1, zz - 2 ) -
                        distance( yy + 1, xx, zz - 1, yy, xx, zz - 1 ) - distance( yy + 1, xx + 1, zz - 1, yy, xx + 1, zz - 1 ) -
                        distance( yy + 1, xx, zz, yy, xx, zz ) - distance( yy + 1, xx + 1, zz, yy, xx + 1, zz );
                }
            }
        }

        // going back
        for( int64_t z = 0; z < IdimZ / 2 - 1; ++z )
        {
            for( int64_t y = 0; y < IdimY / 2; ++y )
            {
                for( int64_t x = 0; x < IdimX / 2; ++x )
                {
                    const auto xx = 2 * x; // index of the original grid
                    auto yy = 2 * y;
                    const auto zz = 2 * z;

                    // first layer
                    WpZB->voxel( y, x, z ) = distance( yy, xx, zz + 2, yy, xx, zz + 1 ) + distance( yy, xx + 1, zz + 2, yy, xx + 1, zz + 1 ) +
                        distance( yy, xx, zz + 3, yy, xx, zz + 2 ) + distance( yy, xx + 1, zz + 3, yy, xx + 1, zz + 2 ) + distance( yy, xx + 1, zz + 3, yy, xx, zz + 3 ) -
                        distance( yy, xx + 1, zz + 2, yy, xx, zz + 2 ) - distance( yy, xx + 1, zz + 1, yy, xx + 1, zz + 1 );

                    //second layer
                    yy = yy + 1;
                    WpZB->voxel( y, x, z ) = WpZB->voxel( y, x, z ) + distance( yy, xx, zz + 2, yy, xx, zz + 1 ) + distance( yy, xx + 1, zz + 2, yy, xx + 1, zz + 1 ) +
                        distance( yy, xx, zz + 3, yy, xx, zz + 2 ) + distance( yy, xx + 1, zz + 3, yy, xx + 1, zz + 2 ) + distance( yy, xx + 1, zz + 3, yy, xx, zz + 3 ) -
                        distance( yy, xx + 1, zz + 2, yy, xx, zz + 2 ) - distance( yy, xx + 1, zz + 1, yy, xx + 1, zz + 1 );

                    //third layer
                    yy = yy - 1;
                    WpZB->voxel( y, x, z ) = WpZB->voxel( y, x, z ) + distance( yy + 1, xx, zz + 2, yy, xx, zz + 2 ) + distance( yy + 1, xx + 1, zz + 2, yy, xx + 1, zz + 2 ) -
                        distance( yy + 1, xx, zz + 1, yy, xx, zz + 1 ) - distance( yy + 1, xx + 1, zz + 1, yy, xx + 1, zz + 1 ) -
                        distance( yy + 1, xx, zz, yy, xx, zz ) - distance( yy + 1, xx + 1, zz, yy, xx + 1, zz );
                }
            }
        }

        return std::make_tuple( WpXR, WpXL, WpYU, WpYD, WpZF, WpZB );
    }

    auto imgradientxyzmag( tgt::Vector3<int64_t> dimensions, const std::function<double( size_t, size_t, size_t )>& volume )
    {
        auto Gx = new voreen::VolumeAtomic<double>( dimensions );
        auto Gy = new voreen::VolumeAtomic<double>( dimensions );
        auto Gz = new voreen::VolumeAtomic<double>( dimensions );
        auto Gmag = new voreen::VolumeAtomic<double>( dimensions );

        for( int64_t x = 0; x < dimensions.x; ++x )
        {
            for( int64_t y = 0; y < dimensions.y; ++y )
            {
                for( int64_t z = 0; z < dimensions.z; ++z )
                {
                    const auto xl = std::max( x - 1, int64_t { 0 } );
                    const auto xh = std::min( x + 1, dimensions.x - 1 );
                    const auto yl = std::max( y - 1, int64_t { 0 } );
                    const auto yh = std::min( y + 1, dimensions.y - 1 );
                    const auto zl = std::max( z - 1, int64_t { 0 } );
                    const auto zh = std::min( z + 1, dimensions.z - 1 );

                    const auto gx = Gx->voxel( x, y, z ) =
                        1.0 * volume( xh, yl, zl ) + 3.0 * volume( xh, yl, z ) + 1.0 * volume( xh, yl, zh ) +
                        3.0 * volume( xh, y, zl ) + 6.0 * volume( xh, y, z ) + 3.0 * volume( xh, y, zh ) +
                        1.0 * volume( xh, yh, zl ) + 3.0 * volume( xh, yh, z ) + 1.0 * volume( xh, yh, zh ) -

                        1.0 * volume( xl, yl, zl ) - 3.0 * volume( xl, yl, z ) - 1.0 * volume( xl, yl, zh ) -
                        3.0 * volume( xl, y, zl ) - 6.0 * volume( xl, y, z ) - 3.0 * volume( xl, y, zh ) -
                        1.0 * volume( xl, yh, zl ) - 3.0 * volume( xl, yh, z ) - 1.0 * volume( xl, yh, zh );

                    const auto gy = Gy->voxel( x, y, z ) =
                        1.0 * volume( xl, yh, zl ) + 3.0 * volume( xl, yh, z ) + 1.0 * volume( xl, yh, zh ) +
                        3.0 * volume( x, yh, zl ) + 6.0 * volume( x, yh, z ) + 3.0 * volume( x, yh, zh ) +
                        1.0 * volume( xh, yh, zl ) + 3.0 * volume( xh, yh, z ) + 1.0 * volume( xh, yh, zh ) -

                        1.0 * volume( xl, yl, zl ) - 3.0 * volume( xl, yl, z ) - 1.0 * volume( xl, yl, zh ) -
                        3.0 * volume( x, yl, zl ) - 6.0 * volume( x, yl, z ) - 3.0 * volume( x, yl, zh ) -
                        1.0 * volume( xh, yl, zl ) - 3.0 * volume( xh, yl, z ) - 1.0 * volume( xh, yl, zh );

                    const auto gz = Gz->voxel( x, y, z ) =
                        1.0 * volume( xl, yl, zh ) + 3.0 * volume( xl, y, zh ) + 1.0 * volume( xl, yh, zh ) +
                        3.0 * volume( x, yl, zh ) + 6.0 * volume( x, y, zh ) + 3.0 * volume( x, yh, zh ) +
                        1.0 * volume( xh, yl, zh ) + 3.0 * volume( xh, y, zh ) + 1.0 * volume( xh, yh, zh ) -

                        1.0 * volume( xl, yl, zl ) - 3.0 * volume( xl, y, zl ) - 1.0 * volume( xl, yh, zl ) -
                        3.0 * volume( x, yl, zl ) - 6.0 * volume( x, y, zl ) - 3.0 * volume( x, yh, zl ) -
                        1.0 * volume( xh, yl, zl ) - 3.0 * volume( xh, y, zl ) - 1.0 * volume( xh, yh, zl );

                    Gmag->voxel( x, y, z ) = std::sqrt( gx * gx + gy * gy + gz * gz );
                }
            }
        }

        return std::make_tuple( Gx, Gy, Gz, Gmag );
    }

    auto locTerm3D( int64_t visitId, tgt::Vector3<int64_t> pos, tgt::Vector3<int64_t> dim )
    {
        //     w = abs(visitId - ((dim(1) - pos(1)+1)*dim(2)+pos(2)))/(dim(1)*dim(2))*256;

        //     % get center of the volume
            //     normT = 1/(dim(1)*dim(2)*dim(3));
        //     Ctr = [dim(1)/2,dim(2)/2,dim(3)/2];
        //     CtrId = (Ctr(3)*dim(3) + Ctr(1))*dim(2)+Ctr(2);
        //     % get distance to center of the volume
            //     distId2Ctr = visitId - CtrId;
        //     distPos2Ctr = ((pos(3)-Ctr(3))*dim(1)+(pos(1)-Ctr(1)))*dim(2)+pos(2)-Ctr(2);
        //     w = abs(distId2Ctr - distPos2Ctr) * normT ;
        //      w = w * 255;

        // get center of the volume
        // LINFO( "locTerm3D begin" );

        const auto posF = pos.cast<double>() / dim;
        const auto bkSize = 0.5; // 1 / 8 of the size
        const auto portY = std::floor( posF[0] / bkSize );
        const auto portX = std::floor( posF[1] / bkSize );
        const auto portZ = std::floor( posF[2] / bkSize );
        const auto CtrThis = tgt::Vector3<int64_t> {
            static_cast<int64_t>( dim[0] * ( portY + 0.5 ) * bkSize ),
            static_cast<int64_t>( dim[1] * ( portX + 0.5 ) * bkSize ),
            static_cast<int64_t>( dim[2] * ( portZ + 0.5 ) * bkSize )
        };
        const auto CtrThisId = ( CtrThis[2] * dim[0] + CtrThis[0] ) * dim[1] + CtrThis[1];
        const auto  distId2PosId = std::abs( visitId - CtrThisId );
        const auto  distPos2Ctr = tgt::length( tgt::Vector3<double>( pos - CtrThis ) ); // ( pos( 1 ) - Ctr( 1 ) )* dim( 2 ) + pos( 2 ) - Ctr( 2 );
        const auto normC = 1.0 / ( bkSize * bkSize * bkSize * dim[0] * dim[1] * dim[2] );
        // w = abs( distId2PosId * normT - distPos2Ctr * normC ) / factor;
        // w = abs( distId2PosId * normT - distPos2Ctr * normC ) * 255;

        // LINFO( "locTerm3D end" );
        return abs( distPos2Ctr * normC ) * 255;
    }

    auto minKey3D2( const std::vector<tgt::Vector3<int64_t>>& zmstSet, int64_t zmstLast, const voreen::VolumeAtomic<uint8_t>& zTaken,
        const voreen::VolumeAtomic<double>& WXR, const voreen::VolumeAtomic<double>& WXL,
        const voreen::VolumeAtomic<double>& WYU, const voreen::VolumeAtomic<double>& WYD,
        const voreen::VolumeAtomic<double>& WZB, const voreen::VolumeAtomic<double>& WZF,
        int64_t dimX, int64_t dimY, int64_t dimZ )
    {
        // find the smallest weight of current location idx
        auto minVal = std::numeric_limits<double>::max();
        auto minidx = tgt::Vector3<int64_t>( 0, 0, 0 );
        auto parentidx = tgt::Vector3<int64_t>( 0, 0, 0 );
        auto minDir = 0; // minvalue direction from current node

        const auto alpha = 0.0;
        const auto beta = 1.0;

        for( int64_t i = zmstLast; i > 0; --i )
        {
            // LINFO( "minKey3D2: " << i );
            const auto iid = zmstSet[i - 1];
            const auto idX = iid[1];
            const auto idY = iid[0];
            const auto idZ = iid[2];

            if( idY - 1 < 1 ); // up
            else if( zTaken.voxel( idY - 1 - 1, idX - 1, idZ - 1 ) == false )
            {
                const auto val = ( 1 - alpha ) * ( beta * WYU.voxel( idY - 1 - 1, idX - 1, idZ - 1 ) ) +
                    alpha * locTerm3D( zmstLast + 1, tgt::Vector3<int64_t>( idY - 1, idX, idZ ), tgt::Vector3<int64_t>( dimY, dimX, dimZ ) );
                if( val < minVal )
                {
                    minVal = val;
                    minidx = tgt::Vector3<int64_t>( idY - 1, idX, idZ );
                    parentidx = tgt::Vector3<int64_t>( idY, idX, idZ );
                    minDir = 1;
                }
            }

            if( idX + 1 > dimX ); // right
            else if( zTaken.voxel( idY - 1, idX + 1 - 1, idZ - 1 ) == false )
            {
                const auto val = ( 1 - alpha ) * ( beta * WXR.voxel( idY - 1, idX - 1, idZ - 1 ) ) +
                    alpha * locTerm3D( zmstLast + 1, tgt::Vector3<int64_t>( idY, idX, idZ ), tgt::Vector3<int64_t>( dimY, dimX, dimZ ) );
                if( val < minVal )
                {
                    minVal = val;
                    minidx = tgt::Vector3<int64_t>( idY, idX + 1, idZ );
                    parentidx = tgt::Vector3<int64_t>( idY, idX, idZ );
                    minDir = 3;
                }
            }

            if( idY + 1 > dimY ); // down
            else if( zTaken.voxel( idY + 1 - 1, idX - 1, idZ - 1 ) == false )
            {
                const auto val = ( 1 - alpha ) * ( beta * WYD.voxel( idY - 1, idX - 1, idZ - 1 ) )
                    + alpha * locTerm3D( zmstLast + 1, tgt::Vector3<int64_t>( idY, idX, idZ ), tgt::Vector3<int64_t>( dimY, dimX, dimZ ) );
                if( val < minVal )
                {
                    minVal = val;
                    minidx = tgt::Vector3<int64_t>( idY + 1, idX, idZ );
                    parentidx = tgt::Vector3<int64_t>( idY, idX, idZ );
                    minDir = 2;
                }
            }

            if( idX - 1 < 1 ); // left
            else if( zTaken.voxel( idY - 1, idX - 1 - 1, idZ - 1 ) == false )
            {
                const auto val = ( 1 - alpha ) * ( beta * WXL.voxel( idY - 1, idX - 1 - 1, idZ - 1 ) )
                    + alpha * locTerm3D( zmstLast + 1, tgt::Vector3<int64_t>( idY, idX - 1, idZ ), tgt::Vector3<int64_t>( dimY, dimX, dimZ ) );
                if( val < minVal )
                {
                    minVal = val;
                    minidx = tgt::Vector3<int64_t>( idY, idX - 1, idZ );
                    parentidx = tgt::Vector3<int64_t>( idY, idX, idZ );
                    minDir = 4;
                }
            }

            if( idZ + 1 > dimZ ); // back
            else if( zTaken.voxel( idY - 1, idX - 1, idZ + 1 - 1 ) == false )
            {
                const auto val = ( 1 - alpha ) * ( beta * WZB.voxel( idY - 1, idX - 1, idZ - 1 ) ) +
                    alpha * locTerm3D( zmstLast + 1, tgt::Vector3<int64_t>( idY, idX, idZ ), tgt::Vector3<int64_t>( dimY, dimX, dimZ ) );
                if( val < minVal )
                {
                    minVal = val;
                    minidx = tgt::Vector3<int64_t>( idY, idX, idZ + 1 );
                    parentidx = tgt::Vector3<int64_t>( idY, idX, idZ );
                    minDir = 5;
                }
            }

            if( idZ - 1 < 1 ); // left
            else if( zTaken.voxel( idY - 1, idX - 1, idZ - 1 - 1 ) == false )
            {
                const auto val = ( 1 - alpha ) * ( beta * WZF.voxel( idY - 1, idX - 1, idZ - 1 - 1 ) ) +
                    alpha * locTerm3D( zmstLast + 1, tgt::Vector3<int64_t>( idY, idX, idZ - 1 ), tgt::Vector3<int64_t>( dimY, dimX, dimZ ) );
                if( val < minVal )
                {
                    minVal = val;
                    minidx = tgt::Vector3<int64_t>( idY, idX, idZ - 1 );
                    parentidx = tgt::Vector3<int64_t>( idY, idX, idZ );
                    minDir = 6;
                }
            }
        }

        return std::make_tuple( minidx, parentidx, minDir );
    }

    auto findMinSpanTree3D2(
        const voreen::VolumeAtomic<double>& WpXR, const voreen::VolumeAtomic<double>& WpXL,
        const voreen::VolumeAtomic<double>& WpYU, const voreen::VolumeAtomic<double>& WpYD,
        const voreen::VolumeAtomic<double>& WpZB, const voreen::VolumeAtomic<double>& WpZF )
    {
        const auto dimY = static_cast<int64_t>( WpXR.getDimensions().x );
        const auto dimXx = static_cast<int64_t>( WpXR.getDimensions().y );
        const auto dimZ = static_cast<int64_t>( WpXR.getDimensions().z );

        const auto dimYy = static_cast<int64_t>( WpYU.getDimensions().x );
        const auto dimX = static_cast<int64_t>( WpYU.getDimensions().y );
        // const auto dimZ = static_cast<int64_t>( WpYU.getDimensions().z );

        auto T = new voreen::VolumeAtomic<vec6>( tgt::svec3( dimY, dimX, dimZ ) );
        T->fill( vec6( 0 ) );

        voreen::VolumeAtomic<uint8_t> posTaken( tgt::svec3( dimY, dimX, dimZ ) );
        posTaken.fill( false );
        auto mstSet = std::vector<tgt::Vector3<int64_t>>( dimX * dimY * dimZ, tgt::Vector3<int64_t>( 0, 0, 0 ) );

        auto nextid = tgt::Vector3<int64_t>( dimY, 1, 1 );
        mstSet[0] = nextid;
        posTaken.voxel( nextid[0] - 1, nextid[1] - 1, nextid[2] - 1 ) = true;

        for( int64_t mstLast = 1; mstLast <= dimX * dimY * dimZ - 1; ++mstLast ) // remaining nodes
        {
            const auto [nextid, parentid, minDir] = minKey3D2( mstSet, mstLast, posTaken, WpXR, WpXL, WpYU, WpYD, WpZB, WpZF, dimX, dimY, dimZ );
            // LINFO( "minKey3D2 with mstLast=" << mstLast << " yielded nextid=" << nextid );

            mstSet[mstLast + 1 - 1] = nextid;
            posTaken.voxel( nextid[0] - 1, nextid[1] - 1, nextid[2] - 1 ) = true;
            T->voxel( parentid - tgt::Vector3<int64_t>( 1 ) )[minDir - 1] = 1;
        }

        return std::make_tuple( T, mstSet );
    }

    auto getElementHamCube( int64_t hamMode )
    {
        auto circGraphAdjMat = std::array<std::array<int64_t, 8>, 8>();
        switch( hamMode )
        {
        case 1:
            circGraphAdjMat = {
                0, 0, 0, 1, 0, 1, 0, 0, // p1 < ->p4, p1 < ->p6
                0, 0, 1, 0, 0, 0, 1, 0, // p2 < ->p3, p2 < ->p7
                0, 1, 0, 1, 0, 0, 0, 0, // p3 < ->p2, p3 < ->p4
                1, 0, 1, 0, 0, 0, 0, 0, // p4 < ->p1, p4 < ->p3
                0, 0, 0, 0, 0, 1, 0, 1, // p5 < ->p6, p5 < ->p8
                1, 0, 0, 0, 1, 0, 0, 0, // p6 < ->p1, p6 < ->p5
                0, 1, 0, 0, 0, 0, 0, 1, // p7 < ->p2, p7 < ->p8
                0, 0, 0, 0, 1, 0, 1, 0
            };
            break;
        case 2:
            circGraphAdjMat = {
                0, 1, 0, 1, 0, 0, 0, 0, // p1<->p4, p1<->p2
                1, 0, 1, 0, 0, 0, 0, 0, // p2<->p3, p2<->p1
                0, 1, 0, 0, 0, 0, 0, 1, // p3<->p2, p3<->p8
                1, 0, 0, 0, 1, 0, 0, 0, // p4<->p1, p4<->p5
                0, 0, 0, 1, 0, 1, 0, 0, // p5<->p6, p5<->p4
                0, 0, 0, 0, 1, 0, 1, 0, // p6<->p7, p6<->p5
                0, 0, 0, 0, 0, 1, 0, 1, // p7<->p6, p7<->p8
                0, 0, 1, 0, 0, 0, 1, 0
            };
            break;
        case 3:
            circGraphAdjMat = {
                0, 1, 0, 0, 0, 1, 0, 0, // p1<->p2, p1<->p6
                1, 0, 1, 0, 0, 0, 0, 0, // p2<->p3, p2<->p1
                0, 1, 0, 1, 0, 0, 0, 0, // p3<->p2, p3<->p4
                0, 0, 1, 0, 1, 0, 0, 0, // p4<->p3, p4<->p5
                0, 0, 0, 1, 0, 0, 0, 1, // p5<->p8, p5<->p4
                1, 0, 0, 0, 0, 0, 1, 0, // p6<->p7, p6<->p1
                0, 0, 0, 0, 0, 1, 0, 1, // p7<->p6, p7<->p8
                0, 0, 0, 0, 1, 0, 1, 0  // p8<->p5, p8<->p7
            };
            break;
        case 4:
            circGraphAdjMat = {
                0, 1, 0, 1, 0, 0, 0, 0, // p1<->p2, p1<->p4
                1, 0, 0, 0, 0, 0, 1, 0, // p2<->p3, p2<->p7
                0, 0, 0, 1, 0, 0, 0, 1, // p3<->p4, p3<->p8
                1, 0, 1, 0, 0, 0, 0, 0, // p4<->p3, p4<->p1
                0, 0, 0, 0, 0, 1, 0, 1, // p5<->p8, p5<->p6
                0, 0, 0, 0, 1, 0, 1, 0, // p6<->p7, p6<->p5
                0, 1, 0, 0, 0, 1, 0, 0, // p7<->p6, p7<->p2
                0, 0, 1, 0, 1, 0, 0, 0  // p8<->p5, p8<->p3
            };
            break;
        case 5:
            circGraphAdjMat = {
                0, 0, 0, 1, 0, 1, 0, 0, // p1<->p6, p1<->p4
                0, 0, 1, 0, 0, 0, 1, 0, // p2<->p3, p2<->p7
                0, 1, 0, 0, 0, 0, 0, 1, // p3<->p2, p3<->p8
                1, 0, 0, 0, 1, 0, 0, 0, // p4<->p5, p4<->p1
                0, 0, 0, 1, 0, 0, 0, 1, // p5<->p8, p5<->p4
                1, 0, 0, 0, 0, 0, 1, 0, // p6<->p7, p6<->p1
                0, 1, 0, 0, 0, 1, 0, 0, // p7<->p6, p7<->p2
                0, 0, 1, 0, 1, 0, 0, 0  // p8<->p5, p8<->p3
            };
            break;
        case 6:
            circGraphAdjMat = {
                0, 1, 0, 0, 0, 1, 0, 0, // %p1<->p6, p1<->p2
                1, 0, 0, 0, 0, 0, 1, 0, // %p2<->p1, p2<->p7
                0, 0, 0, 1, 0, 0, 0, 1, // %p3<->p4, p3<->p8
                0, 0, 1, 0, 1, 0, 0, 0, // %p4<->p5, p4<->p3
                0, 0, 0, 1, 0, 1, 0, 0, // %p5<->p6, p5<->p4
                1, 0, 0, 0, 1, 0, 0, 0, // %p6<->p5, p6<->p1
                0, 1, 0, 0, 0, 0, 0, 1, // %p7<->p8, p7<->p2
                0, 0, 1, 0, 0, 0, 1, 0  // %p8<->p7, p8<->p3
            };
            break;
        }
        return circGraphAdjMat;
    }

    auto findAdjParallelEdges(
        const std::vector<std::pair<tgt::Vector4<int64_t>, tgt::Vector4<int64_t>>>& eH,
        const std::array<tgt::Vector4<int64_t>, 4>& adjPixInCurrCirc,
        const std::array<tgt::Vector3<int64_t>, 8>& pixInCurrCirc,
        const std::array<std::array<int64_t, 8>, 8>& circGraphAdjMat )
    {
        bool hasParallel = false;
        auto edgesToBreak = std::vector<std::pair<tgt::Vector4<int64_t>, tgt::Vector4<int64_t>>>();
        for( int64_t i = 0; i < adjPixInCurrCirc.size(); ++i )
        {
            const auto t = adjPixInCurrCirc[i][3] - 1;

            std::vector<int64_t> circE;
            for( int64_t j = 0; j < circGraphAdjMat.size(); ++j )
                if( circGraphAdjMat[t][j] ) circE.push_back( j );

            // get none zero edge id
            for( int64_t j = 0; j < circE.size(); ++j )
            {
                const auto s = circE[j];
                const auto eC = pixInCurrCirc[t] - pixInCurrCirc[s];
                for( int64_t kk = 0; kk < eH.size(); ++kk ) // check for each edge in eH
                {
                    // distance requirement

                    // TODO: Make sure that the vertices in currCirc and hamCyc are
                    // not twisting!!!

                    const auto eCctr = tgt::Vector3d( pixInCurrCirc[t] + pixInCurrCirc[s] ) / 2.0;
                    const auto eHkctr4D = tgt::Vector4d( eH[kk].first + eH[kk].second ) / 2.0;
                    const auto eHkctr = tgt::Vector3d( eHkctr4D.x, eHkctr4D.y, eHkctr4D.z );

                    const auto eHFirst3D = tgt::Vector3<int64_t>( eH[kk].first.x, eH[kk].first.y, eH[kk].first.z );
                    const auto eHSecond3D = tgt::Vector3<int64_t>( eH[kk].first.x, eH[kk].first.y, eH[kk].first.z );

                    if( tgt::lengthSq( eCctr - eHkctr ) == 1.0 ) // adjacent
                    {
                        const auto eHk = eHFirst3D - eHSecond3D;
                        if( tgt::length( tgt::cross( eC, eHk ) ) == 0 ) // are they parallel
                        {
                            if( tgt::length( pixInCurrCirc[t] - eHFirst3D ) == 1 )
                            {
                                edgesToBreak.push_back( std::make_pair( tgt::Vector4<int64_t>( pixInCurrCirc[t], t + 1 ), tgt::Vector4<int64_t>( pixInCurrCirc[s], s + 1 ) ) );
                            }
                            else
                            {
                                edgesToBreak.push_back( std::make_pair( tgt::Vector4<int64_t>( pixInCurrCirc[s], s + 1 ), tgt::Vector4<int64_t>( pixInCurrCirc[t], t + 1 ) ) );
                            }
                            edgesToBreak.push_back( eH[kk] );
                            hasParallel = true;
                            return edgesToBreak;
                        }
                    }
                }
            }
        }

        if( !hasParallel )
            edgesToBreak.clear();
        return edgesToBreak;
    }

    int64_t recCnt;
    int64_t MAX_CNT;

    auto nnz( const std::array<int64_t, 8>& hamPath )
    {
        int64_t count = 0;
        for( const auto value : hamPath ) if( value ) ++count;
        return count;
    }

    auto isPathSafe( const std::array<int64_t, 8>& hamPath, int64_t testNode )
    {
        for( int64_t ii = 0; ii < hamPath.size(); ++ii ) if( hamPath[ii] )
        {
            if( hamPath[ii] == testNode ) return 0;
        }
        return 1;
    }

    auto hamRecNR( const std::array<std::array<int64_t, 8>, 8>& Graph, std::array<int64_t, 8>& hamPath,
        int64_t Source, int64_t Destination, int64_t totalNodes, int64_t nodesFound )
    {
        std::fill( hamPath.begin(), hamPath.end(), 0 );

        auto degrees = std::array<int64_t, 8>{};
        for( int64_t i = 0; i < 8; ++i )
            for( int64_t j = 0; j < 8; ++j )
                degrees[i] += Graph[i][j];

        auto visited = std::array<std::array<int64_t, 8>, 8>{};

        auto stack = std::stack<int64_t>();
        stack.push( Source );
        auto cnt = 0;

        while( !stack.empty() )
        {
            cnt = cnt + 1;
            if( cnt > MAX_CNT )
                return 0;

            auto noWhereToGo = true;
            const auto nodesFound = nnz( hamPath );

            if( ( nodesFound == totalNodes - 1 && Source != Destination ) || ( nodesFound == totalNodes && Source == Destination ) )
            {
                if( Graph[hamPath[nodesFound]][Destination] != 0 )
                {
                    hamPath[nodesFound + 1] = Destination;
                    return 1;
                }
                else return 0;
            }

            const auto node = stack.top();
            stack.pop();
            if( nodesFound >= 1 )
                visited[hamPath[nodesFound - 1] - 1][node - 1] = 1;
            hamPath[nodesFound + 1 - 1] = node;

            for( int64_t i = totalNodes; i > 0; --i )
            {
                if( Graph[node - 1][i - 1] )
                {
                    if( i == Destination )
                    {
                        visited[node - 1][i - 1] = 1;
                        const auto lastN = nnz( hamPath );

                        if( ( lastN == totalNodes - 1 && Source != Destination ) || ( lastN == totalNodes && Source == Destination ) ) // check finish first!
                        {
                            if( Graph[hamPath[lastN - 1] - 1][Destination - 1] != 0 )
                            {
                                hamPath[lastN + 1 - 1] = Destination;
                                return 1;
                            }
                            else return 0;
                        }

                        continue;
                    }

                    if( isPathSafe( hamPath, i ) )
                    {
                        noWhereToGo = false;
                        stack.push( i );
                    }
                    else
                    {
                        visited[node - 1][i - 1] = 1;
                    }
                }
            }

            if( noWhereToGo )
            {
                const auto k = nnz( hamPath ); // remove last node from path
                std::fill( visited[hamPath[k - 1] - 1].begin(), visited[hamPath[k - 1] - 1].end(), 0 );
                hamPath[k - 1] = 0;

                auto Status = 0;

                for( int64_t l = k - 1; l > 0; --l )
                {
                    const auto nk = hamPath[l - 1];
                    const auto sv = std::accumulate( visited[nk - 1].begin(), visited[nk - 1].end(), 0 );
                    if( sv >= degrees[nk - 1] )
                    {
                        std::fill( visited[nk - 1].begin(), visited[nk - 1].end(), 0 ); // reset flags
                        hamPath[l - 1] = 0;
                    }
                    else break;
                }
            }
        }

        return 1;
    }

    auto hamiltonian( const std::array<std::array<int64_t, 8>, 8>& Graph, int64_t Source, int64_t Destination, int64_t totalNodes )
    {
        auto hamPath = std::array<int64_t, 8>{};
        hamPath[0] = Source;

        recCnt = 0;
        MAX_CNT = 8 * 8 * 15;

        const auto status = hamRecNR( Graph, hamPath, Source, Destination, totalNodes, 1 );
        if( status == 0 )
        {
            if( Source != Destination )
            {
                hamPath = std::array<int64_t, 8>{};
                std::cout << "No Path Found" << std::endl;
            }
            else
            {
                hamPath = std::array<int64_t, 8>{};
                std::cout << "No Cycle Found" << std::endl;
            }
        }

        return hamPath;
    }

    auto parallelEdgeCombine(
        const std::vector<tgt::Vector3<int64_t>>& hamCyc,
        const std::vector<std::pair<tgt::Vector4<int64_t>, tgt::Vector4<int64_t>>>& edgesToBreak,
        const std::array<tgt::Vector3<int64_t>, 8>& pixInCurrCirc,
        const std::array<std::array<int64_t, 8>, 8>& circGraphAdjMat )
    {
        auto hamCycComb = hamCyc;
        const auto startVCircId = edgesToBreak[0].first.w;
        const auto endVCircId = edgesToBreak[0].second.w;

        int64_t currCycLen = 0;
        for( ; currCycLen < hamCyc.size(); ++currCycLen )
            if( !hamCyc[currCycLen].x || !hamCyc[currCycLen].y || !hamCyc[currCycLen].z )
                break;

        auto edgeBrokeAdjMat = circGraphAdjMat;
        edgeBrokeAdjMat[startVCircId - 1][endVCircId - 1] = 0;
        edgeBrokeAdjMat[endVCircId - 1][startVCircId - 1] = 0;

        const auto startVCycId = edgesToBreak[1].first.w;
        const auto endVCycId = edgesToBreak[1].second.w;

        std::copy( hamCyc.begin(), hamCyc.begin() + startVCycId, hamCycComb.begin() );
        auto currId = startVCycId;

        // merge with the curr circ
        // find the hamPath
        auto hamPath = hamiltonian( edgeBrokeAdjMat, startVCircId, endVCircId, edgeBrokeAdjMat.size() );
        for( int64_t i = 0; i < hamPath.size(); ++i )
        {
            const auto vk = hamPath[i];
            currId = currId + 1;
            hamCycComb[currId - 1] = pixInCurrCirc[vk - 1];
        }
        std::copy( hamCyc.begin() + endVCycId - 1, hamCyc.begin() + currCycLen, hamCycComb.begin() + currId + 1 - 1 );

        return hamCycComb;
    }

    auto nonParallelCombine(
        const std::vector<tgt::Vector3<int64_t>>& hamCyc,
        const std::array<tgt::Vector4<int64_t>, 4>& adjPixInHamCyc,
        const std::array<tgt::Vector4<int64_t>, 4>& adjPixInCurrCirc,
        tgt::Vector3<int64_t> pCCMin, tgt::Vector3<int64_t> pCCMax )
    {
        auto hamCycComb = hamCyc;
        int64_t startId = 1;
        int64_t wid = 1;

        auto currCircSearchDir = tgt::cross( adjPixInCurrCirc[1].xyz() - adjPixInCurrCirc[0].xyz(), adjPixInCurrCirc[2].xyz() - adjPixInCurrCirc[0].xyz() );
        const auto tryVcurrCirc = adjPixInCurrCirc[0].xyz() + currCircSearchDir;
        const auto distToCircMin = tryVcurrCirc - pCCMin;

        if( tgt::min( distToCircMin ) < 0 || tgt::max( distToCircMin ) > 1 )
            currCircSearchDir = currCircSearchDir * -1l;

        for( int64_t breakPt : {1, 2} )
        {
            auto startVCycId = adjPixInHamCyc[2 * breakPt - 1 - 1].w;

            // copy part before the merged region
            std::copy( hamCyc.begin() + startId - 1, hamCyc.begin() + startVCycId, hamCycComb.begin() + wid - 1 );

            const auto inPixInCurrCirc = adjPixInCurrCirc[2 * breakPt - 1 - 1].xyz();
            const auto outPixInCurrCirc = adjPixInCurrCirc[2 * breakPt - 1].xyz();
            wid = wid + startVCycId - startId + 1;

            hamCycComb[wid - 1] = inPixInCurrCirc;
            hamCycComb[wid + 1 - 1] = inPixInCurrCirc + currCircSearchDir; // pCC(); // next adjacent pix in currCirc
            hamCycComb[wid + 2 - 1] = outPixInCurrCirc + currCircSearchDir; // next adjacent pix in currCirc
            hamCycComb[wid + 3 - 1] = outPixInCurrCirc; // next adjacent pix in currCirc

            // copy part after the merged region
            const auto endVCycId = adjPixInHamCyc[2 * breakPt - 1].w;
            const auto copyLen = endVCycId - ( startVCycId + 1 ) + 1;
            wid = wid + 4;
            std::copy( hamCyc.begin() + startVCycId + 1 - 1, hamCyc.begin() + endVCycId, hamCycComb.begin() + wid - 1 );

            startId = endVCycId + 1;
            wid = wid + copyLen;
        }

        int64_t currCycLen = 0;
        for( ; currCycLen < hamCyc.size(); ++currCycLen )
            if( !hamCyc[currCycLen].x || !hamCyc[currCycLen].y || !hamCyc[currCycLen].y ) break;

        // copy the residual part in hamCyc if any
        if( startId < currCycLen )
            std::copy( hamCyc.begin() + startId - 1, hamCyc.begin() + currCycLen, hamCycComb.begin() + wid - 1 );

        return hamCycComb;
    }

    auto mergeToCyc3D( const std::vector<tgt::Vector3<int64_t>>& hamCycOld, tgt::Vector3<int64_t> currCirc, tgt::Vector3<int64_t> mergeDir )
    {
        auto hamCycNew = hamCycOld;
        int64_t lastN = 0;
        for( ; lastN < hamCycOld.size(); ++lastN ) if( !hamCycOld[lastN].x || !hamCycOld[lastN].y || !hamCycOld[lastN].z )
            break;

        auto pCC = std::array<tgt::Vector3<int64_t>, 8>();
        pCC[0] = tgt::Vector3<int64_t>( 2 * ( currCirc[0] - 1 ) + 1, 2 * ( currCirc[1] - 1 ) + 1, 2 * ( currCirc[2] - 1 ) + 1 );
        pCC[1] = pCC[0] + tgt::Vector3<int64_t>( 0, 1, 0 );
        pCC[2] = pCC[1] + tgt::Vector3<int64_t>( 1, 0, 0 );
        pCC[3] = pCC[2] + tgt::Vector3<int64_t>( 0, -1, 0 );
        pCC[4] = pCC[3] + tgt::Vector3<int64_t>( 0, 0, 1 );
        pCC[5] = pCC[4] + tgt::Vector3<int64_t>( -1, 0, 0 );
        pCC[6] = pCC[5] + tgt::Vector3<int64_t>( 0, 1, 0 );
        pCC[7] = pCC[6] + tgt::Vector3<int64_t>( 1, 0, 0 );

        const auto pCCMin = pCC[0];
        const auto pCCMax = pCC[7];

        if( lastN == 0 )
        {
            const auto edgeBreakId = 0;
            auto tDir = mergeDir;
            // first node in hamCyc
            if( tDir[0] != 0 )
            {
                if( tDir[0] == 1 )
                {
                    hamCycNew[edgeBreakId + 1 - 1] = pCC[0]; // top left front
                    hamCycNew[edgeBreakId + 4 - 1] = pCC[1]; // top right front
                    hamCycNew[edgeBreakId + 3 - 1] = pCC[2]; // bottom right front
                    hamCycNew[edgeBreakId + 2 - 1] = pCC[3]; // bottom left front
                    hamCycNew[edgeBreakId + 7 - 1] = pCC[4]; // bottom left back
                    hamCycNew[edgeBreakId + 8 - 1] = pCC[5]; // top left back
                    hamCycNew[edgeBreakId + 5 - 1] = pCC[6]; // top right back
                    hamCycNew[edgeBreakId + 6 - 1] = pCC[7]; // bottom right back
                }
                else if( tDir[0] == -1 )
                {
                    hamCycNew[edgeBreakId + 2 - 1] = pCC[0]; // top left front
                    hamCycNew[edgeBreakId + 3 - 1] = pCC[1]; // top right front
                    hamCycNew[edgeBreakId + 4 - 1] = pCC[2]; // bottom right front
                    hamCycNew[edgeBreakId + 1 - 1] = pCC[3]; // bottom left front
                    hamCycNew[edgeBreakId + 8 - 1] = pCC[4]; // bottom left back
                    hamCycNew[edgeBreakId + 7 - 1] = pCC[5]; // top left back
                    hamCycNew[edgeBreakId + 6 - 1] = pCC[6]; // top right back
                    hamCycNew[edgeBreakId + 5 - 1] = pCC[7]; // bottom right back
                }
            }
            else if( tDir[1] != 0 )
            {
                if( tDir[1] == 1 )
                {
                    hamCycNew[edgeBreakId + 4 - 1] = pCC[0]; // top left front
                    hamCycNew[edgeBreakId + 3 - 1] = pCC[1]; // top right front
                    hamCycNew[edgeBreakId + 2 - 1] = pCC[2]; // bottom right front
                    hamCycNew[edgeBreakId + 1 - 1] = pCC[3]; // bottom left front
                    hamCycNew[edgeBreakId + 8 - 1] = pCC[4]; // bottom left back
                    hamCycNew[edgeBreakId + 5 - 1] = pCC[5]; // top left back
                    hamCycNew[edgeBreakId + 6 - 1] = pCC[6]; // top right back
                    hamCycNew[edgeBreakId + 7 - 1] = pCC[7]; // bottom right back
                }
                else if( tDir[1] == -1 )
                {
                    hamCycNew[edgeBreakId + 8 - 1] = pCC[0]; // top left front
                    hamCycNew[edgeBreakId + 7 - 1] = pCC[1]; // top right front
                    hamCycNew[edgeBreakId + 2 - 1] = pCC[2]; // bottom right front
                    hamCycNew[edgeBreakId + 1 - 1] = pCC[3]; // bottom left front
                    hamCycNew[edgeBreakId + 4 - 1] = pCC[4]; // bottom left back
                    hamCycNew[edgeBreakId + 5 - 1] = pCC[5]; // top left back
                    hamCycNew[edgeBreakId + 6 - 1] = pCC[6]; // top right back
                    hamCycNew[edgeBreakId + 3 - 1] = pCC[7]; // bottom right back
                }
            }
            else
            {
                if( tDir[2] == 1 )
                {
                    hamCycNew[edgeBreakId + 8 - 1] = pCC[0]; // top left front
                    hamCycNew[edgeBreakId + 5 - 1] = pCC[1]; // top right front
                    hamCycNew[edgeBreakId + 4 - 1] = pCC[2]; // bottom right front
                    hamCycNew[edgeBreakId + 1 - 1] = pCC[3]; // bottom left front
                    hamCycNew[edgeBreakId + 2 - 1] = pCC[4]; // bottom left back
                    hamCycNew[edgeBreakId + 7 - 1] = pCC[5]; // top left back
                    hamCycNew[edgeBreakId + 6 - 1] = pCC[6]; // top right back
                    hamCycNew[edgeBreakId + 3 - 1] = pCC[7]; // bottom right back
                }
                else if( tDir[2] == -1 )
                {
                    hamCycNew[edgeBreakId + 6 - 1] = pCC[0]; // top left front
                    hamCycNew[edgeBreakId + 5 - 1] = pCC[1]; // top right front
                    hamCycNew[edgeBreakId + 2 - 1] = pCC[2]; // bottom right front
                    hamCycNew[edgeBreakId + 1 - 1] = pCC[3]; // bottom left front
                    hamCycNew[edgeBreakId + 8 - 1] = pCC[4]; // bottom left back
                    hamCycNew[edgeBreakId + 7 - 1] = pCC[5]; // top left back
                    hamCycNew[edgeBreakId + 4 - 1] = pCC[6]; // top right back
                    hamCycNew[edgeBreakId + 3 - 1] = pCC[7]; // bottom right back
                }
            }

            return hamCycNew;
        }

        // find adjacent pixels in hamCyc and currCirc
        auto adjPixInHamCyc = std::array<tgt::Vector4<int64_t>, 4>{
            tgt::Vector4<int64_t>( 0 ), tgt::Vector4<int64_t>( 0 ), tgt::Vector4<int64_t>( 0 ), tgt::Vector4<int64_t>( 0 )
        };
        auto adjPixInCurrCirc = std::array<tgt::Vector4<int64_t>, 4>{
            tgt::Vector4<int64_t>( 0 ), tgt::Vector4<int64_t>( 0 ), tgt::Vector4<int64_t>( 0 ), tgt::Vector4<int64_t>( 0 )
        };

        auto cnt = 1;
        auto allPixFound = false;
        for( int64_t i = 0; i < lastN; ++i )
        {
            const auto circInHamCyc = tgt::Vector3<int64_t>( ( hamCycOld[i][0] + 1 ) / 2, ( hamCycOld[i][1] + 1 ) / 2, ( hamCycOld[i][2] + 1 ) / 2 );
            const auto tDir = currCirc - circInHamCyc;

            if( tDir[0] == mergeDir[0] && tDir[1] == mergeDir[1] && tDir[2] == mergeDir[2] )
            {
                for( int64_t j = 0; j < 8; ++j )
                {
                    if( tgt::lengthSq( hamCycOld[i] - pCC[j] ) == 1 )
                    {
                        adjPixInHamCyc[cnt - 1].x = hamCycOld[i].x;
                        adjPixInHamCyc[cnt - 1].y = hamCycOld[i].y;
                        adjPixInHamCyc[cnt - 1].z = hamCycOld[i].z;
                        adjPixInHamCyc[cnt - 1].w = i + 1;

                        adjPixInCurrCirc[cnt - 1].x = pCC[j].x;
                        adjPixInCurrCirc[cnt - 1].y = pCC[j].y;
                        adjPixInCurrCirc[cnt - 1].z = pCC[j].z;
                        adjPixInCurrCirc[cnt - 1].w = j + 1;

                        cnt = cnt + 1;
                        if( cnt > 4 )
                        {
                            allPixFound = true;
                            break;
                        }
                    }
                }
            }

            if( allPixFound ) break;
        }

        // check edges in adjPixInHamCyc
        auto eH = std::vector<std::pair<tgt::Vector4<int64_t>, tgt::Vector4<int64_t>>>();
        for( int64_t i = 0; i < adjPixInHamCyc.size(); ++i )
        {
            for( int64_t j = i + 1; j < adjPixInHamCyc.size(); ++j )
            {
                if( abs( adjPixInHamCyc[i].w - adjPixInHamCyc[j].w ) == 1 )
                {
                    eH.push_back( std::make_pair( adjPixInHamCyc[i], adjPixInHamCyc[j] ) );
                }
            }
        }

        // generate a random configuration for the circuit to be merged
        auto allHamModes = std::array<int64_t, 6> { 1, 2, 3, 4, 5, 6 };
        std::mt19937 generator( 123456 );
        std::shuffle( allHamModes.begin(), allHamModes.end(), generator );

        for( int64_t m = 0; m < allHamModes.size(); ++m )
        {
            const auto hamMode = allHamModes[m]; // get a random mode of the 3D cube
            const auto circGraphAdjMat = getElementHamCube( hamMode );
            // find adjacent circuit
            const auto edgesToBreak = findAdjParallelEdges( eH, adjPixInCurrCirc, pCC, circGraphAdjMat );

            if( !edgesToBreak.empty() )
            {
                hamCycNew = parallelEdgeCombine( hamCycOld, edgesToBreak, pCC, circGraphAdjMat );
                return hamCycNew;
            }
        }

        // there's really no way out
        // TODO: If there's branching at vertices, we cannot resolve now
        hamCycNew = nonParallelCombine( hamCycOld, adjPixInHamCyc, adjPixInCurrCirc, pCCMin, pCCMax );
        return hamCycNew;
    }

    auto linearizeHamCycleMerge3D( const voreen::VolumeAtomic<vec6>& mstT, tgt::Vector3<int64_t> dimensions, tgt::Vector3<int64_t> entryPix )
    {
        auto currPix = entryPix;
        auto currCirc = tgt::Vector3<int64_t>( floor( ( currPix[0] + 1 ) / 2.0 ), floor( ( currPix[1] + 1 ) / 2.0 ), floor( ( currPix[2] + 1 ) / 2.0 ) );

        const auto size = dimensions.x * dimensions.y * dimensions.z;
        auto LT = std::vector<double>( size, 0 );
        auto hamCyc = std::vector<tgt::Vector3<int64_t>>( size, tgt::Vector3<int64_t>( 0 ) );

        const auto nneighbors = 6;
        const auto neighborDirs = std::array<tgt::Vector3<int64_t>, 6>{
            tgt::Vector3<int64_t>( -1, 0, 0 ), // up
                tgt::Vector3<int64_t>( 1, 0, 0 ), // down
                tgt::Vector3<int64_t>( 0, 1, 0 ), // right
                tgt::Vector3<int64_t>( 0, -1, 0 ), // left
                tgt::Vector3<int64_t>( 0, 0, 1 ), // back
                tgt::Vector3<int64_t>( 0, 0, -1 ) // front
        };

        auto toDir = tgt::Vector3<int64_t>( -1, 0, 0 );
        auto stack = std::stack<tgt::Vector3<int64_t>>();
        stack.push( currCirc );

        auto dirStack = std::stack<tgt::Vector3<int64_t>>();
        dirStack.push( toDir );

        auto cnt = 0;

        while( !stack.empty() )
        {
            cnt += 1;
            currCirc = stack.top();
            toDir = dirStack.top();

            stack.pop();
            dirStack.pop();

            const auto children = mstT.voxel( currCirc[0] - 1, currCirc[1] - 1, currCirc[2] - 1 );

            hamCyc = mergeToCyc3D( hamCyc, currCirc, toDir );

            for( int64_t i = 0; i < nneighbors; ++i )
            {
                if( children[i] > 0 )
                {
                    // for the current channel==direction version
                    const auto tryDir = neighborDirs[i];
                    const auto nextCirc = currCirc + tryDir;
                    toDir = tryDir;

                    // if next pixel is not in circuit, we visit
                    // current pixel and skip all
                    stack.push( nextCirc );
                    dirStack.push( toDir );
                }
            }
        }

        // traverse using the hamCycle
        auto zLT = std::vector<double>( hamCyc.size(), 0 );
        for( int64_t i = 0; i < hamCyc.size(); ++i )
            zLT[i] = 0.0; // zLT( i, : ) = I( hamCyc( i, 1 ), hamCyc( i, 2 ), hamCyc( i, 3 ), : );

        const auto zVisitOrder = hamCyc;
        return std::make_pair( zLT, zVisitOrder );
    }
}

enum Distance : int32_t
{
    eEuclidean = 0,
    eDifference = 1,
    eSquaredDiff = 2,
    eCosine = 3
};

#if defined( _MSC_VER )
#define EXPORT __declspec( dllexport )
#else
#define EXPORT
#endif

extern "C" EXPORT void space_filling_curve(
    uint64_t volume_count,
    uint64_t dimension_x,
    uint64_t dimension_y,
    uint64_t dimension_z,
    double* values,
    int32_t distance_metric,
    uint64_t * output_space_filling_curve
)
{
    const auto dimensions = tgt::svec3 { dimension_x, dimension_y, dimension_z };
    auto distance_function = std::function<double( tgt::Vector3<int64_t>, tgt::Vector3<int64_t> )> {};

    struct Volume
    {
        tgt::svec3 dimensions {};
        double* values {};
        double minimum {};
        double maximum {};

        double voxel( const tgt::Vector3<int64_t>& coordinates ) const
        {
            return values[voreen::VolumeAtomic<double>::calcPos( dimensions, coordinates )];
        }
    };
    auto volumes = std::vector<Volume>( volume_count );

    double* current_value = values;
    for( uint64_t i {}; i < volume_count; ++i )
    {
        volumes[i].dimensions = dimensions;
        volumes[i].values = current_value;
        volumes[i].minimum = std::numeric_limits<double>::max();
        volumes[i].maximum = std::numeric_limits<double>::lowest();

        for( uint64_t x {}; x < dimension_x; ++x ) for( uint64_t y {}; y < dimension_y; ++y ) for( uint64_t z {}; z < dimension_z; ++z )
        {
            const auto value = *current_value++;
            volumes[i].minimum = std::min( volumes[i].minimum, value );
            volumes[i].maximum = std::max( volumes[i].maximum, value );
        }
    }

    if( distance_metric == Distance::eDifference )
    {
        distance_function = [&volumes] ( tgt::Vector3<int64_t> p1, tgt::Vector3<int64_t> p2 ) -> double
        {
            double distance = 0.0;
            for( uint64_t i = 0; i < volumes.size(); ++i )
            {
                const auto& volume = volumes[i];
                const auto diffMax = volume.maximum - volume.minimum;
                if( diffMax > 0.000001 )
                {
                    distance += std::abs( (volume.voxel( p1 ) - volume.voxel( p2 )) / diffMax );
                }
            }
            return distance;
        };
    }
    else if( distance_metric == Distance::eSquaredDiff )
    {
        distance_function = [&volumes] ( tgt::Vector3<int64_t> p1, tgt::Vector3<int64_t> p2 ) -> double
        {
            double distance = 0.0;
            for( uint64_t i = 0; i < volumes.size(); ++i )
            {
                const auto& volume = volumes[i];
                const auto diffMax = volume.maximum - volume.minimum;
                if( diffMax > 0.000001 )
                {
                    const auto diff = volume.voxel( p1 ) - volume.voxel( p2 );
                    distance += diff * diff / ( diffMax * diffMax );
                }
            }
            return distance;
        };
    }
    else if( distance_metric == Distance::eEuclidean )
    {
        distance_function = [&volumes] ( tgt::Vector3<int64_t> p1, tgt::Vector3<int64_t> p2 ) -> double
        {
            double distance = 0.0;
            for( uint64_t i = 0; i < volumes.size(); ++i )
            {
                const auto& volume = volumes[i];
                const auto diffMax = volume.maximum - volume.minimum;
                if( diffMax > 0.000001 )
                {
                    const auto diff = volume.voxel( p1 ) - volume.voxel( p2 );
                    distance += diff * diff / ( diffMax * diffMax );
                }
            }
            return std::sqrt( distance );
        };
    }
    else if( distance_metric == Distance::eCosine )
    {
        distance_function = [&volumes] ( tgt::Vector3<int64_t> p1, tgt::Vector3<int64_t> p2 ) -> double
        {
            double distance = 0.0;
            double norm1 = 0.0;
            double norm2 = 0.0;
            for( size_t i = 0; i < volumes.size(); ++i )
            {
                const auto& volume = volumes[i];
                distance += volume.voxel( p1 ) * volume.voxel( p2 );
                norm1 += volume.voxel( p1 ) * volume.voxel( p1 );
                norm2 += volume.voxel( p2 ) * volume.voxel( p2 );
            }
            if( norm1 < 0.000001 && norm2 < 0.000001 )
            {
                return 0;
            }
            if( norm1 < 0.000001 || norm2 < 0.000001 )
            {
                return 0;
            }
            return 1 - distance / ( std::sqrt( norm1 ) * std::sqrt( norm2 ) );
        };
    }

    const auto timeBegin = std::chrono::high_resolution_clock::now();

    std::cout << "Computing Space-Filling Curve..." << std::endl;
    const auto [WpXR, WpXL, WpYU, WpYD, WpZF, WpZB] = buildSmallCircsDualGraph3D( dimensions, distance_function );
    auto timeDiff = std::chrono::duration_cast<std::chrono::microseconds>( std::chrono::high_resolution_clock::now() - timeBegin ).count() / 1000.0;
    std::cout << "Finished buildSmallCircsDualGraph3D after " << timeDiff << " ms!" << std::endl;

    const auto [T, mstSet] = findMinSpanTree3D2( *WpXR, *WpXL, *WpYU, *WpYD, *WpZB, *WpZF );
    timeDiff = std::chrono::duration_cast<std::chrono::microseconds>( std::chrono::high_resolution_clock::now() - timeBegin ).count() / 1000.0;
    std::cout << "Finished findMinSpanTree3D2 after " << timeDiff << " ms!" << std::endl;

    const auto [LT, visitOrder] = linearizeHamCycleMerge3D( *T, dimensions, tgt::Vector3<int64_t>( dimensions.x, 1, 1 ) );
    timeDiff = std::chrono::duration_cast<std::chrono::microseconds>( std::chrono::high_resolution_clock::now() - timeBegin ).count() / 1000.0;
    std::cout << "Finished linearizeHamCycleMerge3D after " << timeDiff << " ms!" << std::endl;

    for( uint64_t i {}; i < visitOrder.size(); ++i )
    {
        const auto index = voreen::VolumeAtomic<int64_t>::calcPos( dimensions, visitOrder[i] - 1 );
        output_space_filling_curve[index] = i;
    }

    timeDiff = std::chrono::duration_cast<std::chrono::microseconds>( std::chrono::high_resolution_clock::now() - timeBegin ).count() / 1000.0;
    std::cout << "Finished computing space-filling curve after " << timeDiff << " ms!" << std::endl;
}