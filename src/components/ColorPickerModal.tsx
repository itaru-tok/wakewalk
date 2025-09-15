import Slider from '@react-native-community/slider'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'

interface ColorPickerModalProps {
  visible: boolean
  onClose: () => void
  onSelectColor: (color: string) => void
  initialColor?: string
}

type PickerMode = 'grid' | 'spectrum' | 'sliders'

const gridColors = [
  // Grayscale
  [
    '#FFFFFF',
    '#E5E5E5',
    '#CCCCCC',
    '#B3B3B3',
    '#999999',
    '#808080',
    '#666666',
    '#4D4D4D',
    '#333333',
    '#1A1A1A',
    '#000000',
  ],
  // Blues
  [
    '#E3F2FD',
    '#BBDEFB',
    '#90CAF9',
    '#64B5F6',
    '#42A5F5',
    '#2196F3',
    '#1E88E5',
    '#1976D2',
    '#1565C0',
    '#0D47A1',
    '#01579B',
  ],
  // Purples
  [
    '#F3E5F5',
    '#E1BEE7',
    '#CE93D8',
    '#BA68C8',
    '#AB47BC',
    '#9C27B0',
    '#8E24AA',
    '#7B1FA2',
    '#6A1B9A',
    '#4A148C',
    '#311B92',
  ],
  // Pinks
  [
    '#FCE4EC',
    '#F8BBD0',
    '#F48FB1',
    '#F06292',
    '#EC407A',
    '#E91E63',
    '#D81B60',
    '#C2185B',
    '#AD1457',
    '#880E4F',
    '#FF80AB',
  ],
  // Reds
  [
    '#FFEBEE',
    '#FFCDD2',
    '#EF9A9A',
    '#E57373',
    '#EF5350',
    '#F44336',
    '#E53935',
    '#D32F2F',
    '#C62828',
    '#B71C1C',
    '#FF5252',
  ],
  // Oranges
  [
    '#FFF3E0',
    '#FFE0B2',
    '#FFCC80',
    '#FFB74D',
    '#FFA726',
    '#FF9800',
    '#FB8C00',
    '#F57C00',
    '#EF6C00',
    '#E65100',
    '#FF6E40',
  ],
  // Yellows
  [
    '#FFFDE7',
    '#FFF9C4',
    '#FFF59D',
    '#FFF176',
    '#FFEE58',
    '#FFEB3B',
    '#FDD835',
    '#FBC02D',
    '#F9A825',
    '#F57F17',
    '#FFD600',
  ],
  // Greens
  [
    '#E8F5E9',
    '#C8E6C9',
    '#A5D6A7',
    '#81C784',
    '#66BB6A',
    '#4CAF50',
    '#43A047',
    '#388E3C',
    '#2E7D32',
    '#1B5E20',
    '#00C853',
  ],
  // Teals
  [
    '#E0F2F1',
    '#B2DFDB',
    '#80CBC4',
    '#4DB6AC',
    '#26A69A',
    '#009688',
    '#00897B',
    '#00796B',
    '#00695C',
    '#004D40',
    '#00BFA5',
  ],
  // Cyans
  [
    '#E0F7FA',
    '#B2EBF2',
    '#80DEEA',
    '#4DD0E1',
    '#26C6DA',
    '#00BCD4',
    '#00ACC1',
    '#0097A7',
    '#00838F',
    '#006064',
    '#00E5FF',
  ],
]

