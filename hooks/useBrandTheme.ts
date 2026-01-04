import { useState, useEffect } from 'react';
import { CompanyBrand } from '@/types/brands';
import { getBrandBySlug } from '@/lib/brands';
import { getUnitBySlug } from '@/config/units';

export function useBrandTheme(unitSlug: string) {
    const [brand, setBrand] = useState<CompanyBrand | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchBrand() {
            setLoading(true);
            try {
                // 1. Try to get from DB
                const dbBrand = await getBrandBySlug(unitSlug);

                if (dbBrand && isMounted) {
                    setBrand(dbBrand);
                } else if (!dbBrand && isMounted) {
                    // 2. Fallback to Config
                    const configUnit = getUnitBySlug(unitSlug);
                    if (configUnit) {
                        setBrand({
                            unit_slug: configUnit.slug,
                            display_name: configUnit.name,
                            logo_url: configUnit.logo || '',
                            brand_color_primary: configUnit.brandColor.startsWith('#') ? configUnit.brandColor : '#000000',
                            // Note: If config uses tailwind class like 'imeda', we might not get a hex here.
                            // Ideally config should migrate to hex or we need a mapping.
                            // For now, this is a best-effort fallback.
                        });
                    }
                }
            } catch (error) {
                console.error('Error in useBrandTheme:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        if (unitSlug) {
            fetchBrand();
        }

        return () => {
            isMounted = false;
        };
    }, [unitSlug]);

    return { brand, loading };
}
