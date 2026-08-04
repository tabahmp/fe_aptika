"use client";

import { useEffect, useState } from "react";
import { Users, Eye, Edit, Trash2, Plus, Printer } from "lucide-react";
import { getMagangList, deleteMagang, createMagang, updateMagang } from "@/services/api";
import { Modal } from "@/components/ui/Modal";

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const numberToWords = (n: number): string => {
  const units = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  if (n < 12) return units[n];
  if (n < 20) return numberToWords(n - 10) + " Belas";
  if (n < 100) return numberToWords(Math.floor(n / 10)) + " Puluh" + (n % 10 !== 0 ? " " + numberToWords(n % 10) : "");
  if (n < 200) return "Seratus" + (n % 100 !== 0 ? " " + numberToWords(n % 100) : "");
  if (n < 1000) return numberToWords(Math.floor(n / 100)) + " Ratus" + (n % 100 !== 0 ? " " + numberToWords(n % 100) : "");
  if (n < 2000) return "Seribu" + (n % 1000 !== 0 ? " " + numberToWords(n % 1000) : "");
  if (n < 10000) return numberToWords(Math.floor(n / 1000)) + " Ribu" + (n % 1000 !== 0 ? " " + numberToWords(n % 1000) : "");
  return String(n);
};

const formatIndonesianFullDateText = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString + "T00:00:00");
  if (isNaN(date.getTime())) return "-";

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  const yearNum = date.getFullYear();

  const dayWords = numberToWords(dayNum);
  const yearWords = numberToWords(yearNum);

  return `${dayName} tanggal ${dayWords} Bulan ${monthName} tahun ${yearWords} (${dayNum} ${monthName} ${yearNum})`;
};

