/**
 * HTML template strings.
 *
 * Collects all JS generated HTML in one place.
 */

export const startHTML = `<div class="control icon-start control-start"></div>`

export const recordingHTML = `<div class="control icon-stop control-stop"></div>`

export const playerHTML = `<div>Check and <a href="" class="control-submit">submit</a></div><audio id="player" controls preload="metadata"></audio><div><a href="" class="control-reset">Or start again?</a></div>`

export const submittedHTML = `<div>Submitted. <a href="">Download</a></div>`

export const notAllowedErrorHTML = `<div>Please ensure you have allowed using the microphone.</div><div class="control-start">Request again…</div>`
