import Navbar from '@/components/Navbar';
import PantrySearch from '@/components/PantrySearch';

export const metadata = {
    title: 'Tìm Công Thức Từ Nguyên Liệu - CookApp',
    description: 'Nhập nguyên liệu bạn có, AI sẽ tìm công thức phù hợp nhất cho bạn',
};

export default function PantryPage() {
    return (
        <>
            <Navbar />
            <main style={{ minHeight: '100vh', paddingTop: '80px' }}>
                <PantrySearch />
            </main>
        </>
    );
}