export default function MagangDashboard() {
  const [magangs, setMagangs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "add">("add");
  const [selectedMagang, setSelectedMagang] = useState<any>(null);

  // NDA Modal state
  const [isNdaModalOpen, setIsNdaModalOpen] = useState(false);
  const [ndaFormData, setNdaFormData] = useState({
    magangId: "",
    tanggal: new Date().toISOString().split("T")[0],
  });

  // NDA Print Counter state (mulai dari 7 dan bertambah tiap cetak)
  const [printCounter, setPrintCounter] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nda_print_counter");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    return 7;
  });

  // Melacak ID anak magang yang sudah mencetak NDA
  const [printedNdaIds, setPrintedNdaIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("printed_nda_ids");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed.map(String);
        } catch (e) {}
      }
    }
    return [];
  });

  const availableMagangs = magangs.filter(
    (m) => !printedNdaIds.includes(String(m.id))
  );

  // Form state
  const [formData, setFormData] = useState({
    nama: "",
    nama_kampus: "",
    tgl_mulai_magang: "",
    tgl_selesai_magang: "",
    sertifikat: "Belum menerima",
    keterangan: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  // Compute status magang otomatis berdasarkan tanggal
  const computeStatusMagang = (tglMulai: string, tglSelesai: string) => {
    if (!tglMulai || !tglSelesai) return "-";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(tglMulai);
    start.setHours(0, 0, 0, 0);
    const end = new Date(tglSelesai);
    end.setHours(0, 0, 0, 0);

    if (today < start) return "Belum mulai";
    if (today > end) return "Selesai magang";
    return "Sedang magang";
  };

  const currentStatus = computeStatusMagang(formData.tgl_mulai_magang, formData.tgl_selesai_magang);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMagangList();
      if (res?.data) {
        setMagangs(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch magang data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
      try {
        await deleteMagang(id);
        fetchData();
      } catch (error) {
        alert("Gagal menghapus data");
      }
    }
  };

  const handleOpenModal = (mode: "view" | "edit" | "add", data?: any) => {
    setModalMode(mode);
    setSelectedMagang(data || null);
    if (data && mode !== "add") {
      setFormData({
        nama: data.nama || "",
        nama_kampus: data.nama_kampus || "",
        tgl_mulai_magang: data.tgl_mulai || "",
        tgl_selesai_magang: data.tgl_selesai || "",
        sertifikat: data.sertifikat || "Belum menerima",
        keterangan: data.keterangan || "",
      });
      setCvFile(null);
    } else {
      setFormData({
        nama: "",
        nama_kampus: "",
        tgl_mulai_magang: "",
        tgl_selesai_magang: "",
        sertifikat: "Belum menerima",
        keterangan: "",
      });
      setCvFile(null);
    }
    setIsModalOpen(true);
  };

  const handleOpenNdaModal = () => {
    const unprinted = magangs.filter((m) => !printedNdaIds.includes(String(m.id)));
    setNdaFormData({
      magangId: unprinted.length > 0 ? String(unprinted[0].id) : "",
      tanggal: new Date().toISOString().split("T")[0],
    });
    setIsNdaModalOpen(true);
  };

  const handlePrintNda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ndaFormData.magangId) {
      alert("Silakan pilih nama anak magang terlebih dahulu.");
      return;
    }

    const selected = magangs.find((m) => String(m.id) === String(ndaFormData.magangId));
    if (!selected) {
      alert("Data anak magang tidak ditemukan.");
      return;
    }

    const seqNumber = String(printCounter).padStart(2, "0");
    const fullDateText = formatIndonesianFullDateText(ndaFormData.tanggal);
    const dateObj = new Date(ndaFormData.tanggal + "T00:00:00");
    const yearNum = isNaN(dateObj.getTime()) ? new Date().getFullYear() : dateObj.getFullYear();
    const generatedNomorSurat = `NO: ${seqNumber}/NDA/APTIKA/${yearNum}`;
    const logoUrl = typeof window !== "undefined" ? window.location.origin + "/logo-jabar.png" : "/logo-jabar.png";

    // Increment print counter untuk cetakan berikutnya
    const nextCounter = printCounter + 1;
    setPrintCounter(nextCounter);

    // Tandai anak magang ini sudah mencetak NDA
    const updatedPrintedIds = Array.from(new Set([...printedNdaIds, String(selected.id)]));
    setPrintedNdaIds(updatedPrintedIds);

    if (typeof window !== "undefined") {
      localStorage.setItem("nda_print_counter", String(nextCounter));
      localStorage.setItem("printed_nda_ids", JSON.stringify(updatedPrintedIds));
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Gagal membuka jendela cetak. Mohon izinkan pop-up di browser Anda.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Surat Perjanjian NDA - ${selected.nama}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm 20mm 20mm 20mm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10.5pt;
            line-height: 1.5;
            color: #000;
            margin: 0;
            padding: 0;
            background-color: #fff;
          }
          .page {
            page-break-after: always;
            position: relative;
            box-sizing: border-box;
          }
          .page:last-child {
            page-break-after: avoid;
          }
          .logo-container {
            text-align: center;
            margin-bottom: 15px;
          }
          .logo-container img {
            width: 90px;
            height: auto;
          }
          .title-header {
            text-align: center;
            font-weight: bold;
            font-size: 11pt;
            line-height: 1.4;
            margin-bottom: 25px;
          }
          .title-header .doc-no {
            margin-top: 10px;
            font-size: 10.5pt;
            font-weight: bold;
          }
          p {
            margin-top: 0;
            margin-bottom: 12px;
            text-align: justify;
            text-justify: inter-word;
          }
          .party-block {
            margin-left: 20px;
            margin-bottom: 12px;
          }
          .table-party {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
          }
          .table-party td {
            padding: 2px 4px;
            vertical-align: top;
          }
          .table-party td.label {
            width: 90px;
          }
          .table-party td.colon {
            width: 15px;
            text-align: center;
          }
          .section-title {
            font-weight: bold;
            margin-top: 14px;
            margin-bottom: 6px;
          }
          .signature-container {
            margin-top: 70px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .signature-box {
            width: 45%;
            text-align: center;
          }
          .signature-title {
            font-weight: bold;
            margin-bottom: 4px;
          }
          .signature-role {
            margin-bottom: 80px;
          }
          .signature-name {
            font-weight: bold;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>

        <!-- HALAMAN 1 -->
        <div class="page">
          <div class="logo-container">
            <img src="${logoUrl}" alt="Logo Jawa Barat" />
          </div>

          <div class="title-header">
            PERJANJIAN<br>
            LARANGAN PENGUNGKAPAN DAN KERAHASIAAN<br>
            ANTARA<br>
            DINAS KOMUNIKASI DAN INFORMATIKA PROVINSI JAWA BARAT<br>
            DENGAN<br>
            MAHASISWA MAGANG<br>
            ${(selected.nama_kampus || "").toUpperCase()}<br>
            <div class="doc-no">${generatedNomorSurat}</div>
          </div>

          <p>
            Perjanjian Larangan Pengungkapan dan Kerahasiaan (untuk selanjutnya disebut sebagai "Perjanjian") ini diadakan dan ditandatangani pada hari ${fullDateText}, antara:
          </p>

          <div class="party-block">
            <table class="table-party">
              <tr>
                <td class="label">1. Nama</td>
                <td class="colon">:</td>
                <td>Dian Istanti, S.Sos, MAP</td>
              </tr>
              <tr>
                <td class="label">&nbsp;&nbsp;&nbsp;NIP</td>
                <td class="colon">:</td>
                <td>19690519 199803 2 001</td>
              </tr>
              <tr>
                <td class="label">&nbsp;&nbsp;&nbsp;Jabatan</td>
                <td class="colon">:</td>
                <td>Kepala Bidang Aplikasi Informatika</td>
              </tr>
            </table>
            <p style="margin-left: 0;">
              yang bertindak sebagai dan atas nama Dinas Komunikasi dan Informatika Provinsi Jawa Barat untuk selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
            </p>
          </div>

          <div class="party-block">
            <table class="table-party">
              <tr>
                <td class="label">2. Nama</td>
                <td class="colon">:</td>
                <td>${selected.nama}</td>
              </tr>
              <tr>
                <td class="label">&nbsp;&nbsp;&nbsp;Jabatan</td>
                <td class="colon">:</td>
                <td>Mahasiswa Magang</td>
              </tr>
            </table>
            <p style="margin-left: 0;">
              yang bertindak sebagai Mahasiswa Magang Dari ${selected.nama_kampus} untuk selanjutnya disebut Sebagian <strong>PIHAK KEDUA</strong>.
            </p>
          </div>

          <p>
            PIHAK PERTAMA dan PIHAK KEDUA selanjutnya bersama-sama dapat disebut "Para Pihak", atau masing-masing disebut "Pihak" dengan ini menjelaskan dan menyatakan sebagai berikut:
          </p>

          <p>
            Bahwa, dalam pelaksanaan kerja sama, Para Pihak akan saling bertukar informasi yang wajib dijaga kerahasiaannya.
          </p>

          <p>
            Bahwa, para Pihak merasa perlu untuk melindungi kepentingannya atas informasi yang diberikan kepada Pihak lainnya.
          </p>

          <p>
            Karenanya, Para Pihak dengan ini mengadakan Perjanjian ini, berdasarkan syarat-syarat dan ketentuan sebagai berikut:
          </p>

          <div class="section-title">1. PENGERTIAN</div>
          <div style="padding-left: 15px;">
            <p>a. "Pihak Yang Mengungkapkan" berarti suatu Pihak yang memberikan Informasi Rahasia kepada Pihak lainnya;</p>
            <p>b. "Pihak Yang Menerima" berarti suatu Pihak yang menerima Informasi Rahasia dari Pihak lainnya;</p>
            <p>c. "Afiliasi" berarti setiap pihak, kerabat, anak perusahaan, atau induk perusahaan dari suatu Pihak, Perorangan atau perusahaan yang dikendalikan oleh, atau mengendalikan suatu Pihak;</p>
          </div>
        </div>

        <!-- HALAMAN 2 -->
        <div class="page">
          <div style="padding-left: 15px;">
            <p>d. "Informasi Rahasia" berarti mencakup Informasi "Rahasia/Penting/Strategis" milik Pemerintah Daerah Provinsi Jawa Barat dapat berupa dokumen tercetak (hardcopy) atau file elektronik (softcopy), meliputi antara lain:</p>
            <div style="padding-left: 20px;">
              <p>1) Data pribadi pegawai;</p>
              <p>2) Konfigurasi IT dan IP address;</p>
              <p>3) Password;</p>
              <p>4) Kode program (source code);</p>
              <p>5) Hasil scanning vulnerability/penetration testing;</p>
              <p>6) Hasil kajian risiko (risk assessment) dan hasil audit;</p>
              <p>7) Data lelang; dan</p>
              <p>8) Data/Informasi berkategori "Internal/Terbatas/Sensitif/Kritikal/Rahasia" lainnya milik Pemerintah Daerah Provinsi Jawa Barat.</p>
            </div>
          </div>

          <div class="section-title">2. KERAHASIAAN</div>
          <div style="padding-left: 15px;">
            <p>a. Pihak Yang Menerima dengan ini setuju bahwa Informasi Rahasia merupakan hak milik dari, dan dimiliki oleh Pihak Yang Mengungkapkan. Tidak ada satu ketentuan pun dalam Perjanjian ini yang memberikan pengertian atau penafsiran, atau dapat ditafsirkan bahwa setiap Informasi Rahasia yang diberikan, dikirimkan atau diungkapkan kepada Pihak Yang Menerima adalah bentuk dari pengalihan kepemilikan, hibah, pemberian opsi, atau pemberian lisensi hak kekayaan intelektual atas Informasi Rahasia;</p>
            <p>b. Dengan diberikan atau diungkapkannya Informasi Rahasia oleh Pihak Yang Mengungkapkan kepada Pihak Yang Menerima, Pihak Yang Menerima wajib untuk:</p>
            <div style="padding-left: 20px;">
              <p>1) Tidak membocorkan Informasi Rahasia/Penting/Strategis kepada pihak manapun baik secara langsung maupun tidak langsung;</p>
              <p>2) Tidak mempergunakan Informasi Rahasia yang dapat merugikan Pihak Yang Mengungkapkan dan tidak, dengan cara melawan hukum atau dengan cara yang tidak etis, mempergunakan Informasi Rahasia untuk keuntungan dirinya sendiri atau pihak lain;</p>
              <p>3) Tidak memanfaatkan informasi yang diakses dari Pemerintah Daerah Provinsi Jawa Barat selama penugasan untuk kepentingan di luar pelaksanaan tugas dan pekerjaan yang diberikan;</p>
              <p>4) Menjaga kerahasiaannya dan memastikan bahwa Informasi Rahasia tidak diungkapkan kepada Personil atau Afiliasi kecuali dalam hal pengungkapan tersebut dipandang perlu untuk kepentingan pekerjaan dan atas dasar "perlu untuk diketahui" untuk kepentingan pekerjaan tanpa mengesampingkan ketentuan lain dari Perjanjian ini;</p>
              <p>5) Mengamankan seluruh informasi dan sistem informasi sesuai kebijakan yang ditetapkan Pemerintah Daerah Provinsi Jawa Barat;</p>
              <p>6) Tidak membuka Informasi Rahasia kepada pihak ketiga manapun kecuali sebelumnya telah mendapatkan persetujuan tertulis dari Pihak Yang Mengungkapkan;</p>
              <p>7) Tidak, atau mengizinkan pihak lain, termasuk Personil dan Afiliasinya, untuk membuat fotokopi/salinan atau mereproduksi dalam bentuk apapun, setiap Informasi Rahasia tanpa sebelumnya telah mendapatkan persetujuan tertulis dari Pihak Yang Mengungkapkan, kecuali yang secara wajar diperlukan untuk pekerjaan; dan</p>
              <p>8) Mematuhi seluruh kebijakan dan prosedur yang ditetapkan Pemerintah Daerah Provinsi Jawa Barat menyangkut keamanan informasi.</p>
            </div>
            <p>c. Kewajiban untuk menjaga Informasi Rahasia sebagaimana dimaksud dalam butir b di atas tidak berlaku dalam hal Informasi Rahasia:</p>
            <div style="padding-left: 20px;">
              <p>1) Telah menjadi pengetahuan umum atau telah dipublikasikan kepada umum dengan cara yang tidak melanggar ketentuan kerahasiaan berdasarkan Perjanjian ini maupun ketentuan lain yang terkait dengannya;</p>
            </div>
          </div>
        </div>

        <!-- HALAMAN 3 -->
        <div class="page">
          <div style="padding-left: 35px;">
            <p>2) Telah diketahui oleh Pihak Yang Menerima sebelum Informasi Rahasia diberikan atau diungkapkan kepada Pihak Yang Menerima sebagaimana dibuktikan dengan bukti tertulis Pihak Yang Menerima; dan</p>
            <p>3) Disyaratkan untuk diungkapkan berdasarkan ketentuan hukum yang berlaku atau berdasarkan perintah badan peradilan atau instansi Pemerintah terkait.</p>
          </div>

          <div class="section-title">3. PENGEMBALIAN DAN PEMUSNAHAN INFORMASI RAHASIA</div>
          <p>
            Atas permintaan Pihak Yang Mengungkapkan, Pihak Yang Menerima wajib mengembalikan seluruh dokumen atau fasilitas sistem informasi Pemerintah Daerah Provinsi Jawa Barat yang dipinjamkan selama penugasan saya, termasuk mengembalikan hak akses baik logic (User ID) maupun fisik (ID Card) yang saya terima sebagai bagian dari pelaksanaan tugas dan pekerjaan yang diberikan.
          </p>

          <div class="section-title">4. JANJI LEBIH LANJUT</div>
          <p>Untuk lebih lanjut menjaga kerahasiaan dari Informasi Rahasia, Pihak Yang Menerima wajib:</p>
          <div style="padding-left: 15px;">
            <p>a. Membuat agar seluruh Informasi Rahasia dan seluruh informasi yang dihasilkan oleh Pihak Yang Menerima dari Informasi Rahasia terpisah dari dokumen dan catatan-catatan/rekaman-rekaman lain Pihak Yang Menerima dan mengatur serta memelihara tempat penyimpanan yang layak dan aman atas setiap Informasi Rahasia dalam bentuk apapun yang berada padanya; dan</p>
            <p>b. Untuk tidak menggunakan, mereproduksi, mengalih bentuk, atau menyimpan setiap dari Informasi Rahasia pada komputer atau sistem penerimaan informasi elektronik yang dapat diakses oleh eksternal atau mengirimkan Informasi Rahasia tersebut dalam bentuk apapun ke luar tempat usaha Pihak Yang Menerima.</p>
          </div>

          <div class="section-title">5. PEMULIHAN</div>
          <p>
            Para Pihak mengakui dan sepakat bahwa ganti rugi berupa uang mungkin bukan merupakan penggantian yang cukup dalam hal pelanggaran terhadap Perjanjian ini oleh Pihak Yang Menerima. Karenanya, Para Pihak sepakat bahwa Pihak Yang Mengungkapkan berhak untuk mendapatkan penetapan-penetapan atau putusan-putusan pengadilan yang memerintahkan Pihak Yang Menerima wajib untuk berbuat atau untuk tidak berbuat sesuatu, termasuk penetapan-penetapan pengadilan yang mewajibkan Pihak Yang Menerima untuk melaksanakan ketentuan Perjanjian ini dalam hal terjadinya pelanggaran terhadap Perjanjian ini, sebagai tambahan dari hak-hak pemulihan lain yang dimiliki oleh Pihak Yang Mengungkapkan berdasarkan ketentuan peraturan yang berlaku.
          </p>

          <div class="section-title">6. KEBERLAKUAN</div>
          <p>
            Perjanjian ini memiliki jangka waktu paling lama selama 1 (satu) tahun. Meskipun demikian, kewajiban-kewajiban untuk menjaga kerahasiaan dan pembatasan-pembatasan atas penggunaan dan pengungkapan Informasi Rahasia yang berlaku atas Pihak Yang Menerima berdasarkan Perjanjian ini akan tetap berlanjut walaupun perjanjian telah diselesaikan, tidak berjalan, dibatalkan atau terjadinya pengakhiran dari Perjanjian ini.
          </p>

          <div class="section-title">7. HUKUM YANG BERLAKU</div>
          <p>
            Perjanjian ini serta pelaksanaan dari dan penafsiran atas Perjanjian ini diatur oleh dan tunduk pada hukum Negara Republik Indonesia.
          </p>

          <div class="section-title">8. PERUBAHAN</div>
          <p>
            Setiap perubahan terhadap Perjanjian ini tidak berlaku dan tidak mengikat bagi Para Pihak kecuali apabila perubahan tersebut dituangkan secara tertulis dan ditandatangani oleh wakil-wakil yang sah dari Para Pihak. Setelah perubahan tersebut ditandatangani dengan sebagaimana mestinya oleh wakil-wakil yang sah dari Para Pihak, perubahan tersebut akan menjadi satu kesatuan dengan dan bagian yang tidak terpisahkan dari Perjanjian ini.
          </p>
        </div>

        <!-- HALAMAN 4 -->
        <div class="page">
          <div class="section-title">9. KESELURUHAN PERJANJIAN</div>
          <p>
            Perjanjian ini memuat keseluruhan perjanjian antara Para Pihak dalam Perjanjian ini yang berkaitan dengan materi pokok dari Perjanjian ini, dan menggantikan setiap dan semua perjanjian, komunikasi dan kesepahaman sebelumnya, baik secara tertulis atau lisan, mengenai materi pokok tersebut.
          </p>

          <p style="margin-top: 25px;">
            Demikian Perjanjian ini dibuat, yang masing-masing ditandatangani serta bermeterai cukup dengan sebagaimana mestinya oleh Para Pihak pada tanggal sebagaimana disebut di awal Perjanjian ini, dan masing-masing mempunyai kekuatan hukum yang sama.
          </p>

          <div class="signature-container">
            <div class="signature-box">
              <div class="signature-title">PIHAK KESATU</div>
              <div class="signature-role">Kepala Bidang Aplikasi Informatika,</div>
              <div class="signature-name">Dian Istanti, S.Sos, MAP</div>
            </div>
            <div class="signature-box">
              <div class="signature-title">PIHAK KEDUA</div>
              <div class="signature-role">Mahasiswa Magang,</div>
              <div class="signature-name">${selected.nama}</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setIsNdaModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi file size maksimal 2MB
    if (cvFile && cvFile.size > 2 * 1024 * 1024) {
      alert("Ukuran file CV Magang tidak boleh melebihi 2MB");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("nama", formData.nama);
      payload.append("nama_kampus", formData.nama_kampus);
      payload.append("tgl_mulai_magang", formData.tgl_mulai_magang);
      payload.append("tgl_selesai_magang", formData.tgl_selesai_magang);
      payload.append("sertifikat", formData.sertifikat);
      if (formData.keterangan) payload.append("keterangan", formData.keterangan);

      if (cvFile) {
        payload.append("cv_magang", cvFile);
      }

      if (modalMode === "add") {
        await createMagang(payload);
      } else if (modalMode === "edit" && selectedMagang) {
        await updateMagang(selectedMagang.id, payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      if (error?.response?.status === 413) {
        alert("Gagal menyimpan data: Ukuran file terlalu besar (Maksimal 2MB)");
      } else if (error?.response?.data?.message) {
        alert(`Gagal menyimpan data: ${error.response.data.message}`);
      } else {
        alert("Gagal menyimpan data. Pastikan semua field telah diisi dengan benar.");
      }
      console.error(error);
    }
  };

  const activeMagangs = magangs.filter(m => m.status_magang === 'Sedang magang').length;

  return (
    <div className="p-6 max-w-[1200px] mx-auto font-sans">

      {/* ── STATISTIC CARD ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Anak Magang</p>
            <h3 className="text-3xl font-extrabold text-slate-900">{magangs.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Sedang Magang</p>
            <h3 className="text-3xl font-extrabold text-slate-900">{activeMagangs}</h3>
          </div>
        </div>
      </div>

      {/* ── HEADER ACTION ── */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">Daftar Anak Magang</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenNdaModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            <Printer size={18} />
            Cetak NDA
          </button>
          <button
            onClick={() => handleOpenModal("add")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            <Plus size={18} />
            Tambah Data Magang
          </button>
        </div>
      </div>

      {/* ── TABLE DASHBOARD ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-10 text-center">No</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Kampus</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Periode</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Magang</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Sertifikat</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">Memuat data...</td>
                </tr>
              ) : magangs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">Tidak ada data magang</td>
                </tr>
              ) : (
                magangs.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-3 text-sm text-slate-500 font-medium text-center">{idx + 1}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-slate-800">{item.nama}</td>
                    <td className="px-3 py-3 text-sm text-slate-600">{item.nama_kampus}</td>
                    <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(item.tgl_mulai)} - {formatDate(item.tgl_selesai)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${item.status_magang === 'Sedang magang' ? 'bg-blue-100 text-blue-800' :
                          item.status_magang === 'Selesai magang' ? 'bg-green-100 text-green-800' :
                            'bg-slate-100 text-slate-800'
                        }`}>
                        {item.status_magang}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${item.sertifikat === 'Sudah menerima' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {item.sertifikat || 'Belum menerima'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleOpenModal("view", item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleOpenModal("edit", item)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL FORM ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Tambah Data Magang" : modalMode === "edit" ? "Edit Data Magang" : "Detail Anak Magang"}
        size="lg"
      >
        {modalMode === "view" && selectedMagang ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Nama</span>
              <span className="col-span-2 font-semibold text-slate-900">{selectedMagang.nama}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Kampus</span>
              <span className="col-span-2 font-semibold text-slate-900">{selectedMagang.nama_kampus}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Tgl Mulai</span>
              <span className="col-span-2 font-semibold text-slate-900">{formatDate(selectedMagang.tgl_mulai)}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Tgl Selesai</span>
              <span className="col-span-2 font-semibold text-slate-900">{formatDate(selectedMagang.tgl_selesai)}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="col-span-2 font-semibold text-slate-900">{selectedMagang.status_magang}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Sertifikat</span>
              <span className="col-span-2 font-semibold text-slate-900">{selectedMagang.sertifikat}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">CV Magang</span>
              <span className="col-span-2 font-semibold text-blue-600 hover:underline">
                {selectedMagang.cv_magang ? <a href={selectedMagang.cv_magang} target="_blank" rel="noreferrer">Lihat File</a> : "-"}
              </span>
            </div>
            <div className="grid grid-cols-3 pb-3">
              <span className="text-slate-500 font-medium">Keterangan</span>
              <span className="col-span-2 font-semibold text-slate-900 whitespace-pre-line">{selectedMagang.keterangan || "-"}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Masukkan nama"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kampus / Sekolah</label>
                <input
                  type="text"
                  required
                  value={formData.nama_kampus}
                  onChange={(e) => setFormData({ ...formData, nama_kampus: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Masukkan institusi"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  required
                  value={formData.tgl_mulai_magang}
                  onChange={(e) => setFormData({ ...formData, tgl_mulai_magang: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  required
                  value={formData.tgl_selesai_magang}
                  onChange={(e) => setFormData({ ...formData, tgl_selesai_magang: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Magang</label>
                <div className={`w-full rounded-lg px-3 py-2 text-sm font-semibold border ${
                  currentStatus === 'Sedang magang' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  currentStatus === 'Selesai magang' ? 'bg-green-50 text-green-700 border-green-200' :
                  currentStatus === 'Belum mulai' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                  'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {currentStatus}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Sertifikat</label>
                <select
                  required
                  value={formData.sertifikat}
                  onChange={(e) => setFormData({ ...formData, sertifikat: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="Belum menerima">Belum menerima</option>
                  <option value="Sudah menerima">Sudah menerima</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Upload CV (PDF/JPG/PNG)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required={modalMode === "add"}
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-slate-200 rounded-xl p-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan (Opsional)</label>
              <textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                rows={3}
                placeholder="Masukkan keterangan jika ada..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                Simpan Data
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL CETAK NDA ── */}
      <Modal
        isOpen={isNdaModalOpen}
        onClose={() => setIsNdaModalOpen(false)}
        title="Cetak Surat NDA (Non-Disclosure Agreement)"
        size="md"
      >
        <form onSubmit={handlePrintNda} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Anak Magang
            </label>
            <select
              required
              value={ndaFormData.magangId}
              onChange={(e) => setNdaFormData({ ...ndaFormData, magangId: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
            >
              <option value="" disabled>
                {availableMagangs.length === 0
                  ? "-- Semua Anak Magang Sudah Mencetak NDA --"
                  : "-- Pilih Anak Magang --"}
              </option>
              {availableMagangs.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama} - {item.nama_kampus}
                </option>
              ))}
            </select>
            {ndaFormData.magangId && (
              <p className="mt-1.5 text-xs text-slate-500 font-medium">
                Nomor Surat Cetakan Ini:{" "}
                <span className="font-bold text-slate-800">
                  NO: {String(printCounter).padStart(2, "0")}/NDA/APTIKA/{new Date().getFullYear()}
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tanggal Surat NDA
            </label>
            <input
              type="date"
              required
              value={ndaFormData.tanggal}
              onChange={(e) => setNdaFormData({ ...ndaFormData, tanggal: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
            {ndaFormData.tanggal && (
              <div className="mt-2.5 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950 space-y-1">
                <span className="font-bold text-blue-900 block">Teks Otomatis Tanggal:</span>
                <p className="italic font-medium leading-relaxed">
                  "{formatIndonesianFullDateText(ndaFormData.tanggal)}"
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNdaModalOpen(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
            >
              <Printer size={16} />
              Cetak Dokumen NDA
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

