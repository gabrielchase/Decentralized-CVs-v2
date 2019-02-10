const IPFS = require('ipfs-api')
let ipfs = new IPFS('ipfs.infura.io', '5001', { protocol: 'https' })

export default ipfs
