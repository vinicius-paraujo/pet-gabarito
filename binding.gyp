{
  "targets": [
    {
      "target_name": "reading",
      "sources": [ "src/assets/apis/reading.cc" ],
      "include_dirs": [
        "<!(node -p \"require('node-addon-api').include_dir\")",
        "<!(node -p \"require('node-addon-api').include\")"
      ],
      "libraries": [
        "<!(pwd)/src/assets/apis/libleitor.so",
        "<!(pwd)/src/assets/apis/libraylib.so.550",
        "<!(pwd)/src/assets/apis/libZXing.so.3"
      ],
      "ldflags": [
        "-Wl,-rpath,\\$$ORIGIN/../../src/assets/apis"
      ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ]
    }
  ]
}