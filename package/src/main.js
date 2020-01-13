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
    let $fid = $('input[name$="[fid]"]', element)
    let $signature = $('input[name$="[signature]"]', element)
    let $url = $('input[name$="[url]"]', element)
    $('<input type="button" value="upload stuff"/>').click(() => {
      let blob = new Blob(['Hello, world!'], { type: 'text/plain' })
      let data = new FormData()
      data.append('files[content]', blob, 'test.wav')
      data.append('id', element.id)
      data.append('form_build_id', form['form_build_id'].value)
      data.append('fid', $fid.val())
      data.append('signature', $signature.val())
      $.ajax({
        type: 'POST',
        url: '/audiofile/ajax',
        data: data,
        processData: false,
        contentType: false,
        success: (data) => {
          $fid.val(data['fid'])
          $signature.val(data['signature'])
          $url.val(data['url'])
        }
      })
    }).appendTo(element)
  })
}
