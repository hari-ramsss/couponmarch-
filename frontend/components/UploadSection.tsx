"use client"
import { useState } from "react";

export default function UploadSection() {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");

    // Handle image file preview
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="upload-section">

            <h2>Upload Voucher</h2>

            {/* Upload Image */}
            <div className="form-group">
                <label>Upload Voucher Image</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div className="image-preview">
                    <img src={imagePreview} alt="Voucher Preview" />
                    <p>{fileName}</p>
                </div>
            )}

            {/* Upload PDF or Screenshot */}
            <div className="form-group">
                <label>Upload PDF / Screenshot (optional)</label>
                <input
                    type="file"
                    accept=".pdf, image/*"
                />
            </div>

            {/* AI Validation Notice */}
            <div className="ai-validation-note">
                <p>⚡ This voucher will be validated by AI before being approved for listing.</p>
            </div>

        </div>
    );
}
