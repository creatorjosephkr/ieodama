const { prepareSharpForTarget } = require('./sharpPrebuilt.cjs')

const ARCH_MAP = {
  0: 'ia32',
  1: 'x64',
  2: 'armv7l',
  3: 'arm64',
  4: 'universal',
}

exports.default = async function beforePack(context) {
  const platform = context.electronPlatformName === 'mas' ? 'darwin' : context.electronPlatformName
  const arch = typeof context.arch === 'number' ? ARCH_MAP[context.arch] : String(context.arch)

  console.log(`[beforePack] Preparing sharp binaries for ${platform}:${arch}`)
  prepareSharpForTarget(platform, arch)
}
