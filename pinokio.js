module.exports = {
  version: "8.0.0",
  title: "ZONOS3-Mini",
  description: "Local multilingual speech generation and voice cloning with Zonos Voice Studio.",
  icon: "icon.png",
  menu: async (kernel, info) => {
    if (info.running("install.js")) {
      return [{ default: true, icon: "fa-solid fa-plug", text: "Installing", href: "install.js" }]
    } else if (info.running("update.js")) {
      return [{ default: true, icon: "fa-solid fa-rotate", text: "Updating", href: "update.js" }]
    } else if (info.running("reset.js")) {
      return [{ default: true, icon: "fa-solid fa-broom", text: "Resetting", href: "reset.js" }]
    } else if (info.running("start.js")) {
      const local = info.local("start.js")
      if (local && local.url) {
        return [{
          default: true, icon: "fa-solid fa-rocket", text: "Open Web UI", href: local.url
        }, {
          icon: "fa-solid fa-terminal", text: "Terminal", href: "start.js"
        }]
      }
      return [{ default: true, icon: "fa-solid fa-terminal", text: "Starting", href: "start.js" }]
    } else if (info.exists("app/.installed")) {
      return [{
        default: true, icon: "fa-solid fa-power-off", text: "Start", href: "start.js"
      }, {
        icon: "fa-solid fa-rotate", text: "Update", href: "update.js"
      }, {
        icon: "fa-solid fa-plug", text: "Reinstall", href: "install.js"
      }, {
        icon: "fa-solid fa-broom", text: "Reset", href: "reset.js",
        confirm: "Remove the app, environments, and downloaded models? Browser-stored Studio projects are kept."
      }]
    }
    return [{ default: true, icon: "fa-solid fa-plug", text: "Install", href: "install.js" }]
  }
}
