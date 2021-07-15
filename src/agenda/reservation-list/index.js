import _ from 'lodash';
import PropTypes from 'prop-types';
import XDate from 'xdate';

import React, {Component} from 'react';
import {FlatList, ActivityIndicator, View} from 'react-native';

import {extractComponentProps} from '../../component-updater';
import {sameDate} from '../../dateutils';
import {toMarkingFormat} from '../../interface';
import styleConstructor from './style';
import Reservation from './reservation';

class ReservationList extends Component {
  static displayName = 'IGNORE';

  static propTypes = {
    ...Reservation.propTypes,
    /** the list of items that have to be displayed in agenda. If you want to render item as empty date
    the value of date key kas to be an empty array []. If there exists no value for date key it is
    considered that the date in question is not yet loaded */
    reservations: PropTypes.object,
    selectedDay: PropTypes.instanceOf(XDate),
    topDay: PropTypes.instanceOf(XDate),
    /** Show items only for the selected day. Default = false */
    showOnlySelectedDayItems: PropTypes.bool,
    /** callback that gets called when day changes while scrolling agenda list */
    onDayChange: PropTypes.func,
    /** specify what should be rendered instead of ActivityIndicator */
    renderEmptyData: PropTypes.func,

    /** onScroll ListView event */
    onScroll: PropTypes.func,
    /** Called when the user begins dragging the agenda list **/
    onScrollBeginDrag: PropTypes.func,
    /** Called when the user stops dragging the agenda list **/
    onScrollEndDrag: PropTypes.func,
    /** Called when the momentum scroll starts for the agenda list **/
    onMomentumScrollBegin: PropTypes.func,
    /** Called when the momentum scroll stops for the agenda list **/
    onMomentumScrollEnd: PropTypes.func,
    /** A RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView */
    refreshControl: PropTypes.element,
    /** Set this true while waiting for new data from a refresh */
    refreshing: PropTypes.bool,
    /** If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly */
    onRefresh: PropTypes.func
  };

  static defaultProps = {
    refreshing: false,
    selectedDay: XDate(true)
  };

  constructor(props) {
    super(props);

    this.style = styleConstructor(props.theme);

    this.state = {
      reservations: []
    };

    this.heights = [];
    this.selectedDay = props.selectedDay;
    this.scrollOver = true;
  }

  componentDidMount() {
    this.updateDataSource(this.getReservations(this.props).reservations);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (!sameDate(prevProps.topDay, this.props.topDay)) {
        this.setState(
          {
            reservations: []
          },
          () => this.updateReservations(this.props)
        );
      } else {
        this.updateReservations(this.props);
      }
    }
  }

  updateDataSource(reservations) {
    this.setState({
      reservations
    });
  }

  updateReservations(props) {
    const {selectedDay} = props;
    const reservations = this.getReservations(props);
    if (this.list && !sameDate(selectedDay, this.selectedDay)) {
      let scrollPosition = 0;
      for (let i = 0; i < reservations.scrollPosition; i++) {
        scrollPosition += this.heights[i] || 0;
      }
      this.scrollOver = false;
      this.list.scrollToOffset({offset: scrollPosition, animated: true});
    }
    this.selectedDay = selectedDay;
    this.updateDataSource(reservations.reservations);
  }

  getReservationsForDay(iterator, props) {
    const day = iterator.clone();
    const res = props.reservations[toMarkingFormat(day)];
    if (res && res.length) {
      return res.map((reservation, i) => {
        return {
          reservation,
          date: i ? false : day,
          day
        };
      });
    } else if (res) {
      return [
        {
          date: iterator.clone(),
          day
        }
      ];
    } else {
      return false;
    }
  }

  getReservations(props) {
    const {selectedDay, showOnlySelectedDayItems} = props;
    if (!props.reservations || !selectedDay) {
      return {reservations: [], scrollPosition: 0};
    }

    let reservations = [];
    if (this.state.reservations && this.state.reservations.length) {
      const iterator = this.state.reservations[0].day.clone();

      while (iterator.getTime() < selectedDay.getTime()) {
        const res = this.getReservationsForDay(iterator, props);
        if (!res) {
          reservations = [];
          break;
        } else {
          reservations = reservations.concat(res);
        }
        iterator.addDays(1);
      }
    }

    const scrollPosition = reservations.length;
    const iterator = selectedDay.clone();
    if (showOnlySelectedDayItems) {
      const res = this.getReservationsForDay(iterator, props);

      if (res) {
        reservations = res;
      }
      iterator.addDays(1);
    } else {
      for (let i = 0; i < 31; i++) {
        const res = this.getReservationsForDay(iterator, props);

        if (res) {
          reservations = reservations.concat(res);
        }
        iterator.addDays(1);
      }
    }

    return {reservations, scrollPosition};
  }

  onScroll = event => {
    const yOffset = event.nativeEvent.contentOffset.y;
    _.invoke(this.props, 'onScroll', yOffset);

    let topRowOffset = 0;
    let topRow;
    for (topRow = 0; topRow < this.heights.length; topRow++) {
      if (topRowOffset + this.heights[topRow] / 2 >= yOffset) {
        break;
      }
      topRowOffset += this.heights[topRow];
    }

    const row = this.state.reservations[topRow];
    if (!row) return;

    const day = row.day;
    const sameDate = sameDate(day, this.selectedDay);
    if (!sameDate && this.scrollOver) {
      this.selectedDay = day.clone();
      _.invoke(this.props, 'onDayChange', day.clone());
    }
  };

  onListTouch() {
    this.scrollOver = true;
  }

  onRowLayoutChange(ind, event) {
    this.heights[ind] = event.nativeEvent.layout.height;
  }

  onMoveShouldSetResponderCapture = () => {
    this.onListTouch();
    return false;
  };

  renderRow = ({item, index}) => {
    const reservationProps = extractComponentProps(Reservation, this.props);

    return (
      <View onLayout={this.onRowLayoutChange.bind(this, index)}>
        <Reservation {...reservationProps} item={item} />
      </View>
    );
  };

  keyExtractor = (item, index) => String(index);

  render() {
    const {reservations, selectedDay, theme, style} = this.props;
    if (!reservations || !reservations[toMarkingFormat(selectedDay)]) {
      if (_.isFunction(this.props.renderEmptyData)) {
        return _.invoke(this.props, 'renderEmptyData');
      }

      return <ActivityIndicator style={this.style.indicator} color={theme && theme.indicatorColor} />;
    }

    return (
      <FlatList
        ref={c => (this.list = c)}
        style={style}
        contentContainerStyle={this.style.content}
        data={this.state.reservations}
        renderItem={this.renderRow}
        keyExtractor={this.keyExtractor}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={200}
        onMoveShouldSetResponderCapture={this.onMoveShouldSetResponderCapture}
        onScroll={this.onScroll}
        refreshControl={this.props.refreshControl}
        refreshing={this.props.refreshing}
        onRefresh={this.props.onRefresh}
        onScrollBeginDrag={this.props.onScrollBeginDrag}
        onScrollEndDrag={this.props.onScrollEndDrag}
        onMomentumScrollBegin={this.props.onMomentumScrollBegin}
        onMomentumScrollEnd={this.props.onMomentumScrollEnd}
      />
    );
  }
}

export default ReservationList;
