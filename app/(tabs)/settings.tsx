import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'TARGET_WAKE_TIME';

export default function SettingsScreen() {
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem(STORAGE_KEY);
      if (v) setTime(v);
    })();
  }, []);

  const onConfirm = useCallback(async (date: Date) => {
    const hh = `${date.getHours()}`.padStart(2, '0');
    const mm = `${date.getMinutes()}`.padStart(2, '0');
    const v = `${hh}:${mm}`;
    await AsyncStorage.setItem(STORAGE_KEY, v);
    setTime(v);
    setVisible(false);
  }, []);

  return (
    <View className="p-4">
      <Text className="text-xl font-semibold mb-4">設定</Text>
      <View className="gap-2">
        <Text className="text-base text-neutral-700">目標起床時間</Text>
        <Pressable onPress={() => setVisible(true)}>
          <Text className="text-lg text-blue-600">{time ?? '未設定 (タップして設定)'}</Text>
        </Pressable>
      </View>

      <DateTimePickerModal
        isVisible={visible}
        mode="time"
        onConfirm={onConfirm}
        onCancel={() => setVisible(false)}
        minuteInterval={1}
        locale="ja-JP"
      />
    </View>
  );
}

