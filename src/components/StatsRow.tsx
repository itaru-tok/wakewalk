import { Text, View } from 'react-native'
import CustomSwitch from './CustomSwitch'

type StatsRowProps = {
  title: string
  subtitle?: string
  value: boolean
  onValueChange: (next: boolean) => void
  className?: string
}

export default function StatsRow({
  title,
  subtitle,
  value,
  onValueChange,
  className = '',
}: StatsRowProps) {
  return (
    <View className={`flex flex-row items-center justify-between ${className}`}>
      <View>
        <Text className="font-comfortaa text-xl text-primary">{title}</Text>
        {subtitle ? (
          <Text className="font-comfortaa text-sm text-secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <CustomSwitch value={value} onValueChange={onValueChange} />
    </View>
  )
}
