<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Permohonan;

class RingkasanTersediaMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Permohonan $permohonan
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Ringkasan Hasil Kunjungan Kerja Telah Tersedia',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ringkasan-tersedia',
        );
    }

    /**
     * JANGAN MENGIRIM ATTACHMENT SESUAI SPEC MASTER PROMPT!
     */
    public function attachments(): array
    {
        return [];
    }
}
