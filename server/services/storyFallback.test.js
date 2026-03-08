import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFallbackScenes } from './storyFallback.js';

test('buildFallbackScenes creates an opening scene with choices', () => {
  const scenes = buildFallbackScenes({
    emotion: 'hope',
    outputMode: 'judge_en',
    stage: 'opening',
    sceneNumber: 1,
  });

  assert.equal(scenes.length, 1);
  assert.equal(scenes[0].scene_id, 'fallback_scene_1');
  assert.equal(scenes[0].interleaved_blocks.length, 3);
  assert.equal(scenes[0].choices.length, 2);
});

test('buildFallbackScenes can produce a final scene without choices', () => {
  const scenes = buildFallbackScenes({
    emotion: 'wonder',
    outputMode: 'judge_en',
    stage: 'continue',
    sceneNumber: 7,
    allowFinalEnding: true,
  });

  assert.equal(scenes[0].choices.length, 0);
  assert.equal(scenes[0].audio_mood, 'triumphant_rise');
});

