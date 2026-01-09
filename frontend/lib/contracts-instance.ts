import { Contract, BrowserProvider, JsonRpcSigner } from 'ethers';
import {
  MOCK_ERC20_ADDRESS,
  MARKETPLACE_ADDRESS,
  ESCROW_ADDRESS,
  MOCK_ERC20_ABI,
  MARKETPLACE_ABI,
  ESCROW_ABI,
} from './contracts';

/**
 * Contract instance utilities
 * Creates reusable contract instances for blockchain interactions
 */

/**
 * Get MockERC20 contract instance
 */
export function getMockERC20Contract(
  provider: BrowserProvider | JsonRpcSigner
): Contract {
  const signerOrProvider = provider instanceof JsonRpcSigner ? provider : provider;
  return new Contract(MOCK_ERC20_ADDRESS, MOCK_ERC20_ABI, signerOrProvider);
}

/**
 * Get VoucherMarketplace contract instance
 */
export function getMarketplaceContract(
  provider: BrowserProvider | JsonRpcSigner
): Contract {
  const signerOrProvider = provider instanceof JsonRpcSigner ? provider : provider;
  return new Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signerOrProvider);
}

/**
 * Get VoucherEscrow contract instance
 */
export function getEscrowContract(
  provider: BrowserProvider | JsonRpcSigner
): Contract {
  const signerOrProvider = provider instanceof JsonRpcSigner ? provider : provider;
  return new Contract(ESCROW_ADDRESS, ESCROW_ABI, signerOrProvider);
}

/**
 * Get MNEE token balance for an address
 */
export async function getMneeBalance(
  provider: BrowserProvider,
  address: string
): Promise<bigint> {
  const contract = getMockERC20Contract(provider);
  return await contract.balanceOf(address);
}

/**
 * Get MNEE token allowance for escrow
 */
export async function getMneeAllowance(
  provider: BrowserProvider,
  owner: string,
  spender: string = ESCROW_ADDRESS
): Promise<bigint> {
  const contract = getMockERC20Contract(provider);
  return await contract.allowance(owner, spender);
}

/**
 * Approve MNEE tokens for escrow
 */
export async function approveMnee(
  signer: JsonRpcSigner,
  amount: bigint
): Promise<{ hash: string; wait: () => Promise<any> }> {
  const contract = getMockERC20Contract(signer);
  const tx = await contract.approve(ESCROW_ADDRESS, amount);
  return tx;
}

/**
 * Format token amount with decimals
 */
export async function formatTokenAmount(
  provider: BrowserProvider,
  amount: bigint
): Promise<string> {
  const contract = getMockERC20Contract(provider);
  const decimals = await contract.decimals();
  const divisor = BigInt(10 ** Number(decimals));
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;

  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(Number(decimals), '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');

  return trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
}

/**
 * Parse token amount from string (e.g., "1.5" -> BigInt("1500000000000000000") for 18 decimals)
 */
export async function parseTokenAmount(
  provider: BrowserProvider,
  amount: string
): Promise<bigint> {
  const contract = getMockERC20Contract(provider);
  const decimals = await contract.decimals();
  const [whole, fractional = ''] = amount.split('.');

  const wholePart = BigInt(whole || '0');
  const fractionalPart = BigInt((fractional.padEnd(Number(decimals), '0')).slice(0, Number(decimals)));
  const divisor = BigInt(10 ** Number(decimals));

  return wholePart * divisor + fractionalPart;
}

