# React Native Calendars 🗓️ 📆

[![Version](https://img.shields.io/npm/v/react-native-calendars.svg)](https://www.npmjs.com/package/react-native-calendars)
[![Build Status](https://travis-ci.org/wix/react-native-calendars.svg?branch=master)](https://travis-ci.org/wix/react-native-calendars)

This module includes various customizable **React-Native** calendar components.

The package is both **Android** and **iOS** compatible.

## Try it out

You can run example module by performing these steps:

```
$ git clone git@github.com:wix/react-native-calendars.git
$ npm install
$ react-native run-ios
```

You can check example screens source code in [example module screens](https://github.com/wix-private/wix-react-native-calendar/tree/master/example/src/screens)

This project is compatible with Expo/CRNA (without ejecting), and the examples have been [published on Expo](https://expo.io/@community/react-native-calendars-example)

## Installation

```
$ npm install --save react-native-calendars
```

The solution is implemented in JavaScript so no native module linking is required.

## Usage

`import {`[Calendar](#calendar), [CalendarList](#calendarlist), [Agenda](#agenda)`} from 'react-native-calendars';`

All parameters for components are optional. By default the month of current local date will be displayed.

Event handler callbacks are called with `calendar objects` like this:

```javasctipt
{
  day: 1,      // day of month (1-31)
  month: 1,    // month of year (1-12)
  year: 2017,  // year
  timestamp,   // UTC timestamp representing 00:00 AM of this date
  dateString: '2016-05-13' // date formatted as 'YYYY-MM-DD' string
  dayNameIndex: 0 // for Sunday(0) -> Saturday(6)
}
```

Parameters that require date types accept `YYYY-MM-DD` formated `date-strings`, JavaScript date objects, `calendar objects` and `UTC timestamps`.

Calendars can be localized by adding custom locales to `LocaleConfig` object:

```javascript
import {LocaleConfig} from 'react-native-calendars';

LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre'
  ],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';
```

### Calendar

<kbd>
  <img src="https://github.com/wix-private/wix-react-native-calendar/blob/master/demo/calendar.gif?raw=true">
</kbd>

#### Basic parameters

```javascript
<Calendar
  // Initially visible month. Default = Date()
  current={'2012-03-01'}
  // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
  minDate={'2012-05-10'}
  // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
  maxDate={'2012-05-30'}
  // Handler which gets executed on day press. Default = undefined
  onDayPress={day => {
    console.log('selected day', day);
  }}
  // Handler which gets executed on day long press. Default = undefined
  onDayLongPress={day => {
    console.log('selected day', day);
  }}
  // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
  monthFormat={'yyyy MM'}
  // Handler which gets executed when visible month changes in calendar. Default = undefined
  onMonthChange={month => {
    console.log('month changed', month);
  }}
  // Hide month navigation arrows. Default = false
  hideArrows={true}
  // Replace default arrows with custom ones (direction can be 'left' or 'right')
  renderArrow={direction => <Arrow />}
  // Do not show days of other months in month page. Default = false
  hideExtraDays={true}
  // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
  // day from another month that is visible in calendar page. Default = false
  disableMonthChange={true}
  // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
  firstDay={1}
  // Hide day names. Default = false
  hideDayNames={true}
  // Show week numbers to the left. Default = false
  showWeekNumbers={true}
  // Handler which gets executed when press arrow icon left. It receive a callback can go back month
  onPressArrowLeft={subtractMonth => subtractMonth()}
  // Handler which gets executed when press arrow icon right. It receive a callback can go next month
  onPressArrowRight={addMonth => addMonth()}
  // Disable left arrow. Default = false
  disableArrowLeft={true}
  // Disable right arrow. Default = false
  disableArrowRight={true}
  // Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
  disableAllTouchEventsForDisabledDays={true}
  // Replace default month and year title with custom one. the function receive a date as parameter.
  renderHeader={date => {
    /*Return JSX*/
  }}
  // Enable the option to swipe between months. Default = false
  enableSwipeMonths={true}
/>
```

#### Date marking

**Disclaimer**: Make sure that `markedDates` param is immutable. If you change `markedDates` object content but the reference to it does not change calendar update will not be triggered.

Dot marking

<kbd>
  <img height=50 src="https://github.com/wix-private/wix-react-native-calendar/blob/master/demo/marking1.png?raw=true">
</kbd>
<p></p>

```javascript
<Calendar
  // Collection of dates that have to be marked. Default = {}
  markedDates={{
    '2012-05-16': {selected: true, marked: true, selectedColor: 'blue'},
    '2012-05-17': {marked: true},
    '2012-05-18': {marked: true, dotColor: 'red', activeOpacity: 0},
    '2012-05-19': {disabled: true, disableTouchEvent: true}
  }}
/>
```

You can customize a dot color for each day independently.

Multi-Dot marking

<kbd>
 <img height=50 src="https://github.com/wix-private/wix-react-native-calendar/blob/master/demo/marking4.png?raw=true">
</kbd>
<p></p>

Use `markingType={'multi-dot'}` if you want to display more than one dot. Both the `<Calendar/>` and `<CalendarList/>` support multiple dots by using `dots` array in `markedDates` prop.
The property `color` is mandatory while `key` and `selectedColor` are optional. If key is omitted then the array index is used as key. If `selectedColor` is omitted then `color` will be used for selected dates.

```javascript
const vacation = {key: 'vacation', color: 'red', selectedDotColor: 'blue'};
const massage = {key: 'massage', color: 'blue', selectedDotColor: 'blue'};
const workout = {key: 'workout', color: 'green'};

<Calendar
  markedDates={{
    '2017-10-25': {dots: [vacation, massage, workout], selected: true, selectedColor: 'red'},
    '2017-10-26': {dots: [massage, workout], disabled: true}
  }}
  markingType={'multi-dot'}
/>;
```

Period marking

<kbd>
  <img height=50 src="https://github.com/wix-private/wix-react-native-calendar/blob/master/demo/marking2.png?raw=true">
</kbd>

<kbd>
  <img height=50 src="https://github.com/wix-private/wix-react-native-calendar/blob/master/demo/marking3.png?raw=true">
</kbd>
<p></p>

```javascript
<Calendar
  // Collection of dates that have to be colored in a special way. Default = {}
  markedDates={{
    '2012-05-20': {textColor: 'green'},
    '2012-05-22': {startingDay: true, color: 'green'},
    '2012-05-23': {selected: true, endingDay: true, color: 'green', textColor: 'gray'},
    '2012-05-04': {disabled: true, startingDay: true, color: 'green', endingDay: true}
  }}
  // Date marking style [simple/period/multi-dot/custom]. Default = 'simple'
  markingType={'period'}
/>
```

Multi-period marking

<kbd>
  <img height=50 src="https://github.com/wix-private/wix-react-native-calendar/blob/master/demo/marking6.png?raw=true">
</kbd>
<p></p>

**CAUTION**: This marking is only fully supported by the `<Calendar/>` component because it expands its height. Usage with `<CalendarList/>` might lead to overflow issues.

```javascript
<Calendar
  markedDates={{
    '2017-12-14': {
      periods: [
        {startingDay: false, endingDay: true, color: '#5f9ea0'},
        {startingDay: false, endingDay: true, color: '#ffa500'},
        {startingDay: true, endingDay: false, color: '#f0e68c'}
      ]
    },
    '2017-12-15': {
      periods: [
        {startingDay: true, endingDay: false, color: '#ffa500'},
        {color: 'transparent'},
        {startingDay: false, endingDay: false, color: '#f0e68c'}
      ]
    }
  }}
  // Date marking style [simple/period/multi-dot/custom]. Default = 'simple'
  markingType="multi-period"
/>
```

Custom marking allows you to customize each marker with custom styles.

<kbd>
  <img height=50 src="https://github.com/wix-private/wix-react-native-calendar/blob/master/demo/custom.png?raw=true">
</kbd>
<p></p>

```javascript
<Calendar
  // Date marking style [simple/period/multi-dot/single]. Default = 'simple'
  markingType={'custom'}
  markedDates={{
    '2018-03-28': {
      customStyles: {
        container: {
          backgroundColor: 'green'
        },
        text: {
          color: 'black',
          fontWeight: 'bold'
        }
      }
    },
    '2018-03-29': {
      customStyles: {
        container: {
          backgroundColor: 'white',
          elevation: 2
        },
        text: {
          color: 'blue'
        }
      }
    }
  }}
/>
```

**NEW!** While we still don't support multi marking type, we add the possibility to combine between `period` and `simple`.

```javascript
<Calendar
  markingType={'period'}
  markedDates={{
    '2012-05-15': {marked: true, dotColor: '#50cebb'},
    '2012-05-16': {marked: true, dotColor: '#50cebb'},
    '2012-05-21': {startingDay: true, color: '#50cebb', textColor: 'white'},
    '2012-05-22': {color: '#70d7c7', textColor: 'white'},
    '2012-05-23': {color: '#70d7c7', textColor: 'white', marked: true, dotColor: 'white'},
    '2012-05-24': {color: '#70d7c7', textColor: 'white'},
    '2012-05-25': {endingDay: true, color: '#50cebb', textColor: 'white'}
  }}
/>
```

<kbd>
  <img height=350 src="https://github.com/wix-private/wix-react-native-calendar/blob/master/demo/multi-marking.png?raw=true">
</kbd>
<p></p>

Keep in mind that different marking types are not compatible. You can use just one marking style for a calendar.

#### Displaying data loading indicator

<kbd>
  <img height=50 src="https://github.com/wix-private/wix-react-native-calendar/blob/master/demo/loader.png?raw=true">
</kbd>
<p></p>

The loading indicator next to the month name will be displayed if `<Calendar/>` has `displayLoadingIndicator` prop and the `markedDates` collection does not have a value for every day of the month in question. When you load data for days, just set `[]` or special marking value to all days in `markedDates` collection.

#### Customizing look & feel

```javascript
<Calendar
  // Specify style for calendar container element. Default = {}
  style={{
    borderWidth: 1,
    borderColor: 'gray',
    height: 350
  }}
  // Specify theme properties to override specific styles for calendar parts. Default = {}
  theme={{
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    textSectionTitleColor: '#b6c1cd',
    textSectionTitleDisabledColor: '#d9e1e8',
    selectedDayBackgroundColor: '#00adf5',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#00adf5',
    dayTextColor: '#2d4150',
    textDisabledColor: '#d9e1e8',
    dotColor: '#00adf5',
    selectedDotColor: '#ffffff',
    arrowColor: 'orange',
    disabledArrowColor: '#d9e1e8',
    monthTextColor: 'blue',
    indicatorColor: 'blue',
    textDayFontFamily: 'monospace',
    textMonthFontFamily: 'monospace',
    textDayHeaderFontFamily: 'monospace',
    textDayFontWeight: '300',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '300',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 16
  }}
/>
```

#### Customize days titles with disabled styling

```javascript
<Calendar
  theme={{
    textSectionTitleDisabledColor: '#d9e1e8'
  }}
  disabledDaysIndexes={[0, 6]}
  markedDates={{
    ...this.getDisabledDates('2012-05-01', '2012-05-30', [0, 6])
  }}
/>
```

#### Advanced styling

If you want to have complete control over the calendar styles you can do it by overriding default `style.js` files. For example, if you want to override `<CalendarHeader/>` style first you have to find stylesheet id for this file:

https://github.com/wix/react-native-calendars/blob/master/src/calendar/header/style.js#L4

In this case it is `stylesheet.calendar.header`. Next you can add overriding stylesheet to your theme with this id.

https://github.com/wix/react-native-calendars/blob/master/example/src/screens/calendars.js#L56

```javascript
theme={{
  arrowColor: 'white',
  'stylesheet.calendar.header': {
    week: {
      marginTop: 5,
      flexDirection: 'row',
      justifyContent: 'space-between'
    }
  }
}}
```

#### Individual day header and days styling based on day name index

Using the above advanced styling, it is possible to set styles independently for each day's header. If we wanted to make the header for Sunday red, and Saturday blue and make all Sunday days red and Saturday days blue, we could write something like the following:

```javascript
theme={{
  'stylesheet.calendar.header': {
    dayTextAtIndex0: {
      color: 'red'
    },
    dayTextAtIndex6: {
      color: 'blue'
    }
  },
  'stylesheet.day.basic': {
    dayTextAtIndex0: {
      color: 'red'
    },
    dayTextAtIndex6: {
      color: 'blue'
    }
  }
}}
```

<kbd>
  <img height=50 src="https://github.com/wix-private/wix-react-native-calendar/blob/master/demo/day-header-and-days-style.png?raw=true">
</kbd>
<p></p>

**Disclaimer**: Issues that arise because something breaks after using stylesheet override will not be supported. Use this option at your own risk.

#### Overriding day component

If you need custom functionality not supported by current day component implementations you can pass your own custom day component to the calendar.

```javascript
<Calendar
  style={[styles.calendar, {height: 300}]}
  dayComponent={({date, state}) => {
    return (
      <View>
        <Text style={{textAlign: 'center', color: state === 'disabled' ? 'gray' : 'black'}}>{date.day}</Text>
      </View>
    );
  }}
/>
```

The `dayComponent` prop has to receive a RN component or a function that receive props. The `dayComponent` will receive such props:

- state - disabled if the day should be disabled (this is decided by base calendar component).
- marking - `markedDates` value for this day.
- date - the date object representing this day.

**Tip**: Don't forget to implement `shouldComponentUpdate()` for your custom day component to make the calendar perform better

If you implement an awesome day component please make a PR so that other people could use it :)

### CalendarList

<kbd>
  <img src="https://github.com/wix-private/wix-react-native-calendar/blob/master/demo/calendar-list.gif?raw=true">
</kbd>
<p></p>

`<CalendarList/>` is scrollable semi-infinite calendar composed of `<Calendar/>` components. Currently it is possible to scroll 4 years back and 4 years to the future. All parameters that are available for `<Calendar/>` are also available for this component. There are also some additional params that can be used:

```javascript
<CalendarList
  // Callback which gets executed when visible months change in scroll view. Default = undefined
  onVisibleMonthsChange={(months) => {console.log('now these months are visible', months);}}
  // Max amount of months allowed to scroll to the past. Default = 50
  pastScrollRange={50}
  // Max amount of months allowed to scroll to the future. Default = 50
  futureScrollRange={50}
  // Enable or disable scrolling of calendar list
  scrollEnabled={true}
  // Enable or disable vertical scroll indicator. Default = false
  showScrollIndicator={true}
  ...calendarParams
/>
```

#### Horizontal CalendarList

<kbd>
  <img src="https://github.com/wix-private/wix-react-native-calendar/blob/master/demo/horizontal-calendar-list.gif?raw=true">
</kbd>
<p></p>

You can also make the `CalendarList` scroll horizontally. To do that you need to pass specific props to the `CalendarList`:

```javascript
<CalendarList
  // Enable horizontal scrolling, default = false
  horizontal={true}
  // Enable paging on horizontal, default = false
  pagingEnabled={true}
  // Set custom calendarWidth.
  calendarWidth={320}
  ...calendarListParams
  ...calendarParams
/>
```

### Agenda

<kbd>
  <img src="https://github.com/wix-private/wix-react-native-calendar/blob/master/demo/agenda.gif?raw=true">
</kbd>
<p></p>

An advanced `Agenda` component that can display interactive listings for calendar day items.

```javascript
<Agenda
  // The list of items that have to be displayed in agenda. If you want to render item as empty date
  // the value of date key has to be an empty array []. If there exists no value for date key it is
  // considered that the date in question is not yet loaded
  items={{
    '2012-05-22': [{name: 'item 1 - any js object'}],
    '2012-05-23': [{name: 'item 2 - any js object', height: 80}],
    '2012-05-24': [],
    '2012-05-25': [{name: 'item 3 - any js object'}, {name: 'any js object'}]
  }}
  // Callback that gets called when items for a certain month should be loaded (month became visible)
  loadItemsForMonth={month => {
    console.log('trigger items loading');
  }}
  // Callback that fires when the calendar is opened or closed
  onCalendarToggled={calendarOpened => {
    console.log(calendarOpened);
  }}
  // Callback that gets called on day press
  onDayPress={day => {
    console.log('day pressed');
  }}
  // Callback that gets called when day changes while scrolling agenda list
  onDayChange={day => {
    console.log('day changed');
  }}
  // Initially selected day
  selected={'2012-05-16'}
  // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
  minDate={'2012-05-10'}
  // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
  maxDate={'2012-05-30'}
  // Max amount of months allowed to scroll to the past. Default = 50
  pastScrollRange={50}
  // Max amount of months allowed to scroll to the future. Default = 50
  futureScrollRange={50}
  // Specify how each item should be rendered in agenda
  renderItem={(item, firstItemInDay) => {
    return <View />;
  }}
  // Specify how each date should be rendered. day can be undefined if the item is not first in that day.
  renderDay={(day, item) => {
    return <View />;
  }}
  // Specify how empty date content with no items should be rendered
  renderEmptyDate={() => {
    return <View />;
  }}
  // Specify how agenda knob should look like
  renderKnob={() => {
    return <View />;
  }}
  // Specify what should be rendered instead of ActivityIndicator
  renderEmptyData={() => {
    return <View />;
  }}
  // Specify your item comparison function for increased performance
  rowHasChanged={(r1, r2) => {
    return r1.text !== r2.text;
  }}
  // Hide knob button. Default = false
  hideKnob={true}
  // When `true` and `hideKnob` prop is `false`, the knob will always be visible and the user will be able to drag the knob up and close the calendar. Default = false
  showClosingKnob={false}
  // By default, agenda dates are marked if they have at least one item, but you can override this if needed
  markedDates={{
    '2012-05-16': {selected: true, marked: true},
    '2012-05-17': {marked: true},
    '2012-05-18': {disabled: true}
  }}
  // If disabledByDefault={true} dates flagged as not disabled will be enabled. Default = false
  disabledByDefault={true}
  // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly.
  onRefresh={() => console.log('refreshing...')}
  // Set this true while waiting for new data from a refresh
  refreshing={false}
  // Add a custom RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView.
  refreshControl={null}
  // Agenda theme
  theme={{
    ...calendarTheme,
    agendaDayTextColor: 'yellow',
    agendaDayNumColor: 'green',
    agendaTodayColor: 'red',
    agendaKnobColor: 'blue'
  }}
  // Agenda container style
  style={{}}
/>
```

## Authors

- [Tautvilas Mecinskas](https://github.com/tautvilas/) - Initial code - [@tautvilas](https://twitter.com/Tautvilas)
- Katrin Zotchev - Initial design - [@katrin_zot](https://twitter.com/katrin_zot)

See also the list of [contributors](https://github.com/wix/react-native-calendar-components/contributors) who participated in this project.

## Contributing

Pull requests are most welcome!
Please `npm run test` and `npm run lint` before push.
Don't forget to add a **title** and a **description** that explain the issue you're trying to solve and your suggested solution. Screenshots and gifs are very helpful.
