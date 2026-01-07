"use client";

import { useState } from "react";
import Header from "@/components/Header";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission (replace with actual API call)
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSubmitStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header pageType="marketplace" />
            <div className="contact-page">
                {/* Hero Section */}
                <section className="contact-hero">
                    <div className="contact-hero-content">
                        <h1 className="contact-title">Get in Touch</h1>
                        <p className="contact-subtitle">
                            Have questions, feedback, or need support? We'd love to hear from you!
                        </p>
                    </div>
                </section>

                <div className="contact-container">
                    <div className="contact-grid">
                        {/* Contact Form */}
                        <div className="contact-form-card">
                            <h2 className="contact-form-title">Send us a Message</h2>

                            {submitStatus === 'success' && (
                                <div className="contact-alert contact-alert-success">
                                    <p>✅ Message sent successfully! We'll get back to you soon.</p>
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className="contact-alert contact-alert-error">
                                    <p>❌ Something went wrong. Please try again.</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="contact-form-group">
                                    <label htmlFor="name" className="contact-form-label">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="contact-form-input"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="contact-form-group">
                                    <label htmlFor="email" className="contact-form-label">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="contact-form-input"
                                        placeholder="Enter your email address"
                                    />
                                </div>

                                <div className="contact-form-group">
                                    <label htmlFor="subject" className="contact-form-label">
                                        Subject *
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                        className="contact-form-select"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="support">Technical Support</option>
                                        <option value="bug">Bug Report</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="press">Press & Media</option>
                                    </select>
                                </div>

                                <div className="contact-form-group">
                                    <label htmlFor="message" className="contact-form-label">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="contact-form-textarea"
                                        placeholder="Tell us how we can help you..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="contact-form-submit"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>

                        {/* Contact Information */}
                        <div className="contact-info">
                            {/* Contact Cards */}
                            <div className="contact-card contact-card-email">
                                <div className="contact-card-header">
                                    <div className="contact-card-icon">📧</div>
                                    <div>
                                        <h3 className="contact-card-title">Email Support</h3>
                                        <p className="contact-card-desc">Get help with your account</p>
                                    </div>
                                </div>
                                <p className="contact-card-value">support@couponmarche.com</p>
                                <p className="contact-card-note">Response time: 24-48 hours</p>
                            </div>

                            <div className="contact-card contact-card-community">
                                <div className="contact-card-header">
                                    <div className="contact-card-icon">💬</div>
                                    <div>
                                        <h3 className="contact-card-title">Community</h3>
                                        <p className="contact-card-desc">Join our Discord community</p>
                                    </div>
                                </div>
                                <p className="contact-card-value">discord.gg/couponmarche</p>
                                <p className="contact-card-note">Real-time support & discussions</p>
                            </div>

                            <div className="contact-card contact-card-social">
                                <div className="contact-card-header">
                                    <div className="contact-card-icon">🐦</div>
                                    <div>
                                        <h3 className="contact-card-title">Social Media</h3>
                                        <p className="contact-card-desc">Follow us for updates</p>
                                    </div>
                                </div>
                                <p className="contact-card-value">@CouponMarche</p>
                                <p className="contact-card-note">Latest news & announcements</p>
                            </div>

                            {/* FAQ Section */}
                            <div className="contact-faq">
                                <h3 className="contact-faq-title">Quick Help</h3>
                                <div className="contact-faq-list">
                                    <div className="contact-faq-item">
                                        <h4 className="contact-faq-question">How do I connect my wallet?</h4>
                                        <p className="contact-faq-answer">Click "Connect Wallet" in the header and follow the prompts to connect your MetaMask or compatible wallet.</p>
                                    </div>
                                    <div className="contact-faq-item">
                                        <h4 className="contact-faq-question">Are transactions secure?</h4>
                                        <p className="contact-faq-answer">Yes! All transactions are secured by smart contracts on the Ethereum blockchain.</p>
                                    </div>
                                    <div className="contact-faq-item">
                                        <h4 className="contact-faq-question">What fees do you charge?</h4>
                                        <p className="contact-faq-answer">We charge a small platform fee on successful transactions. Gas fees are separate and paid to the network.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Business Hours */}
                            <div className="contact-hours">
                                <h3 className="contact-hours-title">Support Hours</h3>
                                <div className="contact-hours-list">
                                    <div className="contact-hours-item">
                                        <span>Monday - Friday:</span>
                                        <span>9:00 AM - 6:00 PM UTC</span>
                                    </div>
                                    <div className="contact-hours-item">
                                        <span>Saturday:</span>
                                        <span>10:00 AM - 4:00 PM UTC</span>
                                    </div>
                                    <div className="contact-hours-item">
                                        <span>Sunday:</span>
                                        <span>Closed</span>
                                    </div>
                                </div>
                                <p className="contact-hours-note">
                                    * Emergency support available 24/7 for critical issues
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}