export default function ColorPickerModal({
  visible,
  onClose,
  onSelectColor,
  initialColor = '#8B5CF6',
}: ColorPickerModalProps) {
  const [mode, setMode] = useState<PickerMode>('grid')
  const [selectedColor, setSelectedColor] = useState(initialColor)
  const [rgbValues, setRgbValues] = useState({ r: 139, g: 92, b: 246 })

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    onSelectColor(color)
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  const handleRGBChange = (component: 'r' | 'g' | 'b', value: number) => {
    const newRGB = { ...rgbValues, [component]: Math.round(value) }
    setRgbValues(newRGB)
    const hex = rgbToHex(newRGB.r, newRGB.g, newRGB.b)
    setSelectedColor(hex)
    onSelectColor(hex)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-800">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-gray-400 text-lg font-comfortaa">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold font-comfortaa">
            Colours
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-500 text-lg font-comfortaa">Done</Text>
          </TouchableOpacity>
        </View>

        {/* Mode Selector */}
        <View className="flex-row bg-gray-900 mx-4 mt-4 rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setMode('grid')}
            className={`flex-1 py-2 rounded-lg ${mode === 'grid' ? 'bg-gray-700' : ''}`}
          >
            <Text
              className={`text-center font-comfortaa ${mode === 'grid' ? 'text-white' : 'text-gray-400'}`}
            >
              Grid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('spectrum')}
            className={`flex-1 py-2 rounded-lg ${mode === 'spectrum' ? 'bg-gray-700' : ''}`}
          >
            <Text
              className={`text-center font-comfortaa ${mode === 'spectrum' ? 'text-white' : 'text-gray-400'}`}
            >
              Spectrum
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('sliders')}
            className={`flex-1 py-2 rounded-lg ${mode === 'sliders' ? 'bg-gray-700' : ''}`}
          >
            <Text
              className={`text-center font-comfortaa ${mode === 'sliders' ? 'text-white' : 'text-gray-400'}`}
            >
              Sliders
            </Text>
          </TouchableOpacity>
        </View>

        {/* Color Picker Content */}
        <ScrollView className="flex-1 px-4 mt-4">
          {mode === 'grid' && (
            <View>
              {gridColors.map((row, _rowIndex) => (
                <View key={`color-row-${row[0]}`} className="flex-row mb-2">
                  {row.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => handleColorSelect(color)}
                      className="flex-1 aspect-square mx-1"
                    >
                      <View
                        className={`flex-1 rounded ${
                          selectedColor === color ? 'border-2 border-white' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}

          {mode === 'spectrum' && (
            <View className="mt-4">
              <LinearGradient
                colors={[
                  '#FF0000',
                  '#FF7F00',
                  '#FFFF00',
                  '#00FF00',
                  '#0000FF',
                  '#4B0082',
                  '#9400D3',
                  '#FF0000',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 200, borderRadius: 12 }}
              >
                <TouchableOpacity
                  className="flex-1"
                  onPress={(_e) => {
                    // Simplified spectrum color selection
                    const colors = [
                      '#FF0000',
                      '#FF7F00',
                      '#FFFF00',
                      '#00FF00',
                      '#0000FF',
                      '#9400D3',
                    ]
                    const randomColor =
                      colors[Math.floor(Math.random() * colors.length)]
                    handleColorSelect(randomColor)
                  }}
                />
              </LinearGradient>
            </View>
          )}

          {mode === 'sliders' && (
            <View className="mt-4">
              <View className="mb-6">
                <Text className="text-white mb-2 font-comfortaa">
                  Red: {rgbValues.r}
                </Text>
                <Slider
                  value={rgbValues.r}
                  onValueChange={(value) => handleRGBChange('r', value)}
                  minimumValue={0}
                  maximumValue={255}
                  minimumTrackTintColor="#FF0000"
                  maximumTrackTintColor="#374151"
                  thumbTintColor="#ffffff"
                />
              </View>

              <View className="mb-6">
                <Text className="text-white mb-2 font-comfortaa">
                  Green: {rgbValues.g}
                </Text>
                <Slider
                  value={rgbValues.g}
                  onValueChange={(value) => handleRGBChange('g', value)}
                  minimumValue={0}
                  maximumValue={255}
                  minimumTrackTintColor="#00FF00"
                  maximumTrackTintColor="#374151"
                  thumbTintColor="#ffffff"
                />
              </View>

              <View className="mb-6">
                <Text className="text-white mb-2 font-comfortaa">
                  Blue: {rgbValues.b}
                </Text>
                <Slider
                  value={rgbValues.b}
                  onValueChange={(value) => handleRGBChange('b', value)}
                  minimumValue={0}
                  maximumValue={255}
                  minimumTrackTintColor="#0000FF"
                  maximumTrackTintColor="#374151"
                  thumbTintColor="#ffffff"
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Preview */}
        <View className="px-4 py-4 border-t border-gray-800">
          <View className="flex-row items-center">
            <View
              className="w-16 h-16 rounded-lg mr-4"
              style={{ backgroundColor: selectedColor }}
            />
            <Text className="text-white text-lg font-comfortaa">
              {selectedColor}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}
