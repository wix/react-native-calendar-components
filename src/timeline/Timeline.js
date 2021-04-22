// @flow
import _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, Dimensions} from 'react-native';
import styleConstructor from './style';
import populateEvents from './Packer';

const LEFT_MARGIN = 60 - 1;
const TEXT_LINE_HEIGHT = 17;

function range(from, to) {
  return Array.from(Array(to), (_, i) => from + i);
}

let {width: dimensionWidth} = Dimensions.get('window');

export default class Timeline extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number,
    end: PropTypes.number,
    eventTapped: PropTypes.func,
    format24h: PropTypes.bool,
    events: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.string.isRequired,
        end: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        summary: PropTypes.string.isRequired,
        color: PropTypes.string
      })
    ).isRequired
  };

  static defaultProps = {
    start: 0,
    end: 24,
    events: [],
    format24h: true
  };

  constructor(props) {
    super(props);

    const {start, end} = this.props;
    this.calendarHeight = (end - start) * 100;

    this.style = styleConstructor(props.styles, this.calendarHeight);

    const width = dimensionWidth - LEFT_MARGIN;
    const packedEvents = populateEvents(props.events, width, start);
    let initPosition = _.min(_.map(packedEvents, 'top')) - this.calendarHeight / (end - start);
    const verifiedInitPosition = initPosition < 0 ? 0 : initPosition;

    this.state = {
      _scrollY: verifiedInitPosition,
      packedEvents
    };
  }

  componentDidUpdate(prevProps) {
    const width = dimensionWidth - LEFT_MARGIN;
    const {events: prevEvents, start: prevStart = 0} = prevProps;
    const {events, start = 0} = this.props;

    if (prevEvents !== events || prevStart !== start) {
      this.setState({
        packedEvents: populateEvents(events, width, start)
      });
    }
  }

  componentDidMount() {
    this.props.scrollToFirst && this.scrollToFirst();
  }

  scrollToFirst() {
    setTimeout(() => {
      if (this.state && this.state._scrollY && this._scrollView) {
        this._scrollView.scrollTo({
          x: 0,
          y: this.state._scrollY,
          animated: true
        });
      }
    }, 1);
  }

  _renderLines() {
    const {format24h, start = 0, end = 24} = this.props;
    const offset = this.calendarHeight / (end - start);
    const EVENT_DIFF = 20;

    return range(start, end + 1).map((i, index) => {
      let timeText;
      
      if (i < 12) {
        timeText = !format24h ? `${i} AM` : `${i}:00`;
      } else if (i === 12) {
        timeText = !format24h ? `${i} PM` : `${i}:00`;
      } else if (i === 24) {
        timeText = !format24h ? '12 AM' : '23:59';
      } else {
        timeText = !format24h ? `${i - 12} PM` : `${i}:00`;
      }

      return [
        <Text key={`timeLabel${i}`} style={[this.style.timeLabel, {top: offset * index - 6}]}>
          {timeText}
        </Text>,
        i === start ? null : (
          <View key={`line${i}`} style={[this.style.line, {top: offset * index, width: dimensionWidth - EVENT_DIFF}]} />
        ),
        <View
          key={`lineHalf${i}`}
          style={[this.style.line, {top: offset * (index + 0.5), width: dimensionWidth - EVENT_DIFF}]}
        />
      ];
    });
  }

  _onEventTapped(event) {
    if (this.props.eventTapped) {
      this.props.eventTapped(event);
    }
  }

  _renderEvents() {
    const {packedEvents} = this.state;
    let events = packedEvents.map((event, i) => {
      const style = {
        left: event.left,
        height: event.height,
        width: event.width,
        top: event.top,
        backgroundColor: event.color ? event.color : '#add8e6'
      };

      // Fixing the number of lines for the event title makes this calculation easier.
      // However it would make sense to overflow the title to a new line if needed
      const numberOfLines = Math.floor(event.height / TEXT_LINE_HEIGHT);
      const formatTime = this.props.format24h ? 'HH:mm' : 'hh:mm A';
      
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => this._onEventTapped(this.props.events[event.index])}
          key={i}
          style={[this.style.event, style]}
        >
          {this.props.renderEvent ? (
            this.props.renderEvent(event)
          ) : (
            <View>
              <Text numberOfLines={1} style={this.style.eventTitle}>
                {event.title || 'Event'}
              </Text>
              {numberOfLines > 1 ? (
                <Text numberOfLines={numberOfLines - 1} style={[this.style.eventSummary]}>
                  {event.summary || ' '}
                </Text>
              ) : null}
              {numberOfLines > 2 ? (
                <Text style={this.style.eventTimes} numberOfLines={1}>
                  {moment(event.start).format(formatTime)} - {moment(event.end).format(formatTime)}
                </Text>
              ) : null}
            </View>
          )}
        </TouchableOpacity>
      );
    });

    return (
      <View>
        <View style={{marginLeft: LEFT_MARGIN}}>{events}</View>
      </View>
    );
  }

  render() {
    return (
      <ScrollView
        ref={ref => (this._scrollView = ref)}
        contentContainerStyle={[this.style.contentStyle, {width: dimensionWidth}]}
      >
        {this._renderLines()}
        {this._renderEvents()}
      </ScrollView>
    );
  }
}
