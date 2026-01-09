"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import Header from "@/components/Header";
import PriceSection from "@/components/PriceSection";
import UploadSection from "@/components/UploadSection";
import Footer from "@/components/Footer";
import BackendStatus from "@/components/BackendStatus";
import { useWallet } from "@/contexts/WalletContext";
import { getMarketplaceContract } from "@/lib/contracts-instance";
import { parseTokenAmount } from "@/lib/contracts-instance";

import { buildApiUrl, API_CONFIG } from "@/lib/config";
import { storeIPFSHashMapping } from "@/lib/ipfs-resolver";

export default function Sell() {
    const router = useRouter();
    const { wallet, ensureSepolia } = useWallet();

    // Form state
    const [voucherTitle, setVoucherTitle] = useState("");
    const [voucherType, setVoucherType] = useState("Gift Card");
    const [brandName, setBrandName] = useState("");
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherValue, setVoucherValue] = useState("");
    const [discountPercentage, setDiscountPercentage] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [terms, setTerms] = useState("");
    const [price, setPrice] = useState("");
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [voucherImageFile, setVoucherImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<any>(null);


    const handleLogoUpload = (file: File | null) => {
        setLogoFile(file);
    };

    const handleVoucherImageUpload = (file: File | null) => {
        setVoucherImageFile(file);
        setVerificationResult(null); // Reset verification when new image uploaded
    };

    // AI Verification function
    const handleVerifyVoucher = async () => {
        if (!voucherImageFile) {
            setError('Please upload a voucher image first');
            return;
        }

        if (!voucherCode) {
            setError('Please enter the voucher code first');
            return;
        }

        try {
            setIsVerifying(true);
            setError(null);
            setSuccess('Verifying voucher with AI...');

            const formData = new FormData();
            formData.append('voucherImage', voucherImageFile);
            formData.append('code', voucherCode);
            formData.append('brand', brandName);
            formData.append('type', voucherType);

            const response = await fetch('/api/verify/voucher', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Verification failed');
            }

            setVerificationResult(result.data);

            if (result.data.isValid) {
                setSuccess(`✅ Verification passed! Score: ${result.data.score}%`);
            } else {
                setError(`❌ Verification failed: ${result.data.issues.join(', ')}`);
            }
        } catch (err: any) {
            console.error('Verification error:', err);
            setError(err.message || 'Failed to verify voucher');
        } finally {
            setIsVerifying(false);
        }
    };

    // Helper function to validate and parse expiry date
    const parseExpiryTimestamp = (dateString: string): bigint => {
        if (!dateString) {
            return BigInt(0); // No expiry
        }

        const expiryDate = new Date(dateString);
        const currentTime = new Date();

        // Validate date is valid
        if (isNaN(expiryDate.getTime())) {
            throw new Error('Invalid expiry date format');
        }

        // Validate date is in the future (at least 1 hour buffer)
        const minFutureTime = new Date(currentTime.getTime() + 60 * 60 * 1000); // 1 hour from now
        if (expiryDate <= minFutureTime) {
            throw new Error('Expiry date must be at least 1 hour in the future');
        }

        // Convert to Unix timestamp
        return BigInt(Math.floor(expiryDate.getTime() / 1000));
    };

    const handleSubmitListing = async () => {
        if (!wallet.signer) {
            alert('Please connect your wallet first');
            return;
        }

        // Validate required fields
        if (!voucherCode || !price) {
            setError('Voucher code and price are required');
            return;
        }

        // Validate price is a positive number
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            setError('Price must be a positive number');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);

            // Ensure on Sepolia
            await ensureSepolia();

            // Step 1: Upload logo to IPFS (if provided)
            let logoData = null;
            if (logoFile) {
                setSuccess('Uploading logo to IPFS...');
                console.log('📤 Uploading logo:', logoFile.name);

                const logoFormData = new FormData();
                logoFormData.append('logo', logoFile);

                console.log('📡 Calling:', buildApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_LOGO));
                const logoResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_LOGO), {
                    method: 'POST',
                    body: logoFormData,
                });

                console.log('📥 Logo response status:', logoResponse.status);
                const logoResult = await logoResponse.json();
                console.log('📥 Logo result:', logoResult);

                if (!logoResult.success) {
                    throw new Error(logoResult.error || 'Failed to upload logo');
                }

                logoData = logoResult.data;
                console.log('✅ Logo uploaded! IPFS Hash:', logoData.original.ipfsHash);
            }

            // Step 2: Upload voucher image to IPFS (if provided)
            let voucherImageData = null;
            if (voucherImageFile) {
                setSuccess('Uploading voucher image to IPFS...');
                console.log('📤 Uploading voucher image:', voucherImageFile.name);

                const imageFormData = new FormData();
                imageFormData.append('voucherImage', voucherImageFile);

                console.log('📡 Calling:', buildApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_VOUCHER_IMAGE));
                const imageResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_VOUCHER_IMAGE), {
                    method: 'POST',
                    body: imageFormData,
                });

                console.log('📥 Voucher image response status:', imageResponse.status);
                const imageResult = await imageResponse.json();
                console.log('📥 Voucher image result:', imageResult);

                if (!imageResult.success) {
                    throw new Error(imageResult.error || 'Failed to upload voucher image');
                }

                voucherImageData = imageResult.data;
                console.log('✅ Voucher image uploaded! IPFS Hashes:', {
                    original: voucherImageData.original.ipfsHash,
                    blurred: voucherImageData.blurred.ipfsHash
                });
            }

            // Step 3: Create and upload metadata to IPFS
            setSuccess('Creating voucher metadata...');

            // Prepare voucher metadata for IPFS upload
            const voucherMetadata = {
                // Basic Information
                title: voucherTitle || `${voucherType} - ${brandName || 'Voucher'}`,
                type: voucherType,
                brand: brandName || 'Unknown Brand',
                description: `${voucherType} from ${brandName || 'Unknown Brand'}`,

                // Voucher Details
                code: voucherCode,
                partialPattern: '', // Will be set by blockchain
                value: parseFloat(voucherValue) || 0,
                discountPercentage: parseFloat(discountPercentage) || 0,

                // Pricing & Expiry
                price: price,
                currency: 'MNEE',
                expiryDate: expiryDate || null,
                expiryTimestamp: expiryDate ? Math.floor(new Date(expiryDate).getTime() / 1000) : 0,

                // Terms & Conditions
                terms: terms || '',
                usageInstructions: '',
                restrictions: '',

                // Images (IPFS hashes) - FIXED: Nested structure
                images: {
                    logo: {
                        original: logoData?.original?.ipfsHash || '',
                        thumbnail: logoData?.thumbnail?.ipfsHash || '',
                    },
                    voucher: {
                        original: voucherImageData?.original?.ipfsHash || '',
                        blurred: voucherImageData?.blurred?.ipfsHash || '',
                        thumbnail: voucherImageData?.thumbnail?.ipfsHash || '',
                    },
                },

                // Seller Information
                seller: {
                    address: wallet.address || '',
                    reputation: 0,
                    totalSales: 0,
                },

                // Validation & Security
                validation: {
                    aiInitialProof: `proof_${voucherCode}_${Date.now()}`,
                    validationScore: 0,
                    validationStatus: 'pending',
                    validatedAt: null,
                },

                // Blockchain Integration
                blockchain: {
                    network: 'sepolia',
                    listingId: null,
                    contractAddress: '',
                    transactionHash: '',
                },

                // Platform Metadata
                platform: {
                    name: 'CouponMarche',
                    version: '1.0.0',
                    uploadedAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    category: voucherType,
                    tags: [voucherType, brandName].filter(Boolean),
                    featured: false,
                },

                // Analytics & Tracking
                analytics: {
                    views: 0,
                    favorites: 0,
                    inquiries: 0,
                    createdAt: new Date().toISOString(),
                },
            };

            setSuccess('Uploading metadata to IPFS...');

            // Upload metadata to IPFS via backend
            const metadataResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_METADATA), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ voucherData: voucherMetadata }),
            });

            const metadataResult = await metadataResponse.json();

            if (!metadataResult.success) {
                throw new Error(metadataResult.error || 'Failed to upload metadata to IPFS');
            }

            setSuccess('Creating blockchain listing...');

            // Use IPFS hash as metadata hash for blockchain
            const ipfsHash = metadataResult.data.ipfsHash;

            // Convert IPFS hash to bytes32 for smart contract
            // IPFS hashes are base58 encoded, we need to convert to bytes32
            const metadataHashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(ipfsHash));

            // Create partial code pattern (mask most of the code for security)
            const codeLength = voucherCode.length;
            let partialPattern = "";
            if (codeLength <= 6) {
                partialPattern = voucherCode; // Show full code if short
            } else {
                partialPattern = `${voucherCode.slice(0, 2)}${'X'.repeat(Math.max(0, codeLength - 6))}${voucherCode.slice(-4)}`;
            }

            // Parse price to wei
            const priceAmount = await parseTokenAmount(wallet.provider!, price);

            // Parse expiry timestamp using helper function
            const expiryTimestamp = parseExpiryTimestamp(expiryDate);

            // Parse voucher value (optional)
            const valueAmount = voucherValue ? BigInt(voucherValue.replace(/\D/g, '')) : BigInt(0);

            // AI initial proof hash (use the one from metadata)
            const aiInitialProofHash = ethers.keccak256(ethers.toUtf8Bytes(voucherMetadata.validation.aiInitialProof));

            // Create listing on blockchain
            const marketplaceContract = getMarketplaceContract(wallet.signer);
            const tx = await marketplaceContract.createListing(
                metadataHashBytes32, // Use bytes32 hash for smart contract
                partialPattern,
                priceAmount,
                valueAmount,
                expiryTimestamp,
                aiInitialProofHash
            );

            setSuccess('Transaction submitted. Waiting for confirmation...');

            const receipt = await tx.wait();

            // Extract listing ID from transaction receipt
            // Try multiple methods to get the listing ID
            let listingId: number | string = 'unknown';

            // Method 1: Try to get from logs args
            if (receipt.logs && receipt.logs.length > 0) {
                const log = receipt.logs[0];
                if (log.args && log.args[0] !== undefined) {
                    listingId = Number(log.args[0]);
                    console.log('📋 Listing ID from log args:', listingId);
                }
            }

            // Method 2: Try to parse the event manually
            if (listingId === 'unknown' && receipt.logs && receipt.logs.length > 0) {
                try {
                    const iface = marketplaceContract.interface;
                    for (const log of receipt.logs) {
                        try {
                            const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
                            if (parsed && parsed.name === 'ListingCreated' && parsed.args[0] !== undefined) {
                                listingId = Number(parsed.args[0]);
                                console.log('📋 Listing ID from parsed event:', listingId);
                                break;
                            }
                        } catch {
                            // Continue to next log
                        }
                    }
                } catch (parseError) {
                    console.error('Error parsing logs:', parseError);
                }
            }

            console.log('📋 Final Listing ID:', listingId, 'IPFS Hash:', ipfsHash);

            // Store IPFS hash mapping for future retrieval (localStorage)
            if (listingId !== 'unknown' && typeof listingId === 'number') {
                storeIPFSHashMapping(listingId, ipfsHash);

                // Also store on backend for cross-user access
                try {
                    const storeResponse = await fetch('/api/ipfs/store', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ listingId, ipfsHash }),
                    });
                    const storeResult = await storeResponse.json();
                    console.log('✅ IPFS mapping stored on backend:', storeResult);
                } catch (err) {
                    console.error('Failed to store IPFS mapping on backend:', err);
                }
            } else {
                console.warn('⚠️ Could not extract listing ID from transaction receipt');
            }

            setSuccess(`Listing created successfully! Listing ID: ${listingId}. IPFS Hash: ${ipfsHash}`);

            // Redirect to marketplace after 3 seconds
            setTimeout(() => {
                router.push('/marketplace');
            }, 3000);

        } catch (err: any) {
            console.error('Error creating listing:', err);
            setError(err.message || 'Failed to create listing');
        } finally {
            setIsSubmitting(false);
        }

    };

    return (
        <div className="min-h-screen bg-off-white">
            <BackendStatus />
            <Header pageType="sell" />

            {/* Sell Page Header */}
            <div className="sell-page-header">
                <div className="sell-container">
                    <h1>Sell Your Voucher</h1>
                    <p>List your unused vouchers and earn crypto. All listings are AI-validated for authenticity.</p>
                </div>
            </div>

            {/* Main Sell Content */}
            <div className="sell-page-content">
                {/* Top Section: Voucher Info + Upload */}
                <div className="sell-top-section">
                    <div className="voucher-info-section">
                        <h2>Voucher Information</h2>

                        {error && (
                            <div style={{ padding: '1rem', marginBottom: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ padding: '1rem', marginBottom: '1rem', background: '#d4edda', color: '#155724', borderRadius: '4px' }}>
                                {success}
                            </div>
                        )}

                        {/* Voucher Title */}
                        <div className="form-group">
                            <label>Voucher Title (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., Amazon ₹500 Gift Card"
                                value={voucherTitle}
                                onChange={(e) => setVoucherTitle(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Voucher Type */}
                        <div className="form-group">
                            <label>Voucher Type</label>
                            <select
                                value={voucherType}
                                onChange={(e) => setVoucherType(e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option>Gift Card</option>
                                <option>Discount Coupon</option>
                                <option>Store Credit</option>
                                <option>Travel Voucher</option>
                                <option>Food & Dining</option>
                                <option>Fashion & Apparel</option>
                            </select>
                        </div>

                        {/* Brand / Store Name */}
                        <div className="form-group">
                            <label>Brand / Store Name (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., Amazon, Myntra, Swiggy"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Voucher Code */}
                        <div className="form-group">
                            <label>Voucher / Coupon Code *</label>
                            <input
                                type="text"
                                placeholder="Enter the voucher or coupon code"
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                            <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
                                Only a partial pattern will be shown publicly for security.
                            </small>
                        </div>

                        {/* Voucher Value */}
                        <div className="form-group">
                            <label>Voucher Value (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., 500 (numeric value only)"
                                value={voucherValue}
                                onChange={(e) => setVoucherValue(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Discount Percentage */}
                        <div className="form-group">
                            <label>Discount Percentage (optional)</label>
                            <input
                                type="number"
                                placeholder="e.g., 20"
                                value={discountPercentage}
                                onChange={(e) => setDiscountPercentage(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Expiry Date */}
                        <div className="form-group">
                            <label>Expiry Date (optional)</label>
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                disabled={isSubmitting}
                                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Tomorrow minimum
                            />
                            <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
                                Leave empty for no expiry. If set, must be at least 24 hours in the future.
                            </small>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="form-group">
                            <label>Terms & Conditions (optional)</label>
                            <textarea
                                placeholder="Describe voucher terms, restrictions, usage instructions..."
                                rows={4}
                                value={terms}
                                onChange={(e) => setTerms(e.target.value)}
                                disabled={isSubmitting}
                            ></textarea>
                        </div>
                    </div>

                    <UploadSection
                        onLogoUpload={handleLogoUpload}
                        onVoucherImageUpload={handleVoucherImageUpload}
                    />

                    {/* AI Verification Section */}
                    {voucherImageFile && voucherCode && (
                        <div className="verification-section" style={{
                            marginTop: '2rem',
                            padding: '1.5rem',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            border: '2px solid #e9ecef'
                        }}>
                            <h3 style={{ marginBottom: '1rem' }}>
                                <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>
                                    verified
                                </span>
                                AI Verification
                            </h3>
                            <p style={{ marginBottom: '1rem', color: '#666' }}>
                                Verify your voucher authenticity before listing
                            </p>

                            <button
                                onClick={handleVerifyVoucher}
                                disabled={isVerifying || isSubmitting}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: isVerifying ? '#6c757d' : '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isVerifying ? 'not-allowed' : 'pointer',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span className="material-icons">
                                    {isVerifying ? 'sync' : 'verified'}
                                </span>
                                {isVerifying ? 'Verifying...' : 'Verify Voucher with AI'}
                            </button>

                            {verificationResult && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: verificationResult.isValid ? '#d4edda' : '#f8d7da',
                                    color: verificationResult.isValid ? '#155724' : '#721c24',
                                    borderRadius: '4px'
                                }}>
                                    <h4 style={{ marginBottom: '0.5rem' }}>
                                        {verificationResult.isValid ? '✅ Verification Passed' : '❌ Verification Failed'}
                                    </h4>
                                    <p><strong>Score:</strong> {verificationResult.score}%</p>
                                    <p><strong>Confidence:</strong> {verificationResult.confidence}%</p>

                                    <div style={{ marginTop: '0.5rem' }}>
                                        <strong>Findings:</strong>
                                        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                                            <li>Voucher Code: {verificationResult.findings.hasVoucherCode ? '✅' : '❌'}</li>
                                            <li>Brand Name: {verificationResult.findings.hasBrandName ? '✅' : '❌'}</li>
                                            <li>Readable: {verificationResult.findings.isReadable ? '✅' : '❌'}</li>
                                            <li>Authentic: {verificationResult.findings.looksAuthentic ? '✅' : '❌'}</li>
                                        </ul>
                                    </div>

                                    {verificationResult.extractedData && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <strong>Extracted Data:</strong>
                                            {verificationResult.extractedData.voucherCode && (
                                                <p>Code: {verificationResult.extractedData.voucherCode}</p>
                                            )}
                                            {verificationResult.extractedData.brandName && (
                                                <p>Brand: {verificationResult.extractedData.brandName}</p>
                                            )}
                                        </div>
                                    )}

                                    {verificationResult.issues.length > 0 && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <strong>Issues:</strong>
                                            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                                                {verificationResult.issues.map((issue: string, i: number) => (
                                                    <li key={i}>{issue}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom Section: Price */}
                <div className="sell-bottom-section">
                    <PriceSection
                        price={price}
                        onPriceChange={setPrice}
                        onSubmitListing={handleSubmitListing}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
            <Footer />
        </div>
    )
}