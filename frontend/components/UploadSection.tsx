"use client"
import { useState } from "react";

interface UploadSectionProps {
    onLogoUpload?: (logoFile: File | null) => void;
    onVoucherImageUpload?: (imageFile: File | null) => void;
}

export default function UploadSection({ onLogoUpload, onVoucherImageUpload }: UploadSectionProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [voucherImagePreview, setVoucherImagePreview] = useState<string | null>(null);
    const [logoFileName, setLogoFileName] = useState<string>("");
    const [voucherImageFileName, setVoucherImageFileName] = useState<string>("");
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [voucherImageFile, setVoucherImageFile] = useState<File | null>(null);

    // Handle logo file selection (NO IPFS upload yet)
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLogoFileName(file.name);
        setLogoFile(file);

        // Create preview for immediate display (local only)
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Pass file to parent component (not IPFS data)
        if (onLogoUpload) {
            onLogoUpload(file);
        }
    };

    // Handle voucher image file selection (NO IPFS upload yet)
    const handleVoucherImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setVoucherImageFileName(file.name);
        setVoucherImageFile(file);

        // Create preview for immediate display (local only)
        const reader = new FileReader();
        reader.onloadend = () => {
            setVoucherImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Pass file to parent component (not IPFS data)
        if (onVoucherImageUpload) {
            onVoucherImageUpload(file);
        }
    };

    // Handle removing logo
    const handleRemoveLogo = () => {
        setLogoPreview(null);
        setLogoFileName("");
        setLogoFile(null);
        if (onLogoUpload) {
            onLogoUpload(null);
        }
    };

    // Handle removing voucher image
    const handleRemoveVoucherImage = () => {
        setVoucherImagePreview(null);
        setVoucherImageFileName("");
        setVoucherImageFile(null);
        if (onVoucherImageUpload) {
            onVoucherImageUpload(null);
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
                    <br />
                    <strong>Note:</strong> Files will be uploaded to IPFS only when you submit the listing.
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
                        <p className="file-status">📁 Ready for upload</p>
                    </div>
                )}
            </div>

            {/* Upload Actual Voucher Image */}
            <div className="form-group">
                <label>Upload Actual Voucher Image</label>
                <p className="upload-description">
                    Upload the actual voucher/coupon image that buyers will see after purchase.
                    <br />
                    <strong>Note:</strong> Files will be uploaded to IPFS only when you submit the listing.
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
                    <p className="file-status">📁 Ready for upload</p>
                </div>
            )}

        </div>
    );
}
