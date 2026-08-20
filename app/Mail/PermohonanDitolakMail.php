<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Permohonan;

class PermohonanDitolakMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Permohonan $permohonan) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Permohonan Kunjungan Kerja Ditolak — ' . $this->permohonan->kode,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.permohonan-ditolak',
        );
    }
}
