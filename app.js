    function selesaikanUtang(u) { 
        // Guard: jika status sudah Lunas, jangan menambah duplikasi
        // riwayat pelunasan / transaksi manual lagi.
        if (u.status === 'Lunas') return;

        u.status = 'Lunas'; 
        
        // 🕒 MESIN WAKTU KASBON: Ganti tanggal ke Hari Pelunasan!
        let tglLunas = ambilTanggal();
        
        if(u.rincianBarang) { 
            u.rincianBarang.forEach(r => { 
                if(r.transId) { 
                    let td = db.transaksi.find(t => String(t.id) === String(r.transId)); 
                    if(td) {
                        td.status = 'Lunas'; 
                        td.tanggal = tglLunas; // Ubah tanggal transaksi aslinya
                    }
                } else if(u.jenis === 'Piutang') { 
                    db.transaksi.push({ id: Date.now() + Math.random(), tanggal: tglLunas, namaProduk: r.produk || u.namaProduk || 'Pelunasan Kasbon', jumlah: 1, modal: 0, total: r.nominal, untung: r.nominal, status: 'Lunas', pembeli: u.nama, dompetId: u.dompetId || 'none' });
                } 
            }); 
        } 
    }
