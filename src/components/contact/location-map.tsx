import { MapPin } from 'lucide-react';

export function LocationMap() {
  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-orange-100">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-orange-50/50 p-6 text-center">
        <MapPin className="mb-3 h-12 w-12 text-5xl text-orange-600" />
        <h4 className="mb-2 text-lg font-bold">Our Delivery Range</h4>
        <p className="mb-4 text-sm text-gray-600">
          Serving within 50km of downtown Toronto. Contact us for special event
          catering outside this range.
        </p>
        <a
          href="https://maps.google.com/?q=Toronto,+ON,+Canada"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-orange-100 bg-white px-4 py-2 text-xs font-bold transition-colors hover:bg-orange-600 hover:text-white"
        >
          View Interactive Map
        </a>
      </div>
    </div>
  );
}
