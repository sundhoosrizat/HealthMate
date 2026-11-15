import { NativeTabs } from 'expo-router/native-tabs';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor="#163A5F"
      indicatorColor="#24577F"
      labelVisibilityMode="labeled"
      labelStyle={{
        color: '#B8C7D9',
        selected: {
          color: '#20B8A5',
        },
      }}
    >
      {/* Home */}
      <NativeTabs.Trigger
        name="index"
        labelVisibilityMode="labeled"
      >
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md="home"
        />
      </NativeTabs.Trigger>

      {/* Explore */}
      <NativeTabs.Trigger
        name="explore"
        labelVisibilityMode="labeled"
      >
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'safari', selected: 'safari.fill' }}
          md="explore"
        />
      </NativeTabs.Trigger>

      {/* History */}
      <NativeTabs.Trigger
        name="history"
        labelVisibilityMode="labeled"
      >
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'calendar', selected: 'calendar' }}
          md="history"
        />
      </NativeTabs.Trigger>

      {/* Profile */}
      <NativeTabs.Trigger
        name="profile"
        labelVisibilityMode="labeled"
      >
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'person.crop.circle',
            selected: 'person.crop.circle.fill',
          }}
          md="account_circle"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}