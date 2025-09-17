import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

interface SoundSelectionPageProps {
  onBack: () => void
}

const builtInSounds = [
  { id: 'alarm', name: 'Alarm' },
  { id: 'apex', name: 'Apex' },
  { id: 'arpeggio', name: 'Arpeggio-Encoreinfinitum' },
  { id: 'ascending', name: 'Ascending' },
  { id: 'bark', name: 'Bark' },
  { id: 'beacon', name: 'Beacon' },
  { id: 'bell_tower', name: 'Bell Tower' },
  { id: 'bulletin', name: 'Bulletin' },
  { id: 'chimes', name: 'Chimes' },
  { id: 'cosmic', name: 'Cosmic' },
  { id: 'crystals', name: 'Crystals' },
  { id: 'hillside', name: 'Hillside' },
  { id: 'illuminate', name: 'Illuminate' },
  { id: 'night_owl', name: 'Night Owl' },
  { id: 'opening', name: 'Opening' },
  { id: 'radar', name: 'Radar' },
  { id: 'radiate', name: 'Radiate' },
  { id: 'ripples', name: 'Ripples' },
  { id: 'sencha', name: 'Sencha' },
  { id: 'signal', name: 'Signal' },
  { id: 'silk', name: 'Silk' },
  { id: 'slow_rise', name: 'Slow Rise' },
  { id: 'stargaze', name: 'Stargaze' },
  { id: 'summit', name: 'Summit' },
  { id: 'twinkle', name: 'Twinkle' },
  { id: 'uplift', name: 'Uplift' },
  { id: 'waves', name: 'Waves' },
]

const importedSounds = [{ id: 'chiangmai', name: 'chiangmai_bird' }]

export default function SoundSelectionPage({
  onBack,
}: SoundSelectionPageProps) {
  const [selectedSound, setSelectedSound] = useState('chiangmai')
  const [ringDuration, _setRingDuration] = useState(3)
  const [showAllImported, setShowAllImported] = useState(false)

  const _durations = [1, 3, 5, 10, 15, 30]

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
          <TouchableOpacity onPress={onBack} className="p-2">
            <Ionicons name="chevron-back" size={24} color="#06B6D4" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold font-comfortaa">
            Sound
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView className="flex-1">
          {/* Ring Duration Section */}
          <View className="px-4 py-4 border-b border-gray-800">
            <TouchableOpacity
              className="flex-row justify-between items-center"
              onPress={() => {
                // Open duration picker
              }}
            >
              <Text className="text-white text-lg font-comfortaa">
                Ring Duration
              </Text>
              <View className="flex-row items-center">
                <Text className="text-gray-400 mr-2 font-comfortaa">
                  {ringDuration} minutes
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            <Text className="text-gray-500 text-sm mt-2 font-comfortaa">
              Your sound will loop for {ringDuration} minutes.
            </Text>
          </View>

          {/* Music Library Section */}
          <View className="mt-6">
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
          </View>

          {/* Imported Sounds Section */}
          <View className="mt-6">
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
                  onPress={() => setSelectedSound(sound.id)}
                >
                  <Text className="text-white font-comfortaa">
                    {sound.name}
                  </Text>
                  {selectedSound === sound.id && (
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
          </View>

          {/* Built-in Sounds Section */}
          <View className="mt-6 mb-6">
            <Text className="text-gray-500 text-xs px-4 mb-3 font-comfortaa">
              BUILT-IN
            </Text>
            <View className="bg-gray-900 mx-4 rounded-lg">
              {builtInSounds.map((sound, index) => (
                <TouchableOpacity
                  key={sound.id}
                  className={`flex-row justify-between items-center px-4 py-3 ${
                    index > 0 ? 'border-t border-gray-800' : ''
                  }`}
                  onPress={() => setSelectedSound(sound.id)}
                >
                  <Text className="text-white font-comfortaa">
                    {sound.name}
                  </Text>
                  {selectedSound === sound.id && (
                    <Ionicons name="checkmark" size={20} color="#06B6D4" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
