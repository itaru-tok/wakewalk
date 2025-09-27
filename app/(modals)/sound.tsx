import { router } from 'expo-router'
import SoundSelectionPage from '../../src/components/SoundSelectionPage'

export default function SoundModal() {
  return <SoundSelectionPage onBack={() => router.back()} />
}