# ZONOS3-Mini for Pinokio

[![Install with Pinokio](https://badges.pinokio.co/install.svg)](https://pinokio.co/resolve?url=https://github.com/cocktailpeanut/zonos3-mini)

A local launcher for [Zyphra's ZONOS3-Mini](https://github.com/Zyphra/ZONOS3-Mini): multilingual text-to-speech, voice cloning from a reference recording, voice steering, and the included Zonos Voice Studio and Lite interfaces.

## Use

Use the [one-click Pinokio install link](https://pinokio.co/resolve?url=https://github.com/cocktailpeanut/zonos3-mini) to add this launcher. Open the link and add the project if prompted, signing in if needed. You can also enter `https://github.com/cocktailpeanut/zonos3-mini` in Pinokio's **Download from URL** dialog.

1. Open this launcher in Pinokio and click **Install**. It clones the upstream project into `app/`, installs the selected backend, and downloads approximately **6.7 GB** of public model files. No Hugging Face token is required. Installation stops if any of the six required model files is missing or empty.
2. Click **Start**. Once the model is loaded, **Open Web UI** opens the local server. Choose **Zonos Voice Studio** or **Lite**, select a supplied voice or upload a reference recording, enter text, and generate speech.
3. Use Pinokio's native stop control to stop the server.

The server binds to `127.0.0.1` and uses an available port chosen by Pinokio. Read the actual address from **Open Web UI**; the upstream example port `1919` is not reserved by this launcher.

**Update** pulls the upstream app, synchronizes the required submodules, reinstalls dependencies, and refreshes the model downloads. If this launcher has a Git upstream branch, it also pulls launcher changes with `--ff-only`; an unpublished local copy skips that step. Stop the server before updating or reinstalling.

**Reset** deletes `app/`, including its environments and downloaded models. Install again afterward. Studio projects stored in your browser remain in that browser; export important projects before clearing browser data or resetting. A later launch may use a different port and therefore a different browser storage origin.

## Backends and requirements

| Machine | Selected backend |
| --- | --- |
| Apple Silicon Mac | MLX, using upstream's locked Python 3.12 workspace |
| Intel Mac | Native ggml, CPU |
| Windows or Linux with NVIDIA | Native ggml, CUDA |
| Other Windows or Linux machines | Native ggml, CPU |

Pinokio's AI bundle supplies FFmpeg, the Linux C/C++ compiler, and Windows Visual Studio build tools. Native builds add CMake 3.24+, Ninja, and Rust 1.88+ to Pinokio's shared Conda environment and use that same environment when building and starting the server. Windows also installs Clang and its OpenMP runtime for C/C++ compilation because the bundled Visual Studio 2019 compiler rejects an upstream struct declaration; Visual Studio still supplies the Windows SDK, linker, and CUDA host compiler. NVIDIA builds require a supported CUDA-capable card and driver; CMake targets the detected local GPU. Other GPU vendors use the CPU backend. Native macOS builds require Apple's command-line development tools. Shared Pinokio tools remain installed after resetting this app.

Allow additional disk space for dependencies and build files. Performance and memory requirements depend on the machine and reference clip. Windows x64 is the intended Windows configuration.

The standard install includes the quantized release backbone, compact decoder, speaker encoder, raw-reference encoder, SSL teacher, steering bundle, and upstream default voices. It preserves upstream code and model-format validation. Upstream's optional full decoder, speech-edit model/adapters, ASR environment, pronunciation lexicon, and dubbing plugins are not installed. See the [upstream documentation](https://github.com/Zyphra/ZONOS3-Mini#optional-features) for those additional setups.

## Verification

Tested on Apple Silicon macOS with upstream commit `4c66cea` on November 11, 2026:

- Installed from an empty `app/` through `pterm start install.js`, then launched through `pterm run`. Pinokio reported the server online and captured its available-port URL.
- Health, chooser, Studio, Lite, capabilities, controls, model listing, and 30 default voices returned HTTP 200. An unknown voice ID returned HTTP 400.
- Generated a 4.4-second speech WAV and a 3.53-second WAV using an uploaded reference clip in embedding mode; both were non-silent, mono, 16-bit, 44.1 kHz audio.
- Built the native `zonos3-server` with Metal on Apple Silicon using only the additional CMake, Ninja, and Rust packages in Pinokio's shared environment. Verified startup and generated a 2.4-second speech WAV and a 4.47-second WAV from an uploaded MP3 reference using the shared FFmpeg.
- Checked JavaScript syntax, menu lifecycle states, the unpublished-launcher update condition, and command rendering through Pinokio's actual template engine for macOS ARM64/x64, Linux ARM64/x64, and Windows x64. CUDA, Windows/Linux/Intel Mac execution, raw-reference mode, and destructive reset were not exercised on this machine.

Tested on a Windows x64 Shadow PC with an NVIDIA RTX A4500 and CUDA 12.8 on November 12, 2026:

- Built the native CUDA server with Clang and Conda's LLVM OpenMP runtime, then launched it through Pinokio's shared environment. Pinokio captured the URL and reported the server online.
- Health, chooser, Studio, Lite, capabilities, controls, models, and 30 default voices responded successfully. An unknown voice returned HTTP 400.
- Generated a non-silent 2.07-second speech WAV and a non-silent 3.93-second WAV from an uploaded MP3 reference. Both were mono, 16-bit, 44.1 kHz audio. FFmpeg came from Pinokio.
- Verified the corrected dependency command and fresh CMake configuration through Pinokio on Windows. A duplicate verification rebuild was stopped after configuration; the runtime tests used the completed native build.

Tested on Dot cloud with Debian 13.6, x86-64, and no exposed GPU on November 12, 2026, using launcher commit `c6a9712` and upstream commit `4c66cea`:

- Built the native CPU server once through Pinokio and downloaded all six model files (6,744,413,120 bytes). The published `start.js` captured the server URL, and Pinokio reported it online and ready.
- Health, chooser, Studio, Lite, speakers, capabilities, controls, and models returned HTTP 200. An unknown voice returned HTTP 400.
- Generated a non-silent 2.40-second speech WAV and a non-silent 3.93-second WAV from a public MP3 reference in embedding mode. Both were mono, 16-bit, 44.1 kHz audio.
- This required a sandbox-specific loopback fallback in the isolated Pinokiod 8.1.1 runtime because the cloud sandbox denies network-interface enumeration. Installation resumed at the published download steps after installing the proxy client's `socksio` dependency and configuring the platform-provided CA certificate. TLS verification remained enabled. No launcher edits or manual upstream source edits were needed for execution. This verifies execution through the adapted runtime; an uninterrupted install with unmodified Pinokiod was not verified in this sandbox.

Verified the model-download guard separately through Pinokio on macOS, Windows, and the adapted Linux cloud runtime. Existing models allowed the following completion marker; an empty model directory, a missing `steer.gguf`, and an empty `zac-keep2.gguf` each stopped execution before that marker. These checks reused the completed builds and did not repeat installation or speech tests.

Linux CUDA and ARM64 execution, Intel Mac runtime execution, raw-reference mode, and destructive reset remain untested.

## HTTP API

All backends expose the same API. Replace `http://127.0.0.1:PORT` with the address in Pinokio. These examples select the first voice returned by `GET /v2/speakers` and save a WAV file using `POST /v1/audio/speech`.

### Python (standard library)

```python
import json
from pathlib import Path
from urllib.request import Request, urlopen

base = "http://127.0.0.1:PORT"
with urlopen(base + "/v2/speakers") as response:
    voice = json.load(response)["speakers"][0]["id"]
body = json.dumps({
    "model": "zonos3", "input": "Hello from ZONOS3 Mini.",
    "voice": voice, "response_format": "wav",
}).encode()
request = Request(base + "/v1/audio/speech", data=body,
                  headers={"Content-Type": "application/json"})
with urlopen(request, timeout=300) as response:
    Path("hello.wav").write_bytes(response.read())
```

### JavaScript (Node.js 18+)

```javascript
import { writeFile } from "node:fs/promises";

const base = "http://127.0.0.1:PORT";
const speakers = await fetch(`${base}/v2/speakers`);
if (!speakers.ok) throw new Error(await speakers.text());
const { speakers: voices } = await speakers.json();
const response = await fetch(`${base}/v1/audio/speech`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "zonos3", input: "Hello from ZONOS3 Mini.",
    voice: voices[0].id, response_format: "wav",
  }),
});
if (!response.ok) throw new Error(await response.text());
await writeFile("hello.wav", Buffer.from(await response.arrayBuffer()));
```

### Curl

First list the available voice IDs:

```sh
curl -fsS http://127.0.0.1:PORT/v2/speakers
```

Save the following as `speech.json`, replacing `VOICE_ID` with an ID from that response:

```json
{
  "model": "zonos3",
  "input": "Hello from ZONOS3 Mini.",
  "voice": "VOICE_ID",
  "response_format": "wav"
}
```

```sh
curl -fS http://127.0.0.1:PORT/v1/audio/speech -H "Content-Type: application/json" --data-binary @speech.json --output hello.wav
```

For reference-audio cloning, `POST /v2/generate` accepts `text`, `language`, `speaker_audio_base64`, `stream: false`, and `format: "wav"`. `GET /v2/capabilities` reports supported features and `GET /v2/controls` lists steering controls. See the [API guide](https://github.com/Zyphra/ZONOS3-Mini/blob/main/docs/api.md) for streaming, reference voices, controls, and request schemas.

## Source and license

The launcher source is [cocktailpeanut/zonos3-mini](https://github.com/cocktailpeanut/zonos3-mini). Installation downloads the upstream application and public weights into the ignored `app/` directory; this repository contains the launcher, documentation, and icon.

The upstream project and its bundled icon use the [MIT license](https://github.com/Zyphra/ZONOS3-Mini/blob/main/LICENSE); third-party components retain their own licenses.
