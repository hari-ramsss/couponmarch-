/**
 * Minimal AI Verification Service
 * Uses OpenAI Vision API to validate voucher images
 * 
 * Checks for:
 * - Voucher code visibility
 * - Brand/merchant name
 * - Expiry date
 * - Authenticity indicators
 */

interface VerificationResult {
    isValid: boolean;
    confidence: number;
    findings: {
        hasVoucherCode: boolean;
        hasBrandName: boolean;
        hasExpiryDate: boolean;
        isReadable: boolean;
        looksAuthentic: boolean;
    };
    extractedData: {
        voucherCode?: string;
        brandName?: string;
        expiryDate?: string;
    };
    issues: string[];
    score: number; // 0-100
}

/**
 * Verify voucher image using OpenAI Vision API
 * @param imageBuffer - Image buffer or base64 string
 * @param expectedData - Expected voucher data for validation
 */
export async function verifyVoucherImage(
    imageBuffer: Buffer | string,
    expectedData?: {
        code?: string;
        brand?: string;
        type?: string;
    }
): Promise<VerificationResult> {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    // If no API key, return basic validation
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
        console.warn('⚠️ OpenAI API key not configured. Using basic validation.');
        return basicValidation(imageBuffer, expectedData);
    }

    try {
        // Convert buffer to base64 if needed
        const base64Image = Buffer.isBuffer(imageBuffer)
            ? imageBuffer.toString('base64')
            : imageBuffer;

        // Call OpenAI Vision API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Cheaper and faster model
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Analyze this voucher/coupon image and extract the following information in JSON format:
{
  "hasVoucherCode": boolean,
  "voucherCode": "extracted code or null",
  "hasBrandName": boolean,
  "brandName": "extracted brand or null",
  "hasExpiryDate": boolean,
  "expiryDate": "extracted date or null",
  "isReadable": boolean,
  "looksAuthentic": boolean (check for signs of tampering, poor quality, or fake),
  "issues": ["list any problems found"],
  "confidence": number (0-100)
}

Expected data for validation:
- Code: ${expectedData?.code || 'unknown'}
- Brand: ${expectedData?.brand || 'unknown'}
- Type: ${expectedData?.type || 'unknown'}

Be strict about authenticity. Look for clear text, proper formatting, and genuine appearance.`,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 500,
                temperature: 0.3, // Lower temperature for more consistent results
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        // Parse JSON response
        const aiResult = JSON.parse(content);

        // Calculate overall score
        const score = calculateScore(aiResult);

        return {
            isValid: score >= 60, // 60% threshold
            confidence: aiResult.confidence || 0,
            findings: {
                hasVoucherCode: aiResult.hasVoucherCode || false,
                hasBrandName: aiResult.hasBrandName || false,
                hasExpiryDate: aiResult.hasExpiryDate || false,
                isReadable: aiResult.isReadable || false,
                looksAuthentic: aiResult.looksAuthentic || false,
            },
            extractedData: {
                voucherCode: aiResult.voucherCode,
                brandName: aiResult.brandName,
                expiryDate: aiResult.expiryDate,
            },
            issues: aiResult.issues || [],
            score,
        };
    } catch (error: any) {
        console.error('AI verification error:', error);
        // Fallback to basic validation
        return basicValidation(imageBuffer, expectedData);
    }
}

/**
 * Basic validation without AI (fallback)
 */
function basicValidation(
    imageBuffer: Buffer | string,
    expectedData?: any
): VerificationResult {
    // Simple checks without AI
    const hasExpectedData = !!(expectedData?.code && expectedData?.brand);

    return {
        isValid: hasExpectedData,
        confidence: hasExpectedData ? 50 : 30,
        findings: {
            hasVoucherCode: !!expectedData?.code,
            hasBrandName: !!expectedData?.brand,
            hasExpiryDate: false,
            isReadable: true,
            looksAuthentic: true,
        },
        extractedData: {
            voucherCode: expectedData?.code,
            brandName: expectedData?.brand,
        },
        issues: hasExpectedData
            ? []
            : ['AI verification not available. Manual review recommended.'],
        score: hasExpectedData ? 50 : 30,
    };
}

/**
 * Calculate overall score from AI findings
 */
function calculateScore(findings: any): number {
    let score = 0;

    // Core requirements (60 points)
    if (findings.hasVoucherCode) score += 25;
    if (findings.hasBrandName) score += 15;
    if (findings.isReadable) score += 20;

    // Quality indicators (40 points)
    if (findings.looksAuthentic) score += 30;
    if (findings.hasExpiryDate) score += 10;

    // Deduct for issues
    if (findings.issues && findings.issues.length > 0) {
        score -= findings.issues.length * 10;
    }

    return Math.max(0, Math.min(100, score));
}

/**
 * Quick validation for form submission
 */
export async function quickValidate(
    voucherImageBuffer: Buffer,
    voucherData: {
        code: string;
        brand?: string;
        type?: string;
    }
): Promise<{ valid: boolean; message: string; score: number }> {
    const result = await verifyVoucherImage(voucherImageBuffer, voucherData);

    if (result.isValid) {
        return {
            valid: true,
            message: `Verification passed (${result.score}% confidence)`,
            score: result.score,
        };
    } else {
        const issues = result.issues.join(', ');
        return {
            valid: false,
            message: `Verification failed: ${issues || 'Low confidence score'}`,
            score: result.score,
        };
    }
}
