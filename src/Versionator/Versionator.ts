import { terminalHandler } from '../utils/terminalHandler.js'
import { IVersionator } from './interfaces/IVersionator.js'
import { IVersionatorBuilder } from './interfaces/IVersionatorBuilder.js'

export class Versionator implements IVersionator {
  // eslint-disable-next-line no-useless-constructor
  constructor (private readonly versionatorBuilder: IVersionatorBuilder) {}

  async build () {
    const configuredWorkspace = await terminalHandler()

    if (configuredWorkspace) {
      await this.versionatorBuilder.setNewContent()
      await this.versionatorBuilder.setPreviousContent()
      await this.versionatorBuilder.handleFinish()
    }
  }
}
