import host from './host'
import './hello-world'

host.commitStaged()
  .then(() => host.start())
  .then(() => console.log('cordette module host has started'))
  .catch(console.error)
