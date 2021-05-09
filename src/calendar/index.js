import _ from 'lodash';
import PropTypes from 'prop-types';
import XDate from 'xdate';
import React, {Component} from 'react';
import {View} from 'react-native';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import dateutils from '../dateutils';
import {xdateToData, parseDate} from '../interface';
import shouldComponentUpdate from './updater';
import {extractComponentProps} from '../component-updater';
import {WEEK_NUMBER} from '../testIDs';
import styleConstructor from './style';
import CalendarHeader from './header';
import BasicDay from './day/basic';
import Day from './day/index';

const EmptyArray = [];

/**
 * @description: Calendar component
 * @example: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/calendars.js
 * @gif: https://github.com/wix/react-native-calendars/blob/master/demo/calendar.gif
 */
class Calendar extends Component {
  static displayName = 'Calendar';

  static propTypes = {
    ...CalendarHeader.propTypes,
    ...Day.propTypes,
    /** Specify theme properties to override specific styles for calendar parts. Default = {} */
    theme: PropTypes.object,
    /** Specify style for calendar container element. Default = {} */
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
    /** Initially visible month. Default = Date() */
    current: PropTypes.any,
    /** Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined */
    minDate: PropTypes.any,
    /** Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined */
    maxDate: PropTypes.any,
    /** If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday. */
    firstDay: PropTypes.number,
    /** Collection of dates that have to be marked. Default = {} */
    markedDates: PropTypes.object,
    /** Display loading indicator. Default = false */
    displayLoadingIndicator: PropTypes.bool,
    /** Show week numbers. Default = false */
    showWeekNumbers: PropTypes.bool,
    /** Do not show days of other months in month page. Default = false */
    hideExtraDays: PropTypes.bool,
    /** Always show six weeks on each month (only when hideExtraDays = false). Default = false */
    showSixWeeks: PropTypes.bool,
    /** Handler which gets executed on day press. Default = undefined */
    onDayPress: PropTypes.func,
    /** Handler which gets executed on day long press. Default = undefined */
    onDayLongPress: PropTypes.func,
    /** Handler which gets executed when month changes in calendar. Default = undefined */
    onMonthChange: PropTypes.func,
    /** Handler which gets executed when visible month changes in calendar. Default = undefined */
    onVisibleMonthsChange: PropTypes.func,
    /** Disables changing month when click on days of other months (when hideExtraDays is false). Default = false */
    disableMonthChange: PropTypes.bool,
    /** Enable the option to swipe between months. Default: false */
    enableSwipeMonths: PropTypes.bool,
    /** Disable days by default. Default = false */
    disabledByDefault: PropTypes.bool,
    /** Style passed to the header */
    headerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    /** Provide aria-level for calendar heading for proper accessibility when used with web (react-native-web) */
    webAriaLevel: PropTypes.number,
    /** Apply custom disable color to selected day indexes */
    disabledDaysIndexes: PropTypes.arrayOf(PropTypes.number),
    /** Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates*/
    disableAllTouchEventsForDisabledDays: PropTypes.bool,
    /** Replace default month and year title with custom one. the function receive a date as parameter. */
    renderHeader: PropTypes.any,
    /** Allow user give a custom view which is under the day view(button). the function receive a date as parameter, Default = undefined */
    renderUnderDayView: PropTypes.func,
    /** Allow rendering of a totally custom header */
    customHeader: PropTypes.any
  };

  static defaultProps = {
    enableSwipeMonths: false
  };

  constructor(props) {
    super(props);

    this.style = styleConstructor(props.theme);

    this.state = {
      currentMonth: props.current ? parseDate(props.current) : XDate()
    };

    this.shouldComponentUpdate = shouldComponentUpdate;
  }
  
  addMonth = count => {
    this.updateMonth(this.state.currentMonth.clone().addMonths(count, true));
  };

  updateMonth = (day, doNotTriggerListeners) => {
    if (day.toString('yyyy MM') === this.state.currentMonth.toString('yyyy MM')) {
      return;
    }

    this.setState({currentMonth: day.clone()}, () => {
        if (!doNotTriggerListeners) {
          const currMont = this.state.currentMonth.clone();
          _.invoke(this.props, 'onMonthChange', xdateToData(currMont));
          _.invoke(this.props, 'onVisibleMonthsChange', [xdateToData(currMont)]);
        }
      }
    );
  };

  _handleDayInteraction(date, interaction) {
    const {disableMonthChange} = this.props;
    const day = parseDate(date);
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);

