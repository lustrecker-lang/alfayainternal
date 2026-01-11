'use client';

import { useState } from 'react';
import { CompanyBrand } from '@/types/brands';
import { updateBrand, uploadBrandAsset } from '@/lib/brands';
import { Loader2, Upload, X, Save, Image as ImageIcon, Square, PenTool, Stamp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

interface BrandEditorProps {
    brand: CompanyBrand;
    onClose: () => void;
    onUpdate: () => void;
}

export default function BrandEditor({ brand, onClose, onUpdate }: BrandEditorProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // File States
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoUrl, setLogoUrl] = useState(brand.logo_url || '');

    const [logoSquaredFile, setLogoSquaredFile] = useState<File | null>(null);
    const [logoSquaredUrl, setLogoSquaredUrl] = useState(brand.logo_squared_url || '');

    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerUrl, setBannerUrl] = useState(brand.brand_banner_url || '');

    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signatureUrl, setSignatureUrl] = useState(brand.signature_url || '');

    const [stampFile, setStampFile] = useState<File | null>(null);
    const [stampUrl, setStampUrl] = useState(brand.stamp_url || '');

    const { register, handleSubmit, watch, formState: { errors } } = useForm<CompanyBrand>({
        defaultValues: {
            display_name: brand.display_name,
            brand_color_primary: brand.brand_color_primary,
            brand_color_secondary: brand.brand_color_secondary,
            official_website: brand.official_website,
            unit_email: brand.unit_email,
            unit_phone: brand.unit_phone
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'logo_squared' | 'banner' | 'signature' | 'stamp') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);

            if (type === 'logo') {
                setLogoFile(file);
                setLogoUrl(url);
            } else if (type === 'logo_squared') {
                setLogoSquaredFile(file);
                setLogoSquaredUrl(url);
            } else if (type === 'banner') {
                setBannerFile(file);
                setBannerUrl(url);
            } else if (type === 'signature') {
                setSignatureFile(file);
                setSignatureUrl(url);
            } else if (type === 'stamp') {
                setStampFile(file);
                setStampUrl(url);
            }
        }
    };

    const onSubmit = async (data: CompanyBrand) => {
        setIsSubmitting(true);
        try {
            let finalLogoUrl = logoUrl;
            let finalLogoSquaredUrl = logoSquaredUrl;
            let finalBannerUrl = bannerUrl;
            let finalSignatureUrl = signatureUrl;
            let finalStampUrl = stampUrl;

            // Upload assets if changed (files exist in state)
            const uploadPromises = [];

            if (logoFile) {
                uploadPromises.push(uploadBrandAsset(logoFile, brand.unit_slug, 'logo').then(url => finalLogoUrl = url));
            }
            if (logoSquaredFile) {
                uploadPromises.push(uploadBrandAsset(logoSquaredFile, brand.unit_slug, 'logo_squared').then(url => finalLogoSquaredUrl = url));
            }
            if (bannerFile) {
                uploadPromises.push(uploadBrandAsset(bannerFile, brand.unit_slug, 'banner').then(url => finalBannerUrl = url));
            }
            if (signatureFile) {
                uploadPromises.push(uploadBrandAsset(signatureFile, brand.unit_slug, 'signature').then(url => finalSignatureUrl = url));
            }
            if (stampFile) {
                uploadPromises.push(uploadBrandAsset(stampFile, brand.unit_slug, 'stamp').then(url => finalStampUrl = url));
            }

            await Promise.all(uploadPromises);

            await updateBrand(brand.unit_slug, {
                display_name: data.display_name,
                brand_color_primary: data.brand_color_primary,
                brand_color_secondary: data.brand_color_secondary,
                official_website: data.official_website,
                unit_email: data.unit_email,
                unit_phone: data.unit_phone,
                logo_url: finalLogoUrl,
                logo_squared_url: finalLogoSquaredUrl,
                brand_banner_url: finalBannerUrl,
                signature_url: finalSignatureUrl,
                stamp_url: finalStampUrl
            });

            toast.success('Brand updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update brand');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50 sticky top-0 z-10 backdrop-blur-md">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Edit Brand: <span className="text-afconsult">{brand.unit_slug}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Display Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                            <input
                                {...register('display_name', { required: true })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-afconsult focus:border-afconsult bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Website */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Official Website</label>
                            <input
                                {...register('official_website')}
                                placeholder="e.g. imeda.ae"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-afconsult focus:border-afconsult bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                            />
                        </div>
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Email</label>
                            <input
                                {...register('unit_email')}
                                placeholder="contact@imeda.ae"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-afconsult focus:border-afconsult bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                            />
                        </div>
                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Phone</label>
                            <input
                                {...register('unit_phone')}
                                placeholder="+971 50 123 4567"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-afconsult focus:border-afconsult bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Assets Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                            Brand Assets
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 1. Main Logo (SVG) */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">Main Logo (SVG/PNG)</label>
                                <div className="relative group w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
                                    {logoUrl ? (
                                        <>
                                            <img src={logoUrl} alt="Logo" className="max-h-[80%] max-w-[80%] object-contain p-2" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none">
                                                <p className="text-white text-xs font-medium">Change Logo</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <span className="text-xs text-gray-400">Upload Logo</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/svg+xml,image/png"
                                        onChange={(e) => handleFileChange(e, 'logo')}
                                    />
                                </div>
                            </div>

                            {/* 2. Logo Squared */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">Logo Squared (Icon)</label>
                                <div className="relative group w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
                                    {logoSquaredUrl ? (
                                        <>
                                            <img src={logoSquaredUrl} alt="Squared" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none">
                                                <p className="text-white text-xs font-medium">Change Icon</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <Square className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <span className="text-xs text-gray-400">Upload Square</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/png,image/jpeg"
                                        onChange={(e) => handleFileChange(e, 'logo_squared')}
                                    />
                                </div>
                            </div>

                            {/* 3. Brand Banner */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">Brand Banner (Cover)</label>
                                <div className="relative group w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
                                    {bannerUrl ? (
                                        <>
                                            <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none">
                                                <p className="text-white text-xs font-medium">Change Banner</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <span className="text-xs text-gray-400">Upload Banner</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={(e) => handleFileChange(e, 'banner')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            {/* 4. Signature */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">Signature (Transparent PNG)</label>
                                <div className="relative group w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
                                    {signatureUrl ? (
                                        <>
                                            <img src={signatureUrl} alt="Signature" className="max-h-[80%] max-w-[80%] object-contain" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none">
                                                <p className="text-white text-xs font-medium">Change Signature</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <PenTool className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <span className="text-xs text-gray-400">Upload Signature</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/png"
                                        onChange={(e) => handleFileChange(e, 'signature')}
                                    />
                                </div>
                            </div>

                            {/* 5. Stamp */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">Stamp (Transparent PNG)</label>
                                <div className="relative group w-full aspect-square md:aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
                                    {stampUrl ? (
                                        <>
                                            <img src={stampUrl} alt="Stamp" className="max-h-[80%] max-w-[80%] object-contain" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none">
                                                <p className="text-white text-xs font-medium">Change Stamp</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <Stamp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <span className="text-xs text-gray-400">Upload Stamp</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/png"
                                        onChange={(e) => handleFileChange(e, 'stamp')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Colors Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                            Brand Identity
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        {...register('brand_color_primary')}
                                        className="h-9 w-9 p-0 border border-gray-300 rounded overflow-hidden cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        {...register('brand_color_primary')}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-afconsult focus:border-afconsult bg-white dark:bg-zinc-900 text-gray-900 dark:text-white uppercase"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        {...register('brand_color_secondary')}
                                        className="h-9 w-9 p-0 border border-gray-300 rounded overflow-hidden cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        {...register('brand_color_secondary')}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-afconsult focus:border-afconsult bg-white dark:bg-zinc-900 text-gray-900 dark:text-white uppercase"
                                        maxLength={7}
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 bg-afconsult text-white rounded-md hover:bg-afconsult/90 transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Brand
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
