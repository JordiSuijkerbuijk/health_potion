import Head from "next/head";
import BackgroundDotsSection from "../sections/BackgroundDotsSection/BackgroundDotsSection";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Health Potion</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <BackgroundDotsSection />
      </main>
    </div>
  );
}
