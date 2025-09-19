import AVFoundation
import React

@objc(AlarmManager)
class AlarmManager: RCTEventEmitter {
  private var silentPlayer: AVAudioPlayer?
  private var alarmPlayer: AVAudioPlayer?
  private var triggerTimer: DispatchSourceTimer?
  private var stopTimer: DispatchSourceTimer?
  private var targetDate: Date?

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

  @objc(start:soundName:duration:)
  func start(_ iso8601String: NSString, soundName: NSString, duration: NSNumber) {
    guard let date = Self.isoFormatter.date(from: iso8601String as String) else {
      sendEvent(withName: "AlarmError", body: ["message": "Invalid date format"])
      return
    }

    targetDate = date

    configureAudioSession()
    startSilentLoop()
    scheduleTrigger(for: date, soundName: soundName as String, duration: duration.doubleValue)

    sendEvent(withName: "AlarmArmed", body: ["scheduledAt": iso8601String])
  }

  @objc func stop() {
    invalidateTimers()
    stopSilentLoop()
    stopAlarmLoop()
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

    guard let url = audioURL(for: soundName),
          let player = try? AVAudioPlayer(contentsOf: url) else {
      sendEvent(withName: "AlarmError", body: ["message": "Missing alarm sound"])
      stop()
      return
    }

    player.numberOfLoops = -1
    player.volume = 1.0
    player.prepareToPlay()
    player.play()
    alarmPlayer = player

    sendEvent(withName: "AlarmTriggered", body: nil)

    if duration > 0 {
      let timer = DispatchSource.makeTimerSource(queue: DispatchQueue.global(qos: .background))
      timer.schedule(deadline: .now() + duration)
      timer.setEventHandler { [weak self] in
        self?.stop()
      }
      timer.resume()
      stopTimer = timer
    }
  }

  private func stopAlarmLoop() {
    alarmPlayer?.stop()
    alarmPlayer = nil
  }

  private func invalidateTimers() {
    triggerTimer?.cancel()
    triggerTimer = nil
    stopTimer?.cancel()
    stopTimer = nil
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
