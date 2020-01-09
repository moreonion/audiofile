/* global Drupal, jQuery */

import MediaRecorder from 'audio-recorder-polyfill'

var $ = jQuery

// Use polyfill if MediaRecorder is not known
if (typeof window.MediaRecorder === 'undefined') {
  window.MediaRecorder = MediaRecorder
}

Drupal.behaviors.audiofile = {}
Drupal.behaviors.audiofile.attach = function (context, settings) {
  $('.audiofile-recorder', context).each((id, element) => {
    let form = $(element).closest('form').get(0)
    $('<input type="button" value="upload stuff"/>').click(() => {
      let blob = new Blob(['Hello, world!'], { type: 'text/plain' })
      let data = new FormData()
      data.append('files[content]', blob, 'test.wav')
      data.append('id', element.id)
      data.append('form_build_id', form['form_build_id'].value)
      $.ajax({
        type: 'POST',
        url: '/audiofile/ajax',
        data: data,
        processData: false,
        contentType: false,
        success: (data) => {
          $('input[name$="[fid]"]', element).val(data['fid'])
          $('input[name$="[url]"]', element).val(data['url'])
        }
      })
    }).appendTo(element)
  })
}
