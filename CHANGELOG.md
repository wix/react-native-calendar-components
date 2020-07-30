# Changelog

## [1.188.0] - 2019-06-16
### Added
- src/expandableCalendar/AgendaList.js - invoking used SectionList's events.
### Removed
- example/src/screens/ExpandableCalendar.js - removing unnecessary 'data' prop sent to AgendaList.


## [1.189.0] - 2019-06-24
### Bug Fix
- CalendarProvider - fix for 'date' prop update.

## [1.190.0] - 2019-06-24
### Added
- CalendarContext - 'disabledOpacity' prop to control the opacity of the today button when it is disabled (default is now undefined, meaning no opacity).
- src/style.js - adding support for today button's font size, weight, family.
### Bug Fix
- CalendarContext - fix for today button's width to allow button to take content's width.

## [1.191.0] - 2019-06-24
### Bug Fix
- ExpandableCalendar - limit calendar min height to closed height.

## [1.192.0] - 2019-06-25
### Fix
- CalendarProvider - fix for warning on Image 'source' type.
- ExpandableCalendar - fix shadow/elevation style.

## [1.193.0] - 2019-06-26
### Bug Fix
- ExpandableCalendar - fix for week paddings. Changing knob container height and weekDays style.
- CalendarList/item - limit 'headerStyle' to horizontal only.

## [1.194.0] - 2019-06-30
### Added
- CalendarProvider - 'onMonthChange' event returning date object and updateSource.

## [1.195.0] - 2019-07-04
### Changed
- Components' props comment format.

## [1.196.0] - 2019-07-04
### Added
- CalendarList - passing 'testID' to static CalendarHeader.

## [1.197.0] - 2019-07-14
### Added
- asCalendarConsumer - hoist non-react statics.

## [1.198.0] - 2019-07-14
### Fix
- ExpandableCalendar - fix example screen.

## [1.199.0] - 2019-07-18
### Changed
- CalendarHeader - editing 'testID' for static CalendarHeader.

## [1.200.0] - 2019-07-18
### Added
- ExpandableCalendar - adding 'testID' for knob.

## [1.201.0] - 2019-07-25
### Changed
- eslint - updating to version 6.1.0.
- lodash - importing library instead of sub-libraries.

