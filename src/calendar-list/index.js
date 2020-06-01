import React, {Component} from 'react';
import {FlatList, Platform, Dimensions, ActivityIndicator, View} from 'react-native';
import PropTypes from 'prop-types';
import XDate from 'xdate';

import {xdateToData, parseDate} from '../interface';
import styleConstructor from './style';
import dateutils from '../dateutils';
import Calendar from '../calendar';
import CalendarListItem from './item';
import CalendarHeader from '../calendar/header/index';
import {STATIC_HEADER} from '../testIDs';


const {width} = Dimensions.get('window');

/**
 * @description: Calendar List component for both vertical and horizontal calendars
 * @extends: Calendar
 * @extendslink: docs/Calendar
 * @example: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/calendarsList.js
 * @gif: https://github.com/wix/react-native-calendars/blob/master/demo/calendar-list.gif
 */
class CalendarList extends Component {
  static displayName = 'CalendarList';

  static propTypes = {
    ...Calendar.propTypes,
    /** Max amount of months allowed to scroll to the past. Default = 50 */
    pastScrollRange: PropTypes.number,
    /** Max amount of months allowed to scroll to the future. Default = 50 */
    futureScrollRange: PropTypes.number,
    /** Enable or disable scrolling of calendar list */
    scrollEnabled: PropTypes.bool,
    /** Enable or disable vertical scroll indicator. Default = false */
    showScrollIndicator: PropTypes.bool,
    /** When true, the calendar list scrolls to top when the status bar is tapped. Default = true */
    scrollsToTop: PropTypes.bool,
    /** Enable or disable paging on scroll */
    pagingEnabled: PropTypes.bool,
    /** Whether the scroll is horizontal */
    horizontal: PropTypes.bool,
    /** Used when calendar scroll is horizontal, default is device width, pagination should be disabled */
    calendarWidth: PropTypes.number,
    /** Dynamic calendar height */
    calendarHeight: PropTypes.number,
    /** Should Keyboard persist taps */
    keyboardShouldPersistTaps: PropTypes.oneOf(['never', 'always', 'handled']),
    /** Style for the List item (the calendar) */
    calendarStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    /** Whether to use static header that will not scroll with the list (horizontal only) */
    staticHeader: PropTypes.bool,
    /** A custom key extractor for the generated calendar months */
    keyExtractor: PropTypes.func
  }

  static defaultProps = {
    horizontal: false,
    calendarWidth: width,
    calendarHeight: 360,
    pastScrollRange: 50,
    futureScrollRange: 50,
    showScrollIndicator: false,
    scrollEnabled: true,
    scrollsToTop: false,
    removeClippedSubviews: Platform.OS === 'android' ? false : true,
    keyExtractor: (item, index) => String(index)
  }

  constructor(props) {
    super(props);
    
    this.style = styleConstructor(props.theme);
    
    this.viewabilityConfig = {
      itemVisiblePercentThreshold: 20
    };

    const rows = [];
    const texts = [];
    const date = parseDate(props.current) || XDate();
    
    for (let i = 0; i <= this.props.pastScrollRange + this.props.futureScrollRange; i++) {
      const rangeDate = date.clone().addMonths(i - this.props.pastScrollRange, true);
      const rangeDateStr = rangeDate.toString('MMM yyyy');
      texts.push(rangeDateStr);
      /*
       * This selects range around current shown month [-0, +2] or [-1, +1] month for detail calendar rendering.
       * If `this.pastScrollRange` is `undefined` it's equal to `false` or 0 in next condition.
       */
      if (this.props.pastScrollRange - 1 <= i && i <= this.props.pastScrollRange + 1 || !this.props.pastScrollRange && i <= this.props.pastScrollRange + 2) {
        rows.push(rangeDate);
      } else {
        rows.push(rangeDateStr);
      }
    }

    this.state = {
      rows,
      texts,
      openDate: date,
      currentMonth: parseDate(props.current),
      addMarginTop: 0,
      addMarginBottom: 360
    };

    this.onViewableItemsChangedBound = this.onViewableItemsChanged.bind(this);
    this.renderCalendarBound = this.renderCalendar.bind(this);
    this.getItemLayout = this.getItemLayout.bind(this);
    this.onLayout = this.onLayout.bind(this);
  }

