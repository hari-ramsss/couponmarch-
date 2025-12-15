import { useState } from "react";

type ModalState =
    | "PREVIEW"
    | "PROCESSING"
    | "REVEAL"
    | "VERIFY"
    | "SUCCESS"
    | "FAILED";

interface BuyVoucherModalProps {
    voucherId?: string | number;
    voucherTitle?: string;
    voucherPrice?: string;
    onClose: () => void;
}

export default function BuyVoucherModal({
    voucherId,
    voucherTitle = "Amazon ₹500 Gift Card",
    voucherPrice = "0.015 ETH",
    onClose
}: BuyVoucherModalProps) {

    const [state, setState] = useState<ModalState>("PREVIEW");

    // Handle backdrop click to close modal
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Prevent event bubbling when clicking inside modal
    const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-container" onClick={handleModalClick}>

                {/* HEADER */}
                <div className="modal-header">
                    <h2>Purchase Voucher Securely</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                {/* BODY */}
                <div className="modal-body">

                    {state === "PREVIEW" && (
                        <>
                            <h3>Voucher Overview</h3>
                            <p><strong>Voucher:</strong> {voucherTitle}</p>
                            <p><strong>Seller:</strong> 0xAbc...123</p>
                            <p><strong>Expiry:</strong> 30 Sep 2025</p>

                            <div className="voucher-image blurred">
                                <p>Voucher image is blurred</p>
                            </div>

                            <p><strong>Price:</strong> {voucherPrice}</p>

                            <p>
                                Funds will be sent to an <strong>Escrow Smart Contract</strong>.
                                Seller cannot access funds until verification.
                            </p>

                            <button onClick={() => setState("PROCESSING")}>
                                Confirm & Pay {voucherPrice}
                            </button>
                        </>
                    )}

                    {state === "PROCESSING" && (
                        <>
                            <h3>Processing Payment</h3>
                            <p>Waiting for wallet confirmation…</p>
                            <p>Locking funds in escrow…</p>

                            {/* Simulated success */}
                            <button onClick={() => setState("REVEAL")}>
                                Simulate Payment Success
                            </button>
                        </>
                    )}

                    {state === "REVEAL" && (
                        <>
                            <h3>Payment Successful</h3>

                            <div className="voucher-image">
                                <p>Unblurred Voucher Image</p>
                            </div>

                            <p><strong>Coupon Code:</strong> AMAZON-XYZ-123</p>

                            <p>
                                You have a limited time to verify this voucher before funds are released.
                            </p>

                            <button onClick={() => setState("VERIFY")}>
                                Continue to Verification
                            </button>
                        </>
                    )}

                    {state === "VERIFY" && (
                        <>
                            <h3>Verify Voucher</h3>
                            <p>Did the voucher work as expected?</p>

                            <button onClick={() => setState("SUCCESS")}>
                                Coupon Works
                            </button>

                            <button onClick={() => setState("FAILED")}>
                                Coupon Doesn’t Work
                            </button>
                        </>
                    )}

                    {state === "SUCCESS" && (
                        <>
                            <h3>Success</h3>
                            <p>Funds have been released to the seller.</p>
                            <button onClick={onClose}>Close</button>
                        </>
                    )}

                    {state === "FAILED" && (
                        <>
                            <h3>Refund Initiated</h3>
                            <p>Your payment will be refunded from escrow.</p>
                            <button onClick={onClose}>Close</button>
                        </>
                    )}

                </div>

            </div>

        </div>
    );
}
