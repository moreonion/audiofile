<?php

/**
 * @file
 * Webform component plugin callbacks.
 *
 * The webform component is mainly based on the file component.
 */

use Drupal\little_helpers\ArrayConfig;

/**
 * Default configuration for audiofile components.
 */
function _webform_defaults_audiofile() {
  // If private file storage is enabled, make it the default for security
  // reasons. See: https://www.drupal.org/psa-2016-003
  $available_schemes = file_get_stream_wrappers(STREAM_WRAPPERS_WRITE_VISIBLE);
  $scheme = isset($available_schemes['private']) ? 'private' : 'public';

  return [
    'name' => '',
    'form_key' => NULL,
    'required' => 0,
    'pid' => 0,
    'weight' => 0,
    'extra' => [
      'filtering' => [
        'types' => ['wav', 'webm', 'ogg'],
        'addextensions' => '',
        'size' => '2 MB',
      ],
      'rename' => '',
      'scheme' => $scheme,
      'directory' => '',
      'title_display' => 0,
      'description' => '',
      'description_above' => FALSE,
      'attributes' => array(),
      'private' => FALSE,
      'analysis' => FALSE,
    ],
  ];
}


/**
 * Configuration form for the audiofile component.
 */
function _webform_edit_audiofile($component) {
  ArrayConfig::mergeDefaults($component, _webform_defaults_audiofile());

  // As we want to use parts of the file component’s edit form we need all its
  // defaults too.
  ArrayConfig::mergeDefaults($component, webform_component_invoke('file', 'defaults'));
  // Get the file edit form. Create a copy of the
  $edit_file = webform_component_invoke('file', 'edit', $component);

  $form['validation']['size'] = $edit_file['validation']['size'];

  unset($edit_file['validation']['extensions']['types']);
  $form['validation']['extensions'] = $edit_file['validation']['extensions'];
  $current_types = $component['extra']['filtering']['types'] ?? $component['extra']['filtering']['types'];
  $types = ['mp3', 'ogg', 'wav', 'webm'];
  $form['validation']['extensions']['types']['audio'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Audio'),
    '#options' => drupal_map_assoc($types),
    '#default_value' => array_intersect($current_types, $types),
  );
  $form['validation']['extensions']['addextensions'] = $edit_file['validation']['extensions']['addextensions'];

  $form['extra']['scheme'] = $edit_file['extra']['scheme'];
  $form['extra']['directory'] = $edit_file['extra']['directory'];
  return $form;
}

/**
 * Implements _webform_render_component().
 */
function _webform_render_audiofile($component, $value = NULL, $filter = TRUE, $submission = NULL) {
  $node = isset($component['nid']) ? node_load($component['nid']) : NULL;

  // Cap the upload size according to the PHP limit.
  $max_filesize = parse_size(file_upload_max_size());
  $set_filesize = $component['extra']['filtering']['size'];
  if (!empty($set_filesize) && parse_size($set_filesize) < $max_filesize) {
    $max_filesize = parse_size($set_filesize);
  }

  if ($filter) {
    $component['extra']['directory'] = drupal_strtolower(webform_replace_tokens($component['extra']['directory'], $node, $submission));
    $component['extra']['description'] = webform_filter_descriptions($component['extra']['description'], $node, $submission);
  }
  $element = [
    '#type' => 'audiofile',
    '#title' => $filter ? webform_filter_xss($component['name']) : $component['name'],
    '#title_display' => $component['extra']['title_display'] ? $component['extra']['title_display'] : 'before',
    '#required' => $component['required'],
    '#default_value' => isset($value[0]) ? $value[0] : NULL,
    '#attributes' => $component['extra']['attributes'],
    '#upload_validators' => [
      'file_validate_size' => array($max_filesize),
      'file_validate_extensions' => array(implode(' ', $component['extra']['filtering']['types'])),
    ],
    '#pre_render' => ['webform_file_allow_access'],
    '#upload_location' => $component['extra']['scheme'] . '://webform/' . $component['extra']['directory'],
    '#description' => $component['extra']['description'],
    '#weight' => $component['weight'],
    '#theme_wrappers' => ['container', 'webform_element'],
    '#translatable' => ['title', 'description'],
  ];

  if ($filter) {
    $element['#description'] = theme('file_upload_help', [
      'description' => $element['#description'],
      'upload_validators' => $element['#upload_validators'],
    ]);
  }

  return $element;
}

/**
 * Implements _webform_submit_component().
 */
function _webform_submit_audiofile($component, $value) {
  return webform_component_invoke('file', 'submit', $component, $value);
}

/**
 * Implements _webform_display_component().
 */
function _webform_display_audiofile($component, $value, $format = 'html', $submission = []) {
  return webform_component_invoke('file', 'display', $component, $value, $format, $submission);
}

/**
 * Implements _webform_delete_component().
 */
function _webform_delete_audiofile($component, $value) {
  return webform_component_invoke('file', 'delete', $component, $value);
}

/**
 * Implements _webform_attachments_component().
 */
function _webform_attachments_audiofile($component, $value) {
  return webform_component_invoke('file', 'attachments', $component, $value);
}

/**
 * Implements _webform_analysis_component().
 */
function _webform_analysis_audiofile($component, $sids = [], $single = FALSE, $join = NULL) {
  return webform_component_invoke('file', 'analysis', $component, $sids, $single, $join);
}

/**
 * Implements _webform_csv_headers_component().
 */
function _webform_csv_headers_audiofile($component, $export_options) {
  return webform_component_invoke('file', 'csv_headers', $component, $export_options);
}

/**
 * Implements _webform_csv_data_component().
 */
function _webform_csv_data_audiofile($component, $export_options, $value) {
  return webform_component_invoke('file', 'csv_headers', $component, $export_options, $value);
}

/**
 * Implements _webform_form_builder_map_<webform-component>().
 */
function _webform_form_builder_map_audiofile() {
  return [
    'form_builder_type' => 'audiofile',
    'properties' => [
      'webform_file_extensions' => [
        'form_parents' => ['validation', 'extensions'],
        'storage_parents' => ['extra', 'filtering'],
      ],
      'webform_file_size' => [
        'form_parents' => ['validation', 'size'],
        'storage_parents' => ['extra', 'filtering', 'size'],
      ],
      'webform_file_directory' => [
        'form_parents' => ['extra', 'directory'],
        'storage_parents' => ['extra', 'directory'],
      ],
      'webform_file_scheme' => [
        'form_parents' => ['extra', 'scheme'],
        'storage_parents' => ['extra', 'scheme'],
      ],
    ],
  ];
}
