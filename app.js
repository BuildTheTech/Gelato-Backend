const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
const port = 3000;

// Load environment variables
const rpcUrl = process.env.RPC_URL;
const gelatoToken = process.env.GELATO_TOKEN;
const gelatoDistributor = process.env.GELATO_DISTRIBUTOR;

// ABIs
const TokenABI = [
  "function balanceOf(address user) view returns (uint256)",
];
const DistributorABI = [
  "function totalStackedBurned() view returns (uint256)",
  "function totalSolidXBurned() view returns (uint256)",
  "function totalHexDistributed() view returns (uint256)",
  "function totalSolidXDistributed() view returns (uint256)",
];

// Initialize ethers provider and contracts
const provider = new ethers.JsonRpcProvider(rpcUrl);

const ZERO = "0x0000000000000000000000000000000000000000";
const DEAD = "0x000000000000000000000000000000000000dEaD"

const tokenContract = new ethers.Contract(gelatoToken, TokenABI, provider);
const distributorContract = new ethers.Contract(
  gelatoDistributor,
  DistributorABI,
  provider
);

// API endpoint
app.get("/stats", async (req, res) => {
  try {
    const [totalGelZero, totalGelDead, totalStackedBurned, totalSolidXBurned, totalHexDistributed, totalSolidXDistributed] =
      await Promise.all([
        tokenContract.balanceOf(ZERO),
        tokenContract.balanceOf(DEAD),
        distributorContract.totalStackedBurned(),
        distributorContract.totalSolidXBurned(),
        distributorContract.totalHexDistributed(),
        distributorContract.totalSolidXDistributed(),
      ]);

    res.json({
      totalGelBurned: (Number(totalGelZero) + Number(totalGelDead)) / 1e18,
      totalStackedBurned: Number(totalStackedBurned) / 1e18,
      totalSolidXBurned: Number(totalSolidXBurned) / 1e18,
      totalHexDistributed: Number(totalHexDistributed) / 1e8,
      totalSolidXDistributed: Number(totalSolidXDistributed) / 1e18,
    });
  } catch (error) {
    console.error("Error fetching data from contracts:", error);
    res.status(500).json({ error: "Error fetching data from contracts" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
