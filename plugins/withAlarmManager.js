const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('node:fs')
const path = require('node:path')

function withAlarmManager(config) {
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectName = config.modRequest.projectName || 'WakeWalk'
      const iosPath = path.join(
        config.modRequest.platformProjectRoot,
        projectName,
      )
      const modulesPath = path.join(
        config.modRequest.projectRoot,
        'ios-modules',
      )

      if (!fs.existsSync(modulesPath)) {
        console.log(
          'ios-modules directory not found, skipping AlarmManager setup',
        )
        return config
      }

      const swiftSource = path.join(modulesPath, 'AlarmManager.swift')
      if (fs.existsSync(swiftSource)) {
        const swiftDest = path.join(iosPath, 'AlarmManager.swift')
        fs.copyFileSync(swiftSource, swiftDest)
        console.log('✅ Copied AlarmManager.swift')
      }

      const mSource = path.join(modulesPath, 'AlarmManager.m')
      if (fs.existsSync(mSource)) {
        const mDest = path.join(iosPath, 'AlarmManager.m')
        fs.copyFileSync(mSource, mDest)
        console.log('✅ Copied AlarmManager.m')
      }

      const soundDir = path.join(
        config.modRequest.projectRoot,
        'assets',
        'sound',
      )
      if (fs.existsSync(soundDir)) {
        const soundFiles = fs
          .readdirSync(soundDir)
          .filter((file) => /\.(m4a|wav)$/i.test(file))
        soundFiles.forEach((file) => {
          const src = path.join(soundDir, file)
          const dest = path.join(iosPath, file)
          fs.copyFileSync(src, dest)
          console.log(`✅ Copied ${file} for AlarmManager`)
        })
      }

      return config
    },
  ])

  return config
}

module.exports = withAlarmManager
