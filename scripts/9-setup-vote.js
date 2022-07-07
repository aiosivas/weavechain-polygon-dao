import sdk from "./1-initialize-sdk.js";

// This is our governance contract.
const vote = sdk.getVote("0xa9754dC4DBC31bB97AFEC7a24136819c10B3f304");

// This is our ERC-20 contract.
const token = sdk.getToken("0x14acA962Aed91E82D9549b04c951155CfD13DB28");

(async () => {
  try {
    // Give our treasury the power to mint additional token if needed.
    await token.roles.grant("minter", vote.getAddress());

    console.log(
      "Successfully gave vote contract permissions to act on token contract"
    );
  } catch (error) {
    console.error(
      "failed to grant vote contract permissions on token contract",
      error
    );
    process.exit(1);
  }

  try {
    // Grab our wallet's token balance, remember -- we hold basically the entire supply right now!
    const ownedTokenBalance = await token.balanceOf(
      process.env.WALLET_ADDRESS
    );

    // Grab 99% of the supply that we hold.
    const ownedAmount = ownedTokenBalance.displayValue;
    const percent99 = Number(ownedAmount) / 100 * 99;

    // Transfer 90% of the supply to our voting contract.
    await token.transfer(
      vote.getAddress(),
      percent99
    ); 

    console.log("✅ Successfully transferred " + percent99 + " tokens to vote contract");
  } catch (err) {
    console.error("failed to transfer tokens to vote contract", err);
  }
})();