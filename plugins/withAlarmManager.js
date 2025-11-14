const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins')
const {
  ensureGroupRecursively,
  addBuildSourceFileToGroup,
  addResourceFileToGroup,
} = require('@expo/config-plugins/build/ios/utils/Xcodeproj')
const fs = require('node:fs')
const path = require('node:path')

// Ensure the native alarm manager files and assets are present in the Xcode project
// every time Expo regenerates the iOS project (prebuild/eas build).
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

      // Copy all alarm audio assets into the native project directory so they ship
      // with the binary. This keeps TestFlight/App Store builds in sync with JS assets.
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

  // Make sure the copied Swift/Obj-C sources and audio assets are actually
  // referenced by the Xcode project so the final binary links them.
  config = withXcodeProject(config, (config) => {
    const project = config.modResults
    const projectName = config.modRequest.projectName || 'WakeWalk'
    ensureGroupRecursively(project, projectName)

    // Idempotently add a source or resource file to the project if it's not already there.
    const ensureFile = (filePath, { isResource = false } = {}) => {
      const alreadyLinked = Object.values(
        project.pbxFileReferenceSection() || {},
      ).some((ref) => ref.path === filePath)

      if (alreadyLinked) {
        return
      }

      if (isResource) {
        addResourceFileToGroup({
          filepath: filePath,
          groupName: projectName,
          project,
          isBuildFile: true,
        })
      } else {
        addBuildSourceFileToGroup({
          filepath: filePath,
          groupName: projectName,
          project,
        })
      }
    }

    const sourceFiles = ['AlarmManager.swift', 'AlarmManager.m']
    const resourceFiles = [
      'bird_01_pigeon.m4a',
      'bird_02_sparrow.m4a',
      'bird_03_sea.m4a',
      'bird_04_river.m4a',
      'bird_05_Japanese_nightingale.m4a',
      'insect_01.m4a',
      'insect_02.m4a',
      'insect_03.m4a',
      'insect_04.m4a',
      'insect_05.m4a',
      'alarm-loop.m4a',
      'silence-loop.wav',
    ]

    for (const file of sourceFiles) {
      ensureFile(`${projectName}/${file}`)
    }

    for (const file of resourceFiles) {
      ensureFile(`${projectName}/${file}`, { isResource: true })
    }

    return config
  })

  // Final fix: Ensure AppDelegate.swift is correct after all plugins run
  // This MUST run after expo-dev-client to fix the AppDelegate format
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      console.log('🔧 [withAlarmManager] Starting AppDelegate.swift fix check...')
      const projectName = config.modRequest.projectName || 'WakeWalk'
      const iosPath = path.join(
        config.modRequest.platformProjectRoot,
        projectName,
      )
      const appDelegatePath = path.join(iosPath, 'AppDelegate.swift')
      console.log(`🔧 [withAlarmManager] AppDelegate path: ${appDelegatePath}`)

      if (fs.existsSync(appDelegatePath)) {
        const currentContent = fs.readFileSync(appDelegatePath, 'utf8')

        const hasOldCode =
          currentContent.includes('ExpoReactNativeFactory') ||
          currentContent.includes('reactNativeFactory') ||
          currentContent.includes('ExpoReactNativeFactoryDelegate') ||
          currentContent.includes('bindReactNativeFactory') ||
          currentContent.includes('ReactNativeDelegate') ||
          currentContent.includes('ExpoReactDelegate') ||
          currentContent.includes('@UIApplicationMain')

        const hasCorrectFormat =
          currentContent.includes('import ExpoModulesCore') &&
          currentContent.includes('@main') &&
          currentContent.includes('self.moduleName = "main"') &&
          currentContent.includes('self.initialProps = [:]')

        const needsFix = hasOldCode || !hasCorrectFormat

        if (needsFix) {
          const correctAppDelegate = `import ExpoModulesCore

@main
class AppDelegate: ExpoAppDelegate {
  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    self.moduleName = "main"
    self.initialProps = [:]
    
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
`
          fs.writeFileSync(appDelegatePath, correctAppDelegate, 'utf8')
          console.log(
            '✅ Fixed AppDelegate.swift for Expo SDK 54 (removed old Expo SDK code)',
          )
        } else {
          console.log('✅ AppDelegate.swift is already correct for Expo SDK 54')
        }
      } else {
        console.log('⚠️ AppDelegate.swift not found, skipping fix')
      }

      return config
    },
  ])

  return config
}

module.exports = withAlarmManager
