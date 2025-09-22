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
  private var silentLeadTimer: DispatchSourceTimer?

  private let silentLeadTime: TimeInterval = 60
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

  private func startAlarmLoop(soundName: String) {
    guard shouldPlaySound, alarmPlayer == nil else { return }

    guard let url = audioURL(for: soundName),
          let player = try? AVAudioPlayer(contentsOf: url) else {
      sendEvent(withName: "AlarmError", body: ["message": "Missing alarm sound: \(soundName)"])
      return
    }

    player.numberOfLoops = -1
    player.volume = 1.0
    player.prepareToPlay()
    player.play()
    alarmPlayer = player
  }

  private func stopAlarmLoop() {
    alarmPlayer?.stop()
    alarmPlayer = nil
  }

  private func startVibrationLoop() {
    guard shouldVibrate else { return }

    vibrationTimer?.cancel()
    let timer = DispatchSource.makeTimerSource(queue: .global())
    timer.schedule(deadline: .now(), repeating: 1.5)
    timer.setEventHandler {
      AudioServicesPlaySystemSound(SystemSoundID(kSystemSoundID_Vibrate))
    }
    timer.resume()
    vibrationTimer = timer
  }

  private func stopVibrationLoop() {
    vibrationTimer?.cancel()
    vibrationTimer = nil
  }

  private func scheduleTrigger(for date: Date, soundName: String, duration: TimeInterval) {
    invalidateTimers()

    let leadTime = date.timeIntervalSinceNow - silentLeadTime
    if leadTime > 0 {
      let leadTimer = DispatchSource.makeTimerSource(queue: .global())
      leadTimer.schedule(deadline: .now() + leadTime)
      leadTimer.setEventHandler { [weak self] in
        self?.startSilentLoop()
      }
      leadTimer.resume()
      silentLeadTimer = leadTimer
    } else {
      startSilentLoop()
    }

    let triggerTime = date.timeIntervalSinceNow
    if triggerTime > 0 {
      let trigger = DispatchSource.makeTimerSource(queue: .global())
      trigger.schedule(deadline: .now() + triggerTime)
      trigger.setEventHandler { [weak self] in
        self?.stopSilentLoop()
        self?.startAlarmLoop(soundName: soundName)
        self?.startVibrationLoop()
        self?.sendEvent(withName: "AlarmTriggered", body: ["triggeredAt": Self.isoFormatter.string(from: Date())])
      }
      trigger.resume()
      triggerTimer = trigger
    }

    let stopDelay = triggerTime + duration
    if stopDelay > 0 {
      let stop = DispatchSource.makeTimerSource(queue: .global())
      stop.schedule(deadline: .now() + stopDelay)
      stop.setEventHandler { [weak self] in
        self?.stop()
      }
      stop.resume()
      stopTimer = stop
    }
  }

  private func invalidateTimers() {
    triggerTimer?.cancel()
    triggerTimer = nil
    stopTimer?.cancel()
    stopTimer = nil
    silentLeadTimer?.cancel()
    silentLeadTimer = nil
  }
}