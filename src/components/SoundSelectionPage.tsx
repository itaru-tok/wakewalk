import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import { useCallback, useEffect, useRef } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  BUILT_IN_SOUND_GROUPS,
  type BuiltInSoundId,
  getSoundDisplayName,
  SOUND_ASSET_MAP,
} from '../constants/sounds'
import { useAlarmSettings } from '../context/AlarmSettingsContext'

interface SoundSelectionPageProps {
  onBack: () => void
}

export default function SoundSelectionPage({
  onBack,
}: SoundSelectionPageProps) {
  const { selectedSoundId, setSelectedSoundId } = useAlarmSettings()
  const previewSoundRef = useRef<Audio.Sound | null>(null)

  // Allow preview sounds to play even if the device is in silent mode.
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
    }).catch(() => undefined)
  }, [])

  useEffect(() => {
    return () => {
      if (previewSoundRef.current) {
        previewSoundRef.current.unloadAsync().catch(() => undefined)
        previewSoundRef.current = null
      }
    }
  }, [])

  // Play a one-shot preview of the selected sound, replacing any existing preview audio.
  const playPreview = useCallback(async (soundId: BuiltInSoundId) => {
    const asset = SOUND_ASSET_MAP[soundId]
    if (!asset) return

    try {
      if (previewSoundRef.current) {
        await previewSoundRef.current.stopAsync().catch(() => undefined)
        await previewSoundRef.current.unloadAsync().catch(() => undefined)
        previewSoundRef.current = null
      }

      const { sound } = await Audio.Sound.createAsync(asset, {
        shouldPlay: true,
      })

      previewSoundRef.current = sound

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return
        if (status.didJustFinish) {
          sound.unloadAsync().catch(() => undefined)
          if (previewSoundRef.current === sound) {
            previewSoundRef.current = null
          }
        }
      })
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to preview sound', error)
      }
    }
  }, [])

  const handleSelectSound = useCallback(
    async (soundId: BuiltInSoundId) => {
      setSelectedSoundId(soundId)
      await playPreview(soundId)
    },
    [playPreview, setSelectedSoundId],
  )

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
          <TouchableOpacity onPress={onBack} className="p-2">
            {/* TODO: update to liquid glass icon */}
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold font-comfortaa">
            Sound
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView className="flex-1">
          {/* Music Library Section */}
          {/* <View className="mt-6">
            <Text className="text-gray-500 text-xs px-4 mb-3 font-comfortaa">
              MUSIC LIBRARY
            </Text>
            <View className="bg-gray-900 mx-4 rounded-lg">
              <View className="p-4 border-b border-gray-800">
                <Text className="text-gray-400 text-center font-comfortaa">
                  No songs selected
                </Text>
              </View>
              <TouchableOpacity className="flex-row justify-between items-center p-4">
                <Text className="text-white font-comfortaa">Pick a song</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View> */}

          {/* Imported Sounds Section */}
          {/* <View className="mt-6">
            <View className="flex-row justify-between items-center px-4 mb-3">
              <Text className="text-gray-500 text-xs font-comfortaa">
                IMPORTED SOUNDS
              </Text>
              <TouchableOpacity
                onPress={() => setShowAllImported(!showAllImported)}
              >
                <Text className="text-cyan-500 text-xs font-comfortaa">
                  {showAllImported ? 'Hide' : 'Show All'} (
                  {importedSounds.length})
                </Text>
              </TouchableOpacity>
            </View>
            <View className="bg-gray-900 mx-4 rounded-lg">
              {(showAllImported
                ? importedSounds
                : importedSounds.slice(0, 1)
              ).map((sound, index) => (
                <TouchableOpacity
                  key={sound.id}
                  className={`flex-row justify-between items-center p-4 ${
                    index > 0 ? 'border-t border-gray-800' : ''
                  }`}
                  onPress={() => setSelectedSoundId(sound.id)}
                >
                  <Text className="text-white font-comfortaa">
                    {sound.name}
                  </Text>
                  {selectedSoundId === sound.id && (
                    <Ionicons name="checkmark" size={20} color="#06B6D4" />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity className="flex-row justify-between items-center p-4 border-t border-gray-800">
                <Text className="text-white font-comfortaa">
                  Import from Files
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              <Text className="text-gray-500 text-xs px-4 pb-3 font-comfortaa">
                Supports .m4a, .wav, .aac, .aiff, and .mp3.
              </Text>
            </View>
          </View> */}

          {/* Built-in Sounds Section */}
          {BUILT_IN_SOUND_GROUPS.map((group) => (
            <View key={group.key} className="mt-6 mb-6">
              <Text className="text-white text-xs px-4 mb-3 font-comfortaa">
                {group.title}
              </Text>
              <View className="bg-gray-900 mx-4 rounded-lg">
                {group.sounds.map((sound, index) => (
                  <TouchableOpacity
                    key={sound.id}
                    className={`flex-row justify-between items-center px-4 py-3 ${
                      index > 0 ? 'border-t border-gray-800' : ''
                    }`}
                    onPress={() => handleSelectSound(sound.id)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-white font-comfortaa">
                      {getSoundDisplayName(sound.id)}
                    </Text>
                    {selectedSoundId === sound.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#10B981"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
