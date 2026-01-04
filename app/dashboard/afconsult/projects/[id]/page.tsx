import ProjectEditor from './ProjectEditor';

// Required for static export
export async function generateStaticParams() {
    return [{ id: 'debug' }];
}

export default function Page() {
    return <ProjectEditor />;
}
