import XDate from 'xdate';
import React from 'react';
import {ComponentDriver, getTextNodes} from 'react-component-driver';
import {swipeDirections} from 'react-native-swipe-gestures';
import {advanceTo, clear as clearDate} from 'jest-date-mock';
import Calendar from '.';
import {SELECT_DATE_SLOT, WEEK_NUMBER} from '../testIDs';
import {extractStyles, getDaysArray, partial} from '../../test';
import {CalendarHeaderDriver} from './header/driver';

describe('Calendar', () => {
  let currentDate;

  beforeEach(() => {
    currentDate = new Date('2020-04-01T12:00:00.002Z');
    advanceTo(currentDate);
  });

  afterEach(() => {
    clearDate();
  });

  describe('Month days', () => {
    it('should render current month days including extra days from other months by default', () => {
      let expectedDays = [];
      expectedDays.push(...getDaysArray(29, 31)); // March
      expectedDays.push(...getDaysArray(1, 30)); // April
      expectedDays.push(...getDaysArray(1, 2)); // May
      const drv = new CalendarDriver().render();
      expect(getTextNodes(drv.getDays())).toEqual(expectedDays);
    });

    it('should not include extra days with `hideExtraDays={true}` prop', () => {
      const drv = new CalendarDriver().setProps({hideExtraDays: true}).render();
      expect(getTextNodes(drv.getDays())).toEqual(getDaysArray(1, 30));
    });

    it('should render month from `current` prop date', () => {
      const expectedDays = getDaysArray(1, 31);
      expectedDays.push(...getDaysArray(1, 4)); // April days
      const drv = new CalendarDriver().setProps({current: '2020-03-01'}).render();
      expect(getTextNodes(drv.getDays())).toEqual(expectedDays);
    });

    it('should render calendar with week numbers with `showWeekNumbers={true}` prop', () => {
      const drv = new CalendarDriver().setProps({showWeekNumbers: true}).render();
      expect(getTextNodes(drv.getWeekNumbers())).toEqual(['14', '15', '16', '17', '18']);
    });

    it('should gray out dates not in interval between `minDate` and `maxDate`', () => {
      const textDisabledColor = '#AAAAAA';
      const drv = new CalendarDriver()
        .setProps({minDate: '2020-04-10', maxDate: '2020-04-11', theme: {textDisabledColor}})
        .render();

      // Disabled dates
      expect(drv.getDayTextStyle('2020-04-09')).toEqual(partial({color: textDisabledColor}));
      expect(drv.getDayTextStyle('2020-04-12')).toEqual(partial({color: textDisabledColor}));

      // Enabled dates
      expect(drv.getDayTextStyle('2020-04-10')).not.toEqual(partial({color: textDisabledColor}));
      expect(drv.getDayTextStyle('2020-04-11')).not.toEqual(partial({color: textDisabledColor}));
    });

    it('should disable touch events for disabled dates with `disableAllTouchEventsForDisabledDays`', () => {
      const date = '2020-04-10';
      const onDayPress = jest.fn();
      new CalendarDriver()
        .setProps({onDayPress, markedDates: {[date]: {disabled: true}}, disableAllTouchEventsForDisabledDays: true})
        .render()
        .tapDay(date);
      expect(onDayPress).not.toBeCalled();
    });

    describe('Basic Day', () => {
      it('should invoke `onDayPress` prop on day press', () => {
        const date = '2020-04-10';
        const onDayPress = jest.fn();
        new CalendarDriver().setProps({onDayPress}).render().tapDay(date);
        expect(onDayPress).toBeCalledWith({
          dateString: date,
          day: 10,
          month: 4,
          timestamp: 1586476800000,
          year: 2020
        });
      });

      it('should not invoke `onDayPress` on dates with disabled touch events', () => {
        const date = '2020-04-10';
        const onDayPress = jest.fn();
        new CalendarDriver()
          .setProps({onDayPress, markedDates: {[date]: {disableTouchEvent: true}}})
          .render()
          .tapDay(date);
        expect(onDayPress).not.toBeCalled();
      });

      it('should mark selected day', () => {
        const date = '2020-04-10';
        const selectedColor = '#AAAAAA';
        const selectedTextColor = '#BBBBBB';
        const drv = new CalendarDriver()
          .setProps({markedDates: {[date]: {selected: true, selectedColor, selectedTextColor}}})
          .render();
        expect(drv.getDayStyle(date)).toEqual(partial({backgroundColor: selectedColor, borderRadius: 16}));
        expect(drv.getDayTextStyle(date)).toEqual(partial({color: selectedTextColor}));
      });

      it('should mark disabled day', () => {
        const date = '2020-04-10';
        const textDisabledColor = '#AAAAAA';
        const drv = new CalendarDriver()
          .setProps({theme: {textDisabledColor}, markedDates: {[date]: {disabled: true}}})
          .render();
        expect(drv.getDayTextStyle(date)).toEqual(partial({color: textDisabledColor}));
      });

      it('should mark today day', () => {
        const date = '2020-04-01';
        const todayTextColor = '#AAAAAA';
        const todayBackgroundColor = '#BBBBBB';
        const drv = new CalendarDriver().setProps({theme: {todayTextColor, todayBackgroundColor}}).render();
        expect(drv.getDayStyle(date)).toEqual(partial({backgroundColor: todayBackgroundColor, borderRadius: 16}));
        expect(drv.getDayTextStyle(date)).toEqual(partial({color: todayTextColor}));
      });
    });

    // TODO: Unskip after #1353 is merged
    // https://github.com/wix/react-native-calendars/pull/1353
    describe.skip('Accessibility labels', () => {
      it('should have default accessibility label', () => {
        const drv = new CalendarDriver().render();
        expect(drv.getDayAccessibilityLabel('2020-04-10')).toBe('Friday 10 April 2020');
      });

      it('should have correct label for today date', () => {
        const drv = new CalendarDriver().setProps().render();
        expect(drv.getDayAccessibilityLabel('2020-04-01')).toBe('today Wednesday 1 April 2020');
      });

      it('should have correct label for selected date with no markings', () => {
        const drv = new CalendarDriver().setProps({markedDates: {'2020-04-10': {selected: true}}}).render();
        expect(drv.getDayAccessibilityLabel('2020-04-10')).toBe(
          'Friday 10 April 2020 selected You have no entries for this day'
        );
      });

      it('should have correct label for selected date with markings', () => {
        const drv = new CalendarDriver()
          .setProps({markedDates: {'2020-04-10': {selected: true, marked: true}}})
          .render();
        expect(drv.getDayAccessibilityLabel('2020-04-10')).toBe(
          'Friday 10 April 2020 selected You have entries for this day'
        );
      });

      it('should have correct label for disabled date', () => {
        const drv = new CalendarDriver().setProps({markedDates: {'2020-04-10': {disabled: true}}}).render();
        expect(drv.getDayAccessibilityLabel('2020-04-10')).toBe('Friday 10 April 2020 disabled');
      });

      it('should have correct label for disabled touch event', () => {
        const drv = new CalendarDriver().setProps({markedDates: {'2020-04-10': {disableTouchEvent: true}}}).render();
        expect(drv.getDayAccessibilityLabel('2020-04-10')).toBe('Friday 10 April 2020 disabled');
      });

      it('should have correct label for period start', () => {
        const drv = new CalendarDriver().setProps({markedDates: {'2020-04-10': {startingDay: true}}}).render();
        expect(drv.getDayAccessibilityLabel('2020-04-10')).toBe('Friday 10 April 2020 period start');
      });

      it('should have correct label for period end', () => {
        const drv = new CalendarDriver().setProps({markedDates: {'2020-04-10': {endingDay: true}}}).render();
        expect(drv.getDayAccessibilityLabel('2020-04-10')).toBe('Friday 10 April 2020 period end');
      });
    });
  });

  describe('Header', () => {
    it('should render month name and year in header', () => {
      const drv = new CalendarDriver().withDefaultProps().render();
      expect(drv.getHeader().getTitle()).toBe('April 2020');
    });

    it('should render custom header via `renderHeader` prop', () => {
      const text = 'My Custom Header';
      const renderHeader = jest.fn().mockReturnValue(React.createElement('Text', {}, text));
      const drv = new CalendarDriver().withDefaultProps({renderHeader}).render();
      expect(renderHeader).toBeCalledWith(XDate(currentDate));
      expect(getTextNodes(drv.getComponent())).toContain(text);
      expect(drv.getHeader().getTitle()).toBeFalsy();
    });

    it('should render custom header component via `customHeader` prop', () => {
      const text = 'My Custom Header';
      const customHeader = props => React.createElement('Text', props, text);
      const drv = new CalendarDriver().setProps({customHeader}).render();
      expect(getTextNodes(drv.getComponent())).toContain(text);
    });

    it('should have loading indicator with `displayLoadingIndicator` prop when `markedDates` collection does not have a value for every day of the month', () => {
      expect(
        new CalendarDriver()
          .withDefaultProps({current: currentDate, displayLoadingIndicator: true})
          .render()
          .getHeader()
          .getLoadingIndicator()
      ).toBeDefined();
    });

    it('should not have loading indicator with `displayLoadingIndicator` prop when `markedDates` collection has a value for every day of the month', () => {
      let date = currentDate;
      const markedDates = {};
      for (let i = 0; i < 30; i++) {
        const string = date.toISOString().split('T')[0];
        markedDates[string] = {};
        date.setDate(date.getDate() + 1);
      }

      expect(
        new CalendarDriver()
          .withDefaultProps({current: '2020-04-01', displayLoadingIndicator: true, markedDates})
          .render()
          .getHeader()
          .getLoadingIndicator()
      ).toBeUndefined();
    });

    describe('Week days', () => {
      it('should render day names', () => {
        const drv = new CalendarDriver().withDefaultProps().render();
        expect(getTextNodes(drv.getHeader().getDayNames())).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
      });

      it('should support custom first day via `firstDay` prop', () => {
        const drv = new CalendarDriver().withDefaultProps({firstDay: 4}).render();
        expect(getTextNodes(drv.getHeader().getDayNames())).toEqual(['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed']);
      });

      it('should not render day names with `hideDayNames={true}`', () => {
        const drv = new CalendarDriver().withDefaultProps({hideDayNames: true}).render();
        expect(getTextNodes(drv.getHeader().getDayNames())).toEqual([]);
      });
    });

    describe('Arrows', () => {
      it('should not have arrows with `hideArrows={true}` prop', () => {
        const drv = new CalendarDriver().withDefaultProps({hideArrows: true}).render();
        expect(drv.getHeader().getLeftArrow()).toBeUndefined();
        expect(drv.getHeader().getRightArrow()).toBeUndefined();
      });

      it('should change month on left arrow tap', () => {
        const drv = new CalendarDriver().withDefaultProps().render();
        drv.getHeader().tapLeftArrow();
        expect(drv.getHeader().getTitle()).toBe('March 2020');
      });

      it('should change month on right arrow tap', () => {
        const drv = new CalendarDriver().withDefaultProps().render();
        drv.getHeader().tapRightArrow();
        expect(drv.getHeader().getTitle()).toBe('May 2020');
      });

      it('should have right arrow working but left arrow disabled with `disableArrowLeft` prop', () => {
        const drv = new CalendarDriver().withDefaultProps({disableArrowLeft: true}).render();
        drv.getHeader().tapLeftArrow();
        expect(drv.getHeader().getTitle()).toBe('April 2020');
        drv.getHeader().tapRightArrow();
        expect(drv.getHeader().getTitle()).toBe('May 2020');
      });

      it('should have left arrow working but right arrow disabled with `disableArrowRight` prop', () => {
        const drv = new CalendarDriver().withDefaultProps({disableArrowRight: true}).render();
        drv.getHeader().tapRightArrow();
        expect(drv.getHeader().getTitle()).toBe('April 2020');
        drv.getHeader().tapLeftArrow();
        expect(drv.getHeader().getTitle()).toBe('March 2020');
      });

      it('should render custom arrows using `renderArrow` prop', () => {
        const renderArrow = jest.fn().mockImplementation(direction => React.createElement('Text', {}, direction));
        const drv = new CalendarDriver().withDefaultProps({renderArrow}).render();
        expect(getTextNodes(drv.getHeader().getLeftArrow()).join('')).toBe('left');
        expect(getTextNodes(drv.getHeader().getRightArrow()).join('')).toBe('right');
      });
    });
  });

  describe('Gesture Recognizer', () => {
    it('should not have `GestureRecognizer` root view by default', () => {
      expect(new CalendarDriver().render().isRootGestureRecognizer()).toBe(false);
    });

    it('should have `GestureRecognizer` root view with `enableSwipeMonths={true}` prop', () => {
      expect(new CalendarDriver().setProps({enableSwipeMonths: true}).render().isRootGestureRecognizer()).toBe(true);
    });

    it('should not have `GestureRecognizer` root view with `enableSwipeMonths={false}` prop', () => {
      expect(new CalendarDriver().setProps({enableSwipeMonths: false}).render().isRootGestureRecognizer()).toBe(false);
    });

    it('should go forward on left swipe', () => {
      const drv = new CalendarDriver().withDefaultProps({enableSwipeMonths: true}).render();
      expect(drv.swipeLeft().getHeader().getTitle()).toBe('May 2020');
    });

    it('should go back on right swipe', () => {
      const drv = new CalendarDriver().withDefaultProps({enableSwipeMonths: true}).render();
      expect(drv.swipeRight().getHeader().getTitle()).toBe('March 2020');
    });
  });
});

