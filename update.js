const { execFileSync } = require("child_process")

module.exports = async (kernel) => {
  // Unpublished local launchers have no upstream branch to pull.
  let upstream = false
  try {
    execFileSync(await kernel.which("git"), ["rev-parse", "--verify", "@{upstream}"], {
      cwd: __dirname,
      stdio: "ignore"
    })
    upstream = true
  } catch {}
  return {
    run: [{
      when: upstream,
      method: "shell.run",
      params: {
        message: "git pull --ff-only"
      }
    }, {
      when: "{{exists('app/.git')}}",
      method: "shell.run",
      params: {
        path: "app",
        message: "git pull --ff-only"
      }
    }, {
      method: "script.start",
      params: {
        uri: "install.js"
      }
    }]
  }
}
