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
  "function totalGelBurned() view returns (uint256)",
];
const DistributorABI = [
  "function totalStackedBurned() view returns (uint256)",
  "function totalSolidXBurned() view returns (uint256)",
  "function totalHexDistributed() view returns (uint256)",
  "function totalSolidXDistributed() view returns (uint256)",
];

// Initialize ethers provider and contracts
const provider = new ethers.JsonRpcProvider(rpcUrl);

const tokenContract = new ethers.Contract(gelatoToken, TokenABI, provider);
const distributorContract = new ethers.Contract(
  gelatoDistributor,
  DistributorABI,
  provider
);

// API endpoint
app.get("/stats", async (req, res) => {
  try {
    const [totalGelBurned, totalStackedBurned, totalSolidXBurned, totalHexDistributed, totalSolidXDistributed] =
      await Promise.all([
        tokenContract.totalGelBurned(),
        distributorContract.totalStackedBurned(),
        distributorContract.totalSolidXBurned(),
        distributorContract.totalHexDistributed(),
        distributorContract.totalSolidXDistributed(),
      ]);

    res.json({
      totalGelBurned: totalGelBurned.toString() / 1e18,
      totalStackedBurned: totalStackedBurned.toString() / 1e18,
      totalSolidXBurned: totalSolidXBurned.toString() / 1e18,
      totalHexDistributed: totalHexDistributed.toString() / 1e8,
      totalSolidXDistributed: totalSolidXDistributed.toString() / 1e18,
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
