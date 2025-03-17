type Block = {
  type: 'section'
  text: {
    type: 'mrkdwn'
    text: string
  }
}

type ChannelSummary = {
  blocks: Block[]
  text: string
}

export const formatChannelSummary = (
  channelIds: string[][]
): ChannelSummary => {
  if (
    !Array.isArray(channelIds) ||
    channelIds.some(ids => !Array.isArray(ids))
  ) {
    throw new Error('Invalid input: channelIds must be a 2D array of strings.')
  }

  const channelIdCounts = channelIds.flat().reduce(
    (accm, channelId) => ({
      ...accm,
      [channelId]: (accm[channelId] ?? 0) + 1,
    }),
    {} as Record<string, number>
  )

  const countBlocks = Object.entries(channelIdCounts).map(
    ([key, val]) =>
      ({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `- <#${key}>: ${val}回`,
        },
      } satisfies Block)
  )

  const blocks: Block[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '## 参照されたチャンネル一覧と回数',
      },
    },
    ...countBlocks,
  ]

  return { blocks, text: blocks.map(b => b.text.text).join('\n') }
}
