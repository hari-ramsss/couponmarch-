/**
 * Brand Color Palette
 * Centralized color definitions for the AI-Verified Voucher Marketplace
 */

export const colors = {
    // Core Brand Colors
    brand: {
        punchyRed: '#F2352B',      // Background / fills
        offWhite: '#FFF7EF',        // Ticket body
        pureBlack: '#000000',       // Outlines / big text
    },

    // Supporting Accent Colors
    accent: {
        sunnyYellow: '#FFD432',     // Card / sticker
        boldTeal: '#00C7B1',        // Card / CTA
        deepPurple: '#5B2BA8',      // Large block
        orangeAccent: '#FF8A2A',    // Corner tags
    },

    // Shadow and Line Colors
    ui: {
        ticketShadow: '#1A1A1A',    // Drop shadow
        softRedLine: '#E3433A',     // Ticket border line
        mutedGray: '#3A3A3A',       // Subtle dividers
    },
} as const;

// Type-safe color access
export type BrandColor = typeof colors.brand[keyof typeof colors.brand];
export type AccentColor = typeof colors.accent[keyof typeof colors.accent];
export type UIColor = typeof colors.ui[keyof typeof colors.ui];

// Helper function to get color by name
export const getColor = (category: keyof typeof colors, name: string): string => {
    return (colors[category] as any)[name] || colors.brand.pureBlack;
};
