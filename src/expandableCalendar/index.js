import _ from 'lodash';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import XDate from 'xdate';

import React, {Component} from 'react';
import {AccessibilityInfo, PanResponder, Animated, View, Text, Image} from 'react-native';

import {CALENDAR_KNOB} from '../testIDs';
import {page, weekDayNames} from '../dateutils';
import {parseDate, toMarkingFormat} from '../interface';
import styleConstructor, {HEADER_HEIGHT} from './style';
import CalendarList from '../calendar-list';
import Calendar from '../calendar';
import asCalendarConsumer from './asCalendarConsumer';
import WeekCalendar from './WeekCalendar';
import Week from './week';

const commons = require('./commons');
const UPDATE_SOURCES = commons.UPDATE_SOURCES;
const POSITIONS = {
  CLOSED: 'closed',
  OPEN: 'open'
};
const SPEED = 20;
const BOUNCINESS = 6;
const CLOSED_HEIGHT = 120; // header + 1 week
const WEEK_HEIGHT = 46;
const KNOB_CONTAINER_HEIGHT = 20;
const DAY_NAMES_PADDING = 24;
const PAN_GESTURE_THRESHOLD = 30;

/**
 * @description: Expandable calendar component
 * @note: Should be wrapped with 'CalendarProvider'
 * @extends: CalendarList
 * @extendslink: docs/CalendarList
 * @example: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/expandableCalendar.js
 */
class ExpandableCalendar extends Component {
  static displayName = 'ExpandableCalendar';

