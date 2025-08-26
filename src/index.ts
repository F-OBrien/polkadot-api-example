// Import type augmentations first - this must come before any Polkadot API usage
// These imports add Polymesh-specific types to the standard Polkadot.js API
import '@polymeshassociation/polymesh-types/polkadot/augment-types';
import '@polymeshassociation/polymesh-types/polkadot/augment-api';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import type { KeyringPair } from '@polkadot/keyring/types';
import { typesBundle } from '@polymeshassociation/polymesh-types';
import { formatBalance } from '@polkadot/util';

// Configuration constants
const POLYMESH_ENDPOINT = 'wss://testnet-rpc.polymesh.live';
const ALICE_SEED = '//Alice'; // Development account - never use on mainnet
const BOB_SEED = '//Bob'; // Development account - never use on mainnet
const TRANSFER_AMOUNT = 100000; // 0.1 POLYX in Planck units (POLYX has 6 decimal places)
const MEMO = 'Example transfer with memo';
const MAX_MEMO_LENGTH = 32; // Polymesh memo maximum length in bytes

/**
 * Pad a string to the specified length with null characters
 * This is required for Polymesh memos which must be exactly 32 bytes
 */
function padString(value: string, length: number): string {
  return value.padEnd(length, '\0');
}

/**
 * Create a Polymesh memo from a string
 * Follows the same approach as the Polymesh SDK for memo creation
 */
function stringToMemo(api: ApiPromise, value: string): any {
  if (value.length > MAX_MEMO_LENGTH) {
    throw new Error(
      `Max memo length exceeded. Max: ${MAX_MEMO_LENGTH}, provided: ${value.length}`,
    );
  }

  const paddedValue = padString(value, MAX_MEMO_LENGTH);
  return api.createType('PolymeshPrimitivesMemo', paddedValue);
}

/**
 * Main function demonstrating Polymesh API usage
 */
async function main(): Promise<void> {
  console.log('🚀 Starting Polymesh API Example...');

  let api: ApiPromise | null = null;

  try {
    // Step 1: Create WebSocket provider and API connection
    console.log(`📡 Connecting to Polymesh testnet: ${POLYMESH_ENDPOINT}`);
    const provider = new WsProvider(POLYMESH_ENDPOINT);

    // Step 2: Create API instance with Polymesh type bundles
    api = await ApiPromise.create({
      provider,
      typesBundle,
    });

    console.log('✅ Connected to Polymesh network');
    console.log(`Chain: ${await api.rpc.system.chain()}`);
    console.log(`Version: ${await api.rpc.system.version()}`);

    // Step 3: Setup keyring and accounts
    console.log('\n🔑 Setting up accounts...');
    const keyring = new Keyring({ type: 'sr25519' });
    const alice: KeyringPair = keyring.addFromUri(ALICE_SEED);
    const bob: KeyringPair = keyring.addFromUri(BOB_SEED);

    console.log(`Alice address: ${alice.address}`);
    console.log(`Bob address: ${bob.address}`);

    // Step 4: Check balances
    await checkBalances(api, alice, bob);

    // Step 5: Execute transfer with memo
    await executeTransferWithMemo(api, alice, bob);
  } catch (error) {
    console.error('❌ Error in main execution:', error);
    process.exit(1);
  } finally {
    // Clean up API connection
    if (api) {
      console.log('\n🔌 Disconnecting from API...');
      await api.disconnect();
    }
  }
}

/**
 * Check and display account balances for both Alice and Bob
 * Also validates that Alice has sufficient balance for the transfer
 */
