module.exports = async (kernel) => {
  const mlx = kernel.platform === "darwin" && kernel.arch === "arm64"
  const nativeServer = kernel.platform === "win32"
    ? "servers\\ggml\\build\\zonos3-server.exe"
    : "./servers/ggml/build/zonos3-server"
  return {
    daemon: true,
    run: [{
      method: "shell.run",
      params: {
        path: "app",
        ...(mlx ? { venv: "env", venv_python: "3.12" } : {}),
        message: mlx
          ? "python -m zonos3_mlx servers/ggml/gguf/backbone-ptq.gguf --port {{port}} --tts-default-voices-dir assets/default_voices"
          : `${nativeServer} servers/ggml/gguf/backbone-ptq.gguf --port {{port}} --tts-default-voices-dir assets/default_voices {{gpu === 'nvidia' ? '--gpu' : ''}}`,
        on: [{
          event: "/(http:\\/\\/[0-9.:]+)/",
          done: true
        }]
      }
    }, {
      method: "local.set",
      params: {
        url: "{{input.event[1]}}"
      }
    }]
  }
}
