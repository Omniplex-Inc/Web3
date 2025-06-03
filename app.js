const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider.default,
    options: {
      infuraId: "your_infura_project_id", // Replace with your Infura Project ID
    },
  },
};

let provider;
let signer;

// Connect Wallet using WalletConnect
async function connectWallet() {
  try {
    provider = new WalletConnectProvider.default({
      infuraId: "your_infura_project_id", // Replace with your Infura Project ID
    });

    // Enable WalletConnect
    await provider.enable();

    // Wrap provider with Ethers.js
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    signer = ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    // Display wallet info
    document.getElementById("walletInfo").style.display = "block";
    document.getElementById("walletAddress").innerText = userAddress;

    console.log("Connected wallet:", userAddress);
  } catch (error) {
    console.error("Error connecting wallet:", error);
  }
}

// Transfer Tokens Functionality
async function transferTokens() {
  const contractAddress = document.getElementById("contractAddress").value;
  const recipientAddress = document.getElementById("recipientAddress").value;
  const tokenAddress = document.getElementById("tokenAddress").value;
  const amount = document.getElementById("amount").value;

  const tokenAbi = [
    {
      constant: false,
      inputs: [
        { name: "recipient", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ name: "", type: "bool" }],
      type: "function",
    },
  ];

  try {
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);

    const amountToSend = ethers.utils.parseUnits(amount, 18); // Assuming 18 decimals

    // Execute the transaction
    const tx = await tokenContract.transfer(recipientAddress, amountToSend);
    document.getElementById("statusMessage").innerText =
      "Transaction sent. Waiting for confirmation...";
    document.getElementById("statusMessage").className = "";

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    console.log("Transaction successful:", receipt.transactionHash);
    document.getElementById("statusMessage").innerText =
      "Transaction successful: " + receipt.transactionHash;
    document.getElementById("statusMessage").className = "success";
  } catch (error) {
    console.error("Error in transfer:", error);
    document.getElementById("statusMessage").innerText =
      "Error: " + error.message;
    document.getElementById("statusMessage").className = "error";
  }
}

// Event Listeners
document.getElementById("connectWallet").addEventListener("click", connectWallet);
document.getElementById("transferTokens").addEventListener("click", transferTokens);
