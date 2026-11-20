
const express = require('express');
const app = express();
const port = 3000;

const parkir = require('./data/parkir');

// Middleware untuk membaca data request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fungsi mencari parkir berdasarkan ID menggunakan perulangan FOR
function cariParkir(id) {
    let data = null;

    for (let i = 0; i < parkir.length; i++) {
        if (parkir[i].id === Number(id)) {
            data = parkir[i];
            break;
        }
    }

    return data;
}

// Fungsi menampilkan data parkir
function tampilkanParkir() {
    let html = '';

    for (let i = 0; i < parkir.length; i++) {
        const item = parkir[i];
        const tersedia = item.kapasitas - item.terisi;
        const status = tersedia === 0 ? 'PENUH' : 'TERSEDIA';

        html += `
            <div style="border:1px solid #ccc;padding:15px;margin:10px 0;border-radius:8px">
                <h2>${item.nama}</h2>
                <p>ID: ${item.id}</p>
                <p>Kapasitas: ${item.kapasitas} kendaraan</p>
                <p>Terisi: ${item.terisi} kendaraan</p>
                <p>Tersedia: ${tersedia} kendaraan</p>
                <p>Status: ${status}</p>
            </div>
        `;
    }

    return html;
}

// ROUTE 1: GET halaman utama
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Campus Parking</title>
        </head>
        <body>
            <h1>Campus Parking Management</h1>
            <p>Sistem pengelolaan parkir kampus</p>

            <ul>
                <li><a href="/lokasi-parkir">Lokasi Parkir</a></li>
                <li><a href="/cek-kapasitas">Cek Kapasitas</a></li>
                <li><a href="/tambah-parkir">Tambah Parkir</a></li>
                <li><a href="/form-update-parkir">Update Parkir</a></li>
                <li><a href="/form-hapus-parkir">Hapus Parkir</a></li>
            </ul>
        </body>
        </html>
    `);
});

// ROUTE 2: GET menampilkan lokasi parkir
app.get('/lokasi-parkir', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Lokasi Parkir</title>
        </head>
        <body>
            <h1>Daftar Lokasi Parkir Kampus</h1>
            ${tampilkanParkir()}
            <a href="/">Kembali ke Beranda</a>
        </body>
        </html>
    `);
});

// ROUTE 3: GET cek kapasitas
app.get('/cek-kapasitas', (req, res) => {
    let totalKapasitas = 0;
    let totalTerisi = 0;
    let totalTersedia = 0;

    for (let i = 0; i < parkir.length; i++) {
        totalKapasitas += parkir[i].kapasitas;
        totalTerisi += parkir[i].terisi;
        totalTersedia += parkir[i].kapasitas - parkir[i].terisi;
    }

    res.send(`
        <html>
        <head>
            <title>Cek Kapasitas Parkir</title>
        </head>
        <body>
            <h1>Informasi Kapasitas Parkir</h1>
            <p>Total area parkir: ${parkir.length}</p>
            <p>Total kapasitas: ${totalKapasitas} kendaraan</p>
            <p>Total terisi: ${totalTerisi} kendaraan</p>
            <p>Total tersedia: ${totalTersedia} kendaraan</p>

            <hr>
            ${tampilkanParkir()}

            <a href="/">Kembali ke Beranda</a>
        </body>
        </html>
    `);
});

