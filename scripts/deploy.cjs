const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying ZKCertificateRegistry contract to Polygon Amoy Testnet (Chain ID 80002)...");

  const ZKCertificateRegistry = await hre.ethers.getContractFactory("ZKCertificateRegistry");
  const contract = await ZKCertificateRegistry.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✓ ZKCertificateRegistry deployed successfully to Polygon Amoy!`);
  console.log(`  Contract Address: ${address}`);
  console.log(`  Polygonscan Explorer: https://amoy.polygonscan.com/address/${address}`);

  const configPath = path.join(__dirname, "../server/contractConfig.json");
  const configData = {
    contractAddress: address,
    network: "polygon-amoy",
    chainId: 80002,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
  console.log(`✓ Updated server/contractConfig.json with deployed contract address.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
