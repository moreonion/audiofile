<?php

namespace Drupal\audiofile;

use Upal\DrupalUnitTestCase;

/**
 * Test the form-API element helper functions.
 */
class ElementTest extends DrupalUnitTestCase {

  /**
   * Test that signing then parsing gives the same fid again.
   */
  public function testSignAndCheck() {
    $fid = 12;
    $this->assertTrue(Element::checkSignature($fid, Element::signFid($fid)));
  }

  /**
   * Test that manipulated fids give empty return values.
   */
  public function testParseManipulated() {
    $signature = Element::signFid(12);
    $this->assertFalse(Element::checkSignature(13, $signature));
  }

}
