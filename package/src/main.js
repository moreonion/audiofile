/* global Drupal, jQuery */

import MediaRecorder from 'audio-recorder-polyfill'
import { Audiofile } from './audiofile'
import RequestTracker from './requesttracker'

var $ = jQuery

// Use polyfill if MediaRecorder is not known
if (typeof window.MediaRecorder === 'undefined') {
  window.MediaRecorder = MediaRecorder
}

Drupal.behaviors.audiofile = {}
Drupal.behaviors.audiofile.attach = function (context, settings) {
  $('.audiofile-recorder', context).each((id, element) => {
    let form = $(element).closest('form').get(0)
    let $fid = $('input[name$="[fid]"]', element)
    let $signature = $('input[name$="[signature]"]', element)
    let $url = $('input[name$="[url]"]', element)
    let $submitButtons = $('[type="submit"]:enabled', form)

    let requestTracker = new RequestTracker(element)
    let widget = new Audiofile($(element))
    widget.bind($url.val() ? 'playing' : 'initial')

    $(element).on('audiofile:recorded', (event, blob) => {
      let data = new FormData()
      data.append('files[content]', blob, widget.getFilename())
      data.append('id', element.id)
      data.append('form_build_id', form['form_build_id'].value)
      data.append('fid', $fid.val())
      data.append('signature', $signature.val())
      requestTracker.track($.ajax({
        type: 'POST',
        url: '/audiofile/ajax',
        data: data,
        processData: false,
        contentType: false,
        success: (data) => {
          $fid.val(data['fid'])
          $signature.val(data['signature'])
          $url.val(data['url'])
        },
        complete: (data, status) => {
          requestTracker.done()
        }
      }))
    })

    $(element).on('audiofile:reset', (event) => {
      requestTracker.abort()
      $fid.val('')
      $signature.val('')
      $url.val('')
    })

    // Disable submit button during file upload.
    $(element).on('request:start', (event, data) => {
      $submitButtons.prop('disabled', true)
    })
    $(element).on('request:end', (event, data) => {
      $submitButtons.prop('disabled', false)
    })
  })
}