class CalendarDriver extends ComponentDriver {
  testID = 'calendar';

  constructor() {
    super(Calendar);
  }

  withDefaultProps(props) {
    return this.setProps({...props, testID: this.testID});
  }

  getHeader() {
    const node = this.getByID(this.testID);
    if (!node) {
      throw new Error('Header not found.');
    }
    return new CalendarHeaderDriver(this.testID).attachTo(node);
  }

  isRootGestureRecognizer() {
    return !!this.getComponent().props.onSwipe;
  }

  swipe(direction, state) {
    this.getComponent().props.onSwipe(direction, state);
    return this;
  }

  swipeLeft() {
    this.swipe(swipeDirections.SWIPE_LEFT);
    return this;
  }

  swipeRight() {
    this.swipe(swipeDirections.SWIPE_RIGHT);
    return this;
  }

  getDay(dateString) {
    return this.getByID(`${SELECT_DATE_SLOT}-${dateString}`);
  }

  tapDay(dateString) {
    const node = this.getDay(dateString);
    if (!node) {
      throw new Error(`Date ${dateString} not found.`);
    }
    node.props.onClick();
    return this;
  }

  getDays() {
    return this.filterByID(new RegExp(SELECT_DATE_SLOT));
  }

  getDayAccessibilityLabel(dateString) {
    return this.getDay(dateString).props.accessibilityLabel.trim();
  }

  getDayStyle(dateString) {
    return extractStyles(this.getDay(dateString));
  }

  getDayText(dateString) {
    return this.getDay(dateString).children.find(node => node.type === 'Text');
  }

  getDayTextStyle(dateString) {
    return extractStyles(this.getDayText(dateString));
  }

  getWeekNumbers() {
    return this.filterByID(new RegExp(WEEK_NUMBER));
  }
}
