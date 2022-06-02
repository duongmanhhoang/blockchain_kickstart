import web3 from './web3'
import CampaignFactory from '../blockChainBuilds/builds/CampaignFactory.json'

const contract = new web3.eth.contract(CampaignFactory.abi, '0x64E7dA76d655d452d8A87bfAE9eb66d5e95Dac44')

export default contract
