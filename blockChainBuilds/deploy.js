const HDWalletProvider = require("@truffle/hdwallet-provider");
provider = new HDWalletProvider(
  "soap better code morning unveil clump fine age march caution celery rebuild",
  "https://rinkeby.infura.io/v3/e32db711ba694fff94160caa9c40a8df"
);
const Web3 = require("web3");
const web3 = new Web3(provider);
const {
  abi: factoryAbi,
  evm: factoryEvm,
} = require("./builds/CampaignFactory.json");
const {
  abi: campaignAbi,
  evm: campaignEvm,
} = require("./builds/Campaign.json");

const deploy = async () => {
  let factory, campaignAddress, campaign;

  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  factory = await new web3.eth.Contract(factoryAbi)
    .deploy({
      data: factoryEvm.bytecode.object,
    })
    .send({ from: accounts[0], gas: "6000000" });

  await factory.methods
    .createCampaign("100")
    .send({ from: accounts[0], gas: "6000000" });

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  campaign = await new web3.eth.Contract(campaignAbi)
    .deploy({
      data: campaignEvm.bytecode.object,
      arguments: ["100", accounts[0]],
    })
    .send({ from: accounts[0], gas: "6000000" });
  console.log("Contract factory deployed to", factory.options.address);
  console.log("Contract campagin deployed to", campaign.options.address);
  provider.engine.stop();
};
deploy();
