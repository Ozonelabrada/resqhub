/**
 * ⌨️ Keyboard Aware Container
 * Wrapper that handles keyboard and dismissal
 */

import React from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  ViewStyle,
} from 'react-native';

interface KeyboardAwareContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  dismissKeyboardOnTap?: boolean;
}

export const KeyboardAwareContainer: React.FC<KeyboardAwareContainerProps> = ({
  children,
  style,
  dismissKeyboardOnTap = true,
}) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (dismissKeyboardOnTap) {
          Keyboard.dismiss();
        }
      }}
    >
      <View style={style}>{children}</View>
    </TouchableWithoutFeedback>
  );
};

export default KeyboardAwareContainer;
