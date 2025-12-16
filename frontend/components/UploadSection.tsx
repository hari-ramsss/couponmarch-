"use client"
import { useState } from "react";

interface UploadSectionProps {
    onLogoUpload?: (logoUrl: string) => void;
    onVoucherImageUpload?: (imageUrl: string) => void;
}

export default function UploadSection({ onLogoUpload, onVoucherImageUpload }: UploadSectionProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [voucherImagePreview, setVoucherImagePreview] = useState<string | null>(null);
    const [logoFileName, setLogoFileName] = useState<string>("");
    const [voucherImageFileName, setVoucherImageFileName] = useState<string>("");

    // Handle logo upload
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFileName(file.name);

            const reader = new FileReader();
            reader.onloadend = () => {
                const logoUrl = reader.result as string;
                setLogoPreview(logoUrl);

                if (onLogoUpload) {
                    onLogoUpload(logoUrl);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle voucher image upload
    const handleVoucherImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVoucherImageFileName(file.name);

            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                setVoucherImagePreview(imageUrl);

                if (onVoucherImageUpload) {
                    onVoucherImageUpload(imageUrl);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle removing logo
    const handleRemoveLogo = () => {
        setLogoPreview(null);
        setLogoFileName("");
        if (onLogoUpload) {
            onLogoUpload("");
        }
    };

    // Handle removing voucher image
    const handleRemoveVoucherImage = () => {
        setVoucherImagePreview(null);
        setVoucherImageFileName("");
        if (onVoucherImageUpload) {
            onVoucherImageUpload("");
        }
    };

    return (
        <div className="upload-section">

            <h2>Upload Voucher Details</h2>

            {/* Upload Voucher Logo */}
            <div className="form-group">
                <label>Upload Voucher Logo/Banner</label>
                <p className="upload-description">
                    Upload a logo or banner image that will represent your voucher in marketplace listings.
                </p>
                {!logoPreview ? (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                    />
                ) : (
                    <div className="logo-banner-display">
                        <img src={logoPreview} alt="Voucher Banner" className="banner-image" />
                        <button
                            type="button"
                            className="remove-image-btn"
                            onClick={handleRemoveLogo}
                        >
                            ✕
                        </button>
                        <p className="banner-filename">{logoFileName}</p>
                    </div>
                )}
            </div>

            {/* Upload Actual Voucher Image */}
            <div className="form-group">
                <label>Upload Actual Voucher Image</label>
                <p className="upload-description">
                    Upload the actual voucher/coupon image that buyers will see after purchase.
                </p>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleVoucherImageUpload}
                />
            </div>

            {/* Voucher Image Preview */}
            {voucherImagePreview && (
                <div className="image-preview">
                    <div className="preview-container voucher-preview">
                        <img src={voucherImagePreview} alt="Actual Voucher Preview" />
                        <button
                            type="button"
                            className="remove-preview-btn"
                            onClick={handleRemoveVoucherImage}
                        >
                            ✕
                        </button>
                    </div>
                    <p className="file-info">{voucherImageFileName}</p>
                    <p className="preview-note">
                        This image will be revealed to buyers after purchase
                    </p>
                </div>
            )}

            {/* AI Validation Notice */}
            <div className="ai-validation-note">
                <p>⚡ Both your voucher logo and actual voucher image will be validated by AI before being approved for listing.</p>
            </div>

        </div>
    );
}
