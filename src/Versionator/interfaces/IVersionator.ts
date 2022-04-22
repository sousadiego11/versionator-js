export interface IVersionator {
  build: () => Promise<void>
}