  onLayout(event) {
    if (this.props.onLayout) {
      this.props.onLayout(event);
    }
  }

  scrollToDay(d, offset, animated) {
    const day = parseDate(d);
    const diffMonths = Math.round(this.state.openDate.clone().setDate(1).diffMonths(day.clone().setDate(1)));
    const size = this.props.horizontal ? this.props.calendarWidth : this.props.calendarHeight;
    let scrollAmount = (size * this.props.pastScrollRange) + (diffMonths * size) + (offset || 0);
    
    if (!this.props.horizontal) {
      let week = 0;
      const days = dateutils.page(day, this.props.firstDay);
      for (let i = 0; i < days.length; i++) {
        week = Math.floor(i / 7);
        if (dateutils.sameDate(days[i], day)) {
          scrollAmount += 46 * week;
          break;
        }
      }
      if (scrollAmount < 0) {
        this.setState({addMarginTop: Math.abs(scrollAmount)});
      } else {
        this.setState({addMarginTop: 0});
        this.listView.scrollToOffset({offset: scrollAmount, animated});
      }
    } else {
      this.listView.scrollToOffset({offset: scrollAmount, animated});
    }
  }

  scrollToMonth(m) {
    const month = parseDate(m);
    const scrollTo = month || this.state.openDate;
    let diffMonths = Math.round(this.state.openDate.clone().setDate(1).diffMonths(scrollTo.clone().setDate(1)));
    const size = this.props.horizontal ? this.props.calendarWidth : this.props.calendarHeight;
    const scrollAmount = (size * this.props.pastScrollRange) + (diffMonths * size);

    this.listView.scrollToOffset({offset: scrollAmount, animated: false});
  }

  UNSAFE_componentWillReceiveProps(props) {
    const current = parseDate(this.props.current);
    const nextCurrent = parseDate(props.current);
    
    if (nextCurrent && current && nextCurrent.getTime() !== current.getTime()) {
      this.scrollToMonth(nextCurrent);
    }

    const rowclone = this.state.rows;
    const newrows = [];
    
    for (let i = 0; i < rowclone.length; i++) {
      let val = this.state.texts[i];
      if (rowclone[i].getTime) {
        val = rowclone[i].clone();
        val.propbump = rowclone[i].propbump ? rowclone[i].propbump + 1 : 1;
      }
      newrows.push(val);
    }
    this.setState({
      rows: newrows
    });
  }

  onViewableItemsChanged({viewableItems}) {
    function rowIsCloseToViewable(index, distance) {
      for (let i = 0; i < viewableItems.length; i++) {
        if (Math.abs(index - parseInt(viewableItems[i].index)) <= distance) {
          return true;
        }
      }
      return false;
    }

    const rowclone = this.state.rows;
    const newrows = [];
    const visibleMonths = [];
    
    for (let i = 0; i < rowclone.length; i++) {
      let val = rowclone[i];
      const rowShouldBeRendered = rowIsCloseToViewable(i, 1);
      
      if (rowShouldBeRendered && !rowclone[i].getTime) {
        val = this.state.openDate.clone().addMonths(i - this.props.pastScrollRange, true);
      } else if (!rowShouldBeRendered) {
        val = this.state.texts[i];
      }
      newrows.push(val);
      if (rowIsCloseToViewable(i, 0)) {
        visibleMonths.push(xdateToData(val));
      }
    }
    
    if (this.props.onVisibleMonthsChange) {
      this.props.onVisibleMonthsChange(visibleMonths);
    }

    this.setState({
      rows: newrows,
      currentMonth: parseDate(visibleMonths[0])
    });
  }

  renderCalendar({item, index}) {
    let totalScrollAbleMonths = this.props.pastScrollRange + this.props.futureScrollRange;

    return (
      <CalendarListItem
        testID={`${this.props.testID}_${item}`}
        scrollToMonth={this.scrollToMonth.bind(this)}
        item={item} 
        calendarHeight={this.props.calendarHeight} 
        calendarWidth={this.props.horizontal ? this.props.calendarWidth : undefined} 
        {...this.props} 
        style={this.props.calendarStyle, index === totalScrollAbleMonths ? {marginBottom: this.state.addMarginBottom} : null}
      />
    );
  }

