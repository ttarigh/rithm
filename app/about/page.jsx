import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl p-8 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">About Rithm</h1>

      <div className="prose prose-invert lg:prose-xl mx-auto text-gray-800 space-y-6">
        <p>
          Rithm is a unique dating concept centered around the idea that your musical taste and online vibe, as reflected by your Instagram explore page, can be a powerful indicator of compatibility.
        </p>
        <p>
          Instead of endless swiping based on just a few photos, Rithm asks users to share a glimpse into their digital world via a screenshot of their explore page. This provides a richer, more nuanced first impression.
        </p>
        <p>
          When you swipe right on someone whose vibe resonates with yours, and they swipe right on you too, it's a match! Only then are Instagram handles revealed, opening the door for connection.
        </p>
        <p>
          No lengthy profiles, no complex algorithms – just pure vibes.
        </p>
      </div>

      <div className="text-center mt-12">
        <Link href="/">
           <span className="text-blue-500 hover:underline">
             Back to Home
           </span>
        </Link>
      </div>
    </div>
  );
} 