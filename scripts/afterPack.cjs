const { restoreHostSharp } = require('./sharpPrebuilt.cjs')

exports.default = async function afterPack() {
  console.log(`[afterPack] Restoring host sharp binaries (${process.platform}:${process.arch})`)
  restoreHostSharp()
}
