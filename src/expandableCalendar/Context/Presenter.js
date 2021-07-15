import _ from 'lodash';
import XDate from 'xdate';
import {sameMonth as dateutils_sameMonth} from '../../dateutils';
import {xdateToData, toMarkingFormat} from '../../interface';

const commons = require('../commons');
const TOP_POSITION = 65;

class Presenter {
  _isPastDate(date) {
    const today = XDate();
    const d = XDate(date);

    if (today.getFullYear() > d.getFullYear()) {
      return true;
    }
    if (today.getFullYear() === d.getFullYear()) {
      if (today.getMonth() > d.getMonth()) {
        return true;
      }
      if (today.getMonth() === d.getMonth()) {
        if (today.getDate() > d.getDate()) {
          return true;
        }
      }
    }
    return false;
  }

  _getIconDown = () => {
    return require('../../img/down.png');
  };

  _getIconUp = () => {
    return require('../../img/up.png');
  };

  getButtonIcon = (date, showTodayButton = true) => {
    if (!showTodayButton) {
      return undefined;
    }
    const icon = this._isPastDate(date) ? this._getIconDown() : this._getIconUp();
    return icon;
  };

  setDate = (props, date, newDate, updateState, updateSource) => {
    const sameMonth = dateutils_sameMonth(XDate(date), XDate(newDate));
    const buttonIcon = this.getButtonIcon(date, props.showTodayButton);

    updateState(buttonIcon);

    _.invoke(props, 'onDateChanged', date, updateSource);

    if (!sameMonth) {
      _.invoke(props, 'onMonthChange', xdateToData(XDate(date)), updateSource);
    }
  };

  setDisabled = (showTodayButton, newDisabledValue, oldDisabledValue, updateState) => {
    if (!showTodayButton || newDisabledValue === oldDisabledValue) {
      return;
    }
    updateState(newDisabledValue);
  };

  shouldAnimateTodayButton = props => {
    return props.showTodayButton;
  };

  _isToday = date => {
    const today = toMarkingFormat(XDate());
    return today === date;
  };

  getTodayDate = () => {
    return toMarkingFormat(XDate());
  };

  getPositionAnimation = (date, todayBottomMargin) => {
    const toValue = this._isToday(date) ? TOP_POSITION : -todayBottomMargin || -TOP_POSITION;
    return {
      toValue,
      tension: 30,
      friction: 8,
      useNativeDriver: true
    };
  };

  shouldAnimateOpacity = props => {
    return props.disabledOpacity;
  };

  getOpacityAnimation = (props, disabled) => {
    return {
      toValue: disabled ? props.disabledOpacity : 1,
      duration: 500,
      useNativeDriver: true
    };
  };

  getTodayFormatted = () => {
    const todayString = XDate.locales[XDate.defaultLocale].today || commons.todayString;
    const today = todayString.charAt(0).toUpperCase() + todayString.slice(1);
    return today;
  };
}

export default Presenter;
