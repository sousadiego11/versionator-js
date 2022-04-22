export interface IContentBuilder {

  feats: string[]
  fixes: string[]
  refactors: string[]
  docums: string[]
  chores: string[]
  perfs: string[]
  tests: string[]

  feat(e: string): void
  fix(e: string): void
  refactor(e: string): void
  docs(e: string): void
  chore(e: string): void
  perf(e: string): void
  test(e: string): void

  build: (request: IContentBuilder.BuildRequest) => string
  buildCommits: (commits: string[]) => IContentBuilder.Commit[]
}

export namespace IContentBuilder {
  export type BuildRequest = {
    body: string
    tag: string
    issue: string
    date: string
    author: string
  }
  export type Commit = BuildRequest & { type: string, target: string }
}
