type MessageElement = {
  bot_id?: string
  app_id?: string
  bot_profile?: object
  subtype?: string
}

export const filterMessagesByUserOnly = (message: MessageElement): boolean =>
  // ユーザーが存在する（Botの発言を除外）
  !message.bot_id &&
  !message.app_id &&
  !message.bot_profile &&
  // subtypeがない（join/leaveなどのシステム通知を除外）
  !message.subtype
