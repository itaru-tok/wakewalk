import { router } from 'expo-router'
import SnoozeOptions from '../../src/components/SnoozeOptions'

export default function SnoozeModal() {
  return <SnoozeOptions onBack={() => router.back()} />
}
