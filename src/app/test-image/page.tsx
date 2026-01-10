import Image from 'next/image';

export default function TestImagePage() {
  const testImage =
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80';
  const fallbackImage = '/placeholder-food.svg';

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-2xl font-bold">Image Loading Test</h1>

      <div className="space-y-8">
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            Unsplash Image (External)
          </h2>
          <div className="relative h-96 w-96 overflow-hidden rounded-lg border">
            <Image
              src={testImage}
              alt="Test Unsplash Image"
              fill
              className="object-cover"
              onLoad={() => console.log('Unsplash image loaded successfully')}
              onError={e => {
                console.error('Unsplash image failed to load:', e);
              }}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Fallback Image (Local)</h2>
          <div className="relative h-96 w-96 overflow-hidden rounded-lg border">
            <Image
              src={fallbackImage}
              alt="Test Fallback Image"
              fill
              className="object-cover"
              onLoad={() => console.log('Fallback image loaded successfully')}
              onError={e => {
                console.error('Fallback image failed to load:', e);
              }}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">
            Regular img tag (External)
          </h2>
          <img
            src={testImage}
            alt="Test Regular Image"
            className="h-96 w-96 rounded-lg border object-cover"
            onLoad={() => console.log('Regular image loaded successfully')}
            onError={e => {
              console.error('Regular image failed to load:', e);
            }}
          />
        </div>
      </div>
    </div>
  );
}
