import { useAddress, useMetamask, useNFTDrop, useToken, useVote, useNetwork} from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';
import { AddressZero } from "@ethersproject/constants";
import { ChainId } from '@thirdweb-dev/sdk'
//import sdk from "../scripts/1-initialize-sdk.js";

const App = () => {
  // Use the hooks thirdweb give us.
  const address = useAddress();
  const network = useNetwork();
  const connectWithMetamask = useMetamask();
  console.log("👋 Address:", address);

  // Initialize our editionDrop contract
  const nftDrop = useNFTDrop("0x07Cf9b6DD8934DcdE747A8b9C0B017A6D7C2377f");
  const token = useToken("0x14acA962Aed91E82D9549b04c951155CfD13DB28");
  const vote = useVote("0xa9754dC4DBC31bB97AFEC7a24136819c10B3f304");
  
// State variable for us to know if user has our NFT.
const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  
// isClaiming lets us easily keep a loading state while the NFT is minting.
const [isClaiming, setIsClaiming] = useState(false);

// Holds the amount of token each member has in state.
const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
// The array holding all of our members addresses.
const [memberAddresses, setMemberAddresses] = useState([]);

// A fancy function to shorten someones wallet address, no need to show the whole thing.
const shortenAddress = (str) => {
  return str.substring(0, 6) + "..." + str.substring(str.length - 4);
};

const [proposals, setProposals] = useState([]);
const [isVoting, setIsVoting] = useState(false);
const [hasVoted, setHasVoted] = useState(false);

// Retrieve all our existing proposals from the contract.
useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  // A simple call to vote.getAll() to grab the proposals.
  const getAllProposals = async () => {
    try {
      const proposals = await vote.getAll();
      setProposals(proposals);
      console.log("🌈 Proposals:", proposals);
    } catch (error) {
      console.log("failed to get proposals", error);
    }
  };
  getAllProposals();
}, [hasClaimedNFT, vote]);

// We also need to check if the user already voted.
useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  // If we haven't finished retrieving the proposals from the useEffect above
  // then we can't check if the user voted yet!
  if (!proposals.length) {
    return;
  }

  const checkIfUserHasVoted = async () => {
    try {
      const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
      setHasVoted(hasVoted);
      if (hasVoted) {
        console.log("🥵 User has already voted");
      } else {
        console.log("🙂 User has not voted yet");
      }
    } catch (error) {
      console.error("Failed to check if wallet has voted", error);
    }
  };
  checkIfUserHasVoted();

}, [hasClaimedNFT, proposals, address, vote]);

//get member addresses and id numbers
useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }
  const getAllAddresses = async () => {
    try {
      const nfts = await nftDrop.getAllClaimed();
      let id = -1;
      const addresses = nfts.map( (nft) => {
        id = id + 1;
        return {id:id, address:nft.owner};
      });
      setMemberAddresses(addresses);
      console.log("Members", addresses);
    } catch (error) {
      console.error("failed to get member list", error);
    }
  };
  getAllAddresses();
}, [hasClaimedNFT, nftDrop.sales]);

//get member WDGT Token Amounts
useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  const getAllBalances = async () => {
    try {
      const amounts = await token.history.getAllHolderBalances();
      setMemberTokenAmounts(amounts);
      console.log("👜 Amounts", amounts);
    } catch (error) {
      console.error("failed to get member balances", error);
    }
  };
  getAllBalances();
}, [hasClaimedNFT, token.history]);

// Now, we combine the memberAddresses and memberTokenAmounts into a single array
const memberList = useMemo(() => {
  return memberAddresses.map((member) => {
    // We're checking if we are finding the address in the memberTokenAmounts array.
    // If we are, we'll return the amount of token the user has.
    // Otherwise, return 0.
    const m0mber = memberTokenAmounts?.find(({ holder }) => holder === member.address);

    return {
      id: member.id,
      address: member.address,
      tokenAmount: m0mber?.balance.displayValue || "0",
    }
  });
}, [memberAddresses, memberTokenAmounts]);

//this determines whether the connected address has an NFT
useEffect(() => {

    // If they don't have a connected wallet, exit!
    if (!address) {
      return;
    }

    const checkBalance = async () => {
      try {
        const balance = await nftDrop.balanceOf(address);
        if (balance > 0) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      } catch (error) {
        setHasClaimedNFT(false);
        console.error("Failed to get balance", error);
      }
    };
    checkBalance();
}, [address, nftDrop]);

//this function is run when a new user wants to mint an nft
const mintNft = async () => {
    try {
      setIsClaiming(true);
      await nftDrop.claim(1);
      console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${nftDrop.getAddress()}/0`);
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error("Failed to mint NFT", error);
    } finally {
      setIsClaiming(false);
    }
  };

if (address && (network?.[0].data.chain.id !== ChainId.Mumbai)) {
  return (
    <div className="unsupported-network">
      <h2>Please connect to polygon</h2>
      <p>
        This dapp only works on the Polygon network, please switch networks
        in your connected wallet.
      </p>
    </div>
  );
}
  
  // This is the case where the user hasn't connected their wallet
  // to your web app. Let them call connectWallet.
if (!address) {
    return (
      <div className="landing">
        <div className="topbar">
          <h2>Welcome to Weavechain DAO</h2>
        </div>
        <div className="centered card">
          <h3>To enter the DAO and view the dashboard:</h3>
          <p>1. Connect your Metamask wallet on Polygon Mainnet</p>
          <p>2. Mint your membership NFT</p>
        <button onClick={connectWithMetamask} className="standard">
          Connect your (Metamask) wallet
        </button>
        </div>
      </div>
    );
  }

// If the user has already claimed their NFT we want to display the interal DAO page to them
// only DAO members will see this. Render all the members + token amounts.
if (hasClaimedNFT) {
    return (
      <div>
        <div className="topbar">
            <h2>WEV Member Page</h2>
            <button className="barbutton"><a href="https://github.com/aiosivas/weavechain-polygon-dao"><h2>Github</h2></a></button>
          <div></div>
            
        </div>

        <div >
          <div className="card">
          <h2>Member List</h2>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{member.id}</td>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h2>Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                // lets get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  const voteResult = {
                    proposalId: proposal.proposalId,
                    //abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await token.getDelegationOf(address);
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === AddressZero) {
                    //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await token.delegateTo(address);
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async ({ proposalId, vote: _vote }) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await vote.get(proposalId);
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return vote.vote(proposalId, _vote);
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return;
                      })
                    );
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async ({ proposalId }) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await vote.get(proposalId);

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            const executetransaction =  vote.execute(proposalId);
                            console.log(executetransaction);
                            return executetransaction;
                            //counter.functions.increment();
                          }
                        })
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map(({ type, label }) => (
                      <div key={type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + type}
                          name={proposal.proposalId}
                          value={type}
                          //default the "abstain" vote to checked
                          defaultChecked={type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + type}>
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button className="standard" disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  // Render mint nft screen.
  return (
    <div className="mint-nft">
      <div className="topbar">
        <h2>Mint your DAO membership ID</h2>
      </div>
      <div className="centered card">
          <h3>Wallet connected!</h3>
          <p>Press the button to mint, accept the Metamask prompts,</p>
          <p>wait a bit, and you're in!</p>
                <button className="standard"
        disabled={isClaiming}
        onClick={mintNft}
      >
        {isClaiming ? "Minting..." : "Mint your nft"}
      </button>
    </div>
    </div>
  );
}
          
export default App;