import React from 'react';
import { Platform, Text } from 'react-native';

interface WebIconProps {
  name: string;
  size: number;
  color: string;
  style?: any;
}

// Icon mapping for web fallbacks
const iconMap: Record<string, string> = {
  // Navigation icons
  'alert-circle-outline': '⚠️',
  'calculator': '🧮',
  'shield-check-outline': '🛡️',
  'chart-bar': '📊',
  
  // Common icons
  'plus': '+',
  'close': '✕',
  'check': '✓',
  'pencil': '✏️',
  'delete': '🗑️',
  'dots-vertical': '⋮',
  'filter-variant': '🔽',
  'sort': '↕️',
  'matrix': '▦',
  'robot': '🤖',
  'history': '📜',
  'calendar-clock': '📅',
  'folder-open-outline': '📂',
  'link': '🔗',
  'flag': '🚩',
  'alert': '❗',
  'help-circle': '❓',
  'link-variant': '🔗',
  'alert-circle': '⚠️',
  'content-copy': '📋',
  'archive': '📦',
  'circle-outline': '○',
  'check-circle': '✅',
  'numeric-1-circle': '①',
  'numeric-2-circle': '②',
  'numeric-3-circle': '③',
  'file-document': '📄',
  'file-document-multiple': '📑',
  'account': '👤',
  'folder': '📁',
  'format-title': '📝',
  'progress-check': '✔️',
  'lightbulb': '💡',
  'robot-outline': '🤖',
};

const WebIcon: React.FC<WebIconProps> = ({ name, size, color, style }) => {
  if (Platform.OS === 'web') {
    return (
      <Text style={[{ fontSize: size * 0.8, color }, style]}>
        {iconMap[name] || '•'}
      </Text>
    );
  }
  
  // For native platforms, use react-native-vector-icons
  try {
    const VectorIcon = require('react-native-vector-icons/MaterialCommunityIcons').default;
    return <VectorIcon name={name} size={size} color={color} style={style} />;
  } catch (error) {
    // Fallback if vector icons fail to load
    return (
      <Text style={[{ fontSize: size * 0.8, color }, style]}>
        {iconMap[name] || '•'}
      </Text>
    );
  }
};

export default WebIcon;