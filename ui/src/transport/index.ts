/**
 * No-op transport stub for open-qa.
 * The pixel-agents OfficeCanvas imports transport to persist seat assignments.
 * In open-qa we persist via localStorage, so all sends are no-ops.
 */

type MessageHandler = (msg: unknown) => void

const noop = () => {}

export const transport = {
  send: noop,
  onMessage: (_handler: MessageHandler) => noop,
}
