const chalk = require('chalk')
const semver = require('semver')
const { execSync } = require('node:child_process')
const packageConfig = require('../package.json')

const exec = cmd => execSync(cmd).toString().trim()

function checkVersions() {
  const versionRequirements = [
    {
      name: 'node',
      currentVersion: process.version,
      versionRequirement: packageConfig.engines.node
    }
  ]

  const versionNpm = exec('npm --version')

  versionRequirements.push({
    name: 'npm',
    currentVersion: versionNpm,
    versionRequirement: packageConfig.engines.npm
  })

  const warnings = []

  for (const mod of versionRequirements) {
    if (!semver.satisfies(mod.currentVersion, mod.versionRequirement)) {
      warnings.push(chalk.yellow(
        `You are using ${mod.name} ${mod.currentVersion} but this version requires ${mod.name} ${mod.versionRequirement}. ${mod.name === 'node' ? 'Please upgrade your Node version.' : 'Consider using a compatible NPM version.'}`
      ))
    }
  }

  if (warnings.length) {
    console.warn('\n****************************************\n')
    for (const warning of warnings) {
      console.warn(warning)
    }
    console.warn('\n****************************************\n')
    process.exit(1)
  }
}

module.exports = checkVersions
