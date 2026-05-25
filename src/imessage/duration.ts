import type { Message } from './types'

const END_PADDING_FRAMES = 60

export const calculatePreSendDelay = (message: Message): number => {
  return Math.min(
    message.duration,
    message.text?.length ? message.text.length * 2 + 10 : 30
  )
}

export const calculateConversationDuration = (conversation: Message[]): number => {
  return conversation.reduce((total, message) => {
    const activityLeadIn =
      message.type === 'received' ? (message.typingDuration ?? 0) : calculatePreSendDelay(message)
    return total + activityLeadIn + message.duration
  }, END_PADDING_FRAMES)
}
