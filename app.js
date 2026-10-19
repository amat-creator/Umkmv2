function renderKasbonList() {
    // --- Hitung Ringkasan Kasbon & Tabungan Secara Real-Time ---
    let totPiutang = db.utang.filter(u => u.jenis === 'Piutang' && u.status !== 'Lunas').reduce((s, u) => s + ((Number(u.nominal)||0) - (Array.isArray(u.cicilan) ? u.cicilan.reduce((a,c) => a + (Number(c.nominal) || 0), 0) : 0)), 0);
    let totTabungan = db.utang.filter(u => u.jenis === 'Utang' && u.status !== 'Lunas').reduce((s, u) => s + ((Number(u.nominal)||0) - (Array.isArray(u.cicilan) ? u.cicilan.reduce((a,c) => a + (Number(c.nominal) || 0), 0) : 0)), 0);
    
    let elInfoPiutang = document.getElementById('infoTotalPiutangKasbon');
    let elInfoTabungan = document.getElementById('infoTotalTabunganKasbon');
    if (elInfoPiutang) elInfoPiutang.innerText = formatRupiah(totPiutang);
    if (elInfoTabungan) elInfoTabungan.innerText = formatRupiah(totTabungan);
    // -----------------------------------------------------------

    let kw = (document.getElementById('cariKasbonInput') || {}).value || ""; kw = kw.toLowerCase();
    let filterUtang = db.utang.filter(u => {
        if (kasbonTabAktif === 'Lunas') return u.status === 'Lunas' && u.nama.toLowerCase().includes(kw);
        return u.status !== 'Lunas' && u.jenis === kasbonTabAktif && u.nama.toLowerCase().includes(kw);
    });

    // Tombol Tambah khusus Tabungan
    let tombolTambahTab = kasbonTabAktif === 'Utang' ? `<button type="button" class="btn-green" style="margin-bottom:10px;" onclick="bukaModalTambahTabungan()">➕ Buka Tabungan Baru</button>` : '';

    document.getElementById('listUtang').innerHTML = tombolTambahTab + filterUtang.map(u => {
        let tD = (Array.isArray(u.cicilan) ? u.cicilan : []).reduce((a,c) => a + (Number(c.nominal) || 0), 0);
        let sU = (Number(u.nominal) || 0) - tD;
        
        let tUtangModal = 0; let tUtangJual = 0; let tUtangUntung = 0;
        
        let hc = u.cicilan&&u.cicilan.length ? u.cicilan.map((c, idx) => ({c, idx})).slice().reverse().map(item => {
            let nominalC = Number(item.c.nominal) || 0;
            let diskonC = Number(item.c.diskon) || 0;
            let warna = nominalC < 0 ? 'text-red' : 'text-green';
            let tanda = nominalC < 0 ? '-' : '+';
            let labelDiskon = diskonC > 0 ? `<br><span style="font-size:10px; color:#b7791f;">💸 Diskon: Rp ${formatRupiah(diskonC)}</span>` : '';
            return `
            <div class="cicilan-item flex-between" style="border-bottom:1px dashed #eee; padding-bottom:3px; margin-bottom:3px;">
                <div>
                    <span>${formatTanggalIndo(item.c.tanggal)}</span>
                    ${item.c.keterangan ? `<br><span style="font-size:10px; color:#888;">📝 ${item.c.keterangan}</span>` : ''}
                    ${labelDiskon}
                </div>
                <div style="display:flex; align-items:center;">
                    <span class="${warna}">${tanda} Rp ${formatRupiah(Math.abs(nominalC))}</span>
                    <button type="button" class="btn-outline" style="padding:2px 6px; font-size:10px; width:auto; margin:0 0 0 5px;" onclick="bukaEditCicilan('${u.id}', ${item.idx})">✏️</button>
                    <button type="button" class="btn-red" style="padding:2px 6px; font-size:10px; width:auto; margin:0 0 0 2px;" onclick="hapusCicilan('${u.id}', ${item.idx})">❌</button>
                </div>
            </div>`;
        }).join('') : '<div class="text-small" style="color:#aaa;">Belum ada cicilan.</div>';
            
        let hr = u.rincianBarang && u.rincianBarang.length ? u.rincianBarang.map((r, idx) => ({r, idx})).slice().reverse().map(item => {
            let modalInfo = 0; let untungInfo = 0;
            if(item.r.transId) {
                let tx = db.transaksi.find(t => String(t.id) === String(item.r.transId));
                if(tx) { modalInfo = tx.modal; untungInfo = tx.untung; }
            }

            let badgeKeuangan = item.r.transId ? `
                <div class="grid-3" style="text-align:center; gap:5px; margin-top:5px; margin-bottom:5px;">
                    <div style="background:#ffebee; padding:4px; border-radius:4px;"><div style="font-size:9px; color:#666;">Modal</div><b class="text-red" style="font-size:10px;">Rp ${formatRupiah(modalInfo)}</b></div>
                    <div style="background:#eef2f5; padding:4px; border-radius:4px;"><div style="font-size:9px; color:#666;">Jual</div><b class="text-blue" style="font-size:10px;">Rp ${formatRupiah(item.r.nominal)}</b></div>
                    <div style="background:#e8f5e9; padding:4px; border-radius:4px;"><div style="font-size:9px; color:#666;">Untung</div><b class="text-green" style="font-size:10px;">Rp ${formatRupiah(untungInfo)}</b></div>
                </div>` : `
                <div style="margin-top:5px; margin-bottom:5px; font-size:10px; color:#666; font-style:italic;">*Catatan Manual (Tanpa rincian modal)</div>`;

            tUtangModal += Number(modalInfo);
            tUtangJual += Number(item.r.nominal);
            tUtangUntung += Number(untungInfo);

            return `
            <div style="font-size:11px; padding:8px 0; border-bottom:1px dashed #ddd;">
                <div class="flex-between">
                    <div>📅 <b>${formatTanggalIndo(item.r.tanggal)}</b><br><span style="font-size:12px;">🛒 ${item.r.produk}</span></div>
                    <div style="text-align:right;">
                        <b class="text-blue" style="font-size:13px;">Rp ${formatRupiah(item.r.nominal)}</b>
                    </div>
                </div>
                ${badgeKeuangan}
                <div style="display:flex; gap:5px; justify-content:flex-end;">
                    <button type="button" class="btn-outline" style="padding:4px 12px; font-size:10px; width:auto; margin:0;" onclick="bukaEditRincian('${u.id}', ${item.idx})">✏️ Edit</button>
                    <button type="button" class="btn-red" style="padding:4px 12px; font-size:10px; width:auto; margin:0;" onclick="hapusRincian('${u.id}', ${item.idx})">❌ Hapus</button>
                </div>
            </div>`;
        }).join('') : '<div class="text-small" style="color:#aaa;">Tidak ada rincian tercatat.</div>';
        
        let isLunas = u.status === 'Lunas';
        let bgCard = isLunas ? '#f0fdf4' : '#fcfcfc';
        let borderCard = isLunas ? '#c3e6cb' : '#ddd';
        let infoSisa = isLunas ? 
            `<span class="text-green" style="font-weight:bold;">🎉 Lunas Sepenuhnya!</span>` : 
            `<span class="${u.jenis==='Piutang'?'text-blue':'text-red'}" style="font-weight:bold;">Sisa Tagihan: Rp ${formatRupiah(sU)}</span>`;
            
        let tombolAksi = isLunas ? 
            `<button type="button" class="btn-outline" style="width:auto; padding:8px 10px; margin:0; font-size:11px; flex:1;" onclick="editPintarKasbon('${u.id}')">✏️ Edit Info</button>
             <button type="button" class="btn-red" style="width:auto; padding:8px 10px; margin:0; flex:1;" onclick="hapusUtang('${u.id}')">🗑 Hapus Riwayat</button>` 
            : 
            `<button type="button" class="btn-outline" style="width:auto; padding:8px 10px; margin:0; font-size:11px; flex:1;" onclick="editPintarKasbon('${u.id}')">✏️ Edit Info</button>
             <button type="button" class="btn-warning" style="width:auto; flex:1; padding:8px 10px; margin:0; font-size:11px;" onclick="bukaModalCicilan('${u.id}')">💳 Cicil</button>
             <button type="button" class="btn-green" style="width:auto; flex:1; padding:8px 10px; margin:0; font-size:11px;" onclick="lunasSekaligus('${u.id}')">✅ Lunas Full</button>
             <button type="button" class="btn-wa" style="width:auto; padding:8px 10px; margin:0; border-color:#25D366; color:#25D366;" onclick="kirimWATagihan('${u.id}')">📱 WA</button>
             <button type="button" class="btn-red" style="width:auto; padding:8px 10px; margin:0;" onclick="hapusUtang('${u.id}')">🗑</button>`;

        return `<div class="list-item" style="background:${bgCard}; padding:10px; border-radius:8px; border:1px solid ${borderCard}; margin-bottom:10px;">
            <div class="accordion-header flex-between" style="align-items: flex-start;">
                <div style="display:flex; gap:10px; align-items:flex-start;">
                    <input type="checkbox" class="check-kasbon" value="${u.id}" style="width:auto; margin-top:4px;" onchange="cekStatusPilihSemuaKasbon(); event.stopPropagation();">
                    <div onclick="toggleAccordionUtang('${u.id}')" style="cursor:pointer;">
                        <b style="font-size:15px;">${u.nama}</b><br>
                        <span class="text-small">Total Tagihan: Rp ${formatRupiah(u.nominal)}</span><br>
                        ${infoSisa}
                    </div>
                </div>
                <div onclick="toggleAccordionUtang('${u.id}')" style="cursor:pointer;">
                    <span class="text-small" style="background:${isLunas?'#d4edda':'#eee'}; color:${isLunas?'#155724':'#333'}; padding:5px 10px; border-radius:15px; font-weight:bold;">${u.status}</span>
                </div>
            </div>
            <div id="acc-${u.id}" class="accordion-content">
                <div class="grid-3" style="text-align:center; gap:5px; margin-bottom:10px;">
                    <div style="background:#ffebee; padding:5px; border-radius:5px;"><div style="font-size:9px; color:#666;">Total Modal</div><b class="text-red" style="font-size:11px;">Rp ${formatRupiah(tUtangModal)}</b></div>
                    <div style="background:#eef2f5; padding:5px; border-radius:5px;"><div style="font-size:9px; color:#666;">Total Belanja</div><b class="text-blue" style="font-size:11px;">Rp ${formatRupiah(tUtangJual)}</b></div>
                    <div style="background:#e8f5e9; padding:5px; border-radius:5px;"><div style="font-size:9px; color:#666;">Untung Bersih</div><b class="text-green" style="font-size:11px;">Rp ${formatRupiah(tUtangUntung)}</b></div>
                </div>
                <div style="margin-bottom: 10px;">
                    <b class="text-small text-blue">📝 Rincian Barang:</b>
                    <div style="background:#fff; padding:5px 8px; border-radius:5px; border:1px solid #ddd; margin-top:5px; max-height:150px; overflow-y:auto;">${hr}</div>
                </div>
                <div style="margin-bottom: 10px; max-height: 100px; overflow-y: auto;">
                    <b class="text-small">Riwayat Cicilan:</b><br>${hc}
                </div>
                <div class="flex-between" style="gap:5px; flex-wrap:wrap; margin-top:10px;">
                    ${tombolAksi}
                </div>
            </div>
        </div>`;
    }).join('') || '<div class="text-small text-center" style="padding:15px; color: gray;">Kosong / Semua lunas! 🎉</div>';
}

