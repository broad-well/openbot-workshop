const secrets = {
  token: '--- PASTE TOKEN HERE ---',
  clientId: '--- PASTE CLIENT ID HERE ---'
}

if (secrets.token.length === 24 || secrets.clientId.length === 28) {
  throw new Error('Please populate secrets.ts with your bot\'s authentication token and client ID!')
}

export default secrets
