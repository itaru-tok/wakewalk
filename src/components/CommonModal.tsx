import { Button, Host } from '@expo/ui/swift-ui'
import { Modal, Text, View } from 'react-native'
import { fonts } from '../constants/theme'

interface CommonModalProps {
  visible: boolean
  title: string
  message: string
  subMessage?: string
  buttonText?: string
  onDismiss: () => void
}

export default function CommonModal({
  visible,
  title,
  message,
  subMessage,
  buttonText = 'OK',
  onDismiss,
}: CommonModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 bg-black/70 items-center justify-center px-8">
        <View className="w-full max-w-[340px] rounded-3xl bg-[#0f111a] px-6 py-7 border border-white/15">
          <Text
            className="text-white text-2xl mb-2 text-center"
            style={{ fontFamily: fonts.comfortaa.bold }}
          >
            {title}
          </Text>
          <Text
            className="text-white/80 text-base text-center"
            style={{ fontFamily: fonts.comfortaa.medium }}
          >
            {message}
          </Text>
          {subMessage && (
            <Text
              className="text-white/70 text-sm text-center mt-4"
              style={{ fontFamily: fonts.comfortaa.medium }}
            >
              {subMessage}
            </Text>
          )}
          <View className="mt-6">
            <Host>
              <Button variant="borderless" onPress={onDismiss}>
                <View className="rounded-2xl bg-white/15 border border-white/20 py-3">
                  <Text
                    className="text-white text-lg text-center"
                    style={{ fontFamily: fonts.comfortaa.bold }}
                  >
                    {buttonText}
                  </Text>
                </View>
              </Button>
            </Host>
          </View>
        </View>
      </View>
    </Modal>
  )
}