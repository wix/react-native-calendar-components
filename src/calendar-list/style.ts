import {Platform, StyleSheet} from 'react-native';
import * as defaultStyle from '../style';
import {Theme} from '../commons/types';

export default function getStyle(theme: Theme = {}) {
  const appStyle = {...defaultStyle, ...theme};
  return StyleSheet.create({
    flatListContainer: {
      flex: Platform.OS === 'web' ? 1 : undefined
    },
    container: {
      backgroundColor: appStyle.calendarBackground
    },
    placeholder: {
      backgroundColor: appStyle.calendarBackground,
      alignItems: 'center',
      justifyContent: 'center'
    },
    placeholderText: {
      fontSize: 30,
      fontWeight: '200',
      color: appStyle.dayTextColor
    },
    calendar: {
      paddingLeft: 15,
      paddingRight: 15
    },
    staticHeader: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      backgroundColor: appStyle.calendarBackground,
      paddingLeft: 15,
      paddingRight: 15
    },
    ...(theme.stylesheet?.['calendar-list']?.main || {})
  });
}
