import { Tabs } from 'expo-router'
import React from 'react'

const TabLayout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false }} >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="settings" />
    </Tabs>
  )
}

export default TabLayout