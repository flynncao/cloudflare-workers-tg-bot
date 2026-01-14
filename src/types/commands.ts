export default interface Command {
  command: string
  description: string
  handler: (ctx: any) => void
}