  static propTypes = {
    ...CalendarList.propTypes,
    /** the initial position of the calendar ('open' or 'closed') */
    initialPosition: PropTypes.oneOf(_.values(POSITIONS)),
    /** callback that fires when the calendar is opened or closed */
    onCalendarToggled: PropTypes.func,
    /** an option to disable the pan gesture and disable the opening and closing of the calendar (initialPosition will persist)*/
    disablePan: PropTypes.bool,
    /** whether to hide the knob  */
    hideKnob: PropTypes.bool,
    /** source for the left arrow image */
    leftArrowImageSource: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.func]),
    /** source for the right arrow image */
    rightArrowImageSource: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.func]),
    /** whether to have shadow/elevation for the calendar */
    allowShadow: PropTypes.bool,
    /** whether to disable the week scroll in closed position */
    disableWeekScroll: PropTypes.bool,
    /** a threshold for opening the calendar with the pan gesture */
    openThreshold: PropTypes.number,
    /** a threshold for closing the calendar with the pan gesture */
    closeThreshold: PropTypes.number
  };

  static defaultProps = {
    horizontal: true,
    initialPosition: POSITIONS.CLOSED,
    firstDay: 0,
    leftArrowImageSource: require('../calendar/img/previous.png'),
    rightArrowImageSource: require('../calendar/img/next.png'),
    allowShadow: true,
    openThreshold: PAN_GESTURE_THRESHOLD,
    closeThreshold: PAN_GESTURE_THRESHOLD
  };

  static positions = POSITIONS;

  constructor(props) {
    super(props);

    this.style = styleConstructor(props.theme);
    this.closedHeight = CLOSED_HEIGHT + (props.hideKnob ? 0 : KNOB_CONTAINER_HEIGHT);
    this.numberOfWeeks = this.getNumberOfWeeksInMonth(XDate(this.props.context.date));
    this.openHeight = this.getOpenHeight();

    const startHeight = props.initialPosition === POSITIONS.CLOSED ? this.closedHeight : this.openHeight;
    this._height = startHeight;
    this._wrapperStyles = {style: {height: startHeight}};
    this._headerStyles = {style: {top: props.initialPosition === POSITIONS.CLOSED ? 0 : -HEADER_HEIGHT}};
    this._weekCalendarStyles = {style: {}};

    this.wrapper = undefined;
    this.calendar = undefined;
    this.visibleMonth = this.getMonth(this.props.context.date);
    this.initialDate = props.context.date; // should be set only once!!!
    this.headerStyleOverride = {
      'stylesheet.calendar.header': {
        week: {
          marginTop: 7,
          marginBottom: -4, // reduce space between dayNames and first line of dates
          flexDirection: 'row',
          justifyContent: 'space-around'
        }
      }
    };

    this.state = {
      deltaY: new Animated.Value(startHeight),
      headerDeltaY: new Animated.Value(props.initialPosition === POSITIONS.CLOSED ? 0 : -HEADER_HEIGHT),
      position: props.initialPosition,
      screenReaderEnabled: false
    };

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder,
      onPanResponderGrant: this.handlePanResponderGrant,
      onPanResponderMove: this.handlePanResponderMove,
      onPanResponderRelease: this.handlePanResponderEnd,
      onPanResponderTerminate: this.handlePanResponderEnd
    });
  }

  componentDidMount() {
    if (AccessibilityInfo) {
      if (AccessibilityInfo.isScreenReaderEnabled) {
        AccessibilityInfo.isScreenReaderEnabled().then(this.handleScreenReaderStatus);
      } else if (AccessibilityInfo.fetch) {
        // Support for older RN versions
        AccessibilityInfo.fetch().then(this.handleScreenReaderStatus);
      }
    }
  }

  componentDidUpdate(prevProps) {
    const {date} = this.props.context;
    if (date !== prevProps.context.date) {
      // date was changed from AgendaList, arrows or scroll
      this.scrollToDate(date);
    }
  }

  handleScreenReaderStatus = screenReaderEnabled => {
    this.setState({screenReaderEnabled});
  };

  updateNativeStyles() {
    this.wrapper?.setNativeProps(this._wrapperStyles);
    if (!this.props.horizontal) {
      this.header && this.header.setNativeProps(this._headerStyles);
    } else {
      this.weekCalendar && this.weekCalendar.setNativeProps(this._weekCalendarStyles);
    }
  }

  /** Scroll */

  scrollToDate(date) {
    if (this.calendar) {
      if (!this.props.horizontal) {
        this.calendar.scrollToDay(XDate(date), 0, true);
      } else if (this.getMonth(date) !== this.visibleMonth) {
        // don't scroll if the month is already visible
        this.calendar.scrollToMonth(XDate(date));
      }
    }
  }

  scrollPage(next) {
    if (this.props.horizontal) {
      const d = parseDate(this.props.context.date);

      if (this.state.position === POSITIONS.OPEN) {
        d.setDate(1);
        d.addMonths(next ? 1 : -1);
      } else {
        const {firstDay} = this.props;
        let dayOfTheWeek = d.getDay();
        if (dayOfTheWeek < firstDay && firstDay > 0) {
          dayOfTheWeek = 7 + dayOfTheWeek;
        }
        const firstDayOfWeek = (next ? 7 : -7) - dayOfTheWeek + firstDay;
        d.addDays(firstDayOfWeek);
      }
      _.invoke(this.props.context, 'setDate', toMarkingFormat(d), UPDATE_SOURCES.PAGE_SCROLL);
    }
  }

  /** Utils */
  getOpenHeight() {
    if (!this.props.horizontal) {
      return Math.max(commons.screenHeight, commons.screenWidth);
    }
    return CLOSED_HEIGHT + WEEK_HEIGHT * (this.numberOfWeeks - 1) + (this.props.hideKnob ? 12 : KNOB_CONTAINER_HEIGHT);
  }

  getYear(date) {
    const d = XDate(date);
    return d.getFullYear();
  }

  getMonth(date) {
    const d = XDate(date);
    // getMonth() returns the month of the year (0-11). Value is zero-index, meaning Jan=0, Feb=1, Mar=2, etc.
    return d.getMonth() + 1;
  }

  getNumberOfWeeksInMonth(month) {
    const days = page(month, this.props.firstDay);
    return days.length / 7;
  }

  shouldHideArrows() {
    if (!this.props.horizontal) {
      return true;
    }
    return this.props.hideArrows || false;
  }

  isLaterDate(date1, date2) {
    if (date1.year > this.getYear(date2)) {
      return true;
    }
    if (date1.year === this.getYear(date2)) {
      if (date1.month > this.getMonth(date2)) {
        return true;
      }
    }
    return false;
  }

  /** Pan Gesture */

  handleMoveShouldSetPanResponder = (e, gestureState) => {
    if (this.props.disablePan) {
      return false;
    }
    if (!this.props.horizontal && this.state.position === POSITIONS.OPEN) {
      // disable pan detection when vertical calendar is open to allow calendar scroll
      return false;
    }
    if (this.state.position === POSITIONS.CLOSED && gestureState.dy < 0) {
      // disable pan detection to limit to closed height
      return false;
    }
    return gestureState.dy > 5 || gestureState.dy < -5;
  };
  handlePanResponderGrant = () => {};
  handlePanResponderMove = (e, gestureState) => {
    // limit min height to closed height
    this._wrapperStyles.style.height = Math.max(this.closedHeight, this._height + gestureState.dy);

    if (!this.props.horizontal) {
      // vertical CalenderList header
      this._headerStyles.style.top = Math.min(Math.max(-gestureState.dy, -HEADER_HEIGHT), 0);
    } else {
      // horizontal Week view
      if (this.state.position === POSITIONS.CLOSED) {
        this._weekCalendarStyles.style.opacity = Math.min(1, Math.max(1 - gestureState.dy / 100, 0));
      }
    }

    this.updateNativeStyles();
  };
  handlePanResponderEnd = () => {
    this._height = this._wrapperStyles.style.height;
    this.bounceToPosition();
  };

  /** Animated */

  bounceToPosition(toValue) {
    if (!this.props.disablePan) {
      const {deltaY, position} = this.state;
      const {openThreshold, closeThreshold} = this.props;
      const threshold =
        position === POSITIONS.OPEN ? this.openHeight - closeThreshold : this.closedHeight + openThreshold;

      let isOpen = this._height >= threshold;
      const newValue = isOpen ? this.openHeight : this.closedHeight;

      deltaY.setValue(this._height); // set the start position for the animated value
      this._height = toValue || newValue;
      isOpen = this._height >= threshold; // re-check after this._height was set

      Animated.spring(deltaY, {
        toValue: this._height,
        speed: SPEED,
        bounciness: BOUNCINESS,
        useNativeDriver: false
      }).start(this.onAnimatedFinished);

      _.invoke(this.props, 'onCalendarToggled', isOpen);

      this.setPosition();
      this.closeHeader(isOpen);
      this.resetWeekCalendarOpacity(isOpen);
    }
  }

  onAnimatedFinished = ({finished}) => {
    if (finished) {
      // this.setPosition();
    }
  };

  setPosition() {
    const isClosed = this._height === this.closedHeight;
    this.setState({position: isClosed ? POSITIONS.CLOSED : POSITIONS.OPEN});
  }

  resetWeekCalendarOpacity(isOpen) {
    this._weekCalendarStyles.style.opacity = isOpen ? 0 : 1;
    this.updateNativeStyles();
  }

  closeHeader(isOpen) {
    const {headerDeltaY} = this.state;

    headerDeltaY.setValue(this._headerStyles.style.top); // set the start position for the animated value

    if (!this.props.horizontal && !isOpen) {
      Animated.spring(headerDeltaY, {
        toValue: 0,
        speed: SPEED / 10,
        bounciness: 1,
        useNativeDriver: false
      }).start();
    }
  }

  /** Events */

  onPressArrowLeft = () => {
    _.invoke(this.props, 'onPressArrowLeft');
    this.scrollPage(false);
  };

  onPressArrowRight = () => {
    _.invoke(this.props, 'onPressArrowRight');
    this.scrollPage(true);
  };

  onDayPress = value => {
    // {year: 2019, month: 4, day: 22, timestamp: 1555977600000, dateString: "2019-04-23"}
    _.invoke(this.props.context, 'setDate', value.dateString, UPDATE_SOURCES.DAY_PRESS);

    setTimeout(() => {
      // to allows setDate to be completed
      if (this.state.position === POSITIONS.OPEN) {
        this.bounceToPosition(this.closedHeight);
      }
    }, 0);
  };

  onVisibleMonthsChange = value => {
    if (this.visibleMonth !== _.first(value).month) {
      this.visibleMonth = _.first(value).month; // equivalent to this.getMonth(value[0].dateString)

      // for horizontal scroll
      const {date, updateSource} = this.props.context;

      if (this.visibleMonth !== this.getMonth(date) && updateSource !== UPDATE_SOURCES.DAY_PRESS) {
        const next = this.isLaterDate(_.first(value), date);
        this.scrollPage(next);
      }

      // updating openHeight
      setTimeout(() => {
        // to wait for setDate() call in horizontal scroll (this.scrollPage())
        const numberOfWeeks = this.getNumberOfWeeksInMonth(parseDate(this.props.context.date));
        if (numberOfWeeks !== this.numberOfWeeks) {
          this.numberOfWeeks = numberOfWeeks;
          this.openHeight = this.getOpenHeight();
          if (this.state.position === POSITIONS.OPEN) {
            this.bounceToPosition(this.openHeight);
          }
        }
      }, 0);
    }
  };

  /** Renders */
  getWeekDaysStyle = memoize(calendarStyle => {
    return [
      this.style.weekDayNames,
      {
        paddingLeft: calendarStyle?.paddingLeft + 6 || DAY_NAMES_PADDING,
        paddingRight: calendarStyle?.paddingRight + 6 || DAY_NAMES_PADDING
      }
    ];
  });

  renderWeekDaysNames = memoize((weekDaysNames, calendarStyle) => {
    return (
      <View style={this.getWeekDaysStyle(calendarStyle)}>
        {weekDaysNames.map((day, index) => (
          <Text allowFontScaling={false} key={day + index} style={this.style.weekday} numberOfLines={1}>
            {day}
          </Text>
        ))}
      </View>
    );
  });

  renderHeader() {
    const monthYear = XDate(this.props.context.date).toString('MMMM yyyy');
    const weekDaysNames = weekDayNames(this.props.firstDay);

    return (
      <Animated.View
        ref={e => (this.header = e)}
        style={[this.style.header, {height: HEADER_HEIGHT, top: this.state.headerDeltaY}]}
        pointerEvents={'none'}
      >
        <Text allowFontScaling={false} style={this.style.headerTitle}>
          {monthYear}
        </Text>
        {this.renderWeekDaysNames(weekDaysNames, this.props.calendarStyle)}
      </Animated.View>
    );
  }

  renderWeekCalendar() {
    const {position} = this.state;
    const {disableWeekScroll} = this.props;
    const WeekComponent = disableWeekScroll ? Week : WeekCalendar;

    return (
      <Animated.View
        ref={e => (this.weekCalendar = e)}
        style={[this.style.weekContainer, position === POSITIONS.OPEN ? this.style.hidden : this.style.visible]}
        pointerEvents={position === POSITIONS.CLOSED ? 'auto' : 'none'}
      >
        <WeekComponent
          {...this.props}
          current={this.props.context.date}
          onDayPress={this.onDayPress}
          style={this.props.calendarStyle}
          allowShadow={false}
          hideDayNames={true}
          accessibilityElementsHidden // iOS
          importantForAccessibility={'no-hide-descendants'} // Android
        />
      </Animated.View>
    );
  }

  renderKnob() {
    // TODO: turn to TouchableOpacity with onPress that closes it
    return (
      <View style={this.style.knobContainer} pointerEvents={'none'} testID={`${this.props.testID}-knob`}>
        <View style={this.style.knob} testID={CALENDAR_KNOB} />
      </View>
    );
  }

  renderArrow = direction => {
    if (_.isFunction(this.props.renderArrow)) {
      return this.props.renderArrow(direction);
    }

    return (
      <Image
        source={direction === 'right' ? this.props.rightArrowImageSource : this.props.leftArrowImageSource}
        style={this.style.arrowImage}
        testID={`${this.props.testID}-${direction}-arrow`}
      />
    );
  };

  render() {
    const {style, hideKnob, horizontal, allowShadow, theme, ...others} = this.props;
    const {deltaY, position, screenReaderEnabled} = this.state;
    const isOpen = position === POSITIONS.OPEN;
    const themeObject = Object.assign(this.headerStyleOverride, theme);

    return (
      <View testID={this.props.testID} style={[allowShadow && this.style.containerShadow, style]}>
        {screenReaderEnabled ? (
          <Calendar
            testID="calendar"
            {...others}
            theme={themeObject}
            onDayPress={this.onDayPress}
            hideExtraDays
            renderArrow={this.renderArrow}
          />
        ) : (
          <Animated.View ref={e => (this.wrapper = e)} style={{height: deltaY}} {...this.panResponder.panHandlers}>
            <CalendarList
              testID="calendar"
              horizontal={horizontal}
              {...others}
              theme={themeObject}
              ref={r => (this.calendar = r)}
              current={this.initialDate}
              onDayPress={this.onDayPress}
              onVisibleMonthsChange={this.onVisibleMonthsChange}
              pagingEnabled
              scrollEnabled={isOpen}
              hideArrows={this.shouldHideArrows()}
              onPressArrowLeft={this.onPressArrowLeft}
              onPressArrowRight={this.onPressArrowRight}
              hideExtraDays={!horizontal}
              renderArrow={this.renderArrow}
              staticHeader
            />
            {horizontal && this.renderWeekCalendar()}
            {!hideKnob && this.renderKnob()}
            {!horizontal && this.renderHeader()}
          </Animated.View>
        )}
      </View>
    );
  }
}

export default asCalendarConsumer(ExpandableCalendar);
