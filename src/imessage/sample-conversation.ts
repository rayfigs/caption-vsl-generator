import type { Message } from './types'

export const sampleConversation: Message[] = [
  { id: '1', type: 'received', text: 'hey', duration: 30, typingDuration: 20 },
  { id: '2', type: 'sent', text: 'hey, you up?', duration: 40 },
  { id: '3', type: 'received', text: 'yeah', duration: 30, typingDuration: 15 },
]
