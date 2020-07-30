import {Navigation} from 'react-native-navigation';

import AgendaScreen from './agenda';
import CalendarsScreen from './calendars';
import CalendarsList from './calendarsList';
import ExpandableCalendar from './expandableCalendar';

import HorizontalCalendarList from './horizontalCalendarList';
import MenuScreen from './menu';

import TimelineCalendar from './timelineCalendar';

export function registerScreens() {
  Navigation.registerComponent('Menu', () => MenuScreen);
  Navigation.registerComponent('Calendars', () => CalendarsScreen);
  Navigation.registerComponent('Agenda', () => AgendaScreen);
  Navigation.registerComponent('CalendarsList', () => CalendarsList);
  Navigation.registerComponent('HorizontalCalendarList', () => HorizontalCalendarList);
  Navigation.registerComponent('ExpandableCalendar', () => ExpandableCalendar);
  Navigation.registerComponent('TimelineCalendar', () => TimelineCalendar);
}
