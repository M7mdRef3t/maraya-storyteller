import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSpaceAnalysisPrompt, buildStorytellerPrompt } from './storyteller.js';

test('buildStorytellerPrompt defaults', () => {
  const prompt = buildStorytellerPrompt('hope');
  
  assert.match(prompt, /Mode: Judge Mode \(English\)/);
  assert.match(prompt, /Generate exactly 1 opening scene/);
  assert.match(prompt, /All scenes in this response are non-final/);
  assert.match(prompt, /Emotion \(EN\): Hope/);
  assert.match(prompt, /SYMBOLIC CONTINUITY/);
  assert.match(prompt, /SPACE BECOMES MYTH/);
  assert.match(prompt, /symbolic_anchor/);
  assert.match(prompt, /ritual_phase/);
  assert.match(prompt, /mythic_echo/);
});

test('buildStorytellerPrompt with isFollowUp=true', () => {
  const prompt = buildStorytellerPrompt('hope', true);
  
  assert.match(prompt, /Generate exactly 1 follow-up scene/);
  assert.match(prompt, /Continue naturally from the previous scene/);
});

test('buildStorytellerPrompt with allowFinalEnding=true', () => {
  const prompt = buildStorytellerPrompt('hope', false, 'judge_en', true);
  
  assert.match(prompt, /Only the true ending scene may have empty choices/);
});

test('buildStorytellerPrompt with outputMode=ar_fusha', () => {
  const prompt = buildStorytellerPrompt('hope', false, 'ar_fusha');
  
  assert.match(prompt, /Mode: Arabic Fusha/);
  assert.match(prompt, /اكتب بالعربية الفصحى/);
});

test('buildStorytellerPrompt with emotion=anxiety', () => {
  const prompt = buildStorytellerPrompt('anxiety');
  
  assert.match(prompt, /Emotion \(EN\): Anxiety/);
  assert.match(prompt, /Brutalist/);
});

test('buildSpaceAnalysisPrompt requests mythic room reading continuity', () => {
  const prompt = buildSpaceAnalysisPrompt('judge_en');

  assert.match(prompt, /mythic reading/i);
  assert.match(prompt, /symbolic world/i);
  assert.match(prompt, /"mythic_reading"/);
});
