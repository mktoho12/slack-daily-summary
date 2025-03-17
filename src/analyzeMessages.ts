type RichTextElement = {
  type: 'channel'
  channel_id: string
}

type RichTextSection = {
  type: 'rich_text_section'
  elements?: RichTextElement[]
}

type Block = {
  type: 'rich_text'
  elements?: RichTextSection[]
}

type Message = {
  blocks?: Block[]
}

export const analyzeMessages = (messages: Message[]): string[][] => {
  if (!messages) return []

  return messages.map(m => {
    if (!m.blocks) return []

    return m.blocks
      .filter(
        b =>
          b.type === 'rich_text' &&
          b.elements?.some(
            e =>
              e.type === 'rich_text_section' &&
              e.elements?.some(pe => pe.type === 'channel')
          )
      )
      .map(b => b.elements ?? [])
      .flat()
      .filter(ae => ae && ae.type === 'rich_text_section')
      .map(ae => ae!.elements ?? [])
      .flat()
      .filter(pe => pe && pe.type === 'channel')
      .map(pe => pe!['channel_id'])
      .filter(channelId => channelId !== undefined)
  })
}
