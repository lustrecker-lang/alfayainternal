'use client';

import { useForm, Controller } from 'react-hook-form';
import { CompanyProfile } from '@/types/settings';
import { updateCompanyProfile, uploadCompanyAsset } from '@/lib/settings';
import { useState, useEffect } from 'react';
import { Save, Loader2, Upload, X, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CountrySelect from '@/components/ui/CountrySelect';

interface LegalIdentityFormProps {
    defaultValues?: Partial<CompanyProfile>;
}

export default function LegalIdentityForm({ defaultValues }: LegalIdentityFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Manage file states separately as they need async upload before form submit
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [stampFile, setStampFile] = useState<File | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signedStampFile, setSignedStampFile] = useState<File | null>(null);

    // Initial URLs (from stored settings)
    const [logoUrl, setLogoUrl] = useState(defaultValues?.logo_url || '');
    const [stampUrl, setStampUrl] = useState(defaultValues?.stamp_url || '');
    const [signatureUrl, setSignatureUrl] = useState(defaultValues?.signature_url || '');
    const [signedStampUrl, setSignedStampUrl] = useState(defaultValues?.signed_stamp_url || '');

    const { register, handleSubmit, control, formState: { errors } } = useForm<CompanyProfile>({
        defaultValues: {
            legal_name: '',
            trn_number: '',
            address: {
                street: '',
                city: '',
                state: '',
                zip: '',
                country: 'United Arab Emirates'
            },
            ...defaultValues
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp' | 'signature' | 'signed_stamp') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const localPreview = URL.createObjectURL(file);

            if (type === 'logo') {
                setLogoFile(file);
                setLogoUrl(localPreview);
            } else if (type === 'stamp') {
                setStampFile(file);
                setStampUrl(localPreview);
            } else if (type === 'signature') {
                setSignatureFile(file);
                setSignatureUrl(localPreview);
            } else if (type === 'signed_stamp') {
                setSignedStampFile(file);
                setSignedStampUrl(localPreview);
            }
        }
    };

    const onSubmit = async (data: CompanyProfile) => {
        setIsSubmitting(true);
        try {
            // Upload files if new ones are selected
            let finalLogoUrl = logoUrl;
            let finalStampUrl = stampUrl;
            let finalSignatureUrl = signatureUrl;
            let finalSignedStampUrl = signedStampUrl;

            // If local preview blob, it means we need to upload
            if (logoFile) {
                finalLogoUrl = await uploadCompanyAsset(logoFile, 'logo');
            }
            if (stampFile) {
                finalStampUrl = await uploadCompanyAsset(stampFile, 'stamp');
            }
            if (signatureFile) {
                finalSignatureUrl = await uploadCompanyAsset(signatureFile, 'signature');
            }
            if (signedStampFile) {
                finalSignedStampUrl = await uploadCompanyAsset(signedStampFile, 'signed_stamp');
            }

            await updateCompanyProfile({
                legal_name: data.legal_name,
                trade_license_number: data.trade_license_number,
                trn_number: data.trn_number,
                contact_email: data.contact_email,
                contact_phone: data.contact_phone,
                address: data.address,
                logo_url: finalLogoUrl.startsWith('blob:') ? '' : finalLogoUrl,
                stamp_url: finalStampUrl.startsWith('blob:') ? '' : finalStampUrl,
                signature_url: finalSignatureUrl.startsWith('blob:') ? '' : finalSignatureUrl,
                signed_stamp_url: finalSignedStampUrl.startsWith('blob:') ? '' : finalSignedStampUrl,
            });
            toast.success('Legal identity updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update settings');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
                    Company Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Legal Company Name
                        </label>
                        <input
                            {...register('legal_name', { required: 'Company name is required' })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-afconsult focus:border-afconsult bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                            placeholder="e.g. Al Faya Ventures LLC"
                        />
                        {errors.legal_name && <p className="text-red-500 text-xs mt-1">{errors.legal_name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Trade License Number
                        </label>
                        <input
                            {...register('trade_license_number')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-afconsult focus:border-afconsult bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                            placeholder="License No."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            TRN Number (VAT)
                        </label>
                        <input
                            {...register('trn_number')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-afconsult focus:border-afconsult bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                            placeholder="e.g. 100xxxxxxx00003"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                        <input
                            {...register('contact_email')}
                            type="email"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-afconsult focus:border-transparent outline-none transition-all"
                            placeholder="info@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                        <input
                            {...register('contact_phone')}
                            type="tel"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-afconsult focus:border-transparent outline-none transition-all"
                            placeholder="+971 50 000 0000"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Registered Address</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                        <input
                            {...register('address.street')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-afconsult focus:border-afconsult bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                            <input
                                {...register('address.city')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-afconsult focus:border-afconsult bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State / Emirate</label>
                            <input
                                {...register('address.state')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-afconsult focus:border-afconsult bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PO Box / Zip</label>
                            <input
                                {...register('address.zip')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-afconsult focus:border-afconsult bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                            <Controller
                                name="address.country"
                                control={control}
                                render={({ field }) => (
                                    <CountrySelect
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* File Uploads */}
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo */}
                    <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                        <FileUploadField
                            label="Company Logo"
                            previewUrl={logoUrl}
                            onChange={(e) => handleFileChange(e, 'logo')}
                            onRemove={() => { setLogoUrl(''); setLogoFile(null); }}
                        />
                    </div>

                    {/* Stamp */}
                    <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                        <FileUploadField
                            label="Company Stamp"
                            previewUrl={stampUrl}
                            onChange={(e) => handleFileChange(e, 'stamp')}
                            onRemove={() => { setStampUrl(''); setStampFile(null); }}
                        />
                    </div>

                    {/* Signature */}
                    <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                        <FileUploadField
                            label="Auth. Signature"
                            previewUrl={signatureUrl}
                            onChange={(e) => handleFileChange(e, 'signature')}
                            onRemove={() => { setSignatureUrl(''); setSignatureFile(null); }}
                        />
                    </div>

                    {/* Signed Stamp */}
                    <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                        <FileUploadField
                            label="Signed Stamp"
                            previewUrl={signedStampUrl}
                            onChange={(e) => handleFileChange(e, 'signed_stamp')}
                            onRemove={() => { setSignedStampUrl(''); setSignedStampFile(null); }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-afconsult text-white rounded-md hover:bg-afconsult/90 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>
        </form>
    );
}

function FileUploadField({ label, previewUrl, onChange, onRemove }: { label: string, previewUrl: string, onChange: (e: any) => void, onRemove: () => void }) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Reset state when previewUrl changes
    useEffect(() => {
        if (previewUrl) {
            setIsLoading(true);
            setHasError(false);
        }
    }, [previewUrl]);

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
            {previewUrl ? (
                <div className="relative group w-full h-32 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 z-10">
                            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                        </div>
                    )}

                    {/* Error State */}
                    {hasError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-800 z-10 text-red-400">
                            <RefreshCw className="w-5 h-5 mb-1" />
                            <span className="text-xs">Failed to load</span>
                        </div>
                    ) : (
                        <img
                            src={previewUrl}
                            alt={label}
                            className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false);
                                setHasError(true);
                            }}
                        />
                    )}

                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    >
                        <X className="w-3 h-3" />
                    </button>

                    {/* Clear error button if needed, but remove does the job */}
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500 font-medium">Click to upload</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*,.png,.jpg,.jpeg" onChange={onChange} />
                </label>
            )}
        </div>
    );
}
