/* =====================================================
   TOKOTOKOAND
   MAIN JAVASCRIPT
===================================================== */


/* =====================================================
   LOCAL STORAGE
===================================================== */

const STORAGE = {

    akun: "tokotokand_akun",
    barang: "tokotokand_barang",
    transaksi: "tokotokand_transaksi",
    currentUser: "tokotokand_current_user",
    theme: "tokotokand_theme"

};


/* =====================================================
   DATA
===================================================== */

let akun =
    JSON.parse(
        localStorage.getItem(STORAGE.akun)
    ) || [];


let barang =
    JSON.parse(
        localStorage.getItem(STORAGE.barang)
    ) || [];


let transaksi =
    JSON.parse(
        localStorage.getItem(STORAGE.transaksi)
    ) || [];


let currentUser =
    JSON.parse(
        localStorage.getItem(STORAGE.currentUser)
    ) || null;


let cart = [];

let paymentStatus = "Belum Bayar";

let theme =
    localStorage.getItem(STORAGE.theme) || "light";


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    ensureDefaultAdmin();

    applyTheme();

    setupForms();

    setupNavigation();

    updateDate();

    if (currentUser) {

        showApp();

    } else {

        showLogin();

    }

});


/* =====================================================
   DEFAULT ADMIN
===================================================== */

function ensureDefaultAdmin() {

    const adminExists =
        akun.some(
            a =>
                a.username.toLowerCase() === "admin"
        );


    if (!adminExists) {

        akun.unshift({

            id: "USR001",

            nama: "Administrator",

            username: "admin",

            password: "admin123",

            role: "Admin",

            tanggalDaftar:
                new Date().toISOString()

        });

        saveData();

    }

}


/* =====================================================
   SAVE DATA
===================================================== */

function saveData() {

    localStorage.setItem(
        STORAGE.akun,
        JSON.stringify(akun)
    );


    localStorage.setItem(
        STORAGE.barang,
        JSON.stringify(barang)
    );


    localStorage.setItem(
        STORAGE.transaksi,
        JSON.stringify(transaksi)
    );


    if (currentUser) {

        localStorage.setItem(
            STORAGE.currentUser,
            JSON.stringify(currentUser)
        );

    } else {

        localStorage.removeItem(
            STORAGE.currentUser
        );

    }

}


/* =====================================================
   SETUP FORMS
===================================================== */

function setupForms() {

    const loginForm =
        document.getElementById("loginForm");


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                login();

            }
        );

    }


    const registerForm =
        document.getElementById("registerForm");


    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                registerAccount();

            }
        );

    }


    const barangForm =
        document.getElementById("barangForm");


    if (barangForm) {

        barangForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                saveBarang();

            }
        );

    }


    const stokForm =
        document.getElementById("stokForm");


    if (stokForm) {

        stokForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                tambahStok();

            }
        );

    }


    const akunForm =
        document.getElementById("akunForm");


    if (akunForm) {

        akunForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                saveAkun();

            }
        );

    }

}


/* =====================================================
   LOGIN / REGISTER PAGE
===================================================== */

function showLogin() {

    document
        .getElementById("loginPage")
        .classList.remove("hidden");


    document
        .getElementById("registerPage")
        .classList.add("hidden");


    document
        .getElementById("appPage")
        .classList.add("hidden");

}


function showRegister() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");


    document
        .getElementById("registerPage")
        .classList.remove("hidden");


    document
        .getElementById("appPage")
        .classList.add("hidden");

}


function login() {

    const username =
        document
            .getElementById("loginUsername")
            .value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            .value;


    const user =
        akun.find(
            a =>
                a.username.toLowerCase() ===
                    username.toLowerCase()
                &&
                a.password === password
        );


    if (!user) {

        showToast(
            "Username atau password salah.",
            "error"
        );

        return;

    }


    currentUser = {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role
    };


    saveData();

    showApp();

    showToast(
        `Selamat datang, ${user.nama}!`,
        "success"
    );

}


function registerAccount() {

    const nama =
        document
            .getElementById("registerNama")
            .value
            .trim();


    const username =
        document
            .getElementById("registerUsername")
            .value
            .trim();


    const password =
        document
            .getElementById("registerPassword")
            .value;


    const confirm =
        document
            .getElementById("registerConfirm")
            .value;


    if (!nama || !username || !password) {

        showToast(
            "Semua data harus diisi.",
            "warning"
        );

        return;

    }


    if (password.length < 6) {

        showToast(
            "Password minimal 6 karakter.",
            "warning"
        );

        return;

    }


    if (password !== confirm) {

        showToast(
            "Konfirmasi password tidak cocok.",
            "error"
        );

        return;

    }


    const usernameExists =
        akun.some(
            a =>
                a.username.toLowerCase() ===
                username.toLowerCase()
        );


    if (usernameExists) {

        showToast(
            "Username sudah digunakan.",
            "error"
        );

        return;

    }


    const akunBaru = {

        id: generateId("USR"),

        nama: nama,

        username: username,

        password: password,

        role: "Member",

        tanggalDaftar:
            new Date().toISOString()

    };


    akun.push(akunBaru);

    saveData();

    document
        .getElementById("registerForm")
        .reset();


    showLogin();


    showToast(
        "Akun berhasil dibuat sebagai Member.",
        "success"
    );

}


/* =====================================================
   PASSWORD
===================================================== */

function togglePassword(inputId, button) {

    const input =
        document.getElementById(inputId);


    if (input.type === "password") {

        input.type = "text";

        button.textContent = "🙈";

    } else {

        input.type = "password";

        button.textContent = "👁️";

    }

}


/* =====================================================
   SHOW APP
===================================================== */

