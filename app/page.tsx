import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HomeMagicGallery } from "@/components/HomeMagicGallery";
import { Nav } from "@/components/Nav";
import { Work } from "@/components/Work";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
        <HomeMagicGallery />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