function eksekusiSimpanCicilan(e) {
    e.preventDefault();

    try {
        let idUtang = document.getElementById('cicilanUtangId').value;
        let idEdit = document.getElementById('editCicilanId').value;
        let u = db.utang.find(x => String(x.id) === String(idUtang));

        if(!u) return;

        let nom = getAngkaMurni(document.getElementById('cicilanNominal').value);
        let diskon = document.getElementById('cicilanDiskonOtomatis') ? getAngkaMurni(document.getElementById('cicilanDiskonOtomatis').value) : 0;
        let tgl = document.getElementById('cicilanTgl').value;
        let dMasuk = document.getElementById('cicilanDompetMasuk').value;
        let ket = document.getElementById('cicilanKeterangan') ? document.getElementById('cicilanKeterangan').value.trim() : "";

        if(nom <= 0) {
            return alert("Isi nominal bayar terlebih dahulu!");
        }

        if(diskon > nom) {
            return alert("Diskon tidak boleh lebih besar dari nominal bayar!");
        }

        let pembayaranEfektif = Math.max(0, nom - diskon);

        if(!Array.isArray(u.cicilan)) u.cicilan = [];

        if(idEdit !== "") {
            let idx = parseInt(idEdit);

            if(!u.cicilan[idx]) {
                return alert("Data cicilan tidak ditemukan.");
            }

            if(Array.isArray(u.cicilan[idx].alokasi) && u.cicilan[idx].alokasi.length > 0) {
                return alert("Cicilan yang sudah dialokasikan ke produk tidak bisa diedit langsung. Hapus lalu catat ulang.");
            }

            u.cicilan[idx].nominal = pembayaranEfektif;
            u.cicilan[idx].diskon = diskon;
            u.cicilan[idx].tanggal = tgl;
            u.cicilan[idx].keterangan = ket || (diskon > 0 ? 'Diskon/Potongan' : '');

        } else {
            let alokasiBaru = [];

            if(pembayaranEfektif > 0 && Array.isArray(cicilanAlokasiDraft) && cicilanAlokasiDraft.length > 0 && Array.isArray(u.rincianBarang)) {
                cicilanAlokasiDraft.forEach(a => {
                    let r = u.rincianBarang[Number(a.idx)];
                    if(!r) return;

                    let nominalAlokasi = Number(a.nominal) || 0;
                    if(nominalAlokasi <= 0) return;

                    r.dibayar = Math.min(Number(r.nominal) || 0, (Number(r.dibayar) || 0) + nominalAlokasi);

                    let riwayatId = null;

                    if(r.transId) {
                        let td = db.transaksi.find(t => String(t.id) === String(r.transId));
                        if(td && r.dibayar >= (Number(r.nominal) || 0)) {
                            td.status = 'Lunas';
                            td.tanggal = tgl;
                        }
                    } else if(u.jenis === 'Piutang' && r.dibayar >= (Number(r.nominal) || 0)) {
                        riwayatId = Date.now() + Math.random();
                        db.transaksi.push({
                            id: riwayatId,
                            tanggal: tgl,
                            namaProduk: r.produk || u.namaProduk || 'Pelunasan Kasbon',
                            jumlah: 1,
                            modal: 0,
                            total: r.nominal,
                            untung: r.nominal,
                            status: 'Lunas',
                            pembeli: u.nama,
                            dompetId: u.dompetId || 'none'
                        });
                    }

                    alokasiBaru.push({ idx: Number(a.idx), nominal: nominalAlokasi, riwayatId: riwayatId });
                });
            }

            u.cicilan.push({
                id: Date.now(),
                tanggal: tgl,
                hari: getNamaHari(tgl),
                nominal: pembayaranEfektif,
                diskon: diskon,
                keterangan: ket || (diskon > 0 ? 'Diskon/Potongan' : ''),
                alokasi: alokasiBaru
            });
        }

        if(dMasuk !== 'none' && pembayaranEfektif > 0) {
            let dk = db.dompet.find(x => String(x.id) === String(dMasuk));
            if(dk) {
                if(u.jenis === 'Piutang') {
                    dk.saldo += pembayaranEfektif;
                } else if(u.jenis === 'Utang') {
                    dk.saldo -= pembayaranEfektif;
                }
            }
        }

        let tD = u.cicilan.reduce((a,c) => a + (Number(c.nominal) || 0), 0);
        if(tD >= (Number(u.nominal) || 0)) {
            selesaikanUtang(u);
        } else {
            u.status = 'Belum Lunas';
        }

        cicilanAlokasiDraft = [];
        simpanData();

        document.getElementById('modal-cicilan').classList.remove('active');

        alert("✅ Cicilan berhasil dicatat!\n\n" +
            (diskon > 0 ? `Diskon Rp ${formatRupiah(diskon)} otomatis mengurangi nominal bayar.\n` : '') +
            "Sisa pembayaran tetap masuk ke riwayat cicilan dengan nominal yang sudah disesuaikan.");

    } catch(err) {
        alert("Error: " + err.message);
    }
}
