import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";

// WalletConnect provider instance
let provider;
let signer;

// WalletConnect v2 Configuration
const projectId = "your_project_id"; // Replace with your WalletConnect Project ID from https://cloud.walletconnect.com/
const rpcUrls = {
  1: "https://mainnet.infura.io/v3/bfe31d7f19df4e4695ed2ad376ebfa5c", // Ethereum Mainnet
  56: "https://bsc-dataseed.binance.org/", // Binance Smart Chain Mainnet
};

// Function to connect wallet using WalletConnect v2
async function connectWallet() {
  try {
    // Initialize WalletConnect Provider
    provider = new WalletConnectProvider({
      projectId: projectId, // WalletConnect Project ID
      rpc: rpcUrls, // Define RPC URLs for the supported chains
      chainId: 1, // Default to Ethereum Mainnet
      showQrModal: true, // Display QR code modal for connection
    });

    // Enable session (opens QR code modal)
    await provider.enable();

    // Wrap the WalletConnect provider with Ethers.js
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    signer = ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    console.log("Connected wallet:", userAddress);

    // Display the wallet address in the UI
    document.getElementById("walletAddress").innerText = userAddress;
    document.getElementById("walletInfo").style.display = "block";
  } catch (error) {
    console.error("Wallet connection failed:", error);
  }
}

// Function to transfer tokens
async function transferTokens() {
  const tokenAddress = document.getElementById("tokenAddress").value;
  const recipientAddress = document.getElementById("recipientAddress").value;
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
    // Connect to the token contract
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);

    // Convert amount to appropriate decimals
    const amountToSend = ethers.utils.parseUnits(amount, 18); // Assuming 18 decimals for the token

    // Execute the transfer
    const tx = await tokenContract.transfer(recipientAddress, amountToSend);

    // Display transaction status in the UI
    document.getElementById("statusMessage").innerText =
      "Transaction sent. Waiting for confirmation...";
    document.getElementById("statusMessage").className = "";

    // Wait for confirmation
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
