import chalk from 'chalk'
import semver from 'semver'
import { execSync } from 'node:child_process'
import packageConfig from '../package.json' assert { type: 'json' }

const exec = cmd => execSync(cmd).toString().trim()

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
