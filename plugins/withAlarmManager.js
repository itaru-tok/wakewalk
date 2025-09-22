const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withAlarmManager(config) {

  // Copy the actual files
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectName = config.modRequest.projectName || 'WakeWalk';
      const iosPath = path.join(config.modRequest.platformProjectRoot, projectName);
      const modulesPath = path.join(config.modRequest.projectRoot, 'ios-modules');

      // Ensure ios-modules directory exists
      if (!fs.existsSync(modulesPath)) {
        console.log('ios-modules directory not found, skipping AlarmManager setup');
        return config;
      }

      // Copy AlarmManager.swift
      const swiftSource = path.join(modulesPath, 'AlarmManager.swift');
      if (fs.existsSync(swiftSource)) {
        const swiftDest = path.join(iosPath, 'AlarmManager.swift');
        fs.copyFileSync(swiftSource, swiftDest);
        console.log('✅ Copied AlarmManager.swift');
      }

      // Copy AlarmManager.m
      const mSource = path.join(modulesPath, 'AlarmManager.m');
      if (fs.existsSync(mSource)) {
        const mDest = path.join(iosPath, 'AlarmManager.m');
        fs.copyFileSync(mSource, mDest);
        console.log('✅ Copied AlarmManager.m');
      }

      // Copy silence-loop.wav to WakeWalk directory (for AlarmManager)
      const silenceSource = path.join(config.modRequest.projectRoot, 'assets', 'sound', 'silence-loop.wav');
      if (fs.existsSync(silenceSource)) {
        const silenceDest = path.join(iosPath, 'silence-loop.wav');
        fs.copyFileSync(silenceSource, silenceDest);
        console.log('✅ Copied silence-loop.wav for AlarmManager');
      }

      return config;
    },
  ]);

  return config;
}

module.exports = withAlarmManager;