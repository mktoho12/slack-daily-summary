import { App } from '@slack/bolt'
import { fromUnixTime, isSameDay, parse } from 'date-fns'
import { configDotenv } from 'dotenv'
import { analyzeMessages } from './analyzeMessages'
import { filterMessagesByUserOnly } from './filterMessageByUserOnly'
import { formatChannelSummary } from './formatChannelSummary'

configDotenv()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN!,
})

app.event('app_mention', async ({ event, say, client }) => {
  console.log('received app_mention event')

  try {
    const match = event.text.match(/(\d{4}年\d{1,2}月\d{1,2}日)/)

    if (!match) {
      await say({
        channel: event.channel,
        text: '日付を指定してください！（例: 2025年3月16日）',
      })
      return
    }

    const targetDate = parse(
      match[1].replace(/年|月/g, '-').replace('日', ''),
      'yyyy-MM-dd',
      new Date()
    )
    const channel = event.channel
    const messages = await fetchMessages(client, channel, targetDate)
    const summary = analyzeMessages(messages)

    await say({
      channel: channel,
      ...formatChannelSummary(summary),
    })
  } catch (error) {
    console.error(error)
  }
})

async function fetchMessages(
  client: Parameters<Parameters<typeof app.event>[1]>[0]['client'],
  channel: string,
  date: Date
) {
  let messages: {
    // @slack/web-apiで定義されている型とAPIレスポンスが一致しないため
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }[] = []
  let cursor: string | undefined

  do {
    const response = await client.conversations.history({
      channel,
      cursor,
      limit: 100,
    })

    const rawMessages = (response.messages ?? [])
      .filter(filterMessagesByUserOnly)
      .filter(m => isSameDay(fromUnixTime(Number(m.ts)), date))
    messages = messages.concat(rawMessages)
    cursor = response.response_metadata?.next_cursor
  } while (cursor)

  return messages
}

;(async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ Slack bot is running!')
})()
