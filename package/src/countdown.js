/**
 * Countdown class.
 *
 * Binds to an element and renders a countdown for a set time.
 */
export default class Countdown {
  /**
   * Create a new Countdown.
   *
   * @param {jQuery element} $el The countdown element.
   * @param {number} time The time (in milliseconds) to count down.
   */
  constructor ($el, time) {
    // The countdown element.
    this.$el = $el
    this.time = time

    // initialize markup
    this.update(this.time)
  }

  /**
   * Write the time left to the countdown element.
   *
   * @param {number} time The time (in milliseconds) to display.
   */
  update (time) {
    this.time = time

    let minutes = 0
    let seconds = 0

    if (this.time >= 1000) {
      minutes = (this.time % (60 * 60 * 1000)) / (60 * 1000)
      seconds = (this.time % (60 * 1000)) / 1000
    }
    this.$el.html(`${this._format(minutes)}:${this._format(seconds, 2)}`)

    // Add classes for final seconds.
    if (this.time <= 10000) {
      this.$el.addClass('countdown-10')
    }
    else if (this.time <= 30000) {
      this.$el.addClass('countdown-30')
    }
    else if (this.time <= 60000) {
      this.$el.addClass('countdown-60')
    }
  }

  /**
   * Format values for output.
   */
  _format (num, pad = 1) {
    return Math.floor(num).toString().padStart(pad, '0')
  }
}