function showApp() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");


    document
        .getElementById("registerPage")
        .classList.add("hidden");


    document
        .getElementById("appPage")
        .classList.remove("hidden");


    updateUserInterface();

    updateAll();

    goToPage("dashboard");

}


/* =====================================================
   USER INTERFACE
===================================================== */

function updateUserInterface() {

    if (!currentUser) return;


    const initial =
        currentUser.nama
            .charAt(0)
            .toUpperCase();


    document
        .getElementById("sidebarAvatar")
        .textContent = initial;


    document
        .getElementById("topbarAvatar")
        .textContent = initial;


    document
        .getElementById("sidebarUserName")
        .textContent =
        currentUser.nama;


    document
        .getElementById("sidebarUserRole")
        .textContent =
        currentUser.role;


    document
        .getElementById("topbarName")
        .textContent =
        currentUser.nama;


    document
        .getElementById("topbarRole")
        .textContent =
        currentUser.role;


    document
        .getElementById("welcomeName")
        .textContent =
        currentUser.nama;


    const adminOnly =
        document.querySelectorAll(".admin-only");


    adminOnly.forEach(element => {

        if (currentUser.role === "Admin") {

            element.classList.remove("hidden");

        } else {

            element.classList.add("hidden");

        }

    });

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    currentUser = null;

    cart = [];

    paymentStatus = "Belum Bayar";

    saveData();

    showLogin();

    document
        .getElementById("loginForm")
        .reset();

    showToast(
        "Anda telah logout.",
        "success"
    );

}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const page =
                        this.dataset.page;


                    if (
                        this.classList.contains("admin-only")
                        &&
                        currentUser?.role !== "Admin"
                    ) {

                        showToast(
                            "Menu ini hanya dapat diakses Admin.",
                            "error"
                        );

                        return;

                    }


                    goToPage(page);

                }
            );

        });

}


function goToPage(page) {

    if (!currentUser) return;


    if (
        ["barang", "stok", "member", "akun"].includes(page)
        &&
        currentUser.role !== "Admin"
    ) {

        showToast(
            "Halaman ini hanya dapat diakses Admin.",
            "error"
        );

        return;

    }


    document
        .querySelectorAll(".page")
        .forEach(element => {

            element.classList.remove(
                "active-page"
            );

        });


    const target =
        document.getElementById(
            `page-${page}`
        );


    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove("active");

            if (
                button.dataset.page === page
            ) {

                button.classList.add("active");

            }

        });


    updatePageTitle(page);


    if (
        window.innerWidth <= 768
    ) {

        document
            .getElementById("sidebar")
            .classList.remove("open");

    }

}


function updatePageTitle(page) {

    const titles = {

        dashboard: [
            "Dashboard",
            "Ringkasan aktivitas toko"
        ],

        barang: [
            "Data Barang",
            "Kelola barang toko"
        ],

        stok: [
            "Barang Masuk",
            "Kelola stok barang"
        ],

        penjualan: [
            "Penjualan",
            "Buat transaksi penjualan"
        ],

        riwayat: [
            "Riwayat",
            "Riwayat transaksi toko"
        ],

        member: [
            "Data Member",
            "Data akun member"
        ],

        akun: [
            "Kelola Akun",
            "Kelola akun dan role pengguna"
        ]

    };


    const data =
        titles[page] ||
        titles.dashboard;


    document
        .getElementById("pageTitle")
        .textContent = data[0];


    document
        .getElementById("pageSubtitle")
        .textContent = data[1];

}


function toggleSidebar() {

    document
        .getElementById("sidebar")
        .classList.toggle("open");

}


/* =====================================================
   UPDATE ALL
===================================================== */

function updateAll() {

    renderDashboard();

    renderBarang();

    renderStok();

    renderSaleOptions();

    renderCart();

    renderRiwayat();

    renderMember();

    renderAkun();

    updateDate();

}


/* =====================================================
   DASHBOARD
===================================================== */

function renderDashboard() {

    const totalBarang =
        barang.length;


    const totalStok =
        barang.reduce(
            (total, item) =>
                total +
                Number(item.stok || 0),
            0
        );


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const penjualanHariIni =
        transaksi
            .filter(
                t =>
                    t.tanggal
                        .startsWith(today)
            )
            .reduce(
                (total, t) =>
                    total +
                    Number(t.total || 0),
                0
            );


    const stokMenipis =
        barang.filter(
            item =>
                Number(item.stok) <= 10
        ).length;


    document
        .getElementById("totalBarang")
        .textContent =
        totalBarang;


    document
        .getElementById("totalStok")
        .textContent =
        totalStok;


    document
        .getElementById("penjualanHariIni")
        .textContent =
        rupiah(penjualanHariIni);


    document
        .getElementById("stokMenipis")
        .textContent =
        stokMenipis;


    renderLowStock();

    renderRecentTransactions();

}


