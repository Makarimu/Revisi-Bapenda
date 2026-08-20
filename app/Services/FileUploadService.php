<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class FileUploadService
{
    /**
     * Memproses file upload berbasis base64 (Menggantikan DriveApp)
     */
    public function uploadBase64(string|UploadedFile $file, ?string $filename = null, ?string $mime = null, string $path = 'permohonan', ?array $allowedMimes = null): string
    {
        if ($file instanceof UploadedFile) {
            $filename ??= $file->getClientOriginalName();
            $mime ??= $file->getMimeType();
            $data = file_get_contents($file->getRealPath());
        } else {
            if (!preg_match('/^data:([\w.+-]+\/[\w.+-]+);base64,(.*)$/s', $file, $matches)) {
                throw ValidationException::withMessages(['file' => 'Format file tidak valid.']);
            }

            $mime ??= $matches[1];
            $data = base64_decode($matches[2], true);
            if ($data === false) {
                throw ValidationException::withMessages(['file' => 'Isi file base64 tidak valid.']);
            }
        }

        $allowedMimes ??= [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
        ];
        if (!in_array($mime, $allowedMimes, true) || strlen($data) > 10 * 1024 * 1024) {
            $errorMsg = (count($allowedMimes) === 1 && $allowedMimes[0] === 'application/pdf')
                ? 'File harus berupa PDF dengan ukuran maksimal 10 MB.'
                : 'File harus berupa PDF, DOC, DOCX, JPG, atau PNG dengan ukuran maksimal 10 MB.';
            throw ValidationException::withMessages(['file' => $errorMsg]);
        }

        $extensions = [
            'application/pdf' => 'pdf',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
        ];
        $filename ??= 'dokumen';
        $safeName = Str::slug(pathinfo($filename, PATHINFO_FILENAME)) ?: 'dokumen';
        $extension = $extensions[$mime];
        $fullPath = $path . '/' . $safeName . '-' . time() . '-' . Str::random(5) . '.' . $extension;
        Storage::disk('public')->put($fullPath, $data);

        return $fullPath;
    }

    public function deleteFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
