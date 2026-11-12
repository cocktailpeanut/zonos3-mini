module.exports = (kernel) => ({
  requires: {
    bundle: "ai"
  },
  run: [{
    when: "{{exists('app/.installed')}}",
    method: "fs.rm",
    params: {
      path: "app/.installed"
    }
  }, {
    when: "{{!exists('app')}}",
    method: "shell.run",
    params: {
      message: "git clone https://github.com/Zyphra/ZONOS3-Mini.git app"
    }
  }, {
    method: "shell.run",
    params: {
      path: "app",
      message: "git submodule update --init {{platform === 'darwin' && arch === 'arm64' ? 'third_party/fusealign-multilingual' : 'servers/ggml/ggml third_party/zyphra-textnorm'}}"
    }
  }, {
    when: "{{platform === 'darwin' && arch === 'arm64'}}",
    method: "shell.run",
    params: {
      path: "app",
      venv: "env",
      venv_python: "3.12",
      env: {
        UV_PROJECT_ENVIRONMENT: "env"
      },
      message: "uv sync --locked --package zonos3-mlx --no-dev"
    }
  }, {
    when: "{{!(platform === 'darwin' && arch === 'arm64')}}",
    method: "shell.run",
    params: {
      path: "app",
      message: "conda install -y -c conda-forge \"cmake>=3.24\" ninja \"rust>=1.88\" {{platform === 'win32' ? 'clang llvm-openmp' : ''}}"
    }
  }, {
    when: "{{!(platform === 'darwin' && arch === 'arm64')}}",
    method: "shell.run",
    params: {
      path: "app",
      build: true,
      message: [
        `cmake --fresh -S servers/ggml -B servers/ggml/build -G Ninja -DCMAKE_BUILD_TYPE=Release -DBUILD_TESTING=OFF -DBUILD_SHARED_LIBS=OFF ${kernel.platform === "win32" ? `-DCMAKE_C_COMPILER=clang-cl -DCMAKE_CXX_COMPILER=clang-cl "-DOpenMP_libomp_LIBRARY=${kernel.bin.path("miniforge/Library/lib/libiomp5md.lib")}"` : ""} {{gpu === 'nvidia' ? '-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=native' : '-DGGML_CUDA=OFF'}}`,
        "cmake --build servers/ggml/build --config Release --target zonos3-server --parallel 4"
      ],
      on: [{
        event: "/CMake Error|FAILED:|ninja: build stopped/i",
        break: true
      }]
    }
  }, {
    method: "hf.download",
    params: {
      path: "app",
      _: [
        "Zyphra/ZONOS3-Mini",
        "gguf/backbone-ptq.gguf",
        "gguf/zac-keep2.gguf",
        "gguf/spk-encoder.gguf",
        "gguf/zac-encoder.gguf",
        "gguf/ssl-teacher.gguf",
        "gguf/steer.gguf"
      ],
      "local-dir": "servers/ggml"
    }
  }, {
    method: "fs.write",
    params: {
      path: "app/.installed",
      text: "Installation completed.\n"
    }
  }]
})
