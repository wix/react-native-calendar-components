import { Platform, StyleSheet } from "react-native"
import * as defaultStyle from "../style"
import platformStyles from "./platform-style"

const STYLESHEET_ID = "stylesheet.agenda.main"

export default function styleConstructor(theme = {}) {
  const appStyle = { ...defaultStyle, ...theme }
  const { knob, weekdays } = platformStyles(appStyle)
  return StyleSheet.create({
    knob,
    weekdays,
    header: {
      overflow: "hidden",
      justifyContent: "flex-end",
      position: "absolute",
      height: "100%",
      width: "100%",
      backgroundColor: appStyle.backgroundColor,
    },
    calendar: {
      flex: 1,
      borderBottomWidth: 1,
      borderColor: appStyle.separatorColor,
    },
    knobContainer: {
      flex: 1,
      position: "absolute",
      left: 0,
      right: 0,
      height: Platform.OS === "android" ? 24 : 25,
      bottom: 0,
      alignItems: "center",
      backgroundColor: appStyle.calendarBackground,
    },
    weekday: {
      width: 32,
      textAlign: "center",
      fontSize: 13,
      padding: 0,
      margin: 0,
      color: appStyle.textSectionTitleColor,
    },
    reservations: {
      flex: 1,
      marginTop: 104,
      backgroundColor: appStyle.backgroundColor,
    },
    ...(theme[STYLESHEET_ID] || {}),
  })
}
