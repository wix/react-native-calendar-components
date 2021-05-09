import _ from 'lodash';
import PropTypes from 'prop-types';
import XDate from 'xdate';
import React, {Component} from 'react';
import {Text, View, Dimensions, Animated} from 'react-native';
import {extractComponentProps} from '../component-updater';
import {parseDate, xdateToData} from '../interface';
import dateutils from '../dateutils';
import {AGENDA_CALENDAR_KNOB} from '../testIDs';
import {VelocityTracker} from '../input';
import styleConstructor from './style';
import CalendarList from '../calendar-list';
import ReservationList from './reservation-list';

const HEADER_HEIGHT = 104;
const KNOB_HEIGHT = 24;

/**
 * @description: Agenda component
 * @extends: CalendarList
 * @extendslink: docs/CalendarList
 * @example: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/agenda.js
 * @gif: https://github.com/wix/react-native-calendars/blob/master/demo/agenda.gif
 */
export default class AgendaView extends Component {
  static displayName = 'Agenda';

  static propTypes = {
    ...CalendarList.propTypes,
    ...ReservationList.propTypes,
    /** agenda container style */
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
    /** the list of items that have to be displayed in agenda. If you want to render item as empty date
     the value of date key has to be an empty array []. If there exists no value for date key it is
     considered that the date in question is not yet loaded */
    items: PropTypes.object,
    /** callback that gets called when items for a certain month should be loaded (month became visible) */
    loadItemsForMonth: PropTypes.func,
    /** callback that fires when the calendar is opened or closed */
    onCalendarToggled: PropTypes.func,
    /** callback that gets called on day press */
    onDayPress: PropTypes.func,
    /** callback that gets called when day changes while scrolling agenda list */
    onDaychange: PropTypes.func, //TODO: Should be renamed 'onDayChange'
    /** specify how agenda knob should look like */
    renderKnob: PropTypes.func,
    /** initially selected day */
    selected: PropTypes.any, //TODO: Should be renamed 'selectedDay'
    /** Hide knob button. Default = false */
    hideKnob: PropTypes.bool,
    /** Size of knob button. Default = 80 */
    sizeKnobArea: PropTypes.number
  };

  constructor(props) {
    super(props);

    this.style = styleConstructor(props.theme);

    const windowSize = Dimensions.get('window');
    this.viewHeight = windowSize.height;
    this.viewWidth = windowSize.width;

    this.scrollTimeout = undefined;
    this.headerState = 'idle';

    this.state = {
      scrollY: new Animated.Value(0),
      calendarIsReady: false,
      calendarScrollable: false,
      firstReservationLoad: false,
      selectedDay: parseDate(props.selected) || XDate(true),
      topDay: parseDate(props.selected) || XDate(true)
    };

    this.currentMonth = this.state.selectedDay.clone();

    this.knobTracker = new VelocityTracker();
    this.state.scrollY.addListener(({value}) => this.knobTracker.add(value));
  }

  componentDidMount() {
    this._isMounted = true;
    this.loadReservations(this.props);
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.state.scrollY.removeAllListeners();
  }

  componentDidUpdate(prevProps) {
    if (this.props.selected && !dateutils.sameDate(parseDate(this.props.selected), parseDate(prevProps.selected))) {
      this.setState({selectedDay: parseDate(this.props.selected)});
    } else if (!prevProps.items) {
      this.loadReservations(this.props);
    }
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.items) {
      return {firstReservationLoad: false};
    }

