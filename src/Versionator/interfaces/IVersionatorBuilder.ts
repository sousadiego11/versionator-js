export interface IVersionatorBuilder {
  hasContents: boolean

  buildFinalContent: () => string
  transformLogs: (output: string) => void
  getLog: () => Promise<string>
  handleFinish: () => Promise<void>
  setHeader: () => Promise<void>
  setNewContent: () => Promise<void>
  setPreviousContent: () => Promise<void>
}
