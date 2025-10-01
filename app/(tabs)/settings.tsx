// TODO: use SwiftUI Components from @expo/ui/swift-ui
// TODO: use ColorPicker from @expo/ui/swift-ui
import { ColorPicker, Host } from '@expo/ui/swift-ui'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ColorPickerModal from '../../src/components/ColorPickerModal'
import PaywallModal from '../../src/components/PaywallModal'
import { fonts } from '../../src/constants/theme'
import { usePremium } from '../../src/context/PremiumContext'
import { useTheme } from '../../src/context/ThemeContext'
import { getDarkerShade } from '../../src/utils/color'

export default function SettingsScreen() {
  const {
    themeMode,
    setThemeMode,
    themeColor,
    setThemeColor,
    gradientColors,
    setGradientColors,
  } = useTheme()

  const { isPremium, isLoading } = usePremium()

  const [showColorPicker, setShowColorPicker] = useState(false)
  const [editingGradientIndex, setEditingGradientIndex] = useState<
    number | null
  >(null)
  const [showPaywall, setShowPaywall] = useState(false)

  const openExternalLink = useCallback(async (url: string) => {
    try {
      await Linking.openURL(url)
    } catch (error) {
      console.error('Failed to open link', error)
    }
  }, [])

  const handleColorSelect = useCallback(
    (color: string) => {
      if (themeMode === 'color') {
        setThemeColor(color)
      } else if (editingGradientIndex !== null) {
        const newColors = [...gradientColors]
        newColors[editingGradientIndex] = color
        setGradientColors(newColors)
      }
    },
    [
      themeMode,
      editingGradientIndex,
      gradientColors,
      setThemeColor,
      setGradientColors,
    ],
  )

  const handleAddGradientColor = useCallback(() => {
    if (gradientColors.length < 3) {
      setGradientColors([...gradientColors, '#FFFFFF'])
    }
  }, [gradientColors, setGradientColors])

  const handleRemoveGradientColor = useCallback(
    (index: number) => {
      const newColors = gradientColors.filter((_, i) => i !== index)
      setGradientColors(newColors)
    },
    [gradientColors, setGradientColors],
  )

  const getBackgroundColors = useCallback(() => {
    if (themeMode === 'color') {
      return [themeColor, getDarkerShade(themeColor), '#000000'] as const
    } else {
      return [...gradientColors, '#000000'] as unknown as [
        string,
        string,
        ...string[],
      ]
    }
  }, [themeMode, themeColor, gradientColors])

  return (
    <LinearGradient
      colors={getBackgroundColors()}
      style={{ flex: 1 }}
      locations={themeMode === 'color' ? [0, 0.5, 1] : undefined}
    >
      <SafeAreaView className="flex-1" edges={['top']}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View className="px-6 py-4">
          <Text
            className="text-accent text-2xl"
            style={{ fontFamily: fonts.comfortaa.bold }}
          >
            Settings
          </Text>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Theme Mode Selector */}
          <View className="bg-white/10 rounded-2xl p-4 mb-6">
            <Text className="text-white text-lg font-comfortaa mb-4">
              Background Color
            </Text>

            <View className="flex-row bg-black/30 rounded-lg p-1">
              <TouchableOpacity
                onPress={() => setThemeMode('color')}
                className={`flex-1 py-3 rounded-lg ${
                  themeMode === 'color' ? 'bg-white/20' : ''
                }`}
              >
                <View className="flex-row items-center justify-center">
                  <View
                    className="w-5 h-5 rounded-full mr-2"
                    style={{ backgroundColor: themeColor }}
                  />
                  <Text
                    className={`${themeMode === 'color' ? 'text-white' : 'text-gray-400'}`}
                  >
                    Mono
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (isPremium) {
                    setThemeMode('gradient')
                  } else {
                    setShowPaywall(true)
                  }
                }}
                className={`flex-1 py-3 rounded-lg ${
                  themeMode === 'gradient' ? 'bg-white/20' : ''
                }`}
              >
                <View className="flex-row items-center justify-center">
                  <LinearGradient
                    colors={gradientColors.slice(0, 2) as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      marginRight: 8,
                    }}
                  />
                  <Text
                    className={`${themeMode === 'gradient' ? 'text-white' : 'text-gray-400'} ml-2`}
                  >
                    {isPremium ? 'Gradient' : 'Gradient (Pro)'}
                  </Text>
                  {!isPremium && (
                    <Ionicons
                      name="lock-closed"
                      size={16}
                      color="#F59E0B"
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Color Selection */}
          {themeMode === 'color' ? (
            <View className="bg-white/10 rounded-2xl p-4 flex-row items-center justify-between mb-6">
              <Text className="text-white text-lg font-comfortaa">
                Mono Color
              </Text>
              <Host style={{ width: 200, height: 10 }}>
                <ColorPicker
                  selection={themeColor}
                  onValueChanged={(color: string) => setThemeColor(color)}
                  supportsOpacity={false}
                />
              </Host>
            </View>
          ) : isPremium ? (
            <View className="bg-white/10 rounded-2xl p-4 mb-6">
              <Text className="text-white text-lg font-comfortaa mb-4">
                Gradient Colors
              </Text>

              {gradientColors.map((color, index) => (
                <View key={`gradient-color-${color}`} className="mb-3">
                  <TouchableOpacity
                    onPress={() => {
                      setEditingGradientIndex(index)
                      setShowColorPicker(true)
                    }}
                    className="flex-row items-center justify-between bg-black/30 rounded-lg p-4"
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-10 h-10 rounded-lg mr-3"
                        style={{ backgroundColor: color }}
                      />
                      <Text className="text-white font-comfortaa">
                        Color {index + 1}: {color}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <TouchableOpacity
                        onPress={() => handleRemoveGradientColor(index)}
                        className="mr-3"
                      >
                        <Ionicons
                          name="remove-circle"
                          size={24}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9CA3AF"
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {gradientColors.length < 3 && (
                <TouchableOpacity
                  onPress={handleAddGradientColor}
                  className="flex-row items-center justify-center bg-black/30 rounded-lg p-4 mt-2"
                >
                  <Ionicons name="add-circle" size={24} color="#10B981" />
                  <Text className="text-white ml-2 font-comfortaa">
                    Add Color
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View>
              <Text className="text-white text-lg font-comfortaa">
                Gradient Colors (Pro)
              </Text>
            </View>
          )}

          {/* Premium Section */}
          <View className="bg-white/10 rounded-2xl p-4 mb-6">
            <Text className="text-white text-lg font-comfortaa mb-4">
              Pro Plan
            </Text>

            {isLoading ? (
              <View className="flex-row items-center justify-center py-4">
                <ActivityIndicator color="white" />
                <Text className="text-white/70 ml-3 font-comfortaa">
                  Loading...
                </Text>
              </View>
            ) : isPremium ? (
              <View className="flex-row items-center justify-between rounded-lg p-4">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text className="text-white ml-3 font-comfortaa">
                    Pro Active
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowPaywall(true)}
                className="flex-row items-center justify-between bg-yellow-500/20 rounded-lg p-4"
              >
                <View className="flex-row items-center">
                  <Ionicons name="lock-closed" size={24} color="#F59E0B" />
                  <Text className="text-white ml-3 font-comfortaa">
                    Unlock Pro
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Other Settings */}
          {/* <View className="bg-white/10 rounded-2xl p-4 mb-6">
            <Text className="text-white text-lg font-comfortaa mb-4">
              General
            </Text>

            <TouchableOpacity className="py-3 border-b border-white/20">
              <Text className="text-white font-comfortaa">Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-3 border-b border-white/20">
              <Text className="text-white font-comfortaa">Language</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-3">
              <Text className="text-white font-comfortaa">About</Text>
            </TouchableOpacity>
          </View> */}
        </ScrollView>
      </SafeAreaView>

      <ColorPickerModal
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onSelectColor={handleColorSelect}
        initialColor={
          themeMode === 'color'
            ? themeColor
            : editingGradientIndex !== null
              ? gradientColors[editingGradientIndex]
              : '#FFFFFF'
        }
      />

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onOpenLegalLink={(url) => openExternalLink(url)}
      />
    </LinearGradient>
  )
}
