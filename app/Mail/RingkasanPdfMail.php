<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;
use App\Models\Permohonan;
use Illuminate\Support\Facades\Storage;

class RingkasanPdfMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Permohonan $permohonan
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Ringkasan Hasil Kunjungan Kerja — ' . $this->permohonan->kode,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ringkasan-pdf',
        );
    }

    /**
     * Lampirkan PDF ringkasan ke email.
     */
    public function attachments(): array
    {
        if (!$this->permohonan->ringkasan_pdf_path) {
            return [];
        }

        // Nama file yang lebih deskriptif untuk penerima
        $filename = 'Ringkasan-Kunjungan-' . $this->permohonan->kode . '.pdf';

        return [
            Attachment::fromStorage($this->permohonan->ringkasan_pdf_path)
                ->as($filename)
                ->withMime('application/pdf'),
        ];
    }
}
