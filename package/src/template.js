/* global Drupal */

/**
 * HTML template strings.
 *
 * Collects all JS generated HTML in one place.
 */

/* ------------ icons ---------------------------------------------- */

/**
 * License for mic SVG below:
 * Font Awesome Free 5.2.0 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 */
const micSVG = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 352 512"
>
  <path
    id="micIcon"
    fill="currentColor"
    d="M176 352c53.02 0 96-42.98 96-96V96c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96zm160-160h-16c-8.84 0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 376.89 48 317.11 48 250.3V208c0-8.84-7.16-16-16-16H16c-8.84 0-16 7.16-16 16v40.16c0 89.64 63.97 169.55 152 181.69V464H96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16h-56v-33.77C285.71 418.47 352 344.9 352 256v-48c0-8.84-7.16-16-16-16z"
  />
</svg>`

const stopSVG = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 10 10"
>
  <rect x="2" y="2" width="6" height="6" fill="currentColor" id="stopIcon" />
</svg>`

/* ------------ views ---------------------------------------------- */

export const startHTML = `<button type="button" class="control icon-start control-start">${micSVG}</button>
<p>${Drupal.t('Start recording<')}/p>`

export const recordingHTML = `<button type="button" class="control icon-stop control-stop">${stopSVG}</button>
<p><span class="icon-countdown" aria-hidden="true">${micSVG}&ensp;</span>${Drupal.t('!countdown minutes left', { '!countdown': '<span class="countdown">5:00</span>' })}</p>`

export const playerHTML = `<p><a href="" class="control-reset">${Drupal.t('Delete and start again')}</a></p>
<audio id="player" controls preload="metadata"></audio>
<p>${Drupal.t('Play back and check')}</p>`

export const defaultErrorHTML = `<p>${Drupal.t('There seems to be a problem with the microphone. Please ensure that there is a microphone connected and it is enabled on your device.')}</p>
<button type="button" class="control-start">${Drupal.t('Request again…')}</button>`

export const notFoundErrorHTML = `<p>${Drupal.t('Please ensure that there is a microphone connected.')}</p>
<button type="button" class="control-start">${Drupal.t('Request again…')}</button>`

export const notAllowedErrorHTML = `<p>${Drupal.t('Please ensure you have allowed using the microphone.')}</p>
<button type="button" class="control-start">${Drupal.t('Request again…')}</button>`

export const uploadMessageHTML = `<p class="uploading">${Drupal.t('Uploading…')}</p>`

export const uploadErrorHTML = `<p class="upload-error">${Drupal.t('There was a problem uploading your message. Please try recording again.')}</p>`
