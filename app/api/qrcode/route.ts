import { NextResponse } from 'next/server'
import { generateQRCode } from '@/lib/qrcode'

// POST /api/qrcode - Generate QR code
export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const qrCode = await generateQRCode(url)

    return NextResponse.json({ qrCode })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}

