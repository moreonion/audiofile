/* global jQuery */

import {
  startHTML,
  recordingHTML,
  playerHTML,
  submittedHTML,
  notAllowedErrorHTML
} from './template'

const $ = jQuery

/**
 * Audiofile class.
 *
 * Binds to a wrapper element and controls the markup of the `.audiofile-inner`
 * container.
 *
 * Can be rendered in different states: initial, recording, playing,
 * submitting, and error.
 */
class Audiofile {
  /**
   * Create a new Audiofile widget.
   *
   * @param {jQuery element} $wrapper The wrapper element.
   * @param {string} state State to start with. Might need some config before
   * binding.
   */
  constructor ($wrapper, state = 'initial') {
    // The audiofile wrapper, which also includes Drupal AJAX/FAPI specific
    // information, like the FID.
    this.$wrapper = $wrapper
    // The render state of this widget.
    this.state = state
    // The MediaStream, once microphone access was granted.
    this.stream = null
    // The MediaRecorder associated to the MediaStream.
    this.recorder = null
    // The state of the MediaRecorder (for convenience). This basically is the
    // same as this.recorder.state.
    this.recorderState = null
    // The media type of the recording. This differs from browsers.
    // It's `audio/ogg` for native recording of Firefox, `audio/webm` for
    // Chrome, and `audio/wav` if the polyfill is used.
    this.mediaType = null
    // Whether the users approved the recording for submission.
    this.recordingApproved = false

    // Internal store for (time-)sliced recorder chunks.
    this._recordedChunks = []
    // The resulting Blob of the recording. type set to this.mediaType.
    this._recordedBlob = null
    // Data URL of the Blob.
    this._recordingURL = null
  }
  /**
   * Bind the Audiofile to a wrapper.
   *
   * Might need so config before binding, depending on the state the widget
   * should be started with.
   */
  bind () {
    let $widget = this.$wrapper.find('.audiofile-widget')
    if ($widget.length === 0) {
      $widget = $('<div.audiofile-widget></div>')
      this.$wrapper.append($widget)
    }
    // Substitute placeholder text of non-JS notice.
    $widget.html('<div>Enabled</div>')

    // Handle 'start' control.
    // Triggers the mic request and starts the recording.
    // See below.
    $widget.on('click', '.control-start', () => {
      // Ensure we have access to the mic.
      this.requestMic()
    })
    // Handle 'stop' control.
    // Triggers the stop handler of the recorder which save the Blob.
    $widget.on('click', '.control-stop', () => {
      this.recorder.stop()
    })
    // Handle 'submit' control.
    // Approves a recording.
    // NB: this might change depending on further development.
    $widget.on('click', '.control-submit', (e) => {
      e.preventDefault()
      this.recordingApproved = true
      this.transitionTo('submitting')
    })
    // Handle 'reset' control.
    // Clear Blob, go back to initial state to start over.
    $widget.on('click', '.control-reset', (e) => {
      e.preventDefault()
      this._recordedBlob = null
      this._recordingURL = null
      this.recordingApproved = false

      this.transitionTo('initial')
    })

    // Start with the requested state.
    this.transitionTo(this.state)
  }
  /**
   * Return audio recording as Blob.
   * Or null if none available yet.
   */
  getBlobData () {
    return this._recordedBlob
  }
  /**
   * Return the filename for use in Downloads or FormData.
   *
   * @param {string} filenameBase Basename of file.
   */
  getFilename (filenameBase = 'audiofile') {
    // Determine filename by media type of recording.
    let filename = filenameBase
    if (this.mediaType === 'audio/wav') {
      filename = filenameBase + '.wav'
    }
    else if (this.mediaType.indexOf('audio/ogg') >= 0) {
      filename = filenameBase + '.ogg'
    }
    else if (this.mediaType.indexOf('audio/webm') >= 0) {
      filename = filenameBase + '.webm'
    }
    return filename
  }
  /**
   * Transition widget to next state.
   *
   * This calls the render functions.
   * Not all transitions are allowed. It depends on the current state.
   *
   * @param {string} newState State to transition to.
   * @param {object} context Arbitrary data, usable in render function.
   */
  transitionTo (newState, context = {}) {
    let markup = ''

    if (newState === 'initial') {
      markup = this.renderInitial()
    }
    else if (newState === 'recording' && ['initial', 'playing', 'error'].includes(this.state)) {
      markup = this.renderRecording()
    }
    else if (newState === 'playing' && ['recording'].includes(this.state)) {
      markup = this.renderPlaying()
    }
    else if (newState === 'submitting' && ['playing'].includes(this.state)) {
      markup = this.renderSubmitting()
    }
    else if (newState === 'error') {
      markup = this.renderError(newState, context)
    }
    else {
      console.warn('[audiofile]', `Cannot transition from "${this.state}" to "${newState}".`)
      markup = this.renderError(newState, context)
      newState = 'error'
    }

    this.state = newState
    this.$wrapper.find('.audiofile-widget').html(markup)
  }
  /**
   * Render function for state 'initial'.
   */
  renderInitial () {
    return $(startHTML)
  }
  /**
   * Render function for state 'recording'.
   */
  renderRecording () {
    return $(recordingHTML)
  }
  /**
   * Render function for state 'playing'.
   */
  renderPlaying () {
    const $markup = $(playerHTML)
    $markup.filter('audio').prop('src', this._recordingURL)
    return $markup
  }
  /**
   * Render function for state 'submitting'.
   */
  renderSubmitting () {
    const $markup = $(submittedHTML)
    $markup.find('a').prop('href', this._recordingURL)
    $markup.find('a').prop('download', this.getFilename())
    return $markup
  }
  /**
   * Render function for state 'error'.
   *
   * @param {string} state The state which triggered the error
   * @param {object} error An error object with `name` and `message`
   * properties.
   */
  renderError (state, error = {}) {
    let $markup = $(`<div>Error</div>`)
    if (error['name'] === 'NotAllowedError') {
      $markup = $(notAllowedErrorHTML)
    }
    else if (error.name && error.message) {
      $markup = $(`<div>${error.name}: ${error.message}</div>`)
    }
    return $markup
  }
  /**
   * Request the microphone from the user.
   *
   * If successful starts the recording.
   * If failed renders an error.
   */
  requestMic () {
    if (typeof navigator.mediaDevices === 'undefined') {
      this.transitionTo('error', { name: 'Error', message: 'No access to media devices. Maybe not working in a secure context.' })
    }
    else {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => this.handleMicRequestSuccess(stream))
        .catch(err => this.handleMicRequestError(err))
    }
  }
  /**
   * Handle a successful microphone request.
   *
   * Save the stream and recorder in properties.
   * Starts the recording.
   * Does the recorder event handling setup.
   *
   * @param {MediaStream} stream The media stream.
   */
  handleMicRequestSuccess (stream) {
    this.stream = stream
    this.recorder = new MediaRecorder(this.stream)

    // Deal with available media stream data from the recorder.
    this.recorder.addEventListener('dataavailable', (e) => {
      // Save actual media type of recording.
      if (!this.mediaType) {
        this.mediaType = e.data.type
      }
      if (e.data.size > 0) {
        this._recordedChunks.push(e.data)
      }
    })
    // Handle 'start' event of MediaRecorder.
    // Dummy handler.
    this.recorder.addEventListener('start', () => {
      this.recorderState = this.recorder.state
    })
    // Handle 'stop' event of MediaRecorder.
    this.recorder.addEventListener('stop', () => {
      this.recorderState = this.recorder.state

      this._recordedBlob = new Blob(this._recordedChunks, { 'type': this.mediaType })
      this._recordingURL = URL.createObjectURL(this._recordedBlob)
      // Reset chunks for next recording.
      this._recordedChunks = []

      // Release the mic again.
      this.releaseMic()

      this.transitionTo('playing')
    })
    // Handle 'pause' event of MediaRecorder.
    // Dummy handler.
    this.recorder.addEventListener('pause', () => {
      this.recorderState = this.recorder.state
    })
    // Handle 'resume' event of MediaRecorder.
    // Dummy handler.
    this.recorder.addEventListener('resume', () => {
      this.recorderState = this.recorder.state
    })

    // start recording immediatly
    this.recorder.start()

    this.transitionTo('recording')
  }
  /**
   * Handle failed microphone request.
   *
   * For possible errors see
   * https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
   *
   * @param {object} err The error object.
   */
  handleMicRequestError (err) {
    this.transitionTo('error', { name: err.name, msg: err.message })
  }
  /**
   * Release the microphone again.
   *
   * Depending on whether the browser/user remembers the decision, a subsequent
   * microphone request might not prompt the user again.
   */
  releaseMic () {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
    }
    this.stream = null
  }
}

export { Audiofile }
