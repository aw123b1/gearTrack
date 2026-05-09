import { ScanLine } from 'lucide-react'

export default function ScannerPage() {
  return (
    <div className="p-4 flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-primary">Scanner</h2>
        <p className="font-body text-sm text-text-muted mt-0.5">Scan a barcode or QR code</p>
      </div>

      <div className="bg-surface rounded-base shadow-sm flex flex-col items-center justify-center gap-4 py-16">
        <div className="bg-primary/10 p-5 rounded-xl">
          <ScanLine size={48} className="text-primary" strokeWidth={1.5} />
        </div>
        <p className="font-body text-text-muted text-sm text-center max-w-xs">
          Camera scanner will appear here. Point at a product barcode to look it up instantly.
        </p>
        <button className="bg-primary text-white font-heading font-semibold text-sm px-6 py-2.5 rounded-base hover:bg-primary-dark transition-colors">
          Open Camera
        </button>
      </div>
    </div>
  )
}
