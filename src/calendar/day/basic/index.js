import _ from 'lodash';
import PropTypes from 'prop-types';

import React, {Component, Fragment} from 'react';
import {TouchableOpacity, Text, View} from 'react-native';

import {shouldUpdate} from '../../../component-updater';
import {formatStringNumbers} from '../../../dateutils';
import styleConstructor from './style';
import Marking from '../marking';


export default class BasicDay extends Component {
  static displayName = 'IGNORE';

  static propTypes = {
    state: PropTypes.oneOf(['selected', 'disabled', 'today', '']),
    /** The marking object */
    marking: PropTypes.any,
    /** Date marking style [simple/period/multi-dot/multi-period]. Default = 'simple' */
    markingType: PropTypes.oneOf(_.values(Marking.markingTypes)),
    /** Number array, used to localize non-latin numbers */
    numbers: PropTypes.array,
    /** Theme object */
    theme: PropTypes.object,
    /** onPress callback */
    onPress: PropTypes.func,
    /** onLongPress callback */
    onLongPress: PropTypes.func,
    /** The date to return from press callbacks */
    date: PropTypes.object,
    /** Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates*/
    disableAllTouchEventsForDisabledDays: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.style = styleConstructor(props.theme);
  }

  shouldComponentUpdate(nextProps) {
    return shouldUpdate(this.props, nextProps, ['children', 'state', 'markingType', 'marking', 'onPress', 'onLongPress', 'date']);
  }

  onPress = () => {
    _.invoke(this.props, 'onPress', this.props.date);
  }

  onLongPress = () => {
    _.invoke(this.props, 'onLongPress', this.props.date);
  }

  get marking() {
    let marking = this.props.marking || {};
    if (marking && marking.constructor === Array && marking.length) {
      marking = {
        marking: true
      };
    }
    return marking;
  }

  shouldDisableTouchEvent() {
    const {disableAllTouchEventsForDisabledDays} = this.props;
    const {disableTouchEvent} = this.marking;
    let disableTouch = false;

    if (typeof disableTouchEvent === 'boolean') {
      disableTouch = disableTouchEvent;
    } else if (typeof disableAllTouchEventsForDisabledDays === 'boolean' && this.isDisabled()) {
      disableTouch = disableAllTouchEventsForDisabledDays;
    }
    return disableTouch;
  }

  isSelected() {
    return this.marking.selected || this.props.state === 'selected';
  }

  isDisabled() {
    return typeof this.marking.disabled !== 'undefined' ? this.marking.disabled : this.props.state === 'disabled';
  }

  isToday() {
    return this.props.state === 'today';
  }

  isMultiDot() {
    return this.props.markingType === Marking.markingTypes.multiDot;
  }

  isMultiPeriod() {
    return this.props.markingType === Marking.markingTypes.multiPeriod;
  }

  isCustom() {
    return this.props.markingType === Marking.markingTypes.custom;
  }

  getContainerStyle() {
    const {customStyles, selectedColor} = this.marking;
    const style = [this.style.base];

    if (this.isSelected()) {
      style.push(this.style.selected);
      if (selectedColor) {
        style.push({backgroundColor: selectedColor});
      }
    } else if (this.isToday()) {
      style.push(this.style.today);
    }

    //Custom marking type
    if (this.isCustom() && customStyles && customStyles.container) {
      if (customStyles.container.borderRadius === undefined) {
        customStyles.container.borderRadius = 16;
      }
      style.push(customStyles.container);
    }

    return style;
  }

  getTextStyle() {
    const {customStyles, selectedTextColor} = this.marking;
    const style = [this.style.text];

    if (this.isSelected()) {
      style.push(this.style.selectedText);
      if (selectedTextColor) {
        style.push({color: selectedTextColor});
      }
    } else if (this.isDisabled()) {
      style.push(this.style.disabledText);
    } else if (this.isToday()) {
      style.push(this.style.todayText);
    }

    //Custom marking type
    if (this.isCustom() && customStyles && customStyles.text) {
      style.push(customStyles.text);
    }

    return style;
  }

  renderMarking() {
    const {theme, markingType} = this.props;
    const {marked, dotColor, dots, periods} = this.marking;

    return (
      <Marking
        type={markingType}
        theme={theme}
        marked={this.isMultiDot() ? true : marked}
        selected={this.isSelected()}
        disabled={this.isDisabled()}
        today={this.isToday()}
        dotColor={dotColor}
        dots={dots}
        periods={periods}
      />
    );
  }

  renderText() {
    const {children, numbers} = this.props;

    return (
      <Text allowFontScaling={false} style={this.getTextStyle()}>
        {formatStringNumbers(String(children), numbers)}
      </Text>
    );
  }

  renderContent() {
    return (
      <Fragment>
        {this.renderText()}
        {this.renderMarking()}
      </Fragment>
    );
  }

  renderContainer() {
    const {activeOpacity} = this.marking;

    return (
      <TouchableOpacity
        testID={this.props.testID}
        style={this.getContainerStyle()}
        disabled={this.shouldDisableTouchEvent()}
        activeOpacity={activeOpacity}
        onPress={!this.shouldDisableTouchEvent() ? this.onPress : undefined}
        onLongPress={!this.shouldDisableTouchEvent() ? this.onLongPress : undefined}
        accessible
        accessibilityRole={this.isDisabled() ? undefined : 'button'}
        accessibilityLabel={this.props.accessibilityLabel}
      >
        {this.isMultiPeriod() ? this.renderText() : this.renderContent()}
      </TouchableOpacity>
    );
  }

  renderPeriodsContainer() {
    return (
      <View style={this.style.container}>
        {this.renderContainer()}
        {this.renderMarking()}
      </View>
    );
  }

  render() {
    return this.isMultiPeriod() ? this.renderPeriodsContainer() : this.renderContainer();
  }
}
