<?php

namespace Drupal\audiofile;

/**
 * Form-API element helper functions.
 */
class Element {

  /**
   * Sign a file id.
   *
   * @param int|string $fid
   *   The file ID to sign.
   *
   * @return string
   *   The signature.
   */
  public static function signFid($fid) {
    return drupal_hmac_base64("audiofile:fid:$fid", drupal_get_private_key());
  }

  /**
   * Check whether a signature is valid for a fid.
   *
   * @param int|string $fid
   *   The file ID.
   * @param string $signature
   *   The signature to check.
   *
   * @return bool
   *   TRUE if the signature is valid for this ID, otherwise FALSE.
   */
  public static function checkSignature($fid, $signature) : bool {
    if (static::signFid($fid) != $signature) {
      watchdog('audiofile', 'Invalid fid signature for: "@fid/@signed_fid"', ['@fid' => $fid, '@signed_fid' => $signature], WATCHDOG_WARNING);
      return FALSE;
    }
    return TRUE;
  }

}
