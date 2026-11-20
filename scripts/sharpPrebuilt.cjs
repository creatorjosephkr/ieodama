const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT_DIR = path.resolve(__dirname, '..')
const IMG_DIR = path.join(ROOT_DIR, 'node_modules', '@img')
const CACHE_DIR = path.join(ROOT_DIR, 'node_modules', '.cache', 'sharp-prebuilt')
const SHARP_PKG_PATH = path.join(ROOT_DIR, 'node_modules', 'sharp', 'package.json')

const TARGET_PACKAGES = {
  'darwin:arm64': ['sharp-darwin-arm64', 'sharp-libvips-darwin-arm64'],
  'darwin:x64': ['sharp-darwin-x64', 'sharp-libvips-darwin-x64'],
  'win32:x64': ['sharp-win32-x64'],
  'win32:arm64': ['sharp-win32-arm64'],
}

function readSharpPackageJson() {
  if (!fs.existsSync(SHARP_PKG_PATH)) {
    throw new Error(`sharp package.json not found at ${SHARP_PKG_PATH}`)
  }
  return JSON.parse(fs.readFileSync(SHARP_PKG_PATH, 'utf8'))
}

function getPackageVersion(sharpPkg, pkgShortName) {
  const fullName = `@img/${pkgShortName}`
  const optDeps = sharpPkg.optionalDependencies || {}
  if (optDeps[fullName]) {
    return optDeps[fullName]
  }
  return sharpPkg.version
}

function isManagedSharpPackage(dirName) {
  return dirName.startsWith('sharp-') || dirName.startsWith('sharp-libvips-')
}

function backupInstalledToCache() {
  if (!fs.existsSync(IMG_DIR)) return
  fs.mkdirSync(CACHE_DIR, { recursive: true })

  for (const entry of fs.readdirSync(IMG_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || !isManagedSharpPackage(entry.name)) {
      continue
    }

    const srcDir = path.join(IMG_DIR, entry.name)
    const pkgJsonPath = path.join(srcDir, 'package.json')
    if (!fs.existsSync(pkgJsonPath)) {
      continue
    }

    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
    const cacheTarget = path.join(CACHE_DIR, `${entry.name}@${pkg.version}`)
    if (!fs.existsSync(path.join(cacheTarget, 'package.json'))) {
      fs.rmSync(cacheTarget, { recursive: true, force: true })
      fs.cpSync(srcDir, cacheTarget, { recursive: true })
      console.log(`[sharpPrebuilt] Cached existing @img/${entry.name}@${pkg.version}`)
    }
  }
}

function ensureCachedPackage(pkgShortName, version) {
  const cacheTarget = path.join(CACHE_DIR, `${pkgShortName}@${version}`)
  if (fs.existsSync(path.join(cacheTarget, 'package.json'))) {
    return cacheTarget
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true })
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sharp-prebuilt-'))
  const spec = `@img/${pkgShortName}@${version}`

  try {
    console.log(`[sharpPrebuilt] Downloading ${spec}...`)
    const stdout = execFileSync('npm', ['pack', spec], {
      cwd: tempDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    const tgzName = stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .pop()

    if (!tgzName) {
      throw new Error(`npm pack did not produce a tarball name for ${spec}`)
    }

    const tgzPath = path.join(tempDir, tgzName)
    execFileSync('tar', ['-xzf', tgzPath, '-C', tempDir], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    const unpackedDir = path.join(tempDir, 'package')
    if (!fs.existsSync(path.join(unpackedDir, 'package.json'))) {
      throw new Error(`Extracted tarball missing package.json for ${spec}`)
    }

    fs.rmSync(cacheTarget, { recursive: true, force: true })
    fs.cpSync(unpackedDir, cacheTarget, { recursive: true })
    console.log(`[sharpPrebuilt] Cached ${spec}`)
    return cacheTarget
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

function prepareSharpForTarget(platform, arch) {
  const key = `${platform}:${arch}`
  const requiredPackages = TARGET_PACKAGES[key]
  if (!requiredPackages) {
    throw new Error(`Unsupported sharp target platform/arch: ${key}`)
  }

  const sharpPkg = readSharpPackageJson()
  backupInstalledToCache()

  const cachedDirs = requiredPackages.map((pkgShortName) => {
    const version = getPackageVersion(sharpPkg, pkgShortName)
    return {
      pkgShortName,
      version,
      cacheDir: ensureCachedPackage(pkgShortName, version),
    }
  })

  fs.mkdirSync(IMG_DIR, { recursive: true })

  // 기존 sharp-* / sharp-libvips-* 만 정리 (@img/colour 등 공용 패키지는 유지)
  for (const entry of fs.readdirSync(IMG_DIR, { withFileTypes: true })) {
    if (entry.isDirectory() && isManagedSharpPackage(entry.name)) {
      fs.rmSync(path.join(IMG_DIR, entry.name), { recursive: true, force: true })
    }
  }

  for (const { pkgShortName, version, cacheDir } of cachedDirs) {
    const destDir = path.join(IMG_DIR, pkgShortName)
    fs.cpSync(cacheDir, destDir, { recursive: true })
    console.log(`[sharpPrebuilt] Active @img/${pkgShortName}@${version} for ${key}`)
  }
}

function restoreHostSharp() {
  prepareSharpForTarget(process.platform, process.arch)
}

module.exports = {
  prepareSharpForTarget,
  restoreHostSharp,
}
