import configCommon from './common.json'
// Using `require` as `import` does not support dynamic loading (yet).
const configEnv = require(`./${process.env.NODE_ENV}.json`)
// require('dotenv').config();

// Accepting React env vars and aggregating them into `config` object.
const envVarNames = [
  'REACT_APP_PROVIDER_SOCKET',
  'REACT_APP_ARWEAVE_HTTP',
  'REACT_APP_SUBQUERY_HTTP',
  'REACT_APP_ARWEAVE_EXPLORE',
  'REACT_APP_POLKADOT_EXPLORE',
  'REACT_APP_OCT_EXPLORER',
  'REACT_APP_API_ATOCHA_URL',
  'REACT_APP_APP_ATOCHA_URL',
]
const envVars = envVarNames.reduce((mem, n) => {
  // Remove the `REACT_APP_` prefix
  if (process.env[n] !== undefined) mem[n.slice(10)] = process.env[n]
  return mem
}, {})

const config = { ...configCommon, ...configEnv, ...envVars }
export default config
