if(NOT TARGET react-native-worklets::worklets)
add_library(react-native-worklets::worklets SHARED IMPORTED)
set_target_properties(react-native-worklets::worklets PROPERTIES
    IMPORTED_LOCATION "/Users/smit/bishan/TS/learning/cinefriendzchat/frontend/node_modules/react-native-worklets/android/build/intermediates/cxx/Debug/4h5l5n50/obj/armeabi-v7a/libworklets.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/smit/bishan/TS/learning/cinefriendzchat/frontend/node_modules/react-native-worklets/android/build/prefab-headers/worklets"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

