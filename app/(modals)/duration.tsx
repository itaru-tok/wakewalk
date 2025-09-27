import { router } from 'expo-router'
import RingDurationPage from '../../src/components/RingDurationPage'

export default function DurationModal() {
  return <RingDurationPage onBack={() => router.back()} />
}