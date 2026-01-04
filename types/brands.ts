export interface CompanyBrand {
    id?: string; // Optional, usually the unit_slug
    unit_slug: string;
    display_name: string;
    logo_url: string;
    logo_squared_url?: string;
    brand_banner_url?: string;
    brand_color_primary: string;
    brand_color_secondary?: string; // Optional
    official_website?: string; // Optional
    unit_email?: string;
    unit_phone?: string;
    updatedAt?: Date;
}
