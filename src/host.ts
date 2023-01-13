import { ModuleHost } from 'cordette'
import secrets from './secrets'

export default new ModuleHost(secrets.token, secrets.clientId)