  getItemLayout(data, index) {
    return {
      length: this.props.horizontal ? this.props.calendarWidth : this.props.calendarHeight, 
      offset: (this.props.horizontal ? this.props.calendarWidth : this.props.calendarHeight) * index, index
    };
  }

  getMonthIndex(month) {
    let diffMonths = this.state.openDate.diffMonths(month) + this.props.pastScrollRange;
    return diffMonths;
  }

  addMonth = (count) => {
    this.updateMonth(this.state.currentMonth.clone().addMonths(count, true));
  }

  updateMonth(day, doNotTriggerListeners) {
    if (day.toString('yyyy MM') === this.state.currentMonth.toString('yyyy MM')) {
      return;
    }

    this.setState({
      currentMonth: day.clone()
    }, () => {
      this.scrollToMonth(this.state.currentMonth);
      
      if (!doNotTriggerListeners) {
        const currMont = this.state.currentMonth.clone();
        if (this.props.onMonthChange) {
          this.props.onMonthChange(xdateToData(currMont));
        }
        if (this.props.onVisibleMonthsChange) {
          this.props.onVisibleMonthsChange([xdateToData(currMont)]);
        }
      }
    });
  }

  renderStaticHeader() {
    const {staticHeader, horizontal} = this.props;
    const useStaticHeader = staticHeader && horizontal;
    
    if (useStaticHeader) {
      let indicator;
      if (this.props.showIndicator) {
        indicator = <ActivityIndicator color={this.props.theme && this.props.theme.indicatorColor}/>;
      }

      return (
        <CalendarHeader
          style={[this.style.staticHeader, this.props.headerStyle]}
          month={this.state.currentMonth}
          addMonth={this.addMonth}
          showIndicator={indicator}
          theme={this.props.theme}
          hideArrows={this.props.hideArrows}
          firstDay={this.props.firstDay}
          renderArrow={this.props.renderArrow}
          monthFormat={this.props.monthFormat}
          hideDayNames={this.props.hideDayNames}
          weekNumbers={this.props.showWeekNumbers}
          onPressArrowLeft={this.props.onPressArrowLeft}
          onPressArrowRight={this.props.onPressArrowRight}
          testID={STATIC_HEADER}
          accessibilityElementsHidden={true} // iOS
          importantForAccessibility={'no-hide-descendants'} // Android
        />
      );
    }
  }

  render() {
    return (
      <View>
        <FlatList
          testID={this.props.testID}
          onLayout={this.onLayout}
          ref={(c) => this.listView = c}
          //scrollEventThrottle={1000}
          style={[this.style.container, this.props.style, this.props.scrollEnabled ? {marginTop: 0} : {marginTop: this.state.addMarginTop}]}
          initialListSize={this.props.pastScrollRange + this.props.futureScrollRange + 1} // ListView deprecated
          data={this.state.rows}
          //snapToAlignment='start'
          //snapToInterval={this.calendarHeight}
          removeClippedSubviews={this.props.removeClippedSubviews}
          pageSize={1} // ListView deprecated
          horizontal={this.props.horizontal}
          pagingEnabled={this.props.pagingEnabled}
          onViewableItemsChanged={this.onViewableItemsChangedBound}
          viewabilityConfig={this.viewabilityConfig}
          renderItem={this.renderCalendarBound}
          showsVerticalScrollIndicator={this.props.showScrollIndicator}
          showsHorizontalScrollIndicator={this.props.showScrollIndicator}
          scrollEnabled={this.props.scrollEnabled}
          keyExtractor={this.props.keyExtractor}
          initialScrollIndex={this.state.openDate ? this.getMonthIndex(this.state.openDate) : false}
          getItemLayout={this.getItemLayout}
          scrollsToTop={this.props.scrollsToTop}
          onEndReachedThreshold={this.props.onEndReachedThreshold}
          onEndReached={this.props.onEndReached}
          keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps}
        />
        {this.renderStaticHeader()}
      </View>
    );
  }
}

export default CalendarList;