## [1.202.0] - 2019-07-25
### Added
- CalendarHeader - adding 'firstDay' (PR #826), 'monthFormat' (PR #787) and 'weekNumbers' to shouldComponentUpdate.
- Agenda - adding support for weekdays name's 'fontSize', 'fontFamily' and 'fontWeight' (PR #711).
- ReservationList - adding support for Day number's 'fontFamily', and to Day text's 'fontFamily' and 'fontWeight' (PR #711).

## [1.203.0] - 2019-07-31
### Fix
- ExpandableCalendar - fix for vertical open height.

## [1.204.0] - 2019-08-6
### Fix
- CalendarProvider - adding 'buttonTopPosition' prop to control the button's y position.

## [1.205.0] - 2019-08-15
### Fix
- Week - fix for style - removing width to allow flex.

## [1.206.0] - 2019-08-15
### Fix
- CalendarProvider - fix header in vertical mode when initial position is 'open'.

## [1.207.0] - 2019-08-15
### Added
- CalendarProvider - 'todayButtonStyle' prop to allow passing style to the today button.

## [1.208.0] - 2019-08-15
### Added
- CalendarProvider - today button size for tablet. 
    Passing style prop to a container View.
- ExpandableCalendar - adjusting vertical mode open height for tablet in both orientations.

## [1.209.0] - 2019-08-20
### Fix
- CalendarProvider - fix for children wrapper view.

## [1.213.0] - 2019-11-13
### Changed
- Upgrading react-native to version 61.4.0.

## [1.214.0] - 2019-12-12
### Fix
- Agenda - fix typo on 'scrollEnable' prop.
- ExpandableCalendar - fix passed props to CalendarList.

## [1.215.0] - 2019-12-23
### Added
- ExpandableCalendar - adding week scroll to closed position.

## [1.216.0] - 2019-12-24
### Fix
- Week - moving width style to style file.

## [1.217.0] - 2019-12-24
### Fix
- Week - moving width style to WeekCalendar.

## [1.218.0] - 2020-1-12
### Added
- AgendaList - allow text transform override for section header text.

## [1.221.0] - 2020-1-16
### Bug Fix 
- ExpandableCalendar - fix 'renderArrow' (PR #1037).

## [1.223.0] - 2020-1-16
### Added
- WeekCalendar - new component.

## [1.224.0] - 2020-1-16
### Added
- AgendaList - allow passing 'keyExtractor'.

## [1.225.0] - 2020-1-19
### Bug Fix
- package.json - adding 'hoist-non-react-statics' dependency (fix issue #900).

## [1.226.0] - 2020-1-19
### Added
- Life cycle methods - renaming with UNSAFE_ prefix 'componentWillMount()' and 'componentWillReceiveProps()'.

## [1.227.0] - 2020-1-19
### Added
- AgendaList - allow passing 'stickySectionHeadersEnabled' (PR #1004).

## [1.228.0] - 2020-1-19
### Bug Fix
- Day custom - fix for 'selectedDayTextColor' not working (PR #995).

## [1.229.0] - 2020-1-19
### Added
- Calendar - adding ref to CalendarHeader (PR #986).

## [1.230.0] - 2020-1-19
### Fix
- Agenda - fix for calendar offset (PR #953).

## [1.231.0] - 2020-1-19
### Change
- Agenda - use 'initialScrollPadPosition()' (PR #948).

## [1.232.0] - 2020-1-19
### Bug Fix
- Day components - fix for 'disableTouchEvent' marking to disable interactions for all marking types.

## [1.233.0] = 2020-1-19
### Added
- Calendar - update when 'displayLoadingIndicator' changes (PR #939).

## [1.234.0] - 2020-1-19
### Fix
- Calendar and README - typo (PR #).

## [1.235.0] - 2020-1-19
### Fix
- README - typo (Pr #912).

## [1.236.0] - 2020-1-20
### Changed
- Agenda - 'scrollEventThrottle' from 1 to 8 (Pr #908).

## [1.237.0] - 2020-1-20
### Added
- CalendarHeader - re-render when 'renderArrow' changes (PR #907).

## [1.238.0] - 2020-1-20
### Added
- CalendarList - pass 'onEndReached' and 'onEndReachedThreshold' to FlatList (PR #893).

## [1.239.0] - 2020-1-20
### Added
- CalendarList - pass 'keyExtractor' (PR #883).

## [1.240.0] - 2020-1-20
### Added
- Day - adding 'onLongPress' support to type multi-period.

## [1.241.0] - 2020-1-20
### Fix
- README - add 'disabledByDefault' prop (Pr #774).

## [1.242.0] - 2020-1-20
### Added
- Agenda - invoking 'onVisibleMonthsChange()' directly (PR #746).

## [1.243.0] - 2020-1-20
### Added
- Calendar - adding 'disableArrowLeft' and 'disableArrowRight' (PR #530).

## [1.244.0] - 2020-1-20
### Added
- Agenda - allow showing extra days (by passing hideExtraDays={false}).

### Changed
- Calendars screen - remove redundant prop.

## [1.245.0] - 2020-1-21
### Changed
- README - editing.

## [1.246.0] - 2020-1-21
### Changed
- Example - refresh demo app style.

## [1.247.0] - 2020-1-22
### Added
- iOS - app icon.

## [1.248.0] - 2020-1-22
### Changed
- iOS - demo app name.

## [1.249.0] - 2020-1-22
### Added
- CalendarList - passing 'keyboardShouldPersistTaps' to FlatList.

## [1.250.0] - 2020-1-22
### Added
- Agenda - passing 'testId' to knob.

## [1.251.0] - 2020-1-22
### Bug Fix
- CalendarList - 'keyboardShouldPersistTaps' PropTypes.

## [1.252.0] - 2020-1-22
### Changed
- Agenda - Animated.ScrollView invoke 'scrollTo' using ref.getNode() for RN62 compatibility (PR #1040).

## [1.253.0] - 2020-1-23
### Added
- CalendarHeader - 'aria-level' for web accessability support (PR #792).

## [1.254.0] - 2020-1-23
### Added
- ExpandableCalendar - default value to height style to avoid NaN value (PR #1044).

## [1.255.0] - 2020-1-23
### Added
- .eslintrc - new roles.
- src files - fix lint errors.

## [1.256.0] - 2020-1-23
### Fix
- README - fix examples.

## [1.257.0] - 2020-1-23
### Bug fix
- Reservation - secure calls to prop functions to avoid crashes.

## [1.258.0] - 2020-1-25
- file cosmetics.

## [1.259.0] - 2020-1-25
- Android - app icon and demo app name.

## [1.260.0] - 2020-2-3
- Fix app icon.

## [1.261.0] - 2020-2-5
- Calendar - adding accessibility features.

## [1.262.0] - 2020-2-18
- Agenda - adding scroll events callbacks (PR #1063).

## [1.263.0] - 2020-2-18
- Calendar - passing testID to header (PR #1058).

## [1.264.0] - 2020-3-3
- CalendarListItem - fix previous months bug (PR #1069).

## [1.265.0] - 2020-3-12
- Setup Detox for e2e tests (iOS).

## [1.282.0] - 2020-6-04
- New Feature - Enable swipe in calendar

## [1.291.0] - 2020-6-10
- New Feature - Render custom header in calendar
- Update Calendar List's example with the new feature

## [1.292.0] - 2020-6-10
- New Feature - Show should six weeks in the calendar by passing showSixWeeks

## [1.297.0] - 2020-6-17
- Bug Fix - Calendar isn't getting re-rendered if the first day prop is changed.

## [1.298.0] - 2020-6-17
- New Feature - Control the swipe on Calendar with new prop - enableSwipeMonths

## [1.293.0] - 2020-7-6
- Added new prop for custom hitSlop for calendar header
