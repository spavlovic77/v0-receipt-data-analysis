import { ethers } from "hardhat"
import hre from "hardhat"

async function main() {
  console.log("Deploying KREDIT Token...")

  // Get the authorized signer address from environment variable
  const authorizedSigner = process.env.KREDIT_AUTHORIZED_SIGNER

  if (!authorizedSigner) {
    throw new Error("KREDIT_AUTHORIZED_SIGNER environment variable not set")
  }

  console.log("Authorized signer address:", authorizedSigner)

  // Deploy the contract
  const KreditToken = await ethers.getContractFactory("KreditToken")
  const kredit = await KreditToken.deploy(authorizedSigner)

  await kredit.waitForDeployment()

  const contractAddress = await kredit.getAddress()

  console.log("✅ KREDIT Token deployed to:", contractAddress)
  console.log("✅ Authorized signer:", authorizedSigner)

  console.log("\n📝 Add these to your .env file:")
  console.log(`KREDIT_CONTRACT_ADDRESS=${contractAddress}`)
  console.log(`KREDIT_AUTHORIZED_SIGNER=${authorizedSigner}`)

  console.log("\n⏳ Waiting for block confirmations...")
  await kredit.deploymentTransaction()?.wait(5)

  console.log("\n🔍 Verifying contract on Basescan...")
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [authorizedSigner],
    })
    console.log("✅ Contract verified!")
  } catch (error) {
    console.log("⚠️  Verification failed:", error)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
