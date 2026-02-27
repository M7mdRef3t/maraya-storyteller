import { z } from 'zod';

export const StartStorySchema = z.object({
  type: z.literal('start_story'),
  output_mode: z.string().optional(),
  emotion: z.string().optional(),
  image: z.string().optional(),
  mimeType: z.string().optional(),
}).strict();

export const ChooseSchema = z.object({
  type: z.literal('choose'),
  output_mode: z.string().optional(),
  choice_text: z.string().optional(),
  emotion_shift: z.string().optional(),
}).strict();

export const MessageSchema = z.discriminatedUnion('type', [
  StartStorySchema,
  ChooseSchema,
]);
