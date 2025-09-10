import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { AlarmIcon, StatsIcon, SettingsIcon } from '../../components/icons';
import ScrollPicker from '../../components/ScrollPicker';
import SettingRow from '../../components/SettingRow';
import { colors } from '../../constants/theme';

export default function HomeScreen() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [snoozeEnabled, setSnoozeEnabled] = useState(false);
  const [selectedHour, setSelectedHour] = useState(19);
  const [selectedMinute, setSelectedMinute] = useState(30);
  
  // Generate arrays for hours and minutes
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <View className="flex-1 bg-primary">
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="light-content" />
        
        {/* App Header */}
        <View className="h-16 px-6 flex flex-row items-center justify-between bg-primary">
          <Text className="font-comfortaa font-bold text-2xl text-accent">StepUp</Text>
          <View className="w-3 h-3" />
        </View>
        
        {/* Main Content */}
        <View className="flex-1">
          
          {/* Time Picker Section */}
          <View className="flex-1 flex flex-row items-center justify-center">
            {/* Hours Picker */}
            <View className="flex-1 max-w-[120px]">
              <ScrollPicker
                items={hours}
                selectedIndex={selectedHour}
                onValueChange={setSelectedHour}
              />
            </View>
            
            {/* Colon Separator */}
            <View className="mx-2">
              <Text className="text-time-active text-accent font-comfortaa font-medium">:</Text>
            </View>
            
            {/* Minutes Picker */}
            <View className="flex-1 max-w-[120px]">
              <ScrollPicker
                items={minutes}
                selectedIndex={selectedMinute}
                onValueChange={setSelectedMinute}
              />
            </View>
          </View>
          
          {/* Settings Card */}
          <View className="bg-accent rounded-t-3xl px-6 pt-6 pb-8">
            <SettingRow
              title="Sound"
              subtitle="Bip Bip"
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              className="mb-6"
            />
            {/* <SettingRow
              title="Vibrate"
              subtitle="Basic Call"
              value={vibrateEnabled}
              onValueChange={setVibrateEnabled}
              className="mb-6"
            />
            <SettingRow
              title="Snooze"
              subtitle="5 minutes, 3 times"
              value={snoozeEnabled}
              onValueChange={setSnoozeEnabled}
            /> */}
          </View>
        </View>
      </SafeAreaView>
      
      {/* Bottom Navigation */}
      <View className="h-20 bg-primary flex flex-row items-center justify-around px-8 pb-4 pt-2">
        {/* Alarm Nav Item (Active) */}
        <TouchableOpacity className="flex-1 flex items-center justify-center">
          <AlarmIcon width={28} height={31} fill={colors.accent} />
        </TouchableOpacity>
        
        {/* Stats Nav Item */}
        <TouchableOpacity className="flex-1 flex items-center justify-center opacity-60">
          <StatsIcon width={24} height={28} fill={colors.accent} />
        </TouchableOpacity>
        
        {/* Settings Nav Item */}
        {/* <TouchableOpacity className="flex-1 flex items-center justify-center opacity-60">
          <SettingsIcon width={26} height={32} fill={colors.accent} />
        </TouchableOpacity> */}
      </View>
    </View>
  );
}
