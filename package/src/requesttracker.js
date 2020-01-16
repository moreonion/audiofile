/* global jQuery */

var $ = jQuery

/**
 * RequestTracker class.
 *
 * Keeps track of AJAX request for a widget and allows only one active request.
 */
export default class RequestTracker {
  /**
   * Create a new RequestTracker.
   *
   * @param {element} el The widget element.
   */
  constructor (el) {
    // The widget element.
    this.el = el
    // The currently active request.
    this.active = null
  }

  /**
   * Tracks a new request (aborting previous ones).
   *
   * @param {XMLHttpRequest} request A new request.
   */
  track (request) {
    if (this.active) {
      this.active.abort()
    }
    $(this.el).trigger('request:start', request)
    this.active = request
  }

  /**
   * Stops tracking the currently active request.
   *
   * @param {string} status The status of the completed request.
   */
  done (status) {
    if (this.active) {
      $(this.el).trigger('request:end', this.active, status)
      this.active = null
    }
  }

  /**
   * Aborts the currently active request.
   */
  abort () {
    if (this.active) {
      this.active.abort()
      this.done('abort')
    }
  }
}
