/**
 * Tool class
 */
export default {
  buttonStatus(data, button) {
    if (data === undefined || data.length <= 0) {
      return false
    } else {
      return data.includes(button)
    }
  }
}
