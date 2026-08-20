<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Permohonan;

class KunjunganSelesaiMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Permohonan $permohonan
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Terima Kasih Atas Kunjungan Kerja',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.kunjungan-selesai',
        );
    }
}