// ROUTE 4: GET form tambah parkir
app.get('/tambah-parkir', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Tambah Parkir</title>
        </head>
        <body>
            <h1>Form Tambah Parkir</h1>

            <form action="/tambah-parkir" method="POST">
                <p>Nama Parkir:
                    <input type="text" name="nama" required>
                </p>

                <p>Kapasitas:
                    <input type="number" name="kapasitas" min="1" required>
                </p>

                <p>Jumlah Terisi:
                    <input type="number" name="terisi" min="0" required>
                </p>

                <button type="submit">Tambah Parkir</button>
            </form>

            <a href="/">Kembali ke Beranda</a>
        </body>
        </html>
    `);
});

// ROUTE 5: POST menambahkan parkir
app.post('/tambah-parkir', (req, res) => {
    const body = req.body || {};
    const { nama, kapasitas, terisi } = body;

    if (!nama || kapasitas === undefined || terisi === undefined) {
        return res.status(400).send(`
            <h1>Data Tidak Lengkap</h1>
            <p>Nama, kapasitas, dan terisi wajib diisi.</p>
        `);
    }

    const cap = Number(kapasitas);
    const isi = Number(terisi);

    if (!Number.isFinite(cap) || !Number.isFinite(isi) ||
        cap <= 0 || isi < 0 || isi > cap) {
        return res.status(400).send(`
            <h1>Data Tidak Valid</h1>
            <p>Pastikan kapasitas dan jumlah kendaraan benar.</p>
        `);
    }

    let idBaru = 1;

    for (let i = 0; i < parkir.length; i++) {
        if (parkir[i].id >= idBaru) {
            idBaru = parkir[i].id + 1;
        }
    }

    const dataBaru = {
        id: idBaru,
        nama: nama.trim(),
        kapasitas: cap,
        terisi: isi
    };

    parkir.push(dataBaru);

    res.status(201).send(`
        <html>
        <body>
            <h1>Parkir Berhasil Ditambahkan</h1>
            <p>ID: ${dataBaru.id}</p>
            <p>Nama: ${dataBaru.nama}</p>
            <p>Kapasitas: ${dataBaru.kapasitas}</p>
            <p>Terisi: ${dataBaru.terisi}</p>
            <p>Tersedia: ${dataBaru.kapasitas - dataBaru.terisi}</p>
            <a href="/lokasi-parkir">Lihat Lokasi Parkir</a>
            <br>
            <a href="/">Kembali ke Beranda</a>
        </body>
        </html>
    `);
});

// ROUTE 6: GET parameter mencari parkir berdasarkan ID
app.get('/parkir/:id', (req, res) => {
    const id = Number(req.params.id);
    const data = cariParkir(id);

    if (!data) {
        return res.status(404).send(`
            <h1>Parkir Tidak Ditemukan</h1>
            <p>ID parkir ${req.params.id} tidak ditemukan.</p>
        `);
    }

    const tersedia = data.kapasitas - data.terisi;

    res.send(`
        <html>
        <body>
            <h1>Detail Parkir</h1>
            <p>ID: ${data.id}</p>
            <p>Nama: ${data.nama}</p>
            <p>Kapasitas: ${data.kapasitas}</p>
            <p>Terisi: ${data.terisi}</p>
            <p>Tersedia: ${tersedia}</p>
            <p>Status: ${tersedia === 0 ? 'PENUH' : 'TERSEDIA'}</p>
            <a href="/lokasi-parkir">Kembali</a>
        </body>
        </html>
    `);
});

// ROUTE 7: GET form update parkir
app.get('/form-update-parkir', (req, res) => {
    res.send(`
        <html>
        <body>
            <h1>Form Update Parkir</h1>

            <form id="formUpdate">
                <p>ID Parkir:
                    <input type="number" id="id" min="1" required>
                </p>

                <p>Nama Parkir:
                    <input type="text" id="nama" required>
                </p>

                <p>Kapasitas:
                    <input type="number" id="kapasitas" min="1" required>
                </p>

                <p>Jumlah Terisi:
                    <input type="number" id="terisi" min="0" required>
                </p>

                <button type="submit">Update Parkir</button>
            </form>

            <div id="hasil"></div>

            <a href="/">Kembali ke Beranda</a>

            <script>
                document.getElementById('formUpdate').addEventListener('submit', async function(e) {
                    e.preventDefault();

                    const data = {
                        id: Number(document.getElementById('id').value),
                        nama: document.getElementById('nama').value,
                        kapasitas: Number(document.getElementById('kapasitas').value),
                        terisi: Number(document.getElementById('terisi').value)
                    };

                    try {
                        const response = await fetch('/update-parkir', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        });

                        const hasil = await response.text();
                        document.getElementById('hasil').innerHTML = hasil;
                    } catch (error) {
                        document.getElementById('hasil').textContent = 'Gagal menghubungi server.';
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// ROUTE 8: PUT memperbarui parkir menggunakan FOR
app.put('/update-parkir', (req, res) => {
    const body = req.body || {};
    const { id, nama, kapasitas, terisi } = body;

    if (id === undefined) {
        return res.status(400).send('<h1>ID wajib diisi</h1>');
    }

    let data = null;

    // Perulangan FOR untuk mencari data parkir
    for (let i = 0; i < parkir.length; i++) {
        if (parkir[i].id === Number(id)) {
            data = parkir[i];
            break;
        }
    }

    if (!data) {
        return res.status(404).send('<h1>Parkir Tidak Ditemukan</h1>');
    }

    if (!nama || kapasitas === undefined || terisi === undefined) {
        return res.status(400).send('<h1>Data Tidak Lengkap</h1>');
    }

    const cap = Number(kapasitas);
    const isi = Number(terisi);

    if (!Number.isFinite(cap) || !Number.isFinite(isi) ||
        cap <= 0 || isi < 0 || isi > cap) {
        return res.status(400).send('<h1>Data Tidak Valid</h1>');
    }

    data.nama = nama.trim();
    data.kapasitas = cap;
    data.terisi = isi;

    const tersedia = data.kapasitas - data.terisi;

    res.send(`
        <html>
        <body>
            <h1>Parkir Berhasil Diperbarui</h1>
            <p>ID: ${data.id}</p>
            <p>Nama: ${data.nama}</p>
            <p>Kapasitas: ${data.kapasitas}</p>
            <p>Terisi: ${data.terisi}</p>
            <p>Tersedia: ${tersedia}</p>
            <p>Status: ${tersedia === 0 ? 'PENUH' : 'TERSEDIA'}</p>
            <a href="/lokasi-parkir">Lihat Lokasi Parkir</a>
        </body>
        </html>
    `);
});

// ROUTE 9: GET form hapus parkir
app.get('/form-hapus-parkir', (req, res) => {
    res.send(`
        <html>
        <body>
            <h1>Form Hapus Parkir</h1>

            <form id="formHapus">
                <p>ID Parkir:
                    <input type="number" id="id" min="1" required>
                </p>

                <button type="submit">Hapus Parkir</button>
            </form>

            <div id="hasil"></div>

            <a href="/">Kembali ke Beranda</a>

            <script>
                document.getElementById('formHapus').addEventListener('submit', async function(e) {
                    e.preventDefault();

                    const id = document.getElementById('id').value;

                    if (!confirm('Yakin ingin menghapus parkir ID ' + id + '?')) {
                        return;
                    }

                    try {
                        const response = await fetch('/hapus-parkir/' + id, {
                            method: 'DELETE'
                        });

                        const hasil = await response.text();
                        document.getElementById('hasil').innerHTML = hasil;
                    } catch (error) {
                        document.getElementById('hasil').textContent = 'Gagal menghubungi server.';
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// ROUTE 10: DELETE menghapus parkir berdasarkan ID
app.delete('/hapus-parkir/:id', (req, res) => {
    const id = Number(req.params.id);
    let index = -1;

    // Perulangan FOR untuk mencari index parkir
    for (let i = 0; i < parkir.length; i++) {
        if (parkir[i].id === id) {
            index = i;
            break;
        }
    }

    if (index === -1) {
        return res.status(404).send('<h1>Parkir Tidak Ditemukan</h1>');
    }

    const dataHapus = parkir[index];

    // Menghapus data dari array
    parkir.splice(index, 1);

    res.send(`
        <html>
        <body>
            <h1>Parkir Berhasil Dihapus</h1>
            <p>ID: ${dataHapus.id}</p>
            <p>Nama: ${dataHapus.nama}</p>
            <a href="/lokasi-parkir">Lihat Lokasi Parkir</a>
        </body>
        </html>
    `);
});

// Menjalankan server
app.listen(port, () => {
    console.log('Server berjalan di http://localhost:' + port);
});
