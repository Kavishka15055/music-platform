import Gallery from '@/components/Gallery';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Gallery />
      <Footer />
    </main>
  );
}
