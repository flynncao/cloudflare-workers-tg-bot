export default interface Command {
  command: string
  aliases?: string[]
  description: string
  handler: (ctx: any) => void
}
