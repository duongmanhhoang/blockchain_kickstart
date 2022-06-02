const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const {
  abi: factoryAbi,
  evm: factoryEvm,
} = require("../blockChainBuilds/builds/CampaignFactory.json");
const {
  abi: campaignAbi,
  evm: campaignEvm,
} = require("../blockChainBuilds/builds/Campaign.json");

let accounts, factory, campaignAddress, campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  factory = await new web3.eth.Contract(factoryAbi)
    .deploy({
      data: factoryEvm.bytecode.object,
    })
    .send({ from: accounts[0], gas: '6000000' });

  await factory.methods
    .createCampaign("100")
    .send({ from: accounts[0], gas: '6000000' });

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  campaign = await new web3.eth.Contract(campaignAbi)
    .deploy({
      data: campaignEvm.bytecode.object,
      arguments: ['100', accounts[0]],
    })
    .send({ from: accounts[0], gas: '6000000' });
});

describe('Campaigns', () => {
  it('Deploys a factory and a campaign', () => {
    assert.ok(factory.options.address)
    assert.ok(campaign.options.address)
  })

  it('Marks caller as the campaign manager', async () => {
    const managerAddress = await campaign.methods.manager().call()
    assert.equal(managerAddress, accounts[0])
  })

  it('Allows people to contribute and marks them as contributers', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200'
    })

    const isContributer = await campaign.methods.contributers(accounts[1])
    assert(isContributer)
  })

  it('Require minimum contribution', async() => {
    try {
      await campaign.methods.contribute().send({
        from: accounts[1],
        value: '300'
      })
      assert(false)
    } catch (err) {
      assert(err)
    }
  })

  it('Manager can make request', async () => {
    await campaign.methods.createRequest('Buy mechkeyboard', 300, accounts[1]).send({
      from: accounts[0],
      gas: '6000000'
    })

    const request = await campaign.methods.requests(0).call()
    assert.equal('Buy mechkeyboard', request.description)
  })

  it('Proccess request', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: web3.utils.toWei('10', 'ether')
    })

    await campaign.methods.createRequest('Buy mechkeyboard',  web3.utils.toWei('5', 'ether'), accounts[0]).send({
      from: accounts[0],
      gas: '6000000'
    })

    await campaign.methods.approveRequest(0).send({
      from: accounts[1],
      gas: '6000000'
    })

    
    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: '6000000'
    })

    let balance = await web3.eth.getBalance(accounts[0])
    balance = parseFloat(web3.utils.fromWei(balance, 'ether'))
    assert(balance > 100)
  })
})