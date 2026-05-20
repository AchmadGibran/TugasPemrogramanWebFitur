// ==================== FITUR 29: PENYIMPANAN DATA DENGAN LOCALSTORAGE ====================
let data = JSON.parse(localStorage.getItem("mahasiswaA")) || [];
let page = 1;
const limit = 5;
let currentFilterJK = "all";
let currentFilterJurusan = "all";
let currentFilterAngkatan = "all";
let currentSort = "nama";

// ==================== FITUR 8-11: CHART VARIABEL ====================
let genderChart = null;
let jurusanChart = null;
let angkatanChart = null;
let umurChart = null;

const tbody = document.getElementById("tbody");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sortBy");
const form = document.getElementById("form");

// ==================== FUNGSI BANTUAN ====================
function calculateAge(birthDate) {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age >= 0 ? age : '-';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ==================== FITUR 28: TOAST NOTIFIKASI ====================
function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast" + (isError ? " error" : "");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==================== FITUR 21: KONVERSI FOTO KE BASE64 ====================
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ==================== FITUR 6: UPDATE STATISTIK DI SIDEBAR ====================
function updateStats() {
    const total = data.length;
    const totalL = data.filter(d => d.jk === 'L').length;
    const totalP = data.filter(d => d.jk === 'P').length;
    
    let totalAge = 0, ageCount = 0;
    data.forEach(d => {
        const age = calculateAge(d.tanggalLahir);
        if (age !== '-') { totalAge += age; ageCount++; }
    });
    const avgAge = ageCount > 0 ? Math.round(totalAge / ageCount) : 0;
    
    document.getElementById("totalMahasiswa").innerText = total;
    document.getElementById("totalLaki").innerText = totalL;
    document.getElementById("totalPerempuan").innerText = totalP;
    document.getElementById("rataUmur").innerText = avgAge;
    document.getElementById("storageCount").innerText = total;
    
    updateCharts();
}

// ==================== FITUR 8-11: UPDATE SEMUA CHART ====================
function updateCharts() {
    const ctxGender = document.getElementById('genderChart');
    const ctxJurusan = document.getElementById('jurusanChart');
    const ctxAngkatan = document.getElementById('angkatanChart');
    const ctxUmur = document.getElementById('umurChart');
    
    if (!ctxGender || !ctxJurusan || !ctxAngkatan || !ctxUmur) return;
    
    // FITUR 8: GRAFIK JENIS KELAMIN (Doughnut Chart)
    const lakiCount = data.filter(d => d.jk === 'L').length;
    const perempuanCount = data.filter(d => d.jk === 'P').length;
    
    if (genderChart) genderChart.destroy();
    genderChart = new Chart(ctxGender, {
        type: 'doughnut',
        data: {
            labels: ['Laki-laki', 'Perempuan'],
            datasets: [{
                data: [lakiCount, perempuanCount],
                backgroundColor: ['#3b82f6', '#ec4899'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
    
    // FITUR 9: GRAFIK JURUSAN (Bar Chart)
    const jurusanMap = {};
    data.forEach(d => {
        if (d.jurusan) {
            jurusanMap[d.jurusan] = (jurusanMap[d.jurusan] || 0) + 1;
        }
    });
    
    if (jurusanChart) jurusanChart.destroy();
    jurusanChart = new Chart(ctxJurusan, {
        type: 'bar',
        data: {
            labels: Object.keys(jurusanMap),
            datasets: [{
                label: 'Jumlah Mahasiswa',
                data: Object.values(jurusanMap),
                backgroundColor: '#0284c7',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
    
    // FITUR 10: GRAFIK ANGKATAN (Line Chart)
    const angkatanMap = {};
    data.forEach(d => {
        if (d.angkatan) {
            angkatanMap[d.angkatan] = (angkatanMap[d.angkatan] || 0) + 1;
        }
    });
    
    if (angkatanChart) angkatanChart.destroy();
    angkatanChart = new Chart(ctxAngkatan, {
        type: 'line',
        data: {
            labels: Object.keys(angkatanMap).sort(),
            datasets: [{
                label: 'Jumlah Mahasiswa',
                data: Object.keys(angkatanMap).sort().map(t => angkatanMap[t]),
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                borderColor: '#0284c7',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
    
    // FITUR 11: GRAFIK STATISTIK UMUR (Bar Chart)
    const umurMap = {};
    data.forEach(d => {
        const age = calculateAge(d.tanggalLahir);
        if (age !== '-') {
            umurMap[age] = (umurMap[age] || 0) + 1;
        }
    });
    
    if (umurChart) umurChart.destroy();
    umurChart = new Chart(ctxUmur, {
        type: 'bar',
        data: {
            labels: Object.keys(umurMap).sort((a,b) => a-b),
            datasets: [{
                label: 'Jumlah Mahasiswa',
                data: Object.keys(umurMap).sort((a,b) => a-b).map(u => umurMap[u]),
                backgroundColor: '#10b981',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// ==================== FITUR 23: FUNGSI SORTING DATA ====================
function sortData(dataArray) {
    const sorted = [...dataArray];
    switch(currentSort) {
        case 'nama': return sorted.sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
        case 'namaDesc': return sorted.sort((a, b) => (b.nama || '').localeCompare(a.nama || ''));
        case 'nim': return sorted.sort((a, b) => (a.nim || '').localeCompare(b.nim || ''));
        case 'nimDesc': return sorted.sort((a, b) => (b.nim || '').localeCompare(a.nim || ''));
        case 'umur': return sorted.sort((a, b) => {
            const ageA = calculateAge(a.tanggalLahir);
            const ageB = calculateAge(b.tanggalLahir);
            return (ageA === '-' ? 999 : ageA) - (ageB === '-' ? 999 : ageB);
        });
        case 'umurDesc': return sorted.sort((a, b) => {
            const ageA = calculateAge(a.tanggalLahir);
            const ageB = calculateAge(b.tanggalLahir);
            return (ageB === '-' ? 999 : ageB) - (ageA === '-' ? 999 : ageA);
        });
        default: return sorted;
    }
}

// ==================== FITUR 26-27: RENDER TABEL & PAGINATION ====================
function render() {
    const q = searchInput.value.toLowerCase();
    
    // FITUR 22: PENCARIAN DATA
    let filtered = data.filter(d =>
        (d.nim || '').toLowerCase().includes(q) ||
        (d.nama || '').toLowerCase().includes(q)
    );
    
    // FITUR 25: FILTER BERDASARKAN JENIS KELAMIN
    if (currentFilterJK !== "all") {
        filtered = filtered.filter(d => d.jk === currentFilterJK);
    }
    // FITUR 25: FILTER BERDASARKAN JURUSAN
    if (currentFilterJurusan !== "all") {
        filtered = filtered.filter(d => d.jurusan === currentFilterJurusan);
    }
    // FITUR 25: FILTER BERDASARKAN ANGKATAN
    if (currentFilterAngkatan !== "all") {
        filtered = filtered.filter(d => d.angkatan === currentFilterAngkatan);
    }
    
    filtered = sortData(filtered);
    
    // FITUR 27: PAGINATION
    const totalPage = Math.ceil(filtered.length / limit);
    if (page > totalPage && totalPage > 0) page = totalPage;
    if (page < 1) page = 1;
    
    const start = (page - 1) * limit;
    const rows = filtered.slice(start, start + limit);
    
    tbody.innerHTML = "";
    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:60px;">✨ Tidak ada data mahasiswa</td></tr>';
    } else {
        rows.forEach((m, i) => {
            const statusClass = m.status === 'Aktif' ? 'status-aktif' : 'status-tidak';
            const fotoHtml = m.foto ? `<img src="${m.foto}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">` : '<i class="fas fa-user-circle" style="font-size: 32px; color: #94a3b8;"></i>';
            tbody.innerHTML += `
                <tr>
                    <td>${start + i + 1}</td>
                    <td>${fotoHtml}</td>
                    <td><strong style="color:#0284c7;">${escapeHtml(m.nim)}</strong></td>
                    <td>${escapeHtml(m.nama)}</td>
                    <td>${m.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td>${escapeHtml(m.jurusan || '-')}</td>
                    <td>${escapeHtml(m.angkatan || '-')}</td>
                    <td>${formatDate(m.tanggalLahir)}</td>
                    <td>${calculateAge(m.tanggalLahir)} tahun</td>
                    <td>${escapeHtml(m.alamat || '-')}</td>
                    <td><span class="${statusClass}">${m.status || 'Aktif'}</span></td>
                    <td class="actions">
                        <button class="btn-edit" onclick="edit(${m.id})"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn-delete" onclick="hapus(${m.id})"><i class="fas fa-trash"></i> Hapus</button>
                    </td>
                </tr>
            `;
        });
    }
    
    // RENDER PAGINATION BUTTONS
    pagination.innerHTML = "";
    if (totalPage > 1) {
        for (let i = 1; i <= totalPage; i++) {
            pagination.innerHTML += `<button class="${i == page ? 'active-premium' : ''}" onclick="pageChange(${i})">${i}</button>`;
        }
    }
    
    updateStats();
}

window.pageChange = function(p) {
    page = p;
    render();
}

// ==================== FITUR EDIT & HAPUS DATA ====================
window.edit = function(id) {
    const m = data.find(d => d.id === id);
    if (m) {
        document.getElementById("nim").value = m.nim || '';
        document.getElementById("nama").value = m.nama || '';
        document.getElementById("alamat").value = m.alamat || '';
        document.getElementById("jk").value = m.jk || '';
        document.getElementById("jurusan").value = m.jurusan || '';
        document.getElementById("angkatan").value = m.angkatan || '';
        document.getElementById("tanggalLahir").value = m.tanggalLahir || '';
        document.getElementById("status").value = m.status || 'Aktif';
        document.getElementById("password").value = '';
        document.getElementById("editId").value = id;
        showToast("✏️ Mode edit: Silakan ubah data");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.querySelector('.menu-item[data-menu="form"]').click();
    }
}

window.hapus = function(id) {
    if (confirm("⚠️ Hapus data mahasiswa?")) {
        const mahasiswa = data.find(d => d.id === id);
        data = data.filter(d => d.id !== id);
        localStorage.setItem("mahasiswaA", JSON.stringify(data));
        if (data.length === 0) page = 1;
        render();
        showToast(`✅ ${mahasiswa?.nama || 'Data'} berhasil dihapus`);
    }
}

// ==================== FITUR 12-21: SUBMIT FORM (TAMBAH/EDIT DATA) ====================
form.onsubmit = async (e) => {
    e.preventDefault();
    
    let valid = true;
    const nim = document.getElementById("nim");
    const nama = document.getElementById("nama");
    const alamat = document.getElementById("alamat");
    const jk = document.getElementById("jk");
    const jurusan = document.getElementById("jurusan");
    const angkatan = document.getElementById("angkatan");
    const password = document.getElementById("password");
    const editId = document.getElementById("editId");
    const tanggalLahir = document.getElementById("tanggalLahir");
    const status = document.getElementById("status");
    const fotoInput = document.getElementById("foto");
    
    document.querySelectorAll('.error-message').forEach(e => e.innerText = "");
    
    // VALIDASI FIELD WAJIB
    if (!nim.value) { document.getElementById("eNim").innerText = "NIM wajib diisi"; valid = false; }
    if (!nama.value) { document.getElementById("eNama").innerText = "Nama wajib diisi"; valid = false; }
    if (!alamat.value) { document.getElementById("eAlamat").innerText = "Alamat wajib diisi"; valid = false; }
    if (!jk.value) { document.getElementById("eJk").innerText = "Pilih jenis kelamin"; valid = false; }
    if (!jurusan.value) { document.getElementById("eJurusan").innerText = "Pilih jurusan"; valid = false; }
    if (!angkatan.value) { document.getElementById("eAngkatan").innerText = "Pilih angkatan"; valid = false; }
    if (!tanggalLahir.value) { document.getElementById("eTanggalLahir").innerText = "Tanggal lahir wajib diisi"; valid = false; }
    
    // FITUR 20: VALIDASI PASSWORD (MINIMAL 6 KARAKTER)
    if (!editId.value && !password.value) {
        document.getElementById("ePassword").innerText = "Password wajib diisi untuk data baru";
        valid = false;
    }
    
    if (password.value && password.value.length < 6) {
        document.getElementById("ePassword").innerText = "Password minimal 6 karakter";
        valid = false;
    }
    
    // FITUR 14: VALIDASI UMUR MINIMAL 17 TAHUN
    if (tanggalLahir.value && calculateAge(tanggalLahir.value) < 17) {
        document.getElementById("eTanggalLahir").innerText = "Minimal umur 17 tahun";
        valid = false;
    }
    
    // FITUR 12: VALIDASI NIM UNIK
    if (!editId.value && data.some(d => d.nim === nim.value)) {
        document.getElementById("eNim").innerText = "NIM sudah terdaftar! Gunakan NIM yang berbeda.";
        valid = false;
    }
    
    if (editId.value) {
        const existingNim = data.find(d => d.nim === nim.value && d.id != editId.value);
        if (existingNim) {
            document.getElementById("eNim").innerText = "NIM sudah terdaftar! Gunakan NIM yang berbeda.";
            valid = false;
        }
    }
    
    if (!valid) return;
    
    // FITUR 21: KONVERSI FOTO KE BASE64
    let fotoBase64 = '';
    if (fotoInput.files.length > 0) {
        fotoBase64 = await fileToBase64(fotoInput.files[0]);
    } else if (editId.value) {
        const existingData = data.find(d => d.id == editId.value);
        fotoBase64 = existingData?.foto || '';
    }
    
    // PROSES SIMPAN ATAU UPDATE DATA
    if (editId.value) {
        const m = data.find(d => d.id == editId.value);
        if (m) {
            m.nim = nim.value;
            m.nama = nama.value;
            m.alamat = alamat.value;
            m.jk = jk.value;
            m.jurusan = jurusan.value;
            m.angkatan = angkatan.value;
            m.tanggalLahir = tanggalLahir.value;
            m.status = status.value;
            if (fotoBase64) m.foto = fotoBase64;
            if (password.value) m.password = password.value;
            showToast(`✅ Data ${m.nama} berhasil diperbarui`);
        }
    } else {
        data.push({
            id: Date.now(),
            nim: nim.value,
            nama: nama.value,
            alamat: alamat.value,
            jk: jk.value,
            jurusan: jurusan.value,
            angkatan: angkatan.value,
            tanggalLahir: tanggalLahir.value,
            status: status.value,
            password: password.value,
            foto: fotoBase64
        });
        showToast(`🎉 Selamat datang ${nama.value}!`);
    }
    
    localStorage.setItem("mahasiswaA", JSON.stringify(data));
    form.reset();
    document.getElementById("editId").value = "";
    render();
    document.querySelector('.menu-item[data-menu="table"]').click();
};

// ==================== FITUR 24: EXPORT KE EXCEL ====================
document.getElementById("exportExcelBtn").onclick = () => {
    const exportData = data.map(d => ({
        NIM: d.nim,
        Nama: d.nama,
        "Jenis Kelamin": d.jk === 'L' ? 'Laki-laki' : 'Perempuan',
        Jurusan: d.jurusan,
        Angkatan: d.angkatan,
        "Tanggal Lahir": formatDate(d.tanggalLahir),
        Umur: calculateAge(d.tanggalLahir),
        Alamat: d.alamat,
        Status: d.status
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mahasiswa");
    XLSX.writeFile(wb, `data_mahasiswa_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast("✅ Data berhasil diexport ke Excel");
};

// ==================== EVENT LISTENER ====================
searchInput.oninput = () => { page = 1; render(); };
sortSelect.onchange = () => { currentSort = sortSelect.value; page = 1; render(); };

document.getElementById("filterJurusan").onchange = (e) => {
    currentFilterJurusan = e.target.value;
    page = 1;
    render();
};

document.getElementById("filterAngkatan").onchange = (e) => {
    currentFilterAngkatan = e.target.value;
    page = 1;
    render();
};

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilterJK = btn.getAttribute('data-filter');
        page = 1;
        render();
    };
});

// ==================== FITUR 5: DARK MODE TOGGLE ====================
const darkModeBtn = document.getElementById("darkModeToggle");
if (darkModeBtn) {
    darkModeBtn.onclick = () => {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
            darkModeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            darkModeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
    };
}

// ==================== FITUR 7: MENU NAVIGASI ====================
document.querySelectorAll('.menu-item').forEach(menu => {
    menu.onclick = () => {
        document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
        menu.classList.add('active');
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        const targetId = menu.getAttribute('data-menu') + 'Section';
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');
        if (menu.getAttribute('data-menu') === 'table') render();
        if (menu.getAttribute('data-menu') === 'dashboard') {
            setTimeout(() => updateCharts(), 100);
        }
    };
});

// ==================== DATA DEMO AWAL ====================
if (data.length === 0) {
    data.push({
        id: 1,
        nim: "20240001",
        nama: "Muhammad Ikbal",
        alamat: "Jl. Ahmad Yani No. 12, Bontang",
        jk: "L",
        jurusan: "Teknik Informatika",
        angkatan: "2024",
        tanggalLahir: "2005-05-15",
        status: "Aktif",
        password: "123456",
        foto: ""
    });
    data.push({
        id: 2,
        nim: "202412036",
        nama: "Mosyarofah",
        alamat: "Jl. Jendral Sudirman No. 45, Bontang",
        jk: "P",
        jurusan: "Sistem Informasi",
        angkatan: "2024",
        tanggalLahir: "2006-02-20",
        status: "Aktif",
        password: "123456",
        foto: ""
    });
    localStorage.setItem("mahasiswaA", JSON.stringify(data));
}

// ==================== INITIAL RENDER ====================
render();