declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (container: HTMLElement | string, options: Record<string, any>) => number;
      reset: (widgetId?: number) => void;
    };
    onGrecaptchaLoaded?: () => void;
  }
}

let recaptchaPromise: Promise<void> | null = null;

/**
 * Singleton Loader untuk Google reCAPTCHA v2.
 * HANYA memuat script satu kali selama aplikasi berjalan.
 * Menggunakan Promise dan callback grecaptcha.ready() resmi dari Google.
 */
export function loadRecaptchaScript(): Promise<void> {
  if (recaptchaPromise) {
    return recaptchaPromise;
  }

  recaptchaPromise = new Promise<void>((resolve, reject) => {
    // 1. Jika window.grecaptcha dan method render sudah tersedia
    if (
      typeof window !== 'undefined' &&
      window.grecaptcha &&
      typeof window.grecaptcha.render === 'function'
    ) {
      window.grecaptcha.ready(() => resolve());
      return;
    }

    // 2. Siapkan global callback yang akan dipanggil oleh Google script (onload parameter)
    const prevOnload = window.onGrecaptchaLoaded;
    window.onGrecaptchaLoaded = () => {
      if (prevOnload) prevOnload();
      if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
        window.grecaptcha.ready(() => resolve());
      } else {
        resolve();
      }
    };

    // 3. Cek apakah elemen script data-recaptcha-v2 sudah ada di DOM
    let script = document.querySelector<HTMLScriptElement>('script[data-recaptcha-v2]');

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onGrecaptchaLoaded&render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.recaptchaV2 = 'true';
      document.head.appendChild(script);
    }

    const handleError = () => {
      recaptchaPromise = null; // Izinkan retry jika gagal dimuat
      reject(
        new Error('Skrip reCAPTCHA tidak dapat dimuat. Periksa koneksi internet Anda atau pemblokir iklan.')
      );
    };

    script.addEventListener('error', handleError, { once: true });

    // Fallback timeout jika script tidak memberikan respons dalam 12 detik
    const timeoutId = setTimeout(() => {
      if (!window.grecaptcha || typeof window.grecaptcha.render !== 'function') {
        recaptchaPromise = null;
        reject(
          new Error('reCAPTCHA belum merespons. Periksa koneksi internet Anda lalu coba lagi.')
        );
      }
    }, 12000);

    // Resolusi via grecaptcha.ready bila script sudah ada di DOM
    if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
      window.grecaptcha.ready(() => {
        clearTimeout(timeoutId);
        resolve();
      });
    }
  });

  return recaptchaPromise;
}

/**
 * Reset loader promise agar dapat dilakukan retry internal jika terjadi error jaringan.
 */
export function resetRecaptchaPromise(): void {
  recaptchaPromise = null;
}