    if (!(minDate && !dateutils.isGTE(day, minDate)) && !(maxDate && !dateutils.isLTE(day, maxDate))) {
      const shouldUpdateMonth = disableMonthChange === undefined || !disableMonthChange;

      if (shouldUpdateMonth) {
        this.updateMonth(day);
      }
      if (interaction) {
        interaction(xdateToData(day));
      }
    }
  }

  pressDay = date => {
    this._handleDayInteraction(date, this.props.onDayPress);
  };

  longPressDay = date => {
    this._handleDayInteraction(date, this.props.onDayLongPress);
  };

  getDateMarking(day) {
    const {markedDates} = this.props;

    if (!markedDates) {
      return false;
    }

    const dates = markedDates[day.toString('yyyy-MM-dd')] || EmptyArray;

    if (dates.length || dates) {
      return dates;
    } else {
      return false;
    }
  }

  getState(day) {
    const {disabledByDefault} = this.props;
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);
    let state = '';

    if (disabledByDefault) {
      state = 'disabled';
    } else if (dateutils.isDateNotInTheRange(minDate, maxDate, day)) {
      state = 'disabled';
    } else if (!dateutils.sameMonth(day, this.state.currentMonth)) {
      state = 'disabled';
    } else if (dateutils.sameDate(day, XDate())) {
      state = 'today';
    }
    if (!dateutils.sameMonth(day, this.state.currentMonth) && this.props.hideExtraDays) {
      return (<View key={id} style={{flex: 1}}/>);
    }

    const DayComp = this.getDayComponent();
    const date = day.getDate();
    const dateAsObject = xdateToData(day);
    const accessibilityLabel = this.getAccessibilityLabel(state, day);

    return (
      <View style={{flex: 1, alignItems: 'center'}} key={id}>
        <DayComp
          testID={`${SELECT_DATE_SLOT}-${dateAsObject.dateString}`}
          state={state}
          theme={this.props.theme}
          onPress={this.pressDay}
          onLongPress={this.longPressDay}
          date={dateAsObject}
          marking={this.getDateMarking(day)}
          accessibilityLabel={accessibilityLabel}
          disableAllTouchEventsForDisabledDays={this.props.disableAllTouchEventsForDisabledDays}
          renderUnderDayView={this.props.renderUnderDayView}
        >
          {date}
        </DayComp>
      </View>
    );
  }

  getMarkingLabel(day) {
    let label = '';
    const marking = this.getDateMarking(day);

    if (marking.accessibilityLabel) {
      return marking.accessibilityLabel;
    }

    if (marking.selected) {
      label += 'selected ';
      if (!marking.marked) {
        label += 'You have no entries for this day ';
      }
    }
    if (marking.marked) {
      label += 'You have entries for this day ';
    }
    if (marking.startingDay) {
      label += 'period start ';
    }
    if (marking.endingDay) {
      label += 'period end ';
    }
    if (marking.disabled || marking.disableTouchEvent) {
      label += 'disabled ';
    }
    return label
  }

  onSwipe = gestureName => {
    const {SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT} = swipeDirections;

    switch (gestureName) {
      case SWIPE_UP:
      case SWIPE_DOWN:
        break;
      case SWIPE_LEFT:
        this.onSwipeLeft();
        break;
      case SWIPE_RIGHT:
        this.onSwipeRight();
        break;
    }
  };

  onSwipeLeft = () => {
    this.header.onPressRight();
  };

  onSwipeRight = () => {
    this.header.onPressLeft();
  };

  renderWeekNumber(weekNumber) {
    return (
      <View style={this.style.dayContainer} key={`week-container-${weekNumber}`}>
        <BasicDay
          key={`week-${weekNumber}`}
          marking={{disableTouchEvent: true}}
          state="disabled"
          theme={this.props.theme}
          testID={`${WEEK_NUMBER}-${weekNumber}`}
        >
          {weekNumber}
        </BasicDay>
      </View>
    );
  }

  renderDay(day, id) {
    const {hideExtraDays} = this.props;
    const dayProps = extractComponentProps(Day, this.props);

    if (!dateutils.sameMonth(day, this.state.currentMonth) && hideExtraDays) {
      return <View key={id} style={this.style.emptyDayContainer} />;
    }

    return (
      <View style={this.style.dayContainer} key={id}>
        <Day
          {...dayProps}
          day={day}
          state={this.getState(day)}
          marking={this.getDateMarking(day)}
          onPress={this.pressDay}
          onLongPress={this.longPressDay}
        />
      </View>
    );
  }

  renderWeek(days, id) {
    const week = [];

    days.forEach((day, id2) => {
      week.push(this.renderDay(day, id2));
    }, this);

    if (this.props.showWeekNumbers) {
      week.unshift(this.renderWeekNumber(days[days.length - 1].getWeek()));
    }

    return (
      <View style={this.style.week} key={id}>
        {week}
      </View>
    );
  }

  renderMonth() {
    const {currentMonth} = this.state;
    const {firstDay, showSixWeeks, hideExtraDays} = this.props;
    const shouldShowSixWeeks = showSixWeeks && !hideExtraDays;
    const days = dateutils.page(currentMonth, firstDay, shouldShowSixWeeks);
    const weeks = [];

    while (days.length) {
      weeks.push(this.renderWeek(days.splice(0, 7), weeks.length));
    }

    return <View style={this.style.monthView}>{weeks}</View>;
  }

  renderHeader() {
    const {customHeader, headerStyle, displayLoadingIndicator, markedDates, testID} = this.props;
    const current = parseDate(this.props.current);
    let indicator;

    if (current) {
      const lastMonthOfDay = current.clone().addMonths(1, true).setDate(1).addDays(-1).toString('yyyy-MM-dd');
      if (displayLoadingIndicator && !(markedDates && markedDates[lastMonthOfDay])) {
        indicator = true;
      }
    }

    const headerProps = extractComponentProps(CalendarHeader, this.props);

    const props = {
      ...headerProps,
      testID: testID,
      style: headerStyle,
      ref: c => (this.header = c),
      month: this.state.currentMonth,
      addMonth: this.addMonth,
      displayLoadingIndicator: indicator
    };

    const CustomHeader = customHeader;
    const HeaderComponent = customHeader ? CustomHeader : CalendarHeader;

    return <HeaderComponent {...props} />;
  }

  render() {
    const {enableSwipeMonths, style} = this.props;
    const GestureComponent = enableSwipeMonths ? GestureRecognizer : View;
    const gestureProps = enableSwipeMonths ? {onSwipe: (direction, state) => this.onSwipe(direction, state)} : {};

    return (
      <GestureComponent {...gestureProps}>
        <View
          style={[this.style.container, style]}
          accessibilityElementsHidden={this.props.accessibilityElementsHidden} // iOS
          importantForAccessibility={this.props.importantForAccessibility} // Android
        >
          {this.renderHeader()}
          {this.renderMonth()}
        </View>
      </GestureComponent>
    );
  }
}

export default Calendar;
