import AVFoundation
import AudioToolbox
import React

@objc(AlarmManager)
class AlarmManager: RCTEventEmitter {
  private var silentPlayer: AVAudioPlayer?
  private var alarmPlayer: AVAudioPlayer?
  private var triggerTimer: DispatchSourceTimer?
  private var stopTimer: DispatchSourceTimer?
  private var vibrationTimer: DispatchSourceTimer?
  private var targetDate: Date?
  private var shouldVibrate = true
  private var shouldPlaySound = true

  private static let isoFormatter: ISO8601DateFormatter = {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter
  }()

  override static func requiresMainQueueSetup() -> Bool {
    true
  }

  override func supportedEvents() -> [String]! {
    ["AlarmArmed", "AlarmTriggered", "AlarmStopped", "AlarmError"]
  }

  @objc(start:soundName:duration:vibrationEnabled:soundEnabled:)
  func start(
    _ iso8601String: NSString,
    soundName: NSString,
    duration: NSNumber,
    vibrationEnabled: NSNumber,
    soundEnabled: NSNumber
  ) {
    guard let date = Self.isoFormatter.date(from: iso8601String as String) else {
      sendEvent(withName: "AlarmError", body: ["message": "Invalid date format"])
      return
    }

    targetDate = date
    shouldVibrate = vibrationEnabled.boolValue
    shouldPlaySound = soundEnabled.boolValue

    configureAudioSession()
    startSilentLoop()
    scheduleTrigger(for: date, soundName: soundName as String, duration: duration.doubleValue)

    sendEvent(withName: "AlarmArmed", body: ["scheduledAt": iso8601String])
  }

  @objc func stop() {
    invalidateTimers()
    stopSilentLoop()
    stopAlarmLoop()
    stopVibrationLoop()
    sendEvent(withName: "AlarmStopped", body: nil)
  }

  private func configureAudioSession() {
    let session = AVAudioSession.sharedInstance()
    do {
      try session.setCategory(
        .playback,
        mode: .default,
        options: []
      )
      try session.setActive(true, options: [])
    } catch {
      NSLog("AlarmManager: Failed to configure audio session - \(error)")
      sendEvent(withName: "AlarmError", body: ["message": "Audio session error"])
    }
  }

  private func audioURL(for resource: String) -> URL? {
    let name = (resource as NSString).deletingPathExtension
    let ext = (resource as NSString).pathExtension.isEmpty ? "m4a" : (resource as NSString).pathExtension
    return Bundle.main.url(forResource: name, withExtension: ext)
  }

  private func startSilentLoop() {
    guard silentPlayer == nil, let url = audioURL(for: "silence-loop.wav"),
          let player = try? AVAudioPlayer(contentsOf: url) else {
      sendEvent(withName: "AlarmError", body: ["message": "Missing silence asset"])
      return
    }

    player.numberOfLoops = -1
    player.volume = 1.0
    player.prepareToPlay()
    player.play()
    silentPlayer = player
  }

  private func stopSilentLoop() {
    silentPlayer?.stop()
    silentPlayer = nil
  }

  private func startAlarmLoop(soundName: String, duration: Double) {
    stopAlarmLoop()
    stopVibrationLoop()

    var encounteredMissingSound = false

    if shouldPlaySound {
      if let url = audioURL(for: soundName),
         let player = try? AVAudioPlayer(contentsOf: url) {
        player.numberOfLoops = -1
        player.volume = 1.0
        player.prepareToPlay()
        player.play()
        alarmPlayer = player
      } else {
        encounteredMissingSound = true
        sendEvent(withName: "AlarmError", body: ["message": "Missing alarm sound"])
      }
    }

    sendEvent(withName: "AlarmTriggered", body: nil)

    if shouldVibrate {
      startVibrationLoop()
    }

    let shouldStopImmediately = encounteredMissingSound && !shouldVibrate

    if duration > 0 && !shouldStopImmediately {
      let timer = DispatchSource.makeTimerSource(queue: DispatchQueue.global(qos: .background))
      timer.schedule(deadline: .now() + duration)
      timer.setEventHandler { [weak self] in
        self?.stop()
      }
      timer.resume()
      stopTimer = timer
    }

    if shouldStopImmediately {
      stop()
    }
  }

  private func stopAlarmLoop() {
    alarmPlayer?.stop()
    alarmPlayer = nil
  }

  private func startVibrationLoop() {
    if vibrationTimer != nil {
      return
    }

    let timer = DispatchSource.makeTimerSource(queue: DispatchQueue.main)
    timer.schedule(deadline: .now(), repeating: 1.0)
    timer.setEventHandler {
      AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
    }
    timer.resume()
    vibrationTimer = timer
  }

  private func stopVibrationLoop() {
    vibrationTimer?.cancel()
    vibrationTimer = nil
  }

  private func invalidateTimers() {
    triggerTimer?.cancel()
    triggerTimer = nil
    stopTimer?.cancel()
    stopTimer = nil
    stopVibrationLoop()
  }

  private func scheduleTrigger(for date: Date, soundName: String, duration: Double) {
    invalidateTimers()

    let secondsUntilTrigger = max(0, date.timeIntervalSinceNow)
    let queue = DispatchQueue.global(qos: .background)
    let timer = DispatchSource.makeTimerSource(queue: queue)
    timer.schedule(deadline: .now() + secondsUntilTrigger)
    timer.setEventHandler { [weak self] in
      DispatchQueue.main.async {
        self?.stopSilentLoop()
        self?.startAlarmLoop(soundName: soundName, duration: duration)
      }
    }
    timer.resume()
    triggerTimer = timer
  }
}