function renderLowStock() {

    const tbody =
        document.getElementById(
            "lowStockBody"
        );


    const data =
        barang
            .filter(
                item =>
                    Number(item.stok) <= 10
            )
            .sort(
                (a, b) =>
                    Number(a.stok) -
                    Number(b.stok)
            )
            .slice(0, 8);


    if (data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-state">
                    Tidak ada barang dengan stok menipis.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        data.map(item => {

            return `
                <tr>

                    <td>
                        ${escapeHTML(item.nama)}
                    </td>

                    <td>
                        ${item.stok}
                        ${escapeHTML(item.satuan)}
                    </td>

                    <td>
                        ${getStatusBadge(item.stok)}
                    </td>

                </tr>
            `;

        }).join("");

}


function renderRecentTransactions() {

    const tbody =
        document.getElementById(
            "recentTransactionBody"
        );


    const data =
        [...transaksi]
            .sort(
                (a, b) =>
                    new Date(b.tanggal) -
                    new Date(a.tanggal)
            )
            .slice(0, 5);


    if (data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    Belum ada transaksi.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        data.map(t => {

            return `
                <tr>

                    <td>
                        ${escapeHTML(t.id)}
                    </td>

                    <td>
                        ${escapeHTML(t.memberNama)}
                    </td>

                    <td>
                        ${rupiah(t.total)}
                    </td>

                    <td>
                        ${getPaymentBadge(t.paymentStatus)}
                    </td>

                </tr>
            `;

        }).join("");

}


/* =====================================================
   BARANG
===================================================== */

function renderBarang() {

    const tbody =
        document.getElementById(
            "barangTableBody"
        );


    if (!tbody) return;


    const search =
        document
            .getElementById("searchBarang")
            ?.value
            .toLowerCase()
            .trim() || "";


    const data =
        barang.filter(item => {

            return (

                item.nama
                    .toLowerCase()
                    .includes(search)

                ||

                item.id
                    .toLowerCase()
                    .includes(search)

                ||

                item.kategori
                    .toLowerCase()
                    .includes(search)

            );

        });


    if (data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-state">
                    Belum ada data barang.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        data.map(item => {

            const image =
                item.gambar
                    ? `
                        <img
                            src="${item.gambar}"
                            class="product-thumb"
                            alt="${escapeHTML(item.nama)}"
                        >
                    `
                    : `
                        <div class="no-image">
                            📦
                        </div>
                    `;


            return `
                <tr>

                    <td>
                        ${image}
                    </td>

                    <td>
                        ${escapeHTML(item.id)}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(item.nama)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(item.kategori)}
                    </td>

                    <td>
                        ${rupiah(item.hargaBeli)}
                    </td>

                    <td>
                        ${rupiah(item.hargaJual)}
                    </td>

                    <td>
                        <strong>
                            ${item.stok}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(item.satuan)}
                    </td>

                    <td>
                        ${getStatusBadge(item.stok)}
                    </td>

                    <td>

                        <button
                            class="btn btn-small btn-outline"
                            onclick="editBarang('${item.id}')"
                        >
                            ✏️
                        </button>

                        <button
                            class="btn btn-small btn-danger"
                            onclick="deleteBarang('${item.id}')"
                        >
                            🗑️
                        </button>

                    </td>

                </tr>
            `;

        }).join("");

}


function getStatusBadge(stok) {

    stok = Number(stok);


    if (stok === 0) {

        return `
            <span class="badge badge-danger">
                Habis
            </span>
        `;

    }


    if (stok <= 10) {

        return `
            <span class="badge badge-warning">
                Hampir Habis
            </span>
        `;

    }


    return `
        <span class="badge badge-success">
            Tersedia
        </span>
    `;

}


/* =====================================================
   BARANG MODAL
===================================================== */

function openBarangModal(id = null) {

    if (currentUser?.role !== "Admin") {

        showToast(
            "Hanya Admin yang dapat mengelola barang.",
            "error"
        );

        return;

    }


    const modal =
        document.getElementById(
            "barangModal"
        );


    const form =
        document.getElementById(
            "barangForm"
        );


    form.reset();


    document
        .getElementById(
            "barangEditId"
        )
        .value = "";


    document
        .getElementById(
            "barangModalTitle"
        )
        .textContent =
        "Tambah Barang";


    document
        .getElementById(
            "imagePreviewContainer"
        )
        .classList.add("hidden");


    if (id) {

        const item =
            barang.find(
                b => b.id === id
            );


        if (!item) return;


        document
            .getElementById(
                "barangEditId"
            )
            .value =
            item.id;


        document
            .getElementById(
                "barangNama"
            )
            .value =
            item.nama;


        document
            .getElementById(
                "barangKategori"
            )
            .value =
            item.kategori;


        document
            .getElementById(
                "barangHargaBeli"
            )
            .value =
            item.hargaBeli;


        document
            .getElementById(
                "barangHargaJual"
            )
            .value =
            item.hargaJual;


        document
            .getElementById(
                "barangStok"
            )
            .value =
            item.stok;


        document
            .getElementById(
                "barangSatuan"
            )
            .value =
            item.satuan;


        document
            .getElementById(
                "barangModalTitle"
            )
            .textContent =
            "Edit Barang";


        if (item.gambar) {

            document
                .getElementById(
                    "barangImagePreview"
                )
                .src =
                item.gambar;


            document
                .getElementById(
                    "imagePreviewContainer"
                )
                .classList.remove(
                    "hidden"
                );

        }

    }


    modal.classList.remove(
        "hidden"
    );

}


function saveBarang() {

    const id =
        document
            .getElementById(
                "barangEditId"
            )
            .value;


    const nama =
        document
            .getElementById(
                "barangNama"
            )
            .value
            .trim();


    const kategori =
        document
            .getElementById(
                "barangKategori"
            )
            .value
            .trim();


    const hargaBeli =
        Number(
            document
                .getElementById(
                    "barangHargaBeli"
                )
                .value
        );


    const hargaJual =
        Number(
            document
                .getElementById(
                    "barangHargaJual"
                )
                .value
        );


    const stok =
        Number(
            document
                .getElementById(
                    "barangStok"
                )
                .value
        );


    const satuan =
        document
            .getElementById(
                "barangSatuan"
            )
            .value
            .trim();


    const file =
        document
            .getElementById(
                "barangGambar"
            )
            .files[0];


    if (
        !nama ||
        !kategori ||
        !satuan ||
        hargaBeli < 0 ||
        hargaJual < 0 ||
        stok < 0
    ) {

        showToast(
            "Data barang belum lengkap.",
            "warning"
        );

        return;

    }


    if (file && file.size > 1024 * 1024) {

        showToast(
            "Ukuran gambar maksimal 1 MB.",
            "error"
        );

        return;

    }


    const existing =
        id
            ? barang.find(
                b => b.id === id
            )
            : null;


    const processSave =
        gambar => {

            if (existing) {

                existing.nama =
                    nama;

                existing.kategori =
                    kategori;

                existing.hargaBeli =
                    hargaBeli;

                existing.hargaJual =
                    hargaJual;

                existing.stok =
                    stok;

                existing.satuan =
                    satuan;

                if (gambar !== null) {

                    existing.gambar =
                        gambar;

                }

                showToast(
                    "Barang berhasil diperbarui.",
                    "success"
                );

            } else {

                barang.push({

                    id:
                        generateId("BRG"),

                    nama,

                    kategori,

                    hargaBeli,

                    hargaJual,

                    stok,

                    satuan,

                    gambar:
                        gambar || "",

                    tanggalDibuat:
                        new Date().toISOString()

                });


                showToast(
                    "Barang berhasil ditambahkan.",
                    "success"
                );

            }


            saveData();

            closeModal("barangModal");

            updateAll();

        };


    if (file) {

        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                processSave(
                    event.target.result
                );

            };


        reader.readAsDataURL(file);

    } else {

        processSave(
            existing
                ? null
                : ""
        );

    }

}


function editBarang(id) {

    openBarangModal(id);

}


function deleteBarang(id) {

    if (currentUser?.role !== "Admin") {

        showToast(
            "Hanya Admin yang dapat menghapus barang.",
            "error"
        );

        return;

    }


    const item =
        barang.find(
            b => b.id === id
        );


    if (!item) return;


    const confirmDelete =
        confirm(
            `Hapus barang "${item.nama}"?`
        );


    if (!confirmDelete) return;


    barang =
        barang.filter(
            b => b.id !== id
        );


    saveData();

    updateAll();


    showToast(
        "Barang berhasil dihapus.",
        "success"
    );

}


/* =====================================================
   IMAGE PREVIEW
===================================================== */

function previewBarangImage(event) {

    const file =
        event.target.files[0];


    if (!file) return;


    if (file.size > 1024 * 1024) {

        showToast(
            "Ukuran gambar maksimal 1 MB.",
            "error"
        );

        event.target.value = "";

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function (e) {

            document
                .getElementById(
                    "barangImagePreview"
                )
                .src =
                e.target.result;


            document
                .getElementById(
                    "imagePreviewContainer"
                )
                .classList.remove(
                    "hidden"
                );

        };


    reader.readAsDataURL(file);

}


/* =====================================================
   BARANG MASUK
===================================================== */

function renderStok() {

    const tbody =
        document.getElementById(
            "stokTableBody"
        );


    if (!tbody) return;


    if (barang.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    Belum ada barang.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        barang.map(item => {

            return `
                <tr>

                    <td>
                        ${escapeHTML(item.id)}
                    </td>

                    <td>
                        ${escapeHTML(item.nama)}
                    </td>

                    <td>
                        <strong>
                            ${item.stok}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(item.satuan)}
                    </td>

                </tr>
            `;

        }).join("");

}


function openStokModal() {

    if (currentUser?.role !== "Admin") {

        showToast(
            "Hanya Admin yang dapat menambah stok.",
            "error"
        );

        return;

    }


    const select =
        document.getElementById(
            "stokBarang"
        );


    select.innerHTML = `
        <option value="">
            -- Pilih Barang --
        </option>
    `;


    barang.forEach(item => {

        select.innerHTML += `
            <option value="${item.id}">
                ${escapeHTML(item.nama)}
                - Stok ${item.stok}
            </option>
        `;

    });


    document
        .getElementById("stokForm")
        .reset();


    document
        .getElementById("stokModal")
        .classList.remove(
            "hidden"
        );

}


function tambahStok() {

    const id =
        document
            .getElementById(
                "stokBarang"
            )
            .value;


    const jumlah =
        Number(
            document
                .getElementById(
                    "stokJumlah"
                )
                .value
        );


    if (!id || jumlah <= 0) {

        showToast(
            "Pilih barang dan masukkan jumlah stok.",
            "warning"
        );

        return;

    }


    const item =
        barang.find(
            b => b.id === id
        );


    if (!item) return;


    item.stok += jumlah;


    saveData();

    closeModal("stokModal");

    updateAll();


    showToast(
        `Stok ${item.nama} bertambah ${jumlah}.`,
        "success"
    );

}


/* =====================================================
   SALES OPTIONS
===================================================== */

function renderSaleOptions() {

    const memberSelect =
        document.getElementById(
            "saleMember"
        );


    const barangSelect =
        document.getElementById(
            "saleBarang"
        );


    if (!memberSelect || !barangSelect)
        return;


    memberSelect.innerHTML = `
        <option value="UMUM">
            Umum
        </option>
    `;


    akun
        .filter(
            a =>
                a.role === "Member"
        )
        .forEach(memberItem => {

            memberSelect.innerHTML += `
                <option value="${memberItem.id}">
                    ${escapeHTML(memberItem.nama)}
                    (@${escapeHTML(memberItem.username)})
                </option>
            `;

        });


    barangSelect.innerHTML = `
        <option value="">
            -- Pilih Barang --
        </option>
    `;


    barang.forEach(item => {

        if (Number(item.stok) > 0) {

            barangSelect.innerHTML += `
                <option value="${item.id}">
                    ${escapeHTML(item.nama)}
                    - Stok ${item.stok}
                    - ${rupiah(item.hargaJual)}
                </option>
            `;

        }

    });

}


function updateSalePrice() {

    const id =
        document
            .getElementById(
                "saleBarang"
            )
            .value;


    const preview =
        document.getElementById(
            "saleProductPreview"
        );


    if (!id) {

        preview.classList.add(
            "hidden"
        );

        return;

    }


    const item =
        barang.find(
            b => b.id === id
        );


    if (!item) return;


    const image =
        document.getElementById(
            "saleProductImage"
        );


    if (item.gambar) {

        image.src =
            item.gambar;

    } else {

        image.src =
            "";

    }


    document
        .getElementById(
            "saleProductName"
        )
        .textContent =
        item.nama;


    document
        .getElementById(
            "saleProductPrice"
        )
        .textContent =
        `${rupiah(item.hargaJual)} / ${item.satuan}`;


    preview.classList.remove(
        "hidden"
    );

}


/* =====================================================
   CART
===================================================== */

function addToCart() {

    const id =
        document
            .getElementById(
                "saleBarang"
            )
            .value;


    const qty =
        Number(
            document
                .getElementById(
                    "saleQty"
                )
                .value
        );


    if (!id) {

        showToast(
            "Pilih barang terlebih dahulu.",
            "warning"
        );

        return;

    }


    if (qty <= 0) {

        showToast(
            "Jumlah harus lebih dari 0.",
            "warning"
        );

        return;

    }


    const item =
        barang.find(
            b => b.id === id
        );


    if (!item) return;


    const existing =
        cart.find(
            c => c.id === id
        );


    const currentQty =
        existing
            ? existing.qty
            : 0;


    if (
        currentQty + qty >
        Number(item.stok)
    ) {

        showToast(
            `Stok ${item.nama} hanya ${item.stok}.`,
            "error"
        );

        return;

    }


    if (existing) {

        existing.qty += qty;

    } else {

        cart.push({

            id: item.id,

            nama: item.nama,

            harga: Number(
                item.hargaJual
            ),

            qty: qty,

            satuan: item.satuan,

            gambar: item.gambar || ""

        });

    }


    document
        .getElementById(
            "saleQty"
        )
        .value = 1;


    renderCart();


    showToast(
        "Barang masuk ke keranjang.",
        "success"
    );

}


function renderCart() {

    const tbody =
        document.getElementById(
            "cartBody"
        );


    if (!tbody) return;


    if (cart.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    Keranjang masih kosong.
                </td>
            </tr>
        `;

    } else {

        tbody.innerHTML =
            cart.map((item, index) => {

                const subtotal =
                    item.harga *
                    item.qty;


                return `
                    <tr>

                        <td>
                            ${escapeHTML(item.nama)}
                        </td>

                        <td>
                            ${rupiah(item.harga)}
                        </td>

                        <td>
                            ${item.qty}
                        </td>

                        <td>
                            ${rupiah(subtotal)}
                        </td>

                        <td>

                            <button
                                class="btn btn-small btn-danger"
                                onclick="removeFromCart(${index})"
                            >
                                ×
                            </button>

                        </td>

                    </tr>
                `;

            }).join("");

    }


    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                item.harga *
                item.qty,
            0
        );


    const totalQty =
        cart.reduce(
            (sum, item) =>
                sum +
                item.qty,
            0
        );


    document
        .getElementById(
            "cartTotal"
        )
        .textContent =
        rupiah(total);


    document
        .getElementById(
            "cartCount"
        )
        .textContent =
        `${totalQty} item`;

}


function removeFromCart(index) {

    cart.splice(
        index,
        1
    );


    renderCart();

}


/* =====================================================
   CHECKOUT
===================================================== */

function checkout() {

    if (cart.length === 0) {

        showToast(
            "Keranjang masih kosong.",
            "warning"
        );

        return;

    }


    const memberId =
        document
            .getElementById(
                "saleMember"
            )
            .value;


    let memberNama = "Umum";


    if (memberId !== "UMUM") {

        const selectedMember =
            akun.find(
                a =>
                    a.id === memberId
            );


        if (selectedMember) {

            memberNama =
                selectedMember.nama;

        }

    }


    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                item.harga *
                item.qty,
            0
        );


    /*
        Setelah checkout:

        Status pembayaran SELALU
        "Belum Bayar".

        Admin nanti yang
        mengkonfirmasi pembayaran.
    */


    const transaction = {

        id:
            generateId("TRX"),

        tanggal:
            new Date().toISOString(),

        memberId:
            memberId,

        memberNama:
            memberNama,

        jumlahItem:
            cart.reduce(
                (sum, item) =>
                    sum + item.qty,
                0
            ),

        total:
            total,

        kasir:
            currentUser.nama,

        paymentStatus:
            "Belum Bayar",

        detail:
            cart.map(item => ({

                id:
                    item.id,

                nama:
                    item.nama,

                harga:
                    item.harga,

                qty:
                    item.qty,

                subtotal:
                    item.harga *
                    item.qty

            }))

    };


    /*
        Kurangi stok.
    */

    cart.forEach(cartItem => {

        const item =
            barang.find(
                b =>
                    b.id ===
                    cartItem.id
            );


        if (item) {

            item.stok -=
                cartItem.qty;

        }

    });


    transaksi.push(
        transaction
    );


    saveData();


    cart = [];

    paymentStatus =
        "Belum Bayar";


    document
        .getElementById(
            "saleMember"
        )
        .value =
        "UMUM";


    document
        .getElementById(
            "saleBarang"
        )
        .value =
        "";


    document
        .getElementById(
            "saleQty"
        )
        .value =
        1;


    document
        .getElementById(
            "saleProductPreview"
        )
        .classList.add(
            "hidden"
        );


    updateAll();


    showToast(
        `Checkout berhasil. ${transaction.id} menunggu konfirmasi Admin.`,
        "success"
    );

}


/* =====================================================
   RIWAYAT
===================================================== */

function renderRiwayat() {

    const tbody =
        document.getElementById(
            "riwayatTableBody"
        );


    if (!tbody) return;


    let data =
        [...transaksi];


    /*
        Member hanya dapat melihat
        transaksi yang terkait dirinya.

        Admin dapat melihat semuanya.
    */

    if (
        currentUser?.role === "Member"
    ) {

        data =
            data.filter(
                t =>
                    t.memberId ===
                    currentUser.id
            );

    }


    data.sort(
        (a, b) =>
            new Date(b.tanggal) -
            new Date(a.tanggal)
    );


    if (data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    Belum ada transaksi.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        data.map(t => {

            const adminActions =
                currentUser?.role === "Admin"
                    ? `

                        ${
                            t.paymentStatus ===
                            "Belum Bayar"

                                ? `
                                    <button
                                        class="payment-button payment-confirm"
                                        onclick="confirmPayment('${t.id}')"
                                    >
                                        ✅ Sudah Bayar
                                    </button>
                                  `

                                : `
                                    <button
                                        class="payment-button payment-cancel"
                                        onclick="setUnpaid('${t.id}')"
                                    >
                                        ❌ Belum Bayar
                                    </button>
                                  `
                        }

                      `
                    : "";


            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(t.id)}
                        </strong>
                    </td>

                    <td>
                        ${formatDateTime(t.tanggal)}
                    </td>

                    <td>
                        ${escapeHTML(t.memberNama)}
                    </td>

                    <td>
                        ${t.jumlahItem}
                    </td>

                    <td>
                        <strong>
                            ${rupiah(t.total)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(t.kasir)}
                    </td>

                    <td>
                        ${getPaymentBadge(t.paymentStatus)}
                    </td>

                    <td>

                        <button
                            class="btn btn-small btn-outline"
                            onclick="viewTransaction('${t.id}')"
                        >
                            Detail
                        </button>

                        ${adminActions}

                    </td>

                </tr>
            `;

        }).join("");

}


function getPaymentBadge(status) {

    if (status === "Sudah Bayar") {

        return `
            <span class="payment-status payment-paid">
                ✅ Sudah Bayar
            </span>
        `;

    }


    return `
        <span class="payment-status payment-unpaid">
            ❌ Belum Bayar
        </span>
    `;

}


/* =====================================================
   ADMIN PAYMENT CONFIRMATION
===================================================== */

function confirmPayment(id) {

    if (currentUser?.role !== "Admin") {

        showToast(
            "Hanya Admin yang dapat mengonfirmasi pembayaran.",
            "error"
        );

        return;

    }


    const transaction =
        transaksi.find(
            t =>
                t.id === id
        );


    if (!transaction) return;


    transaction.paymentStatus =
        "Sudah Bayar";


    saveData();

    renderRiwayat();

    renderRecentTransactions();


    showToast(
        `Pembayaran ${id} berhasil dikonfirmasi.`,
        "success"
    );

}


function setUnpaid(id) {

    if (currentUser?.role !== "Admin") {

        showToast(
            "Hanya Admin yang dapat mengubah pembayaran.",
            "error"
        );

        return;

    }


    const transaction =
        transaksi.find(
            t =>
                t.id === id
        );


    if (!transaction) return;


    transaction.paymentStatus =
        "Belum Bayar";


    saveData();

    renderRiwayat();

    renderRecentTransactions();


    showToast(
        `Status ${id} dikembalikan menjadi Belum Bayar.`,
        "warning"
    );

}


/* =====================================================
   TRANSACTION DETAIL
===================================================== */

function viewTransaction(id) {

    const transaction =
        transaksi.find(
            t =>
                t.id === id
        );


    if (!transaction) return;


    document
        .getElementById(
            "transactionModalSubtitle"
        )
        .textContent =
        transaction.id;


    const detail =
        document.getElementById(
            "transactionDetail"
        );


    detail.innerHTML = `

        <div class="transaction-summary">

            <div class="transaction-summary-item">
                <span>Pembeli</span>
                <strong>
                    ${escapeHTML(transaction.memberNama)}
                </strong>
            </div>

            <div class="transaction-summary-item">
                <span>Total</span>
                <strong>
                    ${rupiah(transaction.total)}
                </strong>
            </div>

            <div class="transaction-summary-item">
                <span>Status</span>
                <strong>
                    ${getPaymentBadge(transaction.paymentStatus)}
                </strong>
            </div>

        </div>


        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>
                        <th>Barang</th>
                        <th>Harga</th>
                        <th>Jumlah</th>
                        <th>Subtotal</th>
                    </tr>

                </thead>

                <tbody>

                    ${
                        transaction.detail
                            .map(item => `

                                <tr>

                                    <td>
                                        ${escapeHTML(item.nama)}
                                    </td>

                                    <td>
                                        ${rupiah(item.harga)}
                                    </td>

                                    <td>
                                        ${item.qty}
                                    </td>

                                    <td>
                                        ${rupiah(item.subtotal)}
                                    </td>

                                </tr>

                            `)
                            .join("")
                    }

                </tbody>

            </table>

        </div>

    `;


    openModal(
        "transactionModal"
    );

}


/* =====================================================
   DATA MEMBER
===================================================== */

function renderMember() {

    const tbody =
        document.getElementById(
            "memberTableBody"
        );


    if (!tbody) return;


    /*
        Member dihitung langsung
        dari akun yang memiliki role Member.
    */

    const members =
        akun.filter(
            a =>
                a.role === "Member"
        );


    document
        .getElementById(
            "totalMember"
        )
        .textContent =
        members.length;


    if (members.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Belum ada member terdaftar.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        members.map(memberItem => {

            return `
                <tr>

                    <td>
                        ${escapeHTML(memberItem.id)}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(memberItem.nama)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(memberItem.username)}
                    </td>

                    <td>
                        <span class="badge badge-info">
                            Member
                        </span>
                    </td>

                    <td>

                        <div class="password-cell">

                            <span
                                class="password-value"
                                id="memberPassword-${memberItem.id}"
                            >
                                ••••••••
                            </span>

                            <button
                                class="password-view-button"
                                onclick="toggleMemberPassword('${memberItem.id}')"
                                title="Lihat password"
                            >
                                👁️
                            </button>

                        </div>

                    </td>

                    <td>
                        ${formatDate(memberItem.tanggalDaftar)}
                    </td>

                </tr>
            `;

        }).join("");

}


/* =====================================================
   SHOW MEMBER PASSWORD
===================================================== */

function toggleMemberPassword(id) {

    if (currentUser?.role !== "Admin") {

        showToast(
            "Password hanya dapat dilihat Admin.",
            "error"
        );

        return;

    }


    const memberItem =
        akun.find(
            a =>
                a.id === id
        );


    if (!memberItem) return;


    const element =
        document.getElementById(
            `memberPassword-${id}`
        );


    if (
        element.textContent ===
        "••••••••"
    ) {

        element.textContent =
            memberItem.password;

    } else {

        element.textContent =
            "••••••••";

    }

}


/* =====================================================
   KELOLA AKUN
===================================================== */

function renderAkun() {

    const tbody =
        document.getElementById(
            "akunTableBody"
        );


    if (!tbody) return;


    if (currentUser?.role !== "Admin") {

        tbody.innerHTML = "";

        return;

    }


    if (akun.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Belum ada akun.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        akun.map(account => {

            const isCurrent =
                currentUser.id ===
                account.id;


            return `
                <tr>

                    <td>
                        ${escapeHTML(account.id)}
                    </td>

                    <td>
                        ${escapeHTML(account.nama)}
                    </td>

                    <td>
                        ${escapeHTML(account.username)}
                    </td>

                    <td>

                        ${
                            account.role === "Admin"

                                ? `
                                    <span class="badge badge-purple">
                                        Admin
                                    </span>
                                  `

                                : `
                                    <span class="badge badge-info">
                                        Member
                                    </span>
                                  `
                        }

                    </td>

                    <td>
                        ${formatDate(account.tanggalDaftar)}
                    </td>

                    <td>

                        <button
                            class="btn btn-small btn-outline"
                            onclick="openAkunModal('${account.id}')"
                        >
                            ✏️ Edit
                        </button>

                        ${
                            !isCurrent &&
                            account.username !== "admin"

                                ? `
                                    <button
                                        class="btn btn-small btn-danger"
                                        onclick="deleteAkun('${account.id}')"
                                    >
                                        🗑️
                                    </button>
                                  `

                                : ""
                        }

                    </td>

                </tr>
            `;

        }).join("");

}


function openAkunModal(id = null) {

    if (currentUser?.role !== "Admin") {

        showToast(
            "Hanya Admin yang dapat mengelola akun.",
            "error"
        );

        return;

    }


    const form =
        document.getElementById(
            "akunForm"
        );


    form.reset();


    document
        .getElementById(
            "akunEditId"
        )
        .value = "";


    document
        .getElementById(
            "akunModalTitle"
        )
        .textContent =
        "Tambah Akun";


    document
        .getElementById(
            "akunRole"
        )
        .value =
        "Member";


    if (id) {

        const account =
            akun.find(
                a =>
                    a.id === id
            );


        if (!account) return;


        document
            .getElementById(
                "akunEditId"
            )
            .value =
            account.id;


        document
            .getElementById(
                "akunNama"
            )
            .value =
            account.nama;


        document
            .getElementById(
                "akunUsername"
            )
            .value =
            account.username;


        document
            .getElementById(
                "akunRole"
            )
            .value =
            account.role;


        document
            .getElementById(
                "akunModalTitle"
            )
            .textContent =
            "Edit Akun";


        /*
            Admin tidak dapat
            menurunkan role dirinya sendiri.
        */

        const roleSelect =
            document.getElementById(
                "akunRole"
            );


        if (
            account.id ===
            currentUser.id
        ) {

            roleSelect.disabled =
                true;

        } else {

            roleSelect.disabled =
                false;

        }

    } else {

        document
            .getElementById(
                "akunRole"
            )
            .disabled =
            false;

    }


    openModal(
        "akunModal"
    );

}


function saveAkun() {

    if (currentUser?.role !== "Admin") {

        showToast(
            "Hanya Admin yang dapat mengubah akun.",
            "error"
        );

        return;

    }


    const id =
        document
            .getElementById(
                "akunEditId"
            )
            .value;


    const nama =
        document
            .getElementById(
                "akunNama"
            )
            .value
            .trim();


    const username =
        document
            .getElementById(
                "akunUsername"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "akunPassword"
            )
            .value;


    const role =
        document
            .getElementById(
                "akunRole"
            )
            .value;


    if (!nama || !username) {

        showToast(
            "Nama dan username harus diisi.",
            "warning"
        );

        return;

    }


    const duplicate =
        akun.some(
            a =>
                a.username.toLowerCase() ===
                username.toLowerCase()
                &&
                a.id !== id
        );


    if (duplicate) {

        showToast(
            "Username sudah digunakan.",
            "error"
        );

        return;

    }


    if (id) {

        const account =
            akun.find(
                a =>
                    a.id === id
            );


        if (!account) return;


        /*
            Jangan izinkan admin
            mengubah role dirinya sendiri.
        */

        if (
            account.id ===
            currentUser.id
            &&
            role !== account.role
        ) {

            showToast(
                "Anda tidak dapat mengubah role akun sendiri.",
                "error"
            );

            return;

        }


        account.nama =
            nama;


        account.username =
            username;


        if (password) {

            if (password.length < 6) {

                showToast(
                    "Password minimal 6 karakter.",
                    "warning"
                );

                return;

            }

            account.password =
                password;

        }


        account.role =
            role;


        /*
            Jika yang diedit
            adalah user yang sedang login,
            update currentUser.
        */

        if (
            account.id ===
            currentUser.id
        ) {

            currentUser.nama =
                account.nama;

            currentUser.username =
                account.username;

            currentUser.role =
                account.role;

        }


        showToast(
            "Akun berhasil diperbarui.",
            "success"
        );

    } else {

        if (
            !password ||
            password.length < 6
        ) {

            showToast(
                "Password minimal 6 karakter.",
                "warning"
            );

            return;

        }


        /*
            Akun baru dari Kelola Akun
            juga default Member.
            Admin dapat mengubahnya
            setelah akun dibuat.
        */

        akun.push({

            id:
                generateId("USR"),

            nama,

            username,

            password,

            role: "Member",

            tanggalDaftar:
                new Date().toISOString()

        });


        showToast(
            "Akun baru berhasil dibuat sebagai Member.",
            "success"
        );

    }


    saveData();

    closeModal("akunModal");

    updateUserInterface();

    updateAll();

}


/* =====================================================
   DELETE ACCOUNT
===================================================== */

function deleteAkun(id) {

    if (currentUser?.role !== "Admin") {

        showToast(
            "Hanya Admin yang dapat menghapus akun.",
            "error"
        );

        return;

    }


    const account =
        akun.find(
            a =>
                a.id === id
        );


    if (!account) return;


    if (
        account.username ===
        "admin"
    ) {

        showToast(
            "Akun admin utama tidak dapat dihapus.",
            "error"
        );

        return;

    }


    if (
        account.id ===
        currentUser.id
    ) {

        showToast(
            "Akun yang sedang digunakan tidak dapat dihapus.",
            "error"
        );

        return;

    }


    /*
        Jangan menghapus Admin terakhir.
    */

    if (
        account.role === "Admin"
    ) {

        const adminCount =
            akun.filter(
                a =>
                    a.role === "Admin"
            ).length;


        if (adminCount <= 1) {

            showToast(
                "Tidak dapat menghapus Admin terakhir.",
                "error"
            );

            return;

        }

    }


    const confirmDelete =
        confirm(
            `Hapus akun ${account.username}?`
        );


    if (!confirmDelete) return;


    akun =
        akun.filter(
            a =>
                a.id !== id
        );


    saveData();

    updateAll();


    showToast(
        "Akun berhasil dihapus.",
        "success"
    );

}


/* =====================================================
   MODAL
===================================================== */

function openModal(id) {

    document
        .getElementById(id)
        .classList.remove(
            "hidden"
        );

}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.add(
            "hidden"
        );

}


/* =====================================================
   DATE
===================================================== */

function updateDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) return;


    const now =
        new Date();


    element.textContent =
        now.toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


function formatDate(date) {

    if (!date) return "-";


    return new Date(date)
        .toLocaleDateString(
            "id-ID",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

}


function formatDateTime(date) {

    if (!date) return "-";


    return new Date(date)
        .toLocaleString(
            "id-ID",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


/* =====================================================
   RUPIAH
===================================================== */

function rupiah(number) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(
        Number(number) || 0
    );

}


/* =====================================================
   GENERATE ID
===================================================== */

function generateId(prefix) {

    let max = 0;


    const allData = [

        ...akun,

        ...barang,

        ...transaksi

    ];


    allData.forEach(item => {

        if (!item.id) return;


        if (
            item.id.startsWith(prefix)
        ) {

            const number =
                parseInt(
                    item.id
                        .replace(prefix, ""),
                    10
                );


            if (
                !isNaN(number) &&
                number > max
            ) {

                max = number;

            }

        }

    });


    return (
        prefix +
        String(max + 1)
            .padStart(3, "0")
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message,
    type = "success"
) {

    const container =
        document.getElementById(
            "toastContainer"
        );


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.remove();

        },
        3500
    );

}


/* =====================================================
   THEME
===================================================== */

function applyTheme() {

    if (
        theme === "dark"
    ) {

        document.body.classList.add(
            "dark"
        );


        document
            .getElementById(
                "themeIcon"
            )
            .textContent =
            "☀️";


        document
            .getElementById(
                "themeText"
            )
            .textContent =
            "Mode Terang";

    } else {

        document.body.classList.remove(
            "dark"
        );


        document
            .getElementById(
                "themeIcon"
            )
            .textContent =
            "🌙";


        document
            .getElementById(
                "themeText"
            )
            .textContent =
            "Mode Gelap";

    }


    localStorage.setItem(
        STORAGE.theme,
        theme
    );

}


function toggleTheme() {

    theme =
        theme === "dark"
            ? "light"
            : "dark";


    applyTheme();

}


/* =====================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
===================================================== */

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.add(
                "hidden"
            );

        }

    }
);