async function checkBalances(
  api: ApiPromise,
  alice: KeyringPair,
  bob: KeyringPair,
): Promise<void> {
  console.log('\n💰 Checking account balances...');

  try {
    // Query account information for both accounts in parallel
    const [aliceInfo, bobInfo] = await Promise.all([
      api.query.system.account(alice.address),
      api.query.system.account(bob.address),
    ]);

    // Extract free balance amounts (using type assertion for compatibility)
    const aliceBalance = (aliceInfo as any).data.free.toString();
    const bobBalance = (bobInfo as any).data.free.toString();

    console.log(
      `Alice balance: ${formatBalance(aliceBalance, {
        withSi: true,
        withUnit: 'POLYX',
        forceUnit: '-',
        withZero: false,
        decimals: 6,
        withAll: true,
      })}`,
    );
    console.log(
      `Bob balance: ${formatBalance(bobBalance, {
        withSi: true,
        withUnit: 'POLYX',
        forceUnit: '-',
        withZero: false,
        decimals: 6,
        withAll: true,
      })}`,
    );

    // Check if Alice has sufficient balance for transfer
    const aliceBalanceBN = (aliceInfo as any).data.free.toBn();
    const transferAmountBN = api.createType('Balance', TRANSFER_AMOUNT);

    if (aliceBalanceBN.lt(transferAmountBN)) {
      console.log('⚠️  Alice has insufficient balance for the transfer');
    } else {
      console.log('✅ Alice has sufficient balance for the transfer');
    }
  } catch (error) {
    console.error('❌ Error checking balances:', error);
    throw error;
  }
}

/**
 * Execute a balances.transferWithMemo transaction
 * This demonstrates the key Polymesh feature of including memos with transfers
 * The function waits for transaction completion and monitors events
 */
async function executeTransferWithMemo(
  api: ApiPromise,
  alice: KeyringPair,
  bob: KeyringPair,
): Promise<void> {
  console.log('\n📤 Executing balances.transferWithMemo...');

  try {
    // Create a properly formatted Polymesh memo using the SDK approach
    const memoType = stringToMemo(api, MEMO);

    // Create the transfer extrinsic with destination, amount, and memo
    const transfer = api.tx.balances.transferWithMemo(
      bob.address,
      TRANSFER_AMOUNT,
      memoType,
    );

    // Display transaction details
    console.log(
      `Transfer amount: ${formatBalance(TRANSFER_AMOUNT, {
        withSi: true,
        withUnit: 'POLYX',
        forceUnit: '-',
        withZero: false,
        decimals: 6,
        withAll: true,
      })}`,
    );
    console.log(`Memo: "${MEMO}"`);
    console.log(`From: ${alice.address}`);
    console.log(`To: ${bob.address}`);

    // Get transaction fee estimate
    const paymentInfo = await transfer.paymentInfo(alice);
    console.log(
      `Estimated fee: ${formatBalance(paymentInfo.partialFee.toString(), {
        withSi: true,
        withUnit: 'POLYX',
        forceUnit: '-',
        withZero: false,
        decimals: 6,
        withAll: true,
      })}`,
    );

    console.log('\n⏳ Submitting transaction...');

    // Sign and submit the transaction, wrapping in Promise to wait for completion
    await new Promise<void>((resolve, reject) => {
      transfer
        .signAndSend(alice, (result: any) => {
          console.log(`📋 Transaction status: ${result.status.type}`);

          if (result.status.isInBlock) {
            console.log(
              `✅ Transaction included in block: ${result.status.asInBlock}`,
            );
            console.log(`Transaction hash: ${transfer.hash}`);
          } else if (result.status.isFinalized) {
            console.log(
              `🎉 Transaction finalized in block: ${result.status.asFinalized}`,
            );

            // Process events to check for success or failure
            result.events.forEach(
              ({ event: { data, method, section } }: any) => {
                console.log(
                  `\t📅 Event: ${section}.${method}:: ${data.toString()}`,
                );

                if (section === 'system' && method === 'ExtrinsicFailed') {
                  console.error('❌ Transaction failed');
                  reject(new Error('Transaction failed'));
                  return;
                } else if (section === 'balances' && method === 'Transfer') {
                  console.log('💸 Transfer successful!');
                }
              },
            );

            console.log('✅ Transaction completed successfully');
            resolve();
          } else if (result.status.isError || result.isError) {
            console.error('❌ Transaction error:', result.status);
            reject(new Error(`Transaction error: ${result.status}`));
          }
        })
        .catch((error: any) => {
          console.error('❌ Error submitting transaction:', error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('❌ Error executing transfer:', error);
    throw error;
  }
}

/**
 * Handle process termination gracefully
 */
process.on('SIGINT', () => {
  console.log('\n👋 Received SIGINT, exiting gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Received SIGTERM, exiting gracefully...');
  process.exit(0);
});

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}
