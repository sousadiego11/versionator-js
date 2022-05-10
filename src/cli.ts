#!/usr/bin/env node
import { Versionator, VersionatorBuilder } from './Versionator'

const builder = new VersionatorBuilder()
new Versionator(builder).build()