    return null;
  }

  calendarOffset() {
    return 96 - this.viewHeight / 2;
  }

  initialScrollPadPosition = () => {
    return Math.max(0, this.viewHeight - HEADER_HEIGHT);
  };

  setScrollPadPosition = (y, animated) => {
    if (this.scrollPad.scrollTo) {
      this.scrollPad.scrollTo({x: 0, y, animated});
    } else {
      // Support for RN O.61 (Expo 37)
      this.scrollPad.getNode().scrollTo({x: 0, y, animated});
    }
  };

  enableCalendarScrolling() {
    this.setState({
      calendarScrollable: true
    });

    _.invoke(this.props, 'onCalendarToggled', true);

    // Enlarge calendarOffset here as a workaround on iOS to force repaint.
    // Otherwise the month after current one or before current one remains invisible.
    // The problem is caused by overflow: 'hidden' style, which we need for dragging
    // to be performant.
    // Another working solution for this bug would be to set removeClippedSubviews={false}
    // in CalendarList listView, but that might impact performance when scrolling
    // month list in expanded CalendarList.
    // Further info https://github.com/facebook/react-native/issues/1831
    this.calendar.scrollToDay(this.state.selectedDay, this.calendarOffset() + 1, true);
  }

  loadReservations(props) {
    if ((!props.items || !Object.keys(props.items).length) && !this.state.firstReservationLoad) {
      this.setState(
        {
          firstReservationLoad: true
        },
        () => {
          _.invoke(this.props, 'loadItemsForMonth', xdateToData(this.state.selectedDay));
        }
      );
    }
  }

  chooseDayFromCalendar = d => {
    this.chooseDay(d, !this.state.calendarScrollable);
  };

  chooseDay(d, optimisticScroll) {
    const day = parseDate(d);

    this.setState({
      calendarScrollable: false,
      selectedDay: day.clone()
    });

    _.invoke(this.props, 'onCalendarToggled', false);

    if (!optimisticScroll) {
      this.setState({
        topDay: day.clone()
      });
    }

    this.setScrollPadPosition(this.initialScrollPadPosition(), true);
    this.calendar.scrollToDay(day, this.calendarOffset(), true);

    _.invoke(this.props, 'loadItemsForMonth', xdateToData(day));
    _.invoke(this.props, 'onDayPress', xdateToData(day));
  }

  generateMarkings = () => {
    const {markedDates, items} = this.props;
    let markings = markedDates;

    if (!markings) {
      markings = {};
      Object.keys(items || {}).forEach(key => {
        if (items[key] && items[key].length) {
          markings[key] = {marked: true};
        }
      });
    }

    const key = this.state.selectedDay.toString('yyyy-MM-dd');
    return {...markings, [key]: {...(markings[key] || {}), ...{selected: true}}};
  };

  onScrollPadLayout = () => {
    // When user touches knob, the actual component that receives touch events is a ScrollView.
    // It needs to be scrolled to the bottom, so that when user moves finger downwards,
    // scroll position actually changes (it would stay at 0, when scrolled to the top).
    this.setScrollPadPosition(this.initialScrollPadPosition(), false);
    // delay rendering calendar in full height because otherwise it still flickers sometimes
    setTimeout(() => this.setState({calendarIsReady: true}), 0);
  };

  onCalendarListLayout = () => {
    this.calendar.scrollToDay(this.state.selectedDay.clone(), this.calendarOffset(), false);
  };

  onLayout = event => {
    this.viewHeight = event.nativeEvent.layout.height;
    this.viewWidth = event.nativeEvent.layout.width;
    this.forceUpdate();
  };

  onTouchStart = () => {
    this.headerState = 'touched';
    if (this.knob) {
      this.knob.setNativeProps({style: {opacity: 0.5}});
    }
  };

  onTouchEnd = () => {
    if (this.knob) {
      this.knob.setNativeProps({style: {opacity: 1}});
    }

    if (this.headerState === 'touched') {
      this.setScrollPadPosition(0, true);
      this.enableCalendarScrolling();
    }

    this.headerState = 'idle';
  };

  onStartDrag = () => {
    this.headerState = 'dragged';
    this.knobTracker.reset();
  };

  onSnapAfterDrag = e => {
    // on Android onTouchEnd is not called if dragging was started
    this.onTouchEnd();
    const currentY = e.nativeEvent.contentOffset.y;
    this.knobTracker.add(currentY);
    const projectedY = currentY + this.knobTracker.estimateSpeed() * 250; /*ms*/
    const maxY = this.initialScrollPadPosition();
    const snapY = projectedY > maxY / 2 ? maxY : 0;
    this.setScrollPadPosition(snapY, true);

    if (snapY === 0) {
      this.enableCalendarScrolling();
    }
  };

  onVisibleMonthsChange = months => {
    _.invoke(this.props, 'onVisibleMonthsChange', months);

    if (this.props.items && !this.state.firstReservationLoad) {
      clearTimeout(this.scrollTimeout);

      this.scrollTimeout = setTimeout(() => {
        if (this._isMounted) {
          _.invoke(this.props, 'loadItemsForMonth', months[0]);
        }
      }, 200);
    }
  };

  onDayChange = day => {
    const newDate = parseDate(day);
    const withAnimation = dateutils.sameMonth(newDate, this.state.selectedDay);

    this.calendar.scrollToDay(day, this.calendarOffset(), withAnimation);
    this.setState({
      selectedDay: newDate
    });

    _.invoke(this.props, 'onDayChange', xdateToData(newDate));
  };

  renderReservations() {
    const reservationListProps = extractComponentProps(ReservationList, this.props);

    return (
      <ReservationList
        {...reservationListProps}
        ref={c => (this.list = c)}
        reservations={this.props.items}
        selectedDay={this.state.selectedDay}
        topDay={this.state.topDay}
        onDayChange={this.onDayChange}
        onScroll={() => {}}
      />
    );
  }

  renderCalendarList() {
    const shouldHideExtraDays = this.state.calendarScrollable ? this.props.hideExtraDays : false;
    const calendarListProps = extractComponentProps(CalendarList, this.props);

    return (
      <CalendarList
        {...calendarListProps}
        ref={c => (this.calendar = c)}
        current={this.currentMonth}
        markedDates={this.generateMarkings()}
        calendarWidth={this.viewWidth}
        scrollEnabled={this.state.calendarScrollable}
        hideExtraDays={shouldHideExtraDays}
        onLayout={this.onCalendarListLayout}
        onDayPress={this.chooseDayFromCalendar}
        onVisibleMonthsChange={this.onVisibleMonthsChange}
      />
    );
  }

  renderKnob() {
    const {hideKnob, renderKnob} = this.props;
    let knob = <View style={this.style.knobContainer} />;

    if (!hideKnob) {
      const knobView = renderKnob ? renderKnob() : <View style={this.style.knob} />;
      knob = this.state.calendarScrollable ? null : (
        <View style={this.style.knobContainer}>
          <View ref={c => (this.knob = c)}>{knobView}</View>
        </View>
      );
    }
    return knob;
  }

  render() {
    const {firstDay, hideKnob, showWeekNumbers, style, testID, sizeKnobArea} = this.props;
    const agendaHeight = this.initialScrollPadPosition();
    const weekDaysNames = dateutils.weekDayNames(firstDay);
    const weekdaysStyle = [
      this.style.weekdays,
      {
        opacity: this.state.scrollY.interpolate({
          inputRange: [agendaHeight - HEADER_HEIGHT, agendaHeight],
          outputRange: [0, 1],
          extrapolate: 'clamp'
        }),
        transform: [
          {
            translateY: this.state.scrollY.interpolate({
              inputRange: [Math.max(0, agendaHeight - HEADER_HEIGHT), agendaHeight],
              outputRange: [-HEADER_HEIGHT, 0],
              extrapolate: 'clamp'
            })
          }
        ]
      }
    ];
    const headerTranslate = this.state.scrollY.interpolate({
      inputRange: [0, agendaHeight],
      outputRange: [agendaHeight, 0],
      extrapolate: 'clamp'
    });
    const contentTranslate = this.state.scrollY.interpolate({
      inputRange: [0, agendaHeight],
      outputRange: [0, agendaHeight / 2],
      extrapolate: 'clamp'
    });
    const headerStyle = [
      this.style.header,
      {
        bottom: agendaHeight,
        transform: [{translateY: headerTranslate}]
      }
    ];

    if (!this.state.calendarIsReady) {
      // limit header height until everything is setup for calendar dragging
      headerStyle.push({height: 0});
      // fill header with appStyle.calendarBackground background to reduce flickering
      weekdaysStyle.push({height: HEADER_HEIGHT});
    }

    const SIZE_KNOB_AREA = sizeKnobArea || 80;
    const shouldAllowDragging = !hideKnob && !this.state.calendarScrollable;
    const scrollPadPosition = (shouldAllowDragging ? HEADER_HEIGHT : 0) - KNOB_HEIGHT;
    const scrollPadStyle = {
      position: 'absolute',
      width: SIZE_KNOB_AREA,
      height: KNOB_HEIGHT,
      top: scrollPadPosition,
      left: (this.viewWidth - SIZE_KNOB_AREA) / 2
    };

    return (
      <View testID={testID} onLayout={this.onLayout} style={[style, this.style.container]}>
        <View style={this.style.reservations}>{this.renderReservations()}</View>
        <Animated.View style={headerStyle}>
          <Animated.View style={[this.style.animatedContainer, {transform: [{translateY: contentTranslate}]}]}>
            {this.renderCalendarList()}
          </Animated.View>
          {this.renderKnob()}
        </Animated.View>
        <Animated.View style={weekdaysStyle}>
          {showWeekNumbers && <Text allowFontScaling={false} style={this.style.weekday} numberOfLines={1}></Text>}
          {weekDaysNames.map((day, index) => (
            <Text allowFontScaling={false} key={day + index} style={this.style.weekday} numberOfLines={1}>
              {day}
            </Text>
          ))}
        </Animated.View>
        <Animated.ScrollView
          ref={ref => (this.scrollPad = ref)}
          style={scrollPadStyle}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={8}
          scrollsToTop={false}
          onTouchStart={this.onTouchStart}
          onTouchEnd={this.onTouchEnd}
          onScrollBeginDrag={this.onStartDrag}
          onScrollEndDrag={this.onSnapAfterDrag}
          onScroll={Animated.event([{nativeEvent: {contentOffset: {y: this.state.scrollY}}}], {useNativeDriver: true})}
        >
          <View
            testID={AGENDA_CALENDAR_KNOB}
            style={{height: agendaHeight + KNOB_HEIGHT}}
            onLayout={this.onScrollPadLayout}
          />
        </Animated.ScrollView>
      </View>
    );
  }
}
