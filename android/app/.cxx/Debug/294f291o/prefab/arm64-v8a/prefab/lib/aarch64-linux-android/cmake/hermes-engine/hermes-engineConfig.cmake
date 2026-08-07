if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/smit/.gradle/caches/9.3.1/transforms/99d78a3ebe3f31f9bbb9977f2c0f7d8a/transformed/hermes-android-0.14.1-debug/prefab/modules/hermesvm/libs/android.arm64-v8a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/smit/.gradle/caches/9.3.1/transforms/99d78a3ebe3f31f9bbb9977f2c0f7d8a/transformed/hermes-android-0.14.1-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

