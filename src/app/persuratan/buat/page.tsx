'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function BuatNotaDinasPage() {
  const router = useRouter();

  // State dengan format yang menyesuaikan agar tidak ada teks ganda
  const [formData, setFormData] = useState({
    kategori: 'Perbaikan',
    jenis_surat: 'Nota Dinas',
    tanggal: '',
    yth: '',
    nomor: '',
    sifat: 'Biasa',
    lampiran: '',
    hal: '',
    deskripsi: '',
    penandatangan: 'Kepala Dinas Komunikasi Dan Informatika',
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeskripsiChange = (value: string) => {
    setFormData((prev) => ({ ...prev, deskripsi: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const handlePrint = () => {
    const content = document.getElementById('area-cetak-surat')?.innerHTML;
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak Surat</title>
            <style>
              /* Pengaturan Kertas Print & Reset */
              @page { size: A4 portrait; margin: 0; }
              body { 
                margin: 0; 
                padding: 0; 
                font-family: "Times New Roman", Times, serif; 
                background: white; 
                color: black;
              }
              .kertas-a4 { 
                width: 210mm; 
                max-width: 100%;
                padding: 2cm 2.5cm; 
                box-sizing: border-box; 
                margin: auto;
              }
              /* Memaksa tabel tidak melebar keluar batas */
              table { table-layout: fixed; width: 100%; border-collapse: collapse; }
              
              /* Memaksa teks paragraf dari Quill untuk turun ke bawah (Wrap) */
              .isi-surat {
                width: 100%;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
              }
              .isi-surat p {
                text-indent: 1.25cm !important;
                margin-top: 0;
                margin-bottom: 8px;
                text-align: justify;
                white-space: normal !important;
              }
            </style>
          </head>
          <body>
            <div class="kertas-a4">
              ${content}
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen pb-16 font-sans animate-in fade-in duration-300 bg-[#F8FAFC]">
      
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200">
        <div className="text-[13px] text-slate-500 flex items-center gap-2">
          <button onClick={() => router.push('/persuratan')} className="hover:text-[#113289] transition font-medium">Persuratan</button>
          <span>/</span>
          <span className="font-bold text-slate-800">Buat Surat Baru</span>
        </div>
      </div>

      <div className="max-w-4xl px-6 mx-auto mt-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Formulir Nota Dinas</h1>
        </div>

        <form onSubmit={handleSubmit} className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="p-8 space-y-8">
            
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[13px] font-bold">Kategori Persuratan</label>
                <select name="kategori" value={formData.kategori} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[#113289] outline-none">
                  <option value="Perbaikan">Perbaikan</option>
                  <option value="Pemberitahuan hasil Pentest">Pemberitahuan hasil Pentest</option>
                  <option value="Pemberitahuan Keamanan">Pemberitahuan Keamanan</option>
                  <option value="Pendaftaran">Pendaftaran</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-bold">Jenis Surat</label>
                <select name="jenis_surat" value={formData.jenis_surat} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm bg-slate-50 cursor-not-allowed outline-none">
                  <option value="Nota Dinas">Nota Dinas</option>
                </select>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[13px] font-bold">Tempat & Tanggal Surat</label>
                <input type="text" name="tanggal" value={formData.tanggal} onChange={handleChange} placeholder="Cth: Bandung, 14 April 2026" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[#113289] outline-none" required />
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-bold">Kepada (Yth. & Alamat)</label>
                <textarea name="yth" value={formData.yth} onChange={handleChange} rows={4} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[#113289] outline-none resize-none" placeholder="Cth:&#10;Yth. Kepala Dinas Perpustakaan&#10;di&#10;T E M P A T" required></textarea>
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-bold">Nomor</label>
                <input type="text" name="nomor" value={formData.nomor} onChange={handleChange} placeholder="Ketik nomor surat..." className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[#113289] outline-none" required />
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-bold">Sifat</label>
                <select name="sifat" value={formData.sifat} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[#113289] outline-none">
                  <option value="Biasa">Biasa</option>
                  <option value="Penting">Penting</option>
                  <option value="Rahasia">Rahasia</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-bold">Lampiran</label>
                <input type="text" name="lampiran" value={formData.lampiran} onChange={handleChange} placeholder="Contoh: 1 (satu) Berkas" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[#113289] outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-[13px] font-bold">Hal</label>
                <input type="text" name="hal" value={formData.hal} onChange={handleChange} placeholder="Perihal nota dinas..." className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[#113289] outline-none" required />
              </div>
            </section>

            <section>
              <label className="mb-2 block text-[13px] font-bold">Isi Surat</label>
              <div className="pb-12 bg-white rounded-lg"> 
                <ReactQuill theme="snow" value={formData.deskripsi} onChange={handleDeskripsiChange} style={{ height: '250px' }} placeholder="Ketik isi nota dinas di sini..." />
              </div>
            </section>

            <section className="p-6 border bg-slate-50 rounded-xl border-slate-200">
              <label className="mb-2 block text-[13px] font-bold">Penandatangan TTE</label>
              <select name="penandatangan" value={formData.penandatangan} onChange={handleChange} className="w-full max-w-md rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[#113289] outline-none">
                <option value="Kepala Dinas Komunikasi Dan Informatika">Kepala Dinas</option>
                <option value="Kepala Bidang Aptika">Kepala Bidang Aptika</option>
                <option value="Sekretaris Dinas">Sekretaris Dinas</option>
              </select>
            </section>

          </div>

          <div className="flex justify-end gap-3 px-8 py-5 border-t bg-slate-50 border-slate-200">
            <button type="submit" className="px-6 py-2.5 rounded-lg bg-[#113289] text-sm font-bold text-white hover:bg-[#0e276b]">Lihat Draf & Cetak</button>
          </div>
        </form>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col w-full max-w-5xl overflow-hidden bg-white shadow-2xl rounded-xl h-[90vh]">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div><h3 className="text-lg font-bold">Pratinjau Surat</h3></div>
              <div className="flex gap-3">
                <button onClick={() => setShowPreview(false)} className="px-4 py-2 text-sm font-bold border border-slate-300 rounded-lg hover:bg-slate-100">Tutup</button>
                <button onClick={handlePrint} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Print / PDF</button>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-auto bg-slate-300">
              <div 
                id="area-cetak-surat" 
                style={{ 
                  width: '210mm', 
                  minHeight: '297mm', 
                  padding: '2cm 2.5cm', 
                  boxSizing: 'border-box',
                  margin: '0 auto', 
                  backgroundColor: 'white',
                  fontFamily: '"Times New Roman", Times, serif',
                  color: 'black'
                }}
              >
                
                {/* 1. KOP SURAT */}
                <table style={{ width: '100%', borderBottom: '3px solid black', marginBottom: '20px', paddingBottom: '10px' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '100px', textAlign: 'left', verticalAlign: 'middle' }}>
                        <img src="https://dummyimage.com/90x100/ffffff/000000.png&text=Logo+Jabar" alt="Logo Jabar" style={{ width: '90px' }} />
                      </td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <h1 style={{ fontSize: '14pt', margin: '0', fontWeight: 'normal' }}>PEMERINTAH DAERAH PROVINSI JAWA BARAT</h1>
                        <h2 style={{ fontSize: '16pt', margin: '5px 0', fontWeight: 'bold' }}>DINAS KOMUNIKASI DAN INFORMATIKA</h2>
                        <p style={{ fontSize: '10pt', margin: '0' }}>Jalan Tamansari No. 55 Telepon (022) 2502898 Faksimile (022) 2511505</p>
                        <p style={{ fontSize: '10pt', margin: '0' }}>website : http://diskominfo.jabarprov.go.id ; email : diskominfo@jabarprov.go.id</p>
                        <p style={{ fontSize: '10pt', margin: '5px 0 0 0', letterSpacing: '2px' }}>B A N D U N G 40132</p>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 2. META DATA SURAT */}
                <table style={{ width: '100%', fontSize: '11pt', marginBottom: '15px' }}>
                  <tbody>
                    <tr>
                      {/* Bagian Kiri */}
                      <td style={{ width: '50%', verticalAlign: 'top' }}>
                        <table style={{ width: '100%' }}>
                          <tbody>
                            <tr><td style={{ width: '70px', verticalAlign: 'top' }}>Nomor</td><td style={{ width: '15px', verticalAlign: 'top' }}>:</td><td style={{ verticalAlign: 'top' }}>{formData.nomor || '-'}</td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Sifat</td><td style={{ verticalAlign: 'top' }}>:</td><td style={{ verticalAlign: 'top' }}>{formData.sifat}</td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Lampiran</td><td style={{ verticalAlign: 'top' }}>:</td><td style={{ verticalAlign: 'top' }}>{formData.lampiran || '-'}</td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Hal</td><td style={{ verticalAlign: 'top' }}>:</td><td style={{ verticalAlign: 'top' }}>{formData.hal || '-'}</td></tr>
                          </tbody>
                        </table>
                      </td>
                      
                      {/* Bagian Kanan (Dibuat Polos Agar Mengikuti Input User 100%) */}
                      <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '20px' }}>
                        <div style={{ marginBottom: '15px' }}>{formData.tanggal || '...'}</div>
                        <div>Kepada</div>
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{formData.yth || '...'}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 3. ISI SURAT */}
                <div 
                  className="isi-surat"
                  style={{ fontSize: '11pt', lineHeight: '1.5' }}
                  dangerouslySetInnerHTML={{ __html: formData.deskripsi || '<p>(Isi surat masih kosong)</p>' }}
                />

                {/* 4. AREA TTE */}
                <div style={{ marginTop: '40px', fontSize: '11pt', float: 'right', width: '350px', textAlign: 'center' }}>
                  <div style={{ textTransform: 'uppercase' }}>{formData.penandatangan}<br/>PROVINSI JAWA BARAT,</div>
                  
                  <table style={{ marginTop: '15px', border: '1px solid black', borderRadius: '8px', width: '100%', textAlign: 'left', padding: '10px', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '60px', textAlign: 'center', verticalAlign: 'middle' }}>
                          <img src="https://dummyimage.com/60x60/ffffff/000000.png&text=BSrE" alt="BSrE" style={{ width: '45px' }} />
                        </td>
                        <td style={{ fontSize: '8pt', fontFamily: 'Arial, sans-serif', lineHeight: '1.2' }}>
                          <div>Ditandatangani secara elektronik oleh:</div>
                          <div style={{ fontWeight: 'bold', textTransform: 'uppercase', margin: '4px 0' }}>{formData.penandatangan}<br/>PROVINSI JAWA BARAT</div>
                          <div>MAS ADI KOMAR, S.STP., M.Tr.A.P<br/>Pembina TK.I</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div style={{ clear: 'both' }}></div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}