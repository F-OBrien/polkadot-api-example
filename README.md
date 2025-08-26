# Polkadot.js API with Polymesh Example

This TypeScript project demonstrates how to use the Polkadot.js API with the Polymesh blockchain, showcasing the `balances.transferWithMemo` transaction with proper type definitions and memo formatting.

## Features

- ✅ TypeScript setup with Polymesh-specific type definitions
- ✅ Connection to Polymesh testnet (`wss://testnet-rpc.polymesh.live`)
- ✅ Local signing manager with development accounts (Alice & Bob)
- ✅ Balance checking and validation
- ✅ Complete `balances.transferWithMemo` transaction example
- ✅ Proper 32-byte memo formatting using Polymesh SDK approach
- ✅ Transaction monitoring until finalization
- ✅ Event processing and error handling

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Setup

1. Clone or download this project
2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Run the example:

   ```bash
   npm start
   ```

   Or run in development mode:

   ```bash
   npm run dev
   ```

## What the Example Demonstrates

The example connects to the Polymesh testnet and demonstrates:

1. **API Connection**: Establishing a connection with Polymesh-specific type bundles
2. **Account Setup**: Creating keyring pairs from mnemonic seeds
3. **Balance Queries**: Checking account balances with proper POLYX formatting
4. **Memo Creation**: Converting strings to 32-byte Polymesh memos
5. **Transaction Building**: Creating a `balances.transferWithMemo` extrinsic
6. **Fee Estimation**: Getting transaction fee estimates before submission
7. **Transaction Submission**: Signing and submitting with monitoring
8. **Event Processing**: Monitoring blockchain events for success/failure
9. **Graceful Cleanup**: Proper API disconnection

## Configuration

The example uses these default settings:

- **Network**: Polymesh Testnet (`wss://testnet-rpc.polymesh.live`)
- **Signing Account**: Alice (`//Alice`) - development account
- **Recipient**: Bob (`//Bob`) - development account
- **Transfer Amount**: 0.1 POLYX (100,000 Planck units)
- **Memo**: "Example transfer with memo"

## Package Versions

This example uses compatible versions to avoid type conflicts:

- `@polkadot/api`: `^10.13.1`
- `@polkadot/keyring`: `^12.6.2`
- `@polkadot/util`: `^12.6.2`
- `@polkadot/util-crypto`: `^12.6.2`
- `@polymeshassociation/polymesh-types`: `^6.2.0`

## Key Implementation Details

### Memo Formatting

Polymesh requires memos to be exactly 32 bytes. The example includes a utility function that:

- Validates memo length (max 32 characters)
- Pads the string with null characters to reach 32 bytes
- Creates a proper `PolymeshPrimitivesMemo` type

### Transaction Monitoring

The example wraps the `signAndSend` callback in a Promise to ensure the script waits for transaction completion, demonstrating proper async handling.

### Error Handling

Comprehensive error handling for:

- Network connection issues
- Insufficient balance
- Transaction failures
- API errors

## Output Example

```sh
🚀 Starting Polymesh API Example...
📡 Connecting to Polymesh testnet: wss://testnet-rpc.polymesh.live
✅ Connected to Polymesh network
Chain: Polymesh Testnet
Version: 7.3.0

🔑 Setting up accounts...
Alice address: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
Bob address: 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty

💰 Checking account balances...
Alice balance: 216.7202 POLYX
Bob balance: 100.0000 mPOLYX
✅ Alice has sufficient balance for the transfer

📤 Executing balances.transferWithMemo...
Transfer amount: 100.0000 mPOLYX
Memo: "Example transfer with memo"
From: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
To: 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
Estimated fee: 77.5020 mPOLYX

⏳ Submitting transaction...
📋 Transaction status: Ready
📋 Transaction status: Broadcast
📋 Transaction status: InBlock
✅ Transaction included in block: 0x61e79374b95d33ebcf31e6d61acc2009155f6b731265c9ec45fe364347dfe1be
Transaction hash: 0x01604c59c2b77ec2e8e45bb0a1eff502a8c981c4e9f3a40fec46ef5dcc3ac73b
📋 Transaction status: Finalized
🎉 Transaction finalized in block: 0x61e79374b95d33ebcf31e6d61acc2009155f6b731265c9ec45fe364347dfe1be
        📅 Event: balances.Transfer:: [...]
💸 Transfer successful!
        📅 Event: transactionPayment.TransactionFeePaid:: [...]
        📅 Event: system.ExtrinsicSuccess:: [...]
✅ Transaction completed successfully

🔌 Disconnecting from API...
```

## Security Notes

- ⚠️ This example uses development accounts (Alice/Bob) which are publicly known
- ⚠️ Never use these accounts on mainnet or with real funds
- ⚠️ The testnet tokens used have no real value
- ⚠️ Always validate transaction details before signing on mainnet

## Useful Resources

- [Polymesh Documentation](https://docs.polymesh.network/)
- [Polkadot.js API Documentation](https://polkadot.js.org/docs/)
- [Polymesh Types Repository](https://github.com/PolymeshAssociation/polymesh-types)
- [Polymesh SDK](https://github.com/PolymeshAssociation/polymesh-sdk)
