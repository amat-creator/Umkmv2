// ==========================================
// struk.js
// Semua fungsi terkait fitur CETAK STRUK (preview, config, cetak manual,
// cetak dari riwayat, koneksi printer Bluetooth, download struk gambar).
// File ini dipisah dari app.js supaya gampang dimodifikasi tanpa
// menyenggol bagian lain. Harus di-load SETELAH app.js di index.html,
// karena memakai variabel global 'db' yang didefinisikan di app.js.
// ==========================================

    function cetakStrukDariRiwayat(id) {
        let t = db.transaksi.find(x => String(x.id) === String(id));
        if(!t) return;
        bukaSubHalaman('sub-struk-manual');
        ubahModeStrukManual('biasa');
        document.getElementById('strukManualTanggal').value = t.tanggal;
        document.getElementById('strukManualPelanggan').value = t.pembeli || '';
        document.getElementById('wadahBarangManual').innerHTML = `
            <div class="grid-3 item-barang-manual" style="gap:5px; margin-bottom:10px;">
                <input type="text" class="input-nama-barang" value="${t.namaProduk}" oninput="updatePreviewStruk()" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;">
                <input type="number" class="input-qty-barang" value="${t.jumlah}" min="1" oninput="updatePreviewStruk()" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;">
                <input type="number" class="input-harga-barang" value="${t.total / t.jumlah}" oninput="updatePreviewStruk()" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;">
            </div>
        `;
        document.getElementById('strukManualAdmin').value = t.admin || "";
        updatePreviewStruk();
    }

    function formatSpasiTokenPLN() {
        let el = document.getElementById('strukManualCatatan');
        if(!el) return;
        let teks = el.value;
        if(!teks.trim()) return alert("Ketik atau paste nomor tokennya dulu!");
        
        // Membatasi maksimal 20 digit standar PLN dan hapus karakter selain angka
        let hanyaAngka = teks.replace(/\D/g, '').substring(0, 20);
        
        // Membagi setiap 4 digit angka dengan spasi
        let hasil = hanyaAngka.replace(/(.{4})/g, '$1 ').trim();
        el.value = hasil;
        
        updatePreviewStruk();
    }

    // ==========================================
    // UKURAN FONT TOKEN PLN
    // ==========================================
    let tokenFontSize = 30;

    function ubahUkuranFontToken(operasi) {
        if(operasi === 'tambah') {
            tokenFontSize += 2;
        } else if(operasi === 'kurang') {
            tokenFontSize -= 2;
        }

        // Batas ukuran font
        if(tokenFontSize < 10) tokenFontSize = 10;
        if(tokenFontSize > 80) tokenFontSize = 80;

        // Update tulisan ukuran
        let label = document.getElementById('labelUkuranToken');
        if(label) {
            label.innerText = tokenFontSize + "px";
        }

        // Simpan ukuran agar tidak kembali ke awal
        if(!db.strukToggle) {
            db.strukToggle = {};
        }

        db.strukToggle.tokenFontSize = tokenFontSize;

        // Simpan tanpa me-render ulang seluruh aplikasi
        try {
            localStorage.setItem('sistemUMKMPro', JSON.stringify(db));
        } catch(e) {
            console.warn("Gagal menyimpan ukuran font:", e);
        }

        updatePreviewStruk();
    }

    function tambahBarisBarang() {
        let wadah = document.getElementById('wadahBarangManual');
        let div = document.createElement('div');
        div.className = 'grid-3 item-barang-manual';
        div.style.gap = '5px'; div.style.marginBottom = '10px';
        div.innerHTML = `
            <input type="text" class="input-nama-barang" placeholder="Barang" oninput="updatePreviewStruk()" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;">
            <input type="number" class="input-qty-barang" value="1" min="1" oninput="updatePreviewStruk()" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;">
            <input type="number" class="input-harga-barang" placeholder="Harga" oninput="updatePreviewStruk()" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;">
        `;
        wadah.appendChild(div);
    }

    function switchTabStrukManual(tab) {
        document.getElementById('tab-sm-isi').classList.remove('active');
        document.getElementById('tab-sm-pengaturan').classList.remove('active');

        document.getElementById('sm-konten-isi').style.display = 'none';
        document.getElementById('sm-konten-pengaturan').style.display = 'none';

        document.getElementById('tab-sm-' + tab).classList.add('active');
        document.getElementById('sm-konten-' + tab).style.display = 'block';
    }


    /* ==========================================
       PILIH MODE STRUK MANUAL
       biasa = Catatan biasa
       token = Token PLN besar
       ========================================== */

    function ubahModeStrukManual(mode) {

        let area = document.getElementById('areaStrukManual');

        let tombolBiasa =
            document.getElementById('modeStrukBiasa');

        let tombolToken =
            document.getElementById('modeStrukToken');

        if(!area || !tombolBiasa || !tombolToken) return;


        /* ==========================================
           MODE CATATAN BIASA
           ========================================== */

        if(mode === 'biasa') {

            area.classList.remove('mode-token-pln');

            tombolBiasa.classList.add('aktif');
            tombolToken.classList.remove('aktif');

            document.getElementById('labelTokenPLN').style.display =
                'none';

            document.getElementById('areaPrevHeaderTglPlg').style.display =
                'block';

            document.getElementById('dividerHeader').style.display =
                'block';

            document.getElementById('areaPrevDaftarBarangUtama').style.display =
                'block';

            document.getElementById('areaPrevTotalContainer').style.display =
                'block';


            document.getElementById('strukManualCatatan').placeholder =
                "Tulis catatan di sini...";

            if(document.getElementById('wadahFontToken')) {
                document.getElementById('wadahFontToken').style.display = 'none';
            }
        }


        /* ==========================================
           MODE TOKEN PLN
           ========================================== */

        if(mode === 'token') {

            area.classList.add('mode-token-pln');

            tombolBiasa.classList.remove('aktif');
            tombolToken.classList.add('aktif');


            let showTokenLabel = document.getElementById('cbToggleTokenLabel') ? document.getElementById('cbToggleTokenLabel').checked : true;
            document.getElementById('labelTokenPLN').style.display =
                showTokenLabel ? 'block' : 'none';

            document.getElementById('areaPrevHeaderTglPlg').style.display =
                'none';

            document.getElementById('dividerHeader').style.display =
                'none';

            document.getElementById('areaPrevDaftarBarangUtama').style.display =
                'none';

            document.getElementById('areaPrevAdmin').style.display =
                'none';

            document.getElementById('areaPrevTotalContainer').style.display =
                'none';


            document.getElementById('strukManualCatatan').placeholder =
                "Contoh:\n3316 9982 2741 6323 7124";

            if(document.getElementById('wadahFontToken')) {
                document.getElementById('wadahFontToken').style.display = 'flex';
            }
        }


        updatePreviewStruk();
    }

    function updatePreviewStruk() {
        if(!document.getElementById('strukManualNamaToko')) return;

        /* ==========================================
           CEK MODE STRUK
           ========================================== */
        let areaStruk = document.getElementById('areaStrukManual');
        let modeToken = areaStruk && areaStruk.classList.contains('mode-token-pln');

        /* ==========================================
           UPDATE HEADER
           ========================================== */
        let namaToko = document.getElementById('strukManualNamaToko').value || "amat Bajualan";

        let prevNama = document.getElementById('prevNamaToko');
        if(prevNama) {
            prevNama.innerText = namaToko;
        }

        /* ==========================================
           TANGGAL
           ========================================== */
        let tanggal = document.getElementById('strukManualTanggal').value;

        if(document.getElementById('prevTanggal')) {
    document.getElementById('prevTanggal').innerText = tanggal;
}

/* ==========================================
   DATA TRANSAKSI TAMBAHAN
   ========================================== */

let noTransaksi =
    document.getElementById('strukManualNoTransaksi')?.value.trim() ||
    ("TRX-" + Date.now());

let idPelanggan =
    document.getElementById('strukManualIdPelanggan')?.value.trim() || "";

let jasaLayanan =
    parseInt(document.getElementById('strukManualJasa')?.value) || 0;

let statusTransaksi =
    document.getElementById('strukManualStatus')?.value || "BERHASIL";

let prevNoTransaksi =
    document.getElementById('prevNoTransaksi');

if(prevNoTransaksi) {
    prevNoTransaksi.innerText = noTransaksi;
}

let prevIdPelanggan =
    document.getElementById('prevIdPelanggan');

if(prevIdPelanggan) {
    prevIdPelanggan.innerText =
        idPelanggan !== "" ? idPelanggan : "-";
}

let prevJasaLayanan =
    document.getElementById('prevJasaLayanan');

if(prevJasaLayanan) {
    prevJasaLayanan.innerText =
        "Rp " + jasaLayanan.toLocaleString('id-ID');
}

let prevStatus =
    document.getElementById('prevStatusTransaksi');

if(prevStatus) {
    prevStatus.innerText = statusTransaksi;
}

        /* ==========================================
           PELANGGAN
           ========================================== */
        let namaPlg = document.getElementById('strukManualPelanggan').value.trim();

        if(document.getElementById('wadahPelanggan')) {
            document.getElementById('wadahPelanggan').innerHTML =
                namaPlg !== "" ? "Plg: " + namaPlg : "";
        }

        /* ==========================================
           HITUNG BARANG
           ========================================== */
        let htmlBarang = "";
        let subTotalBarang = 0;

        document.querySelectorAll('.item-barang-manual').forEach(baris => {

            let nama = baris.querySelector('.input-nama-barang').value || "-";
            let qty = parseInt(baris.querySelector('.input-qty-barang').value) || 0;
            let harga = parseInt(baris.querySelector('.input-harga-barang').value) || 0;

            let subtotal = qty * harga;
            subTotalBarang += subtotal;

            if(nama !== "-" || harga > 0) {
                htmlBarang += `
                    <div style="margin-bottom:5px;">
                        ${nama} x${qty}
                        <div class="text-right">
                            Rp ${subtotal.toLocaleString('id-ID')}
                        </div>
                    </div>
                `;
            }
        });

        if(document.getElementById('prevDaftarBarang')) {
            document.getElementById('prevDaftarBarang').innerHTML =
                htmlBarang ||
                "<div>- x0<br><div class='text-right'>Rp 0</div></div>";
        }

        /* ==========================================
           ADMIN
           ========================================== */
        let adminFee =
            parseInt(document.getElementById('strukManualAdmin').value) || 0;

        if(document.getElementById('prevAdminText')) {
            document.getElementById('prevAdminText').innerText =
                "Rp " + adminFee.toLocaleString('id-ID');
        }

        /* ==========================================
           TOTAL
           ========================================== */
        let totalAkhir = subTotalBarang + adminFee;

        if(document.getElementById('prevTotal')) {
            document.getElementById('prevTotal').innerText =
                "Rp " + totalAkhir.toLocaleString('id-ID');
        }

        /* ==========================================
           CATATAN / TOKEN
           ========================================== */
        /* ==========================================
           CATATAN / TOKEN
           ========================================== */

        let catatan =
            document.getElementById('strukManualCatatan').value.trim();

        let areaCatatan =
            document.getElementById('areaPrevCatatan');

        let prevCatatan =
            document.getElementById('prevCatatanText');

        if(catatan !== "") {

            areaCatatan.style.display = "block";

            if(modeToken) {

                // Bersihkan token menjadi maksimal 20 angka
                let tokenBersih =
                    catatan.replace(/\D/g, '').substring(0, 20);

                // Pisahkan setiap 4 angka
                let tokenBerjarak =
                    tokenBersih.replace(/(.{4})/g, '$1 ').trim();

                prevCatatan.innerText =
                    tokenBerjarak || catatan;

                // Ambil ukuran font aktif
                let ukuranAktif =
                    Number(tokenFontSize) || 30;

                // Paksa ukuran preview
                prevCatatan.style.setProperty(
                    'font-size',
                    ukuranAktif + 'px',
                    'important'
                );

                prevCatatan.style.fontFamily =
                    "'Courier New', Courier, monospace";

                prevCatatan.style.fontWeight = "700";
                prevCatatan.style.lineHeight = "1.25";
                prevCatatan.style.letterSpacing = "2px";
                prevCatatan.style.wordSpacing = "8px";
                prevCatatan.style.textAlign = "center";

            } else {

                prevCatatan.innerText = catatan;

                prevCatatan.style.setProperty(
                    'font-size',
                    '14px',
                    'important'
                );

                prevCatatan.style.fontWeight = "bold";
                prevCatatan.style.lineHeight = "1.35";
                prevCatatan.style.letterSpacing = "normal";
                prevCatatan.style.wordSpacing = "normal";
                prevCatatan.style.textAlign = "left";
            }

        } else {

            areaCatatan.style.display = "none";
            prevCatatan.innerText = "";
        }

        /* ==========================================
           LABEL INPUT
           ========================================== */
        let labelInput =
            document.getElementById('labelInputCatatan');

        if(labelInput) {

            if(modeToken) {
                labelInput.innerHTML =
                    '<b class="text-small">⚡ Nomor Token PLN:</b>';
            } else {
                labelInput.innerHTML =
                    '<b class="text-small">📝 Catatan (Opsional):</b>';
            }
        }

        /* ==========================================
           PLACEHOLDER
           ========================================== */
        let inputCatatan =
            document.getElementById('strukManualCatatan');

        if(inputCatatan) {

            if(modeToken) {

                inputCatatan.placeholder =
                    "Contoh:\n3316 9982 2741 6323 7124";

            } else {

                inputCatatan.placeholder =
                    "Tulis catatan di sini...";
            }
        }

        /* ==========================================
           TOGGLE PENGATURAN
           ========================================== */
        let showHeader =
            document.getElementById('cbToggleHeader') ?
            document.getElementById('cbToggleHeader').checked : true;

        let showTgl =
            document.getElementById('cbToggleTanggal') ?
            document.getElementById('cbToggleTanggal').checked : true;

        let showPlg =
            document.getElementById('cbTogglePelanggan') ?
            document.getElementById('cbTogglePelanggan').checked : true;

        let showBrg =
            document.getElementById('cbToggleBarang') ?
            document.getElementById('cbToggleBarang').checked : true;

        let showAdmin =
            document.getElementById('cbToggleAdmin') ?
            document.getElementById('cbToggleAdmin').checked : true;

        let showTotal =
            document.getElementById('cbToggleTotal') ?
            document.getElementById('cbToggleTotal').checked : true;

        let showFooter =
            document.getElementById('cbToggleFooter') ?
            document.getElementById('cbToggleFooter').checked : true;

        if(document.getElementById('areaPrevHeaderContainer')) {
            document.getElementById('areaPrevHeaderContainer').style.display =
                showHeader ? "block" : "none";
        }

        if(document.getElementById('areaPrevFooter')) {
            document.getElementById('areaPrevFooter').style.display =
                showFooter ? "block" : "none";
        }

        if(document.getElementById('dividerFooter')) {
            document.getElementById('dividerFooter').style.display =
                showFooter ? "block" : "none";
        }

        /* ==========================================
           TANGGAL & PELANGGAN
           ========================================== */
        if(document.getElementById('areaPrevTanggalSpan')) {
            document.getElementById('areaPrevTanggalSpan').style.display =
                showTgl ? "block" : "none";
        }

        if(document.getElementById('areaPrevPelangganSpan')) {
            document.getElementById('areaPrevPelangganSpan').style.display =
                (showPlg && namaPlg !== "") ? "block" : "none";
        }

        /* ==========================================
           MODE BIASA
           ========================================== */
        if(!modeToken) {

            if(document.getElementById('areaPrevDaftarBarangUtama')) {
                document.getElementById('areaPrevDaftarBarangUtama').style.display =
                    showBrg ? "block" : "none";
            }

            let areaAdmin =
                document.getElementById('areaPrevAdmin');

            if(areaAdmin) {
                areaAdmin.style.display =
                    (showAdmin && adminFee > 0) ? "block" : "none";
            }

            let areaTotalContainer =
                document.getElementById('areaPrevTotalContainer');

            if(areaTotalContainer) {
                areaTotalContainer.style.display =
                    showTotal ? "block" : "none";
            }

        } else {

            /*
             * MODE TOKEN PLN
             * Hanya tampilkan:
             * - Nama toko
             * - Ucapan
             * - Garis
             * - Nomor token besar
             */
            if(document.getElementById('areaPrevDaftarBarangUtama')) {
                document.getElementById('areaPrevDaftarBarangUtama').style.display =
                    "none";
            }

            if(document.getElementById('areaPrevAdmin')) {
                document.getElementById('areaPrevAdmin').style.display =
                    "none";
            }

            if(document.getElementById('areaPrevTotalContainer')) {
                document.getElementById('areaPrevTotalContainer').style.display =
                    "none";
            }

            if(document.getElementById('areaPrevHeaderTglPlg')) {
                document.getElementById('areaPrevHeaderTglPlg').style.display =
                    "none";
            }

            if(document.getElementById('dividerHeader')) {
                document.getElementById('dividerHeader').style.display =
                    "none";
            }

            let showTokenLabel = document.getElementById('cbToggleTokenLabel') ? document.getElementById('cbToggleTokenLabel').checked : true;
            if(document.getElementById('labelTokenPLN')) {
                document.getElementById('labelTokenPLN').style.display =
                    showTokenLabel ? "block" : "none";
            }

            if(areaStruk) {
                areaStruk.classList.add('mode-token-pln');
            }

        }

        /* ==========================================
           HEADER ALIGNMENT
           ========================================== */
        let alignH =
            document.getElementById('selectAlignHeader') ?
            document.getElementById('selectAlignHeader').value :
            'center';

        let areaHeaderContainer =
            document.getElementById('areaPrevHeaderContainer');

        if(areaHeaderContainer) {
            areaHeaderContainer.style.textAlign = alignH;
        }

        /* ==========================================
           CATATAN / TOKEN ALIGNMENT
           ========================================== */
        let alignC =
            document.getElementById('selectAlignCatatan') ?
            document.getElementById('selectAlignCatatan').value :
            'left';

        /*
         * Token PLN selalu CENTER
         */
        if(modeToken) {
            alignC = "center";
        }

        if(prevCatatan) {
            prevCatatan.style.textAlign = alignC;
        }
    }

    function simpanConfigStruk() {

        if(!db.strukToggle) {
            db.strukToggle = {};
        }

        db.strukToggle.header =
            document.getElementById('cbToggleHeader') ?
            document.getElementById('cbToggleHeader').checked : true;

        db.strukToggle.tanggal =
            document.getElementById('cbToggleTanggal') ?
            document.getElementById('cbToggleTanggal').checked : true;

        db.strukToggle.pelanggan =
            document.getElementById('cbTogglePelanggan') ?
            document.getElementById('cbTogglePelanggan').checked : true;

        db.strukToggle.barang =
            document.getElementById('cbToggleBarang') ?
            document.getElementById('cbToggleBarang').checked : true;

        db.strukToggle.admin =
            document.getElementById('cbToggleAdmin') ?
            document.getElementById('cbToggleAdmin').checked : true;

        db.strukToggle.total =
            document.getElementById('cbToggleTotal') ?
            document.getElementById('cbToggleTotal').checked : true;

        db.strukToggle.tokenLabel =
            document.getElementById('cbToggleTokenLabel') ?
            document.getElementById('cbToggleTokenLabel').checked : true;

        db.strukToggle.footer =
            document.getElementById('cbToggleFooter') ?
            document.getElementById('cbToggleFooter').checked : true;

        db.strukToggle.alignHeader =
            document.getElementById('selectAlignHeader') ?
            document.getElementById('selectAlignHeader').value : 'center';

        db.strukToggle.alignCatatan =
            document.getElementById('selectAlignCatatan') ?
            document.getElementById('selectAlignCatatan').value : 'left';

        db.strukToggle.tokenFontSize =
            Number(tokenFontSize) || 30;

        simpanData();
        updatePreviewStruk();
    }


    function loadConfigStruk() {

        if(!db.strukToggle) {
            db.strukToggle = {
                header: true,
                tanggal: true,
                pelanggan: true,
                barang: true,
                admin: true,
                total: true,
                tokenLabel: true,
                footer: true,
                alignHeader: 'center',
                alignCatatan: 'left',
                tokenFontSize: 30
            };
        }

        if(document.getElementById('cbToggleHeader'))
            document.getElementById('cbToggleHeader').checked =
                db.strukToggle.header !== undefined ?
                db.strukToggle.header : true;

        if(document.getElementById('cbToggleTanggal'))
            document.getElementById('cbToggleTanggal').checked =
                db.strukToggle.tanggal !== undefined ?
                db.strukToggle.tanggal : true;

        if(document.getElementById('cbTogglePelanggan'))
            document.getElementById('cbTogglePelanggan').checked =
                db.strukToggle.pelanggan !== undefined ?
                db.strukToggle.pelanggan : true;

        if(document.getElementById('cbToggleBarang'))
            document.getElementById('cbToggleBarang').checked =
                db.strukToggle.barang !== undefined ?
                db.strukToggle.barang : true;

        if(document.getElementById('cbToggleAdmin'))
            document.getElementById('cbToggleAdmin').checked =
                db.strukToggle.admin !== undefined ?
                db.strukToggle.admin : true;

        if(document.getElementById('cbToggleTotal'))
            document.getElementById('cbToggleTotal').checked =
                db.strukToggle.total !== undefined ?
                db.strukToggle.total : true;

        if(document.getElementById('cbToggleTokenLabel'))
            document.getElementById('cbToggleTokenLabel').checked =
                db.strukToggle.tokenLabel !== undefined ?
                db.strukToggle.tokenLabel : true;

        if(document.getElementById('cbToggleFooter'))
            document.getElementById('cbToggleFooter').checked =
                db.strukToggle.footer !== undefined ?
                db.strukToggle.footer : true;

        if(document.getElementById('selectAlignHeader'))
            document.getElementById('selectAlignHeader').value =
                db.strukToggle.alignHeader || 'center';

        if(document.getElementById('selectAlignCatatan'))
            document.getElementById('selectAlignCatatan').value =
                db.strukToggle.alignCatatan || 'left';

        tokenFontSize =
            Number(db.strukToggle.tokenFontSize) || 30;

        let label = document.getElementById('labelUkuranToken');
        if(label) {
            label.innerText = tokenFontSize + "px";
        }
    }


    // ==========================================
    // DRAFT STRUK MANUAL
    // ==========================================

    function ambilDraftStrukManual() {

        let area = document.getElementById('areaStrukManual');

        let items = [];

        document.querySelectorAll('.item-barang-manual').forEach(baris => {

            items.push({
                nama: baris.querySelector('.input-nama-barang')?.value || "",
                qty: baris.querySelector('.input-qty-barang')?.value || "1",
                harga: baris.querySelector('.input-harga-barang')?.value || ""
            });

        });

        return {
            mode: area && area.classList.contains('mode-token-pln')
                ? 'token'
                : 'biasa',

            namaToko:
                document.getElementById('strukManualNamaToko')?.value || "amat Bajualan",

            tanggal:
                document.getElementById('strukManualTanggal')?.value || ambilTanggal(),

            pelanggan:
                document.getElementById('strukManualPelanggan')?.value || "",

            admin:
                document.getElementById('strukManualAdmin')?.value || "",

            catatan:
                document.getElementById('strukManualCatatan')?.value || "",

            tokenFontSize:
                Number(tokenFontSize) || 30,

            items: items,

            waktuSimpan: new Date().toISOString()
        };
    }


    function simpanDraftStrukManual(tampilkanPesan = true) {

        db.strukDraft = ambilDraftStrukManual();

        // Simpan ke localStorage tanpa me-refresh tampilan
        try {
            simpanData(() => {});
        } catch(e) {
            console.error("Gagal menyimpan draft struk:", e);
            return false;
        }

        if(tampilkanPesan) {
            alert("✅ Draft struk berhasil disimpan.");
        }

        return true;
    }


    function muatDraftStrukManual() {

        let draft = db.strukDraft;

        if(!draft) return;

        let namaToko = document.getElementById('strukManualNamaToko');
        let tanggal = document.getElementById('strukManualTanggal');
        let pelanggan = document.getElementById('strukManualPelanggan');
        let admin = document.getElementById('strukManualAdmin');
        let catatan = document.getElementById('strukManualCatatan');

        if(namaToko) namaToko.value = draft.namaToko || "amat Bajualan";
        if(tanggal) tanggal.value = ambilTanggal(); // Selalu reset ke tanggal hari ini
        if(pelanggan) pelanggan.value = draft.pelanggan || "";
        if(admin) admin.value = draft.admin || "";
        if(catatan) catatan.value = draft.catatan || "";

        tokenFontSize =
            Number(draft.tokenFontSize) || tokenFontSize || 30;

        let label = document.getElementById('labelUkuranToken');
        if(label) label.innerText = tokenFontSize + "px";

        // Bersihkan daftar barang lama
        let wadah = document.getElementById('wadahBarangManual');

        if(wadah) {

            wadah.innerHTML = "";

            let daftar =
                Array.isArray(draft.items) && draft.items.length
                ? draft.items
                : [{nama:"", qty:"1", harga:""}];

            daftar.forEach(item => {

                let div = document.createElement('div');

                div.className =
                    'grid-3 item-barang-manual';

                div.style.gap = '5px';
                div.style.marginBottom = '10px';

                div.innerHTML = `
                    <input type="text"
                        class="input-nama-barang"
                        placeholder="Barang"
                        value="${String(item.nama || '').replace(/"/g, '&quot;')}"
                        oninput="updatePreviewStruk()"
                        style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;">

                    <input type="number"
                        class="input-qty-barang"
                        value="${item.qty || 1}"
                        min="1"
                        oninput="updatePreviewStruk()"
                        style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;">

                    <input type="number"
                        class="input-harga-barang"
                        placeholder="Harga"
                        value="${item.harga || ''}"
                        oninput="updatePreviewStruk()"
                        style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;">
                `;

                wadah.appendChild(div);
            });
        }

        if(draft.mode === 'token') {
            ubahModeStrukManual('token');
        } else {
            ubahModeStrukManual('biasa');
        }

        updatePreviewStruk();
    }


    // ==========================================
    // KONFIRMASI SEBELUM CETAK
    // ==========================================

        function konfirmasiCetakStruk() {
        // Simpan dahulu sebelum masuk tahap cetak
        let berhasil = simpanDraftStrukManual(false);
        if(!berhasil) return;

        let info = document.getElementById('infoKonfirmasiStruk');
        if(info) {
            let d = db.strukDraft;
            let html = `<div style="font-family:monospace; font-size:11px; color:#333; line-height:1.4; word-break:break-all;">`;
            
            if (d.mode === 'token') {
                html += `<div style="text-align:center; margin-bottom:5px; color:var(--primary);"><b>⚡ PREVIEW CETAK TOKEN</b></div>`;
                html += `<div>Toko: <b>${d.namaToko}</b></div>`;
                html += `<div style="border-top:1px dashed #ccc; margin:6px 0;"></div>`;
                
                let tokenBersih = (d.catatan || '').replace(/\D/g, '').substring(0, 20);
                let tokenTampil = tokenBersih.replace(/(.{4})/g, '$1 ').trim();
                html += `<div style="font-size:16px; font-weight:bold; text-align:center; padding:8px 0; letter-spacing:1px;">${tokenTampil || '(Belum diisi)'}</div>`;
            } else {
                html += `<div style="text-align:center; margin-bottom:4px; color:var(--primary);"><b>📝 PREVIEW STRUK PPOB / TAGIHAN</b></div>`;
                html += `<div>Toko : <b>${d.namaToko}</b></div>`;
                html += `<div>Tgl  : ${d.tanggal}</div>`;
                if (d.pelanggan) html += `<div>Plg  : ${d.pelanggan}</div>`;
                html += `<div style="border-top:1px dashed #ccc; margin:6px 0;"></div>`;
                
                // Cek apakah ada item barang manual standar
                let totalBarang = 0;
                let adaBarangAktif = false;
                if (d.items && d.items.length > 0) {
                    d.items.forEach(item => {
                        let sub = (parseInt(item.qty)||0) * (parseInt(item.harga)||0);
                        totalBarang += sub;
                        if (item.nama || sub > 0) {
                            adaBarangAktif = true;
                            html += `<div style="display:flex; justify-content:space-between;"><span>${item.nama} x${item.qty}</span><span>Rp ${sub.toLocaleString('id-ID')}</span></div>`;
                        }
                    });
                }

                let admin = parseInt(d.admin) || 0;
                let totalAkhir = totalBarang + admin;

                if (adaBarangAktif && (totalBarang > 0 || admin > 0)) {
                    if (admin > 0) {
                        html += `<div style="display:flex; justify-content:space-between;"><span>Biaya Admin</span><span>Rp ${admin.toLocaleString('id-ID')}</span></div>`;
                    }
                    html += `<div style="border-top:1px dashed #ccc; margin:6px 0;"></div>`;
                    html += `<div style="display:flex; justify-content:space-between; font-weight:bold;"><span>TOTAL</span><span class="text-blue">Rp ${totalAkhir.toLocaleString('id-ID')}</span></div>`;
                }
                
                // Jika mencetak catatan PPOB / Tagihan panjang (seperti PLN)
                if (d.catatan) {
                    if (adaBarangAktif) {
                        html += `<div style="border-top:1px dashed #ccc; margin:6px 0;"></div>`;
                    }
                    html += `<div style="font-size:10px; white-space:pre-line;">${d.catatan}</div>`;
                }
            }

            // Footer Sesuai Permintaan
            html += `<div style="border-top:1px dashed #ccc; margin:6px 0;"></div>`;
            html += `<div style="text-align:center; font-size:9px; color:#555;">Powered by Sistem UMKM Pro<br>by Gemini & CHATGPT developer amat Bajualan</div>`;
            html += `</div>`;
            info.innerHTML = html;
        }

        let modal = document.getElementById('modal-konfirmasi-struk');
        if(modal) {
            modal.classList.add('active');
        }
    }



    function resetFormStrukManual() {
        if(!confirm("Yakin ingin membersihkan semua isian data struk ini?")) return;

        if (document.getElementById('strukManualPelanggan')) document.getElementById('strukManualPelanggan').value = "";
        if (document.getElementById('strukManualAdmin')) document.getElementById('strukManualAdmin').value = "";
        
        let wadah = document.getElementById('wadahBarangManual');
        if (wadah) {
            wadah.innerHTML = `
                <div class="grid-3 item-barang-manual" style="gap:5px; margin-bottom:10px;">
                    <input type="text" class="input-nama-barang" placeholder="Barang" oninput="updatePreviewStruk()" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;">
                    <input type="number" class="input-qty-barang" value="1" min="1" oninput="updatePreviewStruk()" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;">
                    <input type="number" class="input-harga-barang" placeholder="Harga" oninput="updatePreviewStruk()" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:8px;">
                </div>
            `;
        }
        
        let catatan = document.getElementById('strukManualCatatan');
        if (catatan) {
            catatan.value = "";
            catatan.style.height = '120px';
        }
        
        // Nama Toko dan Tanggal sengaja tidak dihapus agar tidak repot mengetik ulang terus-menerus
        updatePreviewStruk();
    }

    function batalKonfirmasiStruk() {

        let modal =
            document.getElementById('modal-konfirmasi-struk');

        if(modal) {
            modal.classList.remove('active');
        }
    }


    async function cetakDariKonfirmasi() {

        batalKonfirmasiStruk();

        // Beri sedikit waktu agar modal benar-benar tertutup
        await new Promise(r => setTimeout(r, 100));

        await cetakStrukBluetoothLangsung();
    }

    let btDevice = null;
    let btCharacteristic = null;

    async function hubungkanPrinterBT() {
        if (!("bluetooth" in navigator)) {
            return alert("❌ Web Bluetooth tidak didukung di browser/perangkat ini. Gunakan Google Chrome di Android dengan koneksi HTTPS.");
        }
        try {
            btDevice = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [
                    '000018f0-0000-1000-8000-00805f9b34fb',
                    'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
                    '0000ff00-0000-1000-8000-00805f9b34fb',
                    '0000ffe0-0000-1000-8000-00805f9b34fb',
                    '00001101-0000-1000-8000-00805f9b34fb'
                ]
            });

            let server = await btDevice.gatt.connect();
            let services = await server.getPrimaryServices();
            btCharacteristic = null;

            for (let service of services) {
                let characteristics = await service.getCharacteristics();
                for (let c of characteristics) {
                    if (c.properties.write || c.properties.writeWithoutResponse) {
                        btCharacteristic = c;
                        break;
                    }
                }
                if (btCharacteristic) break;
            }

            if (btCharacteristic) {
                alert("✅ Printer Bluetooth Berhasil Terhubung: " + (btDevice.name || "Printer Thermal"));
            } else {
                alert("⚠️ Printer terhubung, tetapi jalur cetak (Characteristic Write) tidak ditemukan.");
            }
        } catch (err) {
            alert("❌ Gagal menghubungkan printer: " + err.message);
        }
    }

    async function kirimDataBluetooth(uint8Data) {
        if (!btCharacteristic || !btDevice || !btDevice.gatt.connected) {
            alert("⚠️ Printer belum terhubung! Silakan klik 'Hubungkan Printer BT' terlebih dahulu.");
            return false;
        }
        const CHUNK_SIZE = 100;
        for (let i = 0; i < uint8Data.length; i += CHUNK_SIZE) {
            let chunk = uint8Data.slice(i, i + CHUNK_SIZE);
            if (btCharacteristic.properties.writeWithoutResponse) {
                await btCharacteristic.writeValueWithoutResponse(chunk);
            } else {
                await btCharacteristic.writeValue(chunk);
            }
            await new Promise(r => setTimeout(r, 50));
        }
        return true;
    }

    async function cetakStrukBluetoothLangsung() {
        if (!btCharacteristic || !btDevice || !btDevice.gatt.connected) {
            await hubungkanPrinterBT();
            if (!btCharacteristic) return;
        }

        let areaStruk = document.getElementById('areaStrukManual');
        let isToken = areaStruk && areaStruk.classList.contains('mode-token-pln');

        let namaToko =
    document.getElementById('strukManualNamaToko').value || "amat Bajualan";

let tanggal =
    document.getElementById('strukManualTanggal').value || ambilTanggal();

let namaPlg =
    document.getElementById('strukManualPelanggan').value.trim();

let noTransaksi =
    document.getElementById('strukManualNoTransaksi')?.value.trim() ||
    ("TRX-" + Date.now());

let idPelanggan =
    document.getElementById('strukManualIdPelanggan')?.value.trim() || "";

let catatan =
    document.getElementById('strukManualCatatan').value.trim();

let adminFee =
    parseInt(document.getElementById('strukManualAdmin').value) || 0;

let jasaLayanan =
    parseInt(document.getElementById('strukManualJasa')?.value) || 0;

let statusTransaksi =
    document.getElementById('strukManualStatus')?.value || "BERHASIL";

        let showHeader = document.getElementById('cbToggleHeader') ? document.getElementById('cbToggleHeader').checked : true;
        let showTgl = document.getElementById('cbToggleTanggal') ? document.getElementById('cbToggleTanggal').checked : true;
        let showPlg = document.getElementById('cbTogglePelanggan') ? document.getElementById('cbTogglePelanggan').checked : true;
        let showBrg = document.getElementById('cbToggleBarang') ? document.getElementById('cbToggleBarang').checked : true;
        let showAdmin = document.getElementById('cbToggleAdmin') ? document.getElementById('cbToggleAdmin').checked : true;
        let showTotal = document.getElementById('cbToggleTotal') ? document.getElementById('cbToggleTotal').checked : true;
        let showTokenLabel = document.getElementById('cbToggleTokenLabel') ? document.getElementById('cbToggleTokenLabel').checked : true;
        let showFooter = document.getElementById('cbToggleFooter') ? document.getElementById('cbToggleFooter').checked : true;

        let cmds = [];
        let add = arr => cmds.push(...arr);
        let addStr = str => {
            // FIX: Bersihkan simbol HP/Copy-Paste (seperti dash panjang) agar printer tidak mencetak öõÇ
            let cleanStr = str.replace(/[—–]/g, '-')
                              .replace(/[“”]/g, '"')
                              .replace(/[‘’]/g, "'")
                              .replace(/[^\x00-\x7F]/g, ""); 
            let encoder = new TextEncoder();
            cmds.push(...encoder.encode(cleanStr));
        };

        // Reset ESC/POS
        add([0x1B, 0x40]);
        // Matikan Garis Miring di Angka 0 (Cancel Slashed Zero)
        add([0x1B, 0x7A, 0x00]);

        if (isToken) {
            // MODE TOKEN PLN
            if (showHeader) {
                add([0x1B, 0x61, 0x01]); // Align Center
                add([0x1B, 0x45, 0x01]); // Bold On
                addStr(namaToko + "\n");
                add([0x1B, 0x45, 0x00]); // Bold Off
                addStr("Terima Kasih Sudah Belanja\n");
                addStr("--------------------------------\n");
            }

            if (showTokenLabel) {
                add([0x1B, 0x61, 0x01]);
                addStr("TOKEN PLN\n\n");
            }

            // ==========================================
            // UKURAN TOKEN PLN DI PRINTER
            // Mengikuti ukuran font yang dipilih di aplikasi
            // ==========================================

            let ukuranCetakToken =
                Number(tokenFontSize) || 30;

            let escposUkuran = 0x11;

            /*
             * ESC/POS GS !
             *
             * 0x00 = normal
             * 0x11 = 2x lebar + 2x tinggi
             * 0x22 = 3x lebar + 3x tinggi
             *
             * Kita batasi agar tetap aman untuk printer 58mm.
             */

            if(ukuranCetakToken <= 20) {
                escposUkuran = 0x00;
            } else if(ukuranCetakToken <= 40) {
                escposUkuran = 0x11;
            } else {
                escposUkuran = 0x22;
            }

            add([0x1D, 0x21, escposUkuran]);

            add([0x1B, 0x45, 0x01]); // Bold On

            // ==========================================
            // FORMAT TOKEN PLN
            // ==========================================

            let tokenPolos =
                catatan.replace(/\D/g, '').substring(0, 20);

            let tokenCetak =
                catatan;

            if(tokenPolos.length === 20) {

                let b1 = tokenPolos.substr(0, 4);
                let b2 = tokenPolos.substr(4, 4);
                let b3 = tokenPolos.substr(8, 4);
                let b4 = tokenPolos.substr(12, 4);
                let b5 = tokenPolos.substr(16, 4);

                /*
                 * Dibuat 2 baris agar aman
                 * untuk printer thermal 58mm.
                 */
                tokenCetak =
                    `${b1} ${b2} ${b3}\n${b4} ${b5}`;
            }

            addStr(tokenCetak + "\n");

            // Kembalikan printer ke ukuran normal
            add([0x1D, 0x21, 0x00]);

            // Matikan Bold
            add([0x1B, 0x45, 0x00]);

                if (showFooter) {
                addStr("--------------------------------\n");
                addStr("Powered by Sistem UMKM Pro\n");
                addStr("by Gemini & CHATGPT \n");
                addStr("developer amat Bajualan\n");
            }

            addStr("\n\n\n\n");
        } else {
            // MODE CATATAN BIASA
            if (showHeader) {
                let alignH = document.getElementById('selectAlignHeader') ? document.getElementById('selectAlignHeader').value : 'center';
                let alignCode = alignH === 'left' ? 0 : (alignH === 'right' ? 2 : 1);
                add([0x1B, 0x61, alignCode]);
                add([0x1B, 0x45, 0x01]);
                addStr(namaToko + "\n");
                add([0x1B, 0x45, 0x00]);
                addStr("Terima Kasih Sudah Belanja\n");
                addStr("--------------------------------\n");
            }

            add([0x1B, 0x61, 0x00]); // Align Left

            if (showTgl) addStr("Tgl : " + tanggal + "\n");
            if (showPlg && namaPlg !== "") addStr("Plg : " + namaPlg + "\n");
            if (showTgl || (showPlg && namaPlg !== "")) addStr("--------------------------------\n");

            let totalAkhir = 0;
            if (showBrg) {
                document.querySelectorAll('.item-barang-manual').forEach(baris => {
                    let nama = baris.querySelector('.input-nama-barang').value || "-";
                    let qty = parseInt(baris.querySelector('.input-qty-barang').value) || 0;
                    let harga = parseInt(baris.querySelector('.input-harga-barang').value) || 0;
                    let sub = qty * harga;
                    totalAkhir += sub;

                    if (nama !== "-" || harga > 0) {
                        // Pengaman 32 Karakter agar Nama Barang dan Qty tetap 1 baris
                        let qtyStr = " x" + qty;
                        let maxNamaLen = 32 - qtyStr.length;
                        let namaCetak = nama;
                        
                        // Jika nama barang kepanjangan, potong rapi dan beri akhiran ".."
                        if (namaCetak.length > maxNamaLen) {
                            namaCetak = nama.substring(0, maxNamaLen - 2) + "..";
                        }
                        
                        addStr(namaCetak + qtyStr + "\n");
                        
                        // Print Harga Subtotal (Otomatis Rata Kanan)
                        let subStr = "Rp " + sub.toLocaleString('id-ID');
                        let padSpace = " ".repeat(Math.max(0, 32 - subStr.length));
                        addStr(padSpace + subStr + "\n");
                    }
                });
            }

            if (showAdmin && adminFee > 0) {
                addStr("--------------------------------\n");
                totalAkhir += adminFee;
                let adminStr = "Rp " + adminFee.toLocaleString('id-ID');
                let label = "Biaya Admin";
                let space = " ".repeat(Math.max(0, 32 - label.length - adminStr.length));
                addStr(label + space + adminStr + "\n");
            }

            if (showTotal) {
                addStr("--------------------------------\n");
                add([0x1B, 0x45, 0x01]);
                let totStr = "Rp " + totalAkhir.toLocaleString('id-ID');
                let label = "TOTAL";
                let space = " ".repeat(Math.max(0, 32 - label.length - totStr.length));
                addStr(label + space + totStr + "\n");
                add([0x1B, 0x45, 0x00]);
            }

            if (catatan !== "") {
                addStr("--------------------------------\n");
                let alignC = document.getElementById('selectAlignCatatan') ? document.getElementById('selectAlignCatatan').value : 'left';
                let cCode = alignC === 'left' ? 0 : (alignC === 'right' ? 2 : 1);
                add([0x1B, 0x61, cCode]);
                addStr(catatan + "\n");
            }

            if (showFooter) {
                add([0x1B, 0x61, 0x01]);
                addStr("--------------------------------\n");
                addStr("Powered by Sistem UMKM Pro\n");
                addStr("by Gemini & CHATGPT");
                addStr("Developer amat Bajualan\n");
            }
            addStr("\n\n\n\n");
        }

        let ok = await kirimDataBluetooth(new Uint8Array(cmds));
        if (ok) {
            mainkanSuara('ting');
        }
    }

    function downloadStrukManual() {
        let area = document.getElementById('areaStrukManual');
        html2canvas(area).then(canvas => { 
            let link = document.createElement('a'); 
            link.download = `Struk-${Date.now()}.png`; 
            link.href = canvas.toDataURL("image/png"); 
            link.click(); 
        });
    }
