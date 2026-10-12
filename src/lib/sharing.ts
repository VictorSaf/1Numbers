// Social Media Sharing and Link Generation

export interface ShareData {
  title: string;
  text: string;
  url: string;
  imageUrl?: string;
}

/**
 * Share to Facebook using Web Share API or Facebook URL.
 * @param data - Share data
 */
export const shareToFacebook = (data: ShareData): void => {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`;
  
  if (navigator.share) {
    navigator.share({
      title: data.title,
      text: data.text,
      url: data.url
    }).catch(() => {
      // Fallback to URL
      window.open(shareUrl, '_blank', 'width=600,height=400');
    });
  } else {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
};

/**
 * Share to Twitter/X using Web Share API or Twitter URL.
 * @param data - Share data
 */
export const shareToTwitter = (data: ShareData): void => {
  const text = `${data.title} - ${data.text}`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(data.url)}`;
  
  if (navigator.share) {
    navigator.share({
      title: data.title,
      text: data.text,
      url: data.url
    }).catch(() => {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    });
  } else {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
};

/**
 * Share to WhatsApp using Web Share API or WhatsApp URL.
 * @param data - Share data
 */
export const shareToWhatsApp = (data: ShareData): void => {
  const text = `${data.title}\n\n${data.text}\n\n${data.url}`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  
  if (navigator.share) {
    navigator.share({
      title: data.title,
      text: text,
      url: data.url
    }).catch(() => {
      window.open(shareUrl, '_blank');
    });
  } else {
    window.open(shareUrl, '_blank');
  }
};

/**
 * Share to Instagram (opens Instagram app or website).
 * Note: Instagram doesn't support direct URL sharing, so we use Web Share API.
 * @param data - Share data
 */
export const shareToInstagram = (data: ShareData): void => {
  // Instagram doesn't support direct URL sharing
  // Use Web Share API if available, otherwise show message
  if (navigator.share) {
    navigator.share({
      title: data.title,
      text: data.text,
      url: data.url
    }).catch(() => {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${data.title}\n\n${data.text}\n\n${data.url}`);
      alert('Link copied to clipboard! You can paste it in Instagram.');
    });
  } else {
    // Copy to clipboard
    navigator.clipboard.writeText(`${data.title}\n\n${data.text}\n\n${data.url}`);
    alert('Link copied to clipboard! You can paste it in Instagram.');
  }
};

/**
 * Send report by email using mailto: link.
 * @param data - Share data
 * @param recipientEmail - Optional recipient email
 */
export const sendReportByEmail = (data: ShareData, recipientEmail?: string): void => {
  const subject = encodeURIComponent(data.title);
  const body = encodeURIComponent(`${data.text}\n\n${data.url}`);
  const mailtoUrl = recipientEmail 
    ? `mailto:${recipientEmail}?subject=${subject}&body=${body}`
    : `mailto:?subject=${subject}&body=${body}`;
  
  window.location.href = mailtoUrl;
};

/**
 * Generate shareable link for numerology report.
 * @param reportData - Report data (name, birth date)
 * @param baseUrl - Base URL of the application
 * @returns Shareable URL with encoded data
 */
export const generateShareableLink = (
  reportData: {
    fullName: string;
    birthDate: string; // ISO string
  },
  baseUrl: string = window.location.origin
): string => {
  const params = new URLSearchParams({
    name: reportData.fullName,
    birthDate: reportData.birthDate,
    type: 'report'
  });
  
  return `${baseUrl}/?${params.toString()}`;
};

/**
 * Copy text to clipboard.
 * @param text - Text to copy
 * @returns Promise that resolves when text is copied
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Use native Web Share API if available.
 * @param data - Share data
 * @returns Promise that resolves when share is complete
 */
export const nativeShare = async (data: ShareData): Promise<boolean> => {
  if (!navigator.share) {
    return false;
  }
  
  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url,
      ...(data.imageUrl && { files: [] }) // Files not supported in all browsers
    });
    return true;
  } catch (err) {
    // User cancelled or error occurred
    return false;
  }
};
