import AFClientEditor from './AFClientEditor';

// Required for static export
export async function generateStaticParams() {
    return [{ id: 'debug' }];
}

export default function Page() {
    return <AFClientEditor />;
}
