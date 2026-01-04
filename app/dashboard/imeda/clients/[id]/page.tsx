import ClientEditor from './ClientEditor';

// Required for static export
export async function generateStaticParams() {
    return [{ id: 'debug' }];
}

export default function ImedaClientDetailPage() {
    return <ClientEditor />;
}
