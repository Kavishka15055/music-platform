import Gallery from '@/app/components/Gallery';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Gallery />
      <Footer />
    </main>
  );
}
