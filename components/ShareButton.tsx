'use client'

import { useState } from 'react'
import { Share2, Twitter, Facebook, Mail, Link as LinkIcon, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareButtonProps {
  url: string
  title: string
  dealId?: string
}

export function ShareButton({ url, title, dealId }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)

  const createShortUrl = async (platform: string) => {
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          dealId,
          platform,
          utmSource: platform,
          utmMedium: 'social',
        }),
      })

      const data = await response.json()
      return data.shortUrl
    } catch (error) {
      console.error('Error creating short URL:', error)
      return url
    }
  }

  const handleShare = async (platform: string) => {
    const shortUrl = await createShortUrl(platform)
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shortUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this deal: ${shortUrl}`)}`,
    }

    if (platform in shareUrls) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400')
      toast.success('Sharing link opened!')
    }

    setShowMenu(false)
  }

  const handleCopyLink = async () => {
    const shortUrl = await createShortUrl('direct')
    
    try {
      await navigator.clipboard.writeText(shortUrl)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
    
    setShowMenu(false)
  }

  const handleGenerateQR = async () => {
    try {
      const shortUrl = await createShortUrl('qr')
      
      const response = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: shortUrl }),
      })

      const data = await response.json()
      setQrCode(data.qrCode)
      toast.success('QR code generated!')
    } catch (error) {
      toast.error('Failed to generate QR code')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-20 py-2">
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 text-left"
            >
              <Twitter className="w-4 h-4 text-blue-400" />
              Share on Twitter
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 text-left"
            >
              <Facebook className="w-4 h-4 text-blue-600" />
              Share on Facebook
            </button>
            <button
              onClick={() => handleShare('email')}
              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 text-left"
            >
              <Mail className="w-4 h-4 text-gray-600" />
              Share via Email
            </button>
            <hr className="my-2" />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 text-left"
            >
              <LinkIcon className="w-4 h-4 text-gray-600" />
              Copy Link
            </button>
            <button
              onClick={handleGenerateQR}
              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 text-left"
            >
              <QrCode className="w-4 h-4 text-gray-600" />
              Generate QR Code
            </button>
          </div>
        </>
      )}

      {qrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-4">QR Code</h3>
            <img src={qrCode} alt="QR Code" className="w-full" />
            <div className="flex gap-2 mt-4">
              <a
                href={qrCode}
                download="qrcode.png"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-center"
              >
                Download
              </a>
              <button
                onClick={() => setQrCode(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

