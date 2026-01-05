'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TeacherEditor from '../TeacherEditor';
import { getTeacher } from '@/lib/teachers';
import type { ImedaTeacher } from '@/types/teacher';

export default function EditTeacherPage() {
    const params = useParams();
    const id = params.id as string;
    const [teacher, setTeacher] = useState<ImedaTeacher | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTeacher();
    }, [id]);

    const loadTeacher = async () => {
        try {
            const data = await getTeacher(id);
            setTeacher(data);
        } catch (error) {
            console.error('Error loading teacher:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-imeda"></div>
            </div>
        );
    }

    return <TeacherEditor teacher={teacher} />;
}
