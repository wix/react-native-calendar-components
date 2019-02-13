import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import XDate from "xdate";
import dateutils from "../../dateutils";
import { xdateToData } from "../../interface";
import styleConstructor from "./style";

class ReservationListItem extends Component {
  constructor(props) {
    super(props)
    this.styles = styleConstructor(props.theme)
  }

  shouldComponentUpdate(nextProps) {
    const r1 = this.props.item
    const r2 = nextProps.item
    let changed = true
    if (!r1 && !r2) {
      changed = false
    } else if (r1 && r2) {
      if (r1.day.getTime() !== r2.day.getTime()) {
        changed = true
      } else if (!r1.reservation && !r2.reservation) {
        changed = false
      } else if (r1.reservation && r2.reservation) {
        if ((!r1.date && !r2.date) || (r1.date && r2.date)) {
          changed = this.props.rowHasChanged(r1.reservation, r2.reservation)
        }
      }
    }
    return changed
  }

  renderDate(date, item, lastItem = false) {
    let isHoliday = false
    let dayOfTheWeek = null
    if (date) {
      try {
        const dateData = xdateToData(date)
        const dateString = dateData.dateString
        const holidays = this.props.holidays
        const dateObject = new Date(dateString)
        isHoliday = holidays.includes(dateString)
        dayOfTheWeek = dateObject.getDay()
      } catch {
        // do nothing
      }
    }
    if (this.props.renderDay) {
      return this.props.renderDay(date ? xdateToData(date) : undefined, item)
    }
    const today = dateutils.sameDate(date, XDate()) ? this.styles.today : undefined
    const holiday = isHoliday || dayOfTheWeek === 0 ? this.styles.holiday : undefined
    const saturday = dayOfTheWeek === 6 ? this.styles.saturday : undefined
    if (lastItem) {
      return <View style={this.styles.day} />
    }
    if (date) {
      return (
        <View style={this.styles.day}>
          <Text allowFontScaling={false} style={[this.styles.dayNum, saturday, holiday, today]}>
            {date.getDate()}
          </Text>
          <Text allowFontScaling={false} style={[this.styles.dayText, saturday, holiday, today]}>
            {XDate.locales[XDate.defaultLocale].dayNamesShort[date.getDay()]}
          </Text>
        </View>
      )
    } else {
      return <View style={this.styles.day} />
    }
  }

  renderSeparator = () => (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#9EA1A7",
      }}
    />
  )

  render() {
    const { reservation, date } = this.props.item
    let content
    let lastItem = false
    if (reservation) {
      const firstItem = date ? true : false
      content = this.props.renderItem(reservation, firstItem)
      lastItem = reservation.last
    } else {
      content = this.props.renderEmptyDate(date)
    }
    if (!lastItem) {
      return (
        <View style={[this.styles.container, date && this.styles.daySeparator]}>
          {this.renderDate(date, reservation)}
          <View style={{ flex: 1 }}>{content}</View>
          {this.renderSeparator()}
        </View>
      )
    }
    return (
      <View>
        <View style={[this.styles.container, date && this.styles.daySeparator]}>
          {this.renderDate(date, reservation)}
          <View style={{ flex: 1 }}>{content}</View>
          {this.renderSeparator()}
        </View>
        <View style={this.styles.container}>
          {this.renderDate(date, reservation, lastItem)}
          <View style={{ flex: 1 }}>{this.props.renderEmptyDate(date)}</View>
        </View>
      </View>
    )
  }
}

export default ReservationListItem
