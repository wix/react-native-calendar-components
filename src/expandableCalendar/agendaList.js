import _ from 'lodash';
import React, {Component} from 'react';
import {SectionList, Text} from 'react-native';
import PropTypes from 'prop-types';
import XDate from 'xdate';
import {isToday as dateutils_isToday} from '../dateutils';
import styleConstructor from './style';
import asCalendarConsumer from './asCalendarConsumer';
import {getMoment} from '../momentResolver';

const commons = require('./commons');
const UPDATE_SOURCES = commons.UPDATE_SOURCES;

/**
 * @description: AgendaList component
 * @note: Should be wrapped with 'CalendarProvider'
 * @extends: SectionList
 * @example: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/expandableCalendar.js
 */
class AgendaList extends Component {
  static displayName = 'AgendaList';

  static propTypes = {
    ...SectionList.propTypes,
    /** day format in section title. Formatting values: http://arshaw.com/xdate/#Formatting */
    dayFormat: PropTypes.string,
    /** a function to custom format the section header's title */
    dayFormatter: PropTypes.func,
    /** whether to use moment.js for date string formatting
     * (remember to pass 'dayFormat' with appropriate format, like 'dddd, MMM D') */
    useMoment: PropTypes.bool,
    /** whether to mark today's title with the "Today, ..." string. Default = true */
    markToday: PropTypes.bool,
    /** style passed to the section view */
    sectionStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    /** whether to block the date change in calendar (and calendar context provider) when agenda scrolls */
    avoidDateUpdates: PropTypes.bool
  };

  static defaultProps = {
    dayFormat: 'dddd, MMM d',
    stickySectionHeadersEnabled: true,
    markToday: true
  };

  constructor(props) {
    super(props);
    this.style = styleConstructor(props.theme);

    this._topSection = _.get(props, 'sections[0].title');
    this.didScroll = false;
    this.sectionScroll = false;

    this.viewabilityConfig = {
      itemVisiblePercentThreshold: 20 // 50 means if 50% of the item is visible
    };
    this.list = React.createRef();
  }

  getSectionIndex(date) {
    let i;
    _.map(this.props.sections, (section, index) => {
      // NOTE: sections titles should match current date format!!!
      if (section.title === date) {
        i = index;
        return;
      }
    });
    return i;
  }

  componentDidMount() {
    const {date} = this.props.context;
    if (date !== this._topSection) {
      setTimeout(() => {
        const sectionIndex = this.getSectionIndex(date);
        this.scrollToSection(sectionIndex);
      }, 500);
    }
  }

  componentDidUpdate(prevProps) {
    const {updateSource, date} = this.props.context;
    if (date !== prevProps.context.date) {
      // NOTE: on first init data should set first section to the current date!!!
      if (updateSource !== UPDATE_SOURCES.LIST_DRAG && updateSource !== UPDATE_SOURCES.CALENDAR_INIT) {
        const sectionIndex = this.getSectionIndex(date);
        this.scrollToSection(sectionIndex);
      }
    }
  }

  getSectionTitle(title) {
    if (!title) return;

    const {dayFormatter, dayFormat, useMoment, markToday} = this.props;
    let sectionTitle = title;

    if (dayFormatter) {
      sectionTitle = dayFormatter(title);
    } else if (dayFormat) {
      if (useMoment) {
        const moment = getMoment();
        sectionTitle = moment(title).format(dayFormat);
      } else {
        sectionTitle = XDate(title).toString(dayFormat);
      }
    }

    if (markToday) {
      const todayString = XDate.locales[XDate.defaultLocale].today || commons.todayString;
      const isToday = dateutils_isToday(XDate(title));
      sectionTitle = isToday ? `${todayString}, ${sectionTitle}` : sectionTitle;
    }

    return sectionTitle;
  }

  scrollToSection(sectionIndex) {
    if (this.list.current && sectionIndex !== undefined) {
      this.sectionScroll = true; // to avoid setDate() in onViewableItemsChanged
      this._topSection = this.props.sections[sectionIndex].title;

      this.list.current.scrollToLocation({
        animated: true,
        sectionIndex: sectionIndex,
        itemIndex: 0,
        viewPosition: 0, // position at the top
        viewOffset: (commons.isAndroid ? this.sectionHeight : 0) + this.props.viewOffset
      });
    }
  }

  onViewableItemsChanged = ({viewableItems}) => {
    if (viewableItems && !this.sectionScroll) {
      const topSection = _.get(viewableItems[0], 'section.title');
      if (topSection && topSection !== this._topSection) {
        this._topSection = topSection;
        if (this.didScroll && !this.props.avoidDateUpdates) {
          // to avoid setDate() on first load (while setting the initial context.date value)
          _.invoke(this.props.context, 'setDate', this._topSection, UPDATE_SOURCES.LIST_DRAG);
        }
      }
    }
  };

  onScroll = event => {
    if (!this.didScroll) {
      this.didScroll = true;
    }
    _.invoke(this.props, 'onScroll', event);
  };

  onMomentumScrollBegin = event => {
    _.invoke(this.props.context, 'setDisabled', true);
    _.invoke(this.props, 'onMomentumScrollBegin', event);
  };

  onMomentumScrollEnd = event => {
    // when list momentum ends AND when scrollToSection scroll ends
    this.sectionScroll = false;
    _.invoke(this.props.context, 'setDisabled', false);
    _.invoke(this.props, 'onMomentumScrollEnd', event);
  };

  onScrollToIndexFailed = info => {
    console.warn('onScrollToIndexFailed info: ', info);
  };

  onHeaderLayout = ({nativeEvent}) => {
    this.sectionHeight = nativeEvent.layout.height;
  };

  renderSectionHeader = ({section: {title}}) => {
    const {renderSectionHeader, sectionStyle} = this.props;

    if (renderSectionHeader) {
      return renderSectionHeader(title);
    }

    return (
      <Text allowFontScaling={false} style={[this.style.sectionText, sectionStyle]} onLayout={this.onHeaderLayout}>
        {this.getSectionTitle(title)}
      </Text>
    );
  };

  keyExtractor = (item, index) => {
    const {keyExtractor} = this.props;
    return _.isFunction(keyExtractor) ? keyExtractor(item, index) : String(index);
  };

  render() {
    const props = _.omit(this.props, 'context');

    return (
      <SectionList
        {...props}
        ref={this.list}
        keyExtractor={this.keyExtractor}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={this.onViewableItemsChanged}
        viewabilityConfig={this.viewabilityConfig}
        renderSectionHeader={this.renderSectionHeader}
        onScroll={this.onScroll}
        onMomentumScrollBegin={this.onMomentumScrollBegin}
        onMomentumScrollEnd={this.onMomentumScrollEnd}
        onScrollToIndexFailed={this.onScrollToIndexFailed}
        // getItemLayout={this.getItemLayout} // onViewableItemsChanged is not updated when list scrolls!!!
      />
    );
  }

  // getItemLayout = (data, index) => {
  //   return {length: commons.screenWidth, offset: commons.screenWidth  * index, index};
  // }
}

export default asCalendarConsumer(AgendaList);
