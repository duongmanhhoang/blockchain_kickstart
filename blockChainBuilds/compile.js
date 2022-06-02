const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const contractFileName = "Campaign.sol";
const buildPath = path.resolve(__dirname, "builds");
fs.removeSync(buildPath);
const contractPath = path.resolve(__dirname, "contracts", contractFileName);

const content = fs.readFileSync(contractPath, "utf8");
const input = {
  language: "Solidity",
  sources: {
    [contractFileName]: {
      content,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));
fs.ensureDirSync(buildPath);

for (let contractName in output.contracts[contractFileName]) {
  fs.outputJSONSync(
    path.resolve(buildPath, `${contractName}.json`),
    output.contracts[contractFileName][contractName]
  );
}
