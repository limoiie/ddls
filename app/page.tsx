import Conferences from "./pages/Conferences";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Conference Deadlines for IIE07 · JQ
        </h1>
        <Conferences />
      </main>
    </div>
  );
}
