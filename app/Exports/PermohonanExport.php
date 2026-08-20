<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Carbon\Carbon;

class PermohonanExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithTitle,
    WithEvents
{
    protected Collection $data;
    protected string $exportedAt;

    public function __construct(Collection $data)
    {
        $this->data       = $data;
        $this->exportedAt = Carbon::now()->locale('id')->isoFormat('dddd, D MMMM YYYY HH:mm') . ' WIB';
    }

    public function title(): string
    {
        return 'Data Permohonan';
    }

    public function collection(): Collection
    {
        return $this->data;
    }

    public function headings(): array
    {
        return [
            'No. Permohonan',
            'Tanggal Pengajuan',
            'Nama Instansi',
            'Alamat Instansi',
            'Nama PIC',
            'Jabatan',
            'Nomor Telepon',
            'Email',
            'Jumlah Peserta',
            'Tanggal Kunjungan',
            'Jam Kunjungan',
            'Tujuan Kunjungan',
            'Status',
            'Tanggal Persetujuan',
            'Admin yang Memproses',
            'Tanggal Selesai',
        ];
    }

    public function map($row): array
    {
        return [
            $row->kode,
            $row->created_at ? Carbon::parse($row->created_at)->locale('id')->isoFormat('D MMMM YYYY HH:mm') : '-',
            $row->instansi,
            $row->nama_hotel ?? '-',          // Alamat instansi — field tersedia adalah nama_hotel, atau bisa dikosongkan
            $row->nama_pic,
            $row->jabatan_pic,
            $row->no_telp,
            $row->email,
            $row->jumlah_peserta . ' orang',
            $row->tanggal_kunjungan ? Carbon::parse($row->tanggal_kunjungan)->locale('id')->isoFormat('D MMMM YYYY') : '-',
            $row->jam_penerimaan ? $row->jam_penerimaan . ' WIB' : '-',
            $row->tujuan,
            $row->status,
            $row->tgl_diproses ? Carbon::parse($row->tgl_diproses)->locale('id')->isoFormat('D MMMM YYYY HH:mm') : '-',
            $row->narasumber ?? '-',
            $row->tgl_diproses ? Carbon::parse($row->tgl_diproses)->locale('id')->isoFormat('D MMMM YYYY') : '-',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        // Style for header row (row 3 — because row 1 = title, row 2 = export date)
        return [
            3 => [
                'font' => ['bold' => true, 'size' => 10],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '2E7D32'],
                ],
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN],
                ],
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $totalColumns = 16;
                $lastCol      = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($totalColumns);

                // Insert title rows before the data
                $sheet->insertNewRowBefore(1, 2);

                // Row 1: Title
                $sheet->mergeCells("A1:{$lastCol}1");
                $sheet->setCellValue('A1', 'DATA PERMOHONAN KUNJUNGAN KERJA BAPPENDA');
                $sheet->getStyle('A1')->applyFromArray([
                    'font'      => ['bold' => true, 'size' => 14, 'color' => ['rgb' => '1B4332']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D1FAE5']],
                ]);
                $sheet->getRowDimension(1)->setRowHeight(28);

                // Row 2: Export date
                $sheet->mergeCells("A2:{$lastCol}2");
                $sheet->setCellValue('A2', 'Tanggal Export: ' . $this->exportedAt);
                $sheet->getStyle('A2')->applyFromArray([
                    'font'      => ['italic' => true, 'size' => 10, 'color' => ['rgb' => '374151']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                    'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F0FDF4']],
                ]);
                $sheet->getRowDimension(2)->setRowHeight(18);

                // Header row (now row 3)
                $sheet->getStyle("A3:{$lastCol}3")->applyFromArray([
                    'font'      => ['bold' => true, 'size' => 10, 'color' => ['rgb' => 'FFFFFF']],
                    'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2E7D32']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FFFFFF']]],
                ]);
                $sheet->getRowDimension(3)->setRowHeight(20);

                // Auto-width for all columns
                for ($col = 1; $col <= $totalColumns; $col++) {
                    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                    $sheet->getColumnDimension($colLetter)->setAutoSize(true);
                }

                // Style data rows
                $lastDataRow = $sheet->getHighestRow();
                if ($lastDataRow >= 4) {
                    $sheet->getStyle("A4:{$lastCol}{$lastDataRow}")->applyFromArray([
                        'font'    => ['size' => 10],
                        'borders' => [
                            'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']],
                        ],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                    ]);

                    // Zebra striping
                    for ($row = 4; $row <= $lastDataRow; $row++) {
                        if ($row % 2 === 0) {
                            $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
                                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F9FAFB']],
                            ]);
                        }
                    }
                }

                // Freeze panes at row 4 (so title + header stay visible when scrolling)
                $sheet->freezePane('A4');
            },
        ];
    }
}
