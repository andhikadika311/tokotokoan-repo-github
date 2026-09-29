/* =====================================================
   TOKOTOKOAND
   Store Management System
===================================================== */


/* =====================================================
   DATA
===================================================== */

let akun =
    JSON.parse(localStorage.getItem("tokotokand_akun")) || [];

let barang =
    JSON.parse(localStorage.getItem("tokotokand_barang")) || [];

let transaksi =
    JSON.parse(localStorage.getItem("tokotokand_transaksi")) || [];

let cart = [];

let currentUser =
    JSON.parse(
        localStorage.getItem("tokotokand_current_user")
    ) || null;

let selectedPaymentStatus = true;

let currentTransactionId = null;

let editingBarangImage = "";


/* =====================================================
   DEFAULT ADMIN
===================================================== */

if (akun.length === 0) {

    akun.push({
        id: "USR001",
        nama: "Administrator",
        username: "admin",
        password: "admin123",
        role: "Admin",
        tanggalDaftar: new Date().toISOString()
    });

    saveData();
}


/* =====================================================
   SAVE DATA
===================================================== */

function saveData() {

    localStorage.setItem(
        "tokotokand_akun",
        JSON.stringify(akun)
    );

    localStorage.setItem(
        "tokotokand_barang",
        JSON.stringify(barang)
    );

    localStorage.setItem(
        "tokotokand_transaksi",
        JSON.stringify(transaksi)
    );
}


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    document.getElementById("topbarDate").textContent =
        new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    if (currentUser) {
        showApp();
    }

});


/* =====================================================
   LOGIN
===================================================== */

function login(event) {

    event.preventDefault();

    const username =
        document.getElementById("loginUsername")
            .value
            .trim();

    const password =
        document.getElementById("loginPassword")
            .value;

    const user = akun.find(
        item =>
            item.username.toLowerCase() ===
                username.toLowerCase()
            &&
            item.password === password
    );

    if (!user) {

        showToast(
            "Username atau password salah.",
            "error"
        );

        return;
    }

    currentUser = user;

    localStorage.setItem(
        "tokotokand_current_user",
        JSON.stringify(currentUser)
    );

    showApp();

    showToast(
        `Selamat datang, ${user.nama}!`,
        "success"
    );

}


/* =====================================================
   REGISTER
===================================================== */

function registerAccount(event) {

    event.preventDefault();

    const nama =
        document.getElementById("registerNama")
            .value
            .trim();

    const username =
        document.getElementById("registerUsername")
            .value
            .trim();

    const password =
        document.getElementById("registerPassword")
            .value;

    const confirmPassword =
        document.getElementById(
            "registerConfirmPassword"
        ).value;


    if (password.length < 6) {

        showToast(
            "Password minimal 6 karakter.",
            "warning"
        );

        return;
    }


    if (password !== confirmPassword) {

        showToast(
            "Konfirmasi password tidak sesuai.",
            "error"
        );

        return;
    }


    const usernameExists = akun.some(
        item =>
            item.username.toLowerCase() ===
            username.toLowerCase()
    );


    if (usernameExists) {

        showToast(
            "Username sudah digunakan.",
            "error"
        );

        return;
    }


    const newAccount = {

        id: generateId(
            akun,
            "USR"
        ),

        nama: nama,

        username: username,

        password: password,

        // SEMUA AKUN BARU OTOMATIS MEMBER
        role: "Member",

        tanggalDaftar:
            new Date().toISOString()

    };


    akun.push(newAccount);

    saveData();

    syncMemberData();


    document.getElementById(
        "registerNama"
    ).value = "";

    document.getElementById(
        "registerUsername"
    ).value = "";

    document.getElementById(
        "registerPassword"
    ).value = "";

    document.getElementById(
        "registerConfirmPassword"
    ).value = "";


    showLogin();

    document.getElementById(
        "loginUsername"
    ).value = username;


    showToast(
        "Akun berhasil dibuat sebagai Member.",
        "success"
    );
}


/* =====================================================
   SHOW LOGIN / REGISTER
===================================================== */

function showRegister() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("registerPage")
        .classList.remove("hidden");
}


function showLogin() {

    document
        .getElementById("registerPage")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");
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

        button.textContent = "👁";
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

    navigate("dashboard");
}


/* =====================================================
   USER INTERFACE
===================================================== */

function updateUserInterface() {

    if (!currentUser) return;


    document.getElementById(
        "sidebarUserName"
    ).textContent = currentUser.nama;


    document.getElementById(
        "sidebarUserRole"
    ).textContent = currentUser.role;


    document.getElementById(
        "sidebarAvatar"
    ).textContent =
        currentUser.nama
            .charAt(0)
            .toUpperCase();


    const adminElements =
        document.querySelectorAll(".admin-only");


    adminElements.forEach(element => {

        if (currentUser.role === "Admin") {

            element.style.display = "";

        } else {

            element.style.display = "none";
        }

    });

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    currentUser = null;

    cart = [];

    localStorage.removeItem(
        "tokotokand_current_user"
    );

    document
        .getElementById("appPage")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");

    document.getElementById(
        "loginUsername"
    ).value = "";

    document.getElementById(
        "loginPassword"
    ).value = "";

    showToast(
        "Anda telah logout.",
        "success"
    );
}


/* =====================================================
   NAVIGATION
===================================================== */

function navigate(page) {

    if (!currentUser) return;


    const adminPages = [
        "barang",
        "stok",
        "member",
        "akun"
    ];


    if (
        adminPages.includes(page) &&
        currentUser.role !== "Admin"
    ) {

        showToast(
            "Menu ini hanya dapat diakses Admin.",
            "error"
        );

        return;
    }


    document
        .querySelectorAll(".page")
        .forEach(item =>
            item.classList.remove("active")
        );


    const target =
        document.getElementById(
            `page-${page}`
        );


    if (target) {
        target.classList.add("active");
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item =>
            item.classList.remove("active")
        );


    const nav =
        document.querySelector(
            `.nav-item[data-page="${page}"]`
        );


    if (nav) {
        nav.classList.add("active");
    }


    updatePageTitle(page);


    if (window.innerWidth <= 768) {

        document
            .querySelector(".sidebar")
            .classList.remove("open");
    }

}


/* =====================================================
   PAGE TITLE
===================================================== */

function updatePageTitle(page) {

    const titles = {

        dashboard: [
            "Dashboard",
            "Ringkasan aktivitas TOKOTOKOAND"
        ],

        barang: [
            "Data Barang",
            "Kelola barang TOKOTOKOAND"
        ],

        stok: [
            "Barang Masuk",
            "Kelola stok barang"
        ],

        penjualan: [
            "Penjualan",
            "Kelola transaksi penjualan"
        ],

        riwayat: [
            "Riwayat",
            "Riwayat transaksi TOKOTOKOAND"
        ],

        member: [
            "Data Member",
            "Data pengguna TOKOTOKOAND"
        ],

        akun: [
            "Kelola Akun",
            "Kelola akun dan role pengguna"
        ]

    };


    if (titles[page]) {

        document.getElementById(
            "pageTitle"
        ).textContent = titles[page][0];

        document.getElementById(
            "pageSubtitle"
        ).textContent = titles[page][1];
    }
}


/* =====================================================
   UPDATE ALL
===================================================== */

function updateAll() {

    syncMemberData();

    renderDashboard();

    renderBarang();

    renderStok();

    renderSaleOptions();

    renderMember();

    renderAkun();

    renderRiwayat();
}


/* =====================================================
   MEMBER DATA
=====================================================

   Data Member otomatis berasal dari akun.
   Tidak ada data telepon/email/alamat.
===================================================== */

function syncMemberData() {

    // Fungsi ini tidak membuat array member terpisah.
    // Data akun digunakan langsung sebagai data member.

    renderMember();
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
    ).format(Number(number) || 0);
}


/* =====================================================
   GENERATE ID
===================================================== */

function generateId(array, prefix) {

    let max = 0;

    array.forEach(item => {

        const match =
            String(item.id || "")
                .match(/(\d+)$/);

        if (match) {

            const number =
                parseInt(match[1]);

            if (number > max) {
                max = number;
            }
        }

    });

    return prefix +
        String(max + 1).padStart(3, "0");
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
                total + Number(item.stok || 0),
            0
        );


    const totalMember =
        akun.filter(
            item => item.role === "Member"
        ).length;


    const today =
        new Date().toDateString();


    const todaySales =
        transaksi
            .filter(
                trx =>
                    new Date(
                        trx.tanggal
                    ).toDateString() === today
            )
            .reduce(
                (total, trx) =>
                    total + Number(trx.total || 0),
                0
            );


    document.getElementById(
        "statBarang"
    ).textContent = totalBarang;


    document.getElementById(
        "statStok"
    ).textContent = totalStok;


    document.getElementById(
        "statMember"
    ).textContent = totalMember;


    document.getElementById(
        "statPenjualan"
    ).textContent = rupiah(todaySales);


    renderLowStock();

    renderRecentTransactions();
}


/* =====================================================
   LOW STOCK
===================================================== */

function renderLowStock() {

    const tbody =
        document.getElementById(
            "lowStockTable"
        );


    const lowStock =
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


    if (lowStock.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    <div class="empty-state">
                        ✅
                        <p>Tidak ada stok menipis</p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        lowStock.map(item => `

            <tr>

                <td>
                    ${escapeHTML(item.nama)}
                </td>

                <td>
                    <strong>
                        ${item.stok}
                    </strong>
                    ${escapeHTML(item.satuan)}
                </td>

                <td>
                    ${getStatusBadge(item.stok)}
                </td>

            </tr>

        `).join("");
}


/* =====================================================
   RECENT TRANSACTIONS
===================================================== */

function renderRecentTransactions() {

    const tbody =
        document.getElementById(
            "recentTransactionTable"
        );


    const recent =
        [...transaksi]
            .sort(
                (a, b) =>
                    new Date(b.tanggal) -
                    new Date(a.tanggal)
            )
            .slice(0, 5);


    if (recent.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        🧾
                        <p>Belum ada transaksi</p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        recent.map(trx => `

            <tr>

                <td>
                    <strong>
                        ${escapeHTML(trx.id)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(trx.memberNama)}
                </td>

                <td>
                    ${rupiah(trx.total)}
                </td>

                <td>
                    ${paymentBadge(trx.pembayaran)}
                </td>

            </tr>

        `).join("");
}


/* =====================================================
   STATUS BARANG
===================================================== */

function getStatusBadge(stok) {

    stok = Number(stok);

    if (stok <= 0) {

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
   DATA BARANG
===================================================== */

function renderBarang() {

    const tbody =
        document.getElementById(
            "barangTable"
        );


    const search =
        (
            document.getElementById(
                "searchBarang"
            )?.value || ""
        )
            .toLowerCase();


    const filtered =
        barang.filter(item =>

            item.nama
                .toLowerCase()
                .includes(search)

            ||

            item.kategori
                .toLowerCase()
                .includes(search)

            ||

            item.id
                .toLowerCase()
                .includes(search)
        );


    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="10">
                    <div class="empty-state">
                        📦
                        <p>Belum ada barang</p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        filtered.map(item => `

            <tr>

                <td>
                    ${productImage(item)}
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

                    <div class="action-buttons">

                        <button
                            class="action-btn action-edit"
                            onclick="editBarang('${item.id}')"
                        >
                            ✏️
                        </button>

                        <button
                            class="action-btn action-delete"
                            onclick="deleteBarang('${item.id}')"
                        >
                            🗑️
                        </button>

                    </div>

                </td>

            </tr>

        `).join("");
}


/* =====================================================
   PRODUCT IMAGE
===================================================== */

function productImage(item) {

    if (item.gambar) {

        return `
            <img
                src="${item.gambar}"
                class="product-thumb"
                alt="${escapeHTML(item.nama)}"
            >
        `;

    }

    return `
        <div class="no-image">
            📦
        </div>
    `;
}


/* =====================================================
   BARANG MODAL
===================================================== */

function openBarangModal(id = "") {

    document.getElementById(
        "barangEditId"
    ).value = id;

    document.getElementById(
        "barangModalTitle"
    ).textContent =
        id
            ? "Edit Barang"
            : "Tambah Barang";


    document.getElementById(
        "barangNama"
    ).value = "";

    document.getElementById(
        "barangKategori"
    ).value = "";

    document.getElementById(
        "barangHargaBeli"
    ).value = "";

    document.getElementById(
        "barangHargaJual"
    ).value = "";

    document.getElementById(
        "barangStok"
    ).value = "";

    document.getElementById(
        "barangSatuan"
    ).value = "";


    editingBarangImage = "";


    const preview =
        document.getElementById(
            "barangImagePreview"
        );

    const placeholder =
        document.getElementById(
            "imagePlaceholder"
        );


    preview.src = "";

    preview.style.display = "none";

    placeholder.style.display = "block";


    document.getElementById(
        "barangImage"
    ).value = "";


    if (id) {

        const item =
            barang.find(
                item => item.id === id
            );


        if (item) {

            document.getElementById(
                "barangNama"
            ).value = item.nama;

            document.getElementById(
                "barangKategori"
            ).value = item.kategori;

            document.getElementById(
                "barangHargaBeli"
            ).value = item.hargaBeli;

            document.getElementById(
                "barangHargaJual"
            ).value = item.hargaJual;

            document.getElementById(
                "barangStok"
            ).value = item.stok;

            document.getElementById(
                "barangSatuan"
            ).value = item.satuan;


            editingBarangImage =
                item.gambar || "";


            if (item.gambar) {

                preview.src =
                    item.gambar;

                preview.style.display =
                    "block";

                placeholder.style.display =
                    "none";
            }

        }

    }


    openModal("barangModal");
}


/* =====================================================
   PREVIEW IMAGE
===================================================== */

function previewBarangImage(event) {

    const file =
        event.target.files[0];

    if (!file) return;


    if (!file.type.startsWith("image/")) {

        showToast(
            "File harus berupa gambar.",
            "error"
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload = function(e) {

        editingBarangImage =
            e.target.result;


        const preview =
            document.getElementById(
                "barangImagePreview"
            );

        const placeholder =
            document.getElementById(
                "imagePlaceholder"
            );


        preview.src =
            e.target.result;

        preview.style.display =
            "block";

        placeholder.style.display =
            "none";
    };


    reader.readAsDataURL(file);
}


/* =====================================================
   SAVE BARANG
===================================================== */

function saveBarang(event) {

    event.preventDefault();


    const editId =
        document.getElementById(
            "barangEditId"
        ).value;


    const data = {

        nama:
            document.getElementById(
                "barangNama"
            ).value.trim(),

        kategori:
            document.getElementById(
                "barangKategori"
            ).value.trim(),

        hargaBeli:
            Number(
                document.getElementById(
                    "barangHargaBeli"
                ).value
            ),

        hargaJual:
            Number(
                document.getElementById(
                    "barangHargaJual"
                ).value
            ),

        stok:
            Number(
                document.getElementById(
                    "barangStok"
                ).value
            ),

        satuan:
            document.getElementById(
                "barangSatuan"
            ).value.trim(),

        gambar:
            editingBarangImage

    };


    if (data.hargaJual < data.hargaBeli) {

        showToast(
            "Harga jual sebaiknya tidak lebih kecil dari harga beli.",
            "warning"
        );
    }


    if (editId) {

        const index =
            barang.findIndex(
                item => item.id === editId
            );


        if (index !== -1) {

            barang[index] = {

                ...barang[index],

                ...data

            };

            showToast(
                "Barang berhasil diperbarui.",
                "success"
            );
        }

    } else {

        barang.push({

            id:
                generateId(
                    barang,
                    "BRG"
                ),

            ...data

        });


        showToast(
            "Barang berhasil ditambahkan.",
            "success"
        );
    }


    saveData();

    renderBarang();

    renderDashboard();

    renderSaleOptions();

    closeModal("barangModal");
}


/* =====================================================
   EDIT BARANG
===================================================== */

function editBarang(id) {

    openBarangModal(id);
}


/* =====================================================
   DELETE BARANG
===================================================== */

function deleteBarang(id) {

    const item =
        barang.find(
            item => item.id === id
        );


    if (!item) return;


    const confirmDelete =
        confirm(
            `Hapus barang "${item.nama}"?`
        );


    if (!confirmDelete) return;


    barang =
        barang.filter(
            item => item.id !== id
        );


    saveData();

    renderBarang();

    renderDashboard();

    renderSaleOptions();

    showToast(
        "Barang berhasil dihapus.",
        "success"
    );
}


/* =====================================================
   BARANG MASUK
===================================================== */

function renderStok() {

    const tbody =
        document.getElementById(
            "stokTable"
        );


    if (barang.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        📦
                        <p>Belum ada barang</p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        barang.map(item => `

            <tr>

                <td>
                    ${productImage(item)}
                </td>

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

        `).join("");
}


/* =====================================================
   STOK MODAL
===================================================== */

function openStokModal() {

    const select =
        document.getElementById(
            "stokBarang"
        );


    if (barang.length === 0) {

        showToast(
            "Tambahkan barang terlebih dahulu.",
            "warning"
        );

        return;
    }


    select.innerHTML =
        barang.map(item => `

            <option value="${item.id}">
                ${escapeHTML(item.nama)}
                — Stok ${item.stok}
            </option>

        `).join("");


    document.getElementById(
        "stokJumlah"
    ).value = "";


    openModal("stokModal");
}


/* =====================================================
   TAMBAH STOK
===================================================== */

function tambahStok(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "stokBarang"
        ).value;


    const jumlah =
        Number(
            document.getElementById(
                "stokJumlah"
            ).value
        );


    const item =
        barang.find(
            item => item.id === id
        );


    if (!item || jumlah <= 0) {

        showToast(
            "Data stok tidak valid.",
            "error"
        );

        return;
    }


    item.stok =
        Number(item.stok) +
        jumlah;


    saveData();

    renderStok();

    renderBarang();

    renderDashboard();

    renderSaleOptions();


    closeModal("stokModal");


    showToast(
        `Stok ${item.nama} bertambah ${jumlah}.`,
        "success"
    );
}


/* =====================================================
   SALE OPTIONS
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
        <option value="">
            Umum
        </option>
    `;


    akun
        .filter(
            item => item.role === "Member"
        )
        .forEach(item => {

            memberSelect.innerHTML += `

                <option value="${item.id}">
                    ${escapeHTML(item.nama)}
                    (@${escapeHTML(item.username)})
                </option>

            `;
        });


    barangSelect.innerHTML = `
        <option value="">
            Pilih barang
        </option>
    `;


    barang.forEach(item => {

        barangSelect.innerHTML += `

            <option value="${item.id}">
                ${escapeHTML(item.nama)}
                — ${rupiah(item.hargaJual)}
                — Stok ${item.stok}
            </option>

        `;
    });


    updateSalePrice();
}


/* =====================================================
   UPDATE SALE PRICE
===================================================== */

function updateSalePrice() {

    const id =
        document.getElementById(
            "saleBarang"
        )?.value;


    const container =
        document.getElementById(
            "selectedProduct"
        );


    if (!id) {

        container.classList.add("hidden");

        return;
    }


    const item =
        barang.find(
            item => item.id === id
        );


    if (!item) return;


    container.classList.remove("hidden");


    const image =
        document.getElementById(
            "selectedProductImage"
        );


    if (item.gambar) {

        image.src =
            item.gambar;

    } else {

        image.src =
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
                    <rect width="100%" height="100%" fill="#e2e8f0"/>
                    <text x="50%" y="55%" text-anchor="middle" font-size="35">📦</text>
                </svg>`
            );
    }


    document.getElementById(
        "selectedProductName"
    ).textContent =
        item.nama;


    document.getElementById(
        "selectedProductPrice"
    ).textContent =
        rupiah(item.hargaJual);


    document.getElementById(
        "selectedProductStock"
    ).textContent =
        `Stok: ${item.stok} ${item.satuan}`;
}


/* =====================================================
   ADD TO CART
===================================================== */

function addToCart() {

    const barangId =
        document.getElementById(
            "saleBarang"
        ).value;


    const qty =
        Number(
            document.getElementById(
                "saleQty"
            ).value
        );


    if (!barangId) {

        showToast(
            "Pilih barang terlebih dahulu.",
            "warning"
        );

        return;
    }


    if (qty <= 0) {

        showToast(
            "Jumlah barang harus lebih dari 0.",
            "warning"
        );

        return;
    }


    const item =
        barang.find(
            item => item.id === barangId
        );


    if (!item) return;


    const existing =
        cart.find(
            item => item.id === barangId
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
            "Jumlah melebihi stok tersedia.",
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

            harga:
                Number(item.hargaJual),

            qty: qty,

            satuan: item.satuan,

            gambar:
                item.gambar || ""

        });
    }


    document.getElementById(
        "saleQty"
    ).value = 1;


    renderCart();

    calculateChange();


    showToast(
        "Barang ditambahkan ke keranjang.",
        "success"
    );
}


/* =====================================================
   RENDER CART
===================================================== */

function renderCart() {

    const container =
        document.getElementById(
            "cartContainer"
        );


    const count =
        cart.reduce(
            (total, item) =>
                total + item.qty,
            0
        );


    const total =
        cart.reduce(
            (total, item) =>
                total +
                item.harga *
                item.qty,
            0
        );


    document.getElementById(
        "cartCount"
    ).textContent =
        `${count} item`;


    document.getElementById(
        "cartTotal"
    ).textContent =
        rupiah(total);


    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                🛒
                <p>Keranjang masih kosong</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        cart.map(item => `

            <div class="cart-item">

                ${
                    item.gambar
                        ? `
                            <img
                                src="${item.gambar}"
                                alt="${escapeHTML(item.nama)}"
                            >
                          `
                        : `
                            <div class="cart-item-image no-image">
                                📦
                            </div>
                          `
                }

                <div class="cart-item-info">

                    <strong>
                        ${escapeHTML(item.nama)}
                    </strong>

                    <span>
                        ${item.qty} ×
                        ${rupiah(item.harga)}
                    </span>

                </div>

                <div class="cart-item-price">

                    ${rupiah(
                        item.harga *
                        item.qty
                    )}

                </div>

                <button
                    class="remove-cart"
                    onclick="removeFromCart('${item.id}')"
                >
                    ×
                </button>

            </div>

        `).join("");
}


/* =====================================================
   REMOVE CART
===================================================== */

function removeFromCart(id) {

    cart =
        cart.filter(
            item => item.id !== id
        );


    renderCart();

    calculateChange();
}


/* =====================================================
   CART TOTAL
===================================================== */

function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total +
            item.harga *
            item.qty,
        0
    );
}


/* =====================================================
   PAYMENT STATUS
===================================================== */

function setPaymentStatus(status) {

    selectedPaymentStatus =
        status;


    const paidButton =
        document.getElementById(
            "paidButton"
        );

    const unpaidButton =
        document.getElementById(
            "unpaidButton"
        );


    paidButton.classList.toggle(
        "active",
        status === true
    );


    unpaidButton.classList.toggle(
        "active",
        status === false
    );


    calculateChange();
}


/* =====================================================
   CALCULATE CHANGE
===================================================== */

function calculateChange() {

    const total =
        getCartTotal();


    const payment =
        Number(
            document.getElementById(
                "paymentAmount"
            )?.value
        ) || 0;


    let change = 0;


    if (payment >= total) {

        change =
            payment - total;

    }


    document.getElementById(
        "changeAmount"
    ).textContent =
        rupiah(change);
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


    const total =
        getCartTotal();


    const payment =
        Number(
            document.getElementById(
                "paymentAmount"
            ).value
        ) || 0;


    if (
        selectedPaymentStatus &&
        payment < total
    ) {

        showToast(
            "Uang dibayar masih kurang.",
            "error"
        );

        return;
    }


    const memberId =
        document.getElementById(
            "saleMember"
        ).value;


    const selectedMember =
        akun.find(
            item => item.id === memberId
        );


    /*
        Kalau pembayaran belum dibayar,
        uang yang masuk bisa 0.
    */

    const uangDibayar =
        selectedPaymentStatus
            ? payment
            : 0;


    const kembalian =
        selectedPaymentStatus
            ? Math.max(
                0,
                payment - total
            )
            : 0;


    /*
        Cek stok sekali lagi
    */

    for (const cartItem of cart) {

        const product =
            barang.find(
                item =>
                    item.id === cartItem.id
            );


        if (
            !product ||
            Number(product.stok) <
            Number(cartItem.qty)
        ) {

            showToast(
                `Stok ${cartItem.nama} tidak mencukupi.`,
                "error"
            );

            return;
        }
    }


    /*
        Kurangi stok
    */

    cart.forEach(cartItem => {

        const product =
            barang.find(
                item =>
                    item.id === cartItem.id
            );


        product.stok -=
            Number(cartItem.qty);

    });


    const transaction = {

        id:
            generateId(
                transaksi,
                "TRX"
            ),

        tanggal:
            new Date().toISOString(),

        memberId:
            selectedMember
                ? selectedMember.id
                : "",

        memberNama:
            selectedMember
                ? selectedMember.nama
                : "Umum",

        jumlahItem:
            cart.reduce(
                (total, item) =>
                    total + item.qty,
                0
            ),

        total: total,

        uangDibayar:
            uangDibayar,

        kembalian:
            kembalian,

        pembayaran:
            selectedPaymentStatus
                ? "Sudah Bayar"
                : "Belum Bayar",

        kasir:
            currentUser
                ? currentUser.nama
                : "System",

        detail:
            cart.map(item => ({
                id: item.id,
                nama: item.nama,
                qty: item.qty,
                harga: item.harga,
                subtotal:
                    item.harga *
                    item.qty,
                satuan: item.satuan,
                gambar: item.gambar
            }))

    };


    transaksi.push(transaction);


    saveData();


    const transactionId =
        transaction.id;


    /*
        Reset
    */

    cart = [];


    document.getElementById(
        "paymentAmount"
    ).value = "";


    document.getElementById(
        "saleMember"
    ).value = "";


    document.getElementById(
        "saleBarang"
    ).value = "";


    document.getElementById(
        "saleQty"
    ).value = 1;


    selectedPaymentStatus = true;


    setPaymentStatus(true);


    renderCart();

    renderDashboard();

    renderBarang();

    renderStok();

    renderSaleOptions();

    renderRiwayat();


    showToast(
        `Transaksi ${transactionId} berhasil.`,
        "success"
    );


    setTimeout(() => {

        openTransactionDetail(
            transactionId
        );

    }, 300);

}


/* =====================================================
   RIWAYAT
===================================================== */

function renderRiwayat() {

    const tbody =
        document.getElementById(
            "riwayatTable"
        );


    if (!tbody) return;


    const search =
        (
            document.getElementById(
                "searchRiwayat"
            )?.value || ""
        )
            .toLowerCase();


    const filter =
        document.getElementById(
            "filterPembayaran"
        )?.value || "semua";


    let data =
        [...transaksi];


    if (search) {

        data =
            data.filter(trx =>

                trx.id
                    .toLowerCase()
                    .includes(search)

                ||

                trx.memberNama
                    .toLowerCase()
                    .includes(search)

            );
    }


    if (filter === "lunas") {

        data =
            data.filter(
                trx =>
                    trx.pembayaran ===
                    "Sudah Bayar"
            );

    }


    if (filter === "belum") {

        data =
            data.filter(
                trx =>
                    trx.pembayaran ===
                    "Belum Bayar"
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
                <td colspan="7">
                    <div class="empty-state">
                        📜
                        <p>Belum ada transaksi</p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        data.map(trx => `

            <tr>

                <td>
                    <strong>
                        ${escapeHTML(trx.id)}
                    </strong>
                </td>

                <td>
                    ${formatDate(trx.tanggal)}
                </td>

                <td>
                    ${escapeHTML(trx.memberNama)}
                </td>

                <td>
                    ${trx.jumlahItem}
                </td>

                <td>
                    ${rupiah(trx.total)}
                </td>

                <td>
                    ${paymentBadge(trx.pembayaran)}
                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            class="action-btn action-view"
                            onclick="openTransactionDetail('${trx.id}')"
                        >
                            👁 Detail
                        </button>

                        ${
                            trx.pembayaran ===
                            "Belum Bayar"
                                ? `
                                    <button
                                        class="action-btn action-edit"
                                        onclick="markAsPaid('${trx.id}')"
                                    >
                                        ✅
                                    </button>
                                  `
                                : ""
                        }

                    </div>

                </td>

            </tr>

        `).join("");
}


/* =====================================================
   PAYMENT BADGE
===================================================== */

function paymentBadge(status) {

    if (status === "Sudah Bayar") {

        return `
            <span class="badge badge-success">
                ✅ Sudah Bayar
            </span>
        `;

    }

    return `
        <span class="badge badge-danger">
            ❌ Belum Bayar
        </span>
    `;
}


/* =====================================================
   MARK AS PAID
===================================================== */

function markAsPaid(id) {

    const trx =
        transaksi.find(
            item => item.id === id
        );


    if (!trx) return;


    if (
        trx.pembayaran ===
        "Sudah Bayar"
    ) {

        return;
    }


    const confirmPayment =
        confirm(
            `Tandai transaksi ${id} sebagai sudah dibayar?`
        );


    if (!confirmPayment) return;


    trx.pembayaran =
        "Sudah Bayar";


    trx.uangDibayar =
        trx.total;


    trx.kembalian = 0;


    saveData();

    renderRiwayat();

    renderDashboard();


    showToast(
        `Transaksi ${id} sudah ditandai lunas.`,
        "success"
    );
}


/* =====================================================
   MEMBER
===================================================== */

function renderMember() {

    const tbody =
        document.getElementById(
            "memberTable"
        );


    if (!tbody) return;


    const search =
        (
            document.getElementById(
                "searchMember"
            )?.value || ""
        )
            .toLowerCase();


    const members =
        akun
            .filter(
                item =>
                    item.nama
                        .toLowerCase()
                        .includes(search)

                    ||

                    item.username
                        .toLowerCase()
                        .includes(search)
            );


    if (members.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        👥
                        <p>Belum ada member</p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        members.map(item => `

            <tr>

                <td>
                    ${escapeHTML(item.id)}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(item.nama)}
                    </strong>
                </td>

                <td>
                    @${escapeHTML(item.username)}
                </td>

                <td>
                    ${
                        item.role === "Admin"
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
                    ${formatDate(item.tanggalDaftar)}
                </td>

            </tr>

        `).join("");
}


/* =====================================================
   AKUN
===================================================== */

function renderAkun() {

    const tbody =
        document.getElementById(
            "akunTable"
        );


    if (!tbody) return;


    tbody.innerHTML =
        akun.map(item => `

            <tr>

                <td>
                    ${escapeHTML(item.id)}
                </td>

                <td>
                    ${escapeHTML(item.nama)}
                </td>

                <td>
                    @${escapeHTML(item.username)}
                </td>

                <td>

                    <select
                        onchange="changeRole('${item.id}', this.value)"
                        ${
                            item.id === "USR001"
                                ? "disabled"
                                : ""
                        }
                    >

                        <option
                            value="Member"
                            ${
                                item.role === "Member"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Member
                        </option>

                        <option
                            value="Admin"
                            ${
                                item.role === "Admin"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Admin
                        </option>

                    </select>

                </td>

                <td>
                    ${formatDate(item.tanggalDaftar)}
                </td>

                <td>

                    <div class="action-buttons">

                        ${
                            item.id !== "USR001" &&
                            item.id !== currentUser.id
                                ? `
                                    <button
                                        class="action-btn action-delete"
                                        onclick="deleteAkun('${item.id}')"
                                    >
                                        🗑️
                                    </button>
                                  `
                                : `
                                    <span
                                        class="badge badge-info"
                                    >
                                        Aktif
                                    </span>
                                  `
                        }

                    </div>

                </td>

            </tr>

        `).join("");
}


/* =====================================================
   OPEN AKUN MODAL
===================================================== */

function openAkunModal() {

    document.getElementById(
        "akunNama"
    ).value = "";

    document.getElementById(
        "akunUsername"
    ).value = "";

    document.getElementById(
        "akunPassword"
    ).value = "";

    document.getElementById(
        "akunRole"
    ).value = "Member";


    openModal("akunModal");
}


/* =====================================================
   SAVE AKUN
===================================================== */

function saveAkun(event) {

    event.preventDefault();


    const nama =
        document.getElementById(
            "akunNama"
        ).value.trim();


    const username =
        document.getElementById(
            "akunUsername"
        ).value.trim();


    const password =
        document.getElementById(
            "akunPassword"
        ).value;


    const role =
        document.getElementById(
            "akunRole"
        ).value;


    if (password.length < 6) {

        showToast(
            "Password minimal 6 karakter.",
            "warning"
        );

        return;
    }


    const exists =
        akun.some(
            item =>
                item.username.toLowerCase() ===
                username.toLowerCase()
        );


    if (exists) {

        showToast(
            "Username sudah digunakan.",
            "error"
        );

        return;
    }


    akun.push({

        id:
            generateId(
                akun,
                "USR"
            ),

        nama,

        username,

        password,

        role,

        tanggalDaftar:
            new Date().toISOString()

    });


    saveData();

    renderAkun();

    renderMember();

    renderSaleOptions();

    renderDashboard();


    closeModal("akunModal");


    showToast(
        `Akun ${username} berhasil dibuat sebagai ${role}.`,
        "success"
    );
}


/* =====================================================
   CHANGE ROLE
===================================================== */

function changeRole(id, newRole) {

    if (!currentUser ||
        currentUser.role !== "Admin") {

        showToast(
            "Hanya Admin yang dapat mengubah role.",
            "error"
        );

        return;
    }


    if (id === "USR001") {

        showToast(
            "Admin utama tidak dapat diubah rolenya.",
            "warning"
        );

        renderAkun();

        return;
    }


    const account =
        akun.find(
            item => item.id === id
        );


    if (!account) return;


    if (
        account.id ===
        currentUser.id &&
        newRole !== "Admin"
    ) {

        showToast(
            "Anda tidak dapat menurunkan role akun sendiri.",
            "warning"
        );

        renderAkun();

        return;
    }


    account.role =
        newRole;


    if (
        account.id ===
        currentUser.id
    ) {

        currentUser.role =
            newRole;

        localStorage.setItem(
            "tokotokand_current_user",
            JSON.stringify(currentUser)
        );

        updateUserInterface();
    }


    saveData();

    renderAkun();

    renderMember();

    renderSaleOptions();

    renderDashboard();


    showToast(
        `Role ${account.nama} diubah menjadi ${newRole}.`,
        "success"
    );
}


/* =====================================================
   DELETE ACCOUNT
===================================================== */

function deleteAkun(id) {

    const account =
        akun.find(
            item => item.id === id
        );


    if (!account) return;


    if (id === "USR001") {

        showToast(
            "Admin utama tidak dapat dihapus.",
            "warning"
        );

        return;
    }


    if (
        currentUser &&
        id === currentUser.id
    ) {

        showToast(
            "Akun yang sedang digunakan tidak dapat dihapus.",
            "warning"
        );

        return;
    }


    const confirmed =
        confirm(
            `Hapus akun "${account.nama}"?`
        );


    if (!confirmed) return;


    akun =
        akun.filter(
            item => item.id !== id
        );


    saveData();

    renderAkun();

    renderMember();

    renderSaleOptions();

    renderDashboard();


    showToast(
        "Akun berhasil dihapus.",
        "success"
    );
}


/* =====================================================
   TRANSACTION DETAIL
===================================================== */

function openTransactionDetail(id) {

    const trx =
        transaksi.find(
            item => item.id === id
        );


    if (!trx) return;


    currentTransactionId =
        id;


    document.getElementById(
        "transactionSubtitle"
    ).textContent =
        `${trx.id} • ${formatDate(trx.tanggal)}`;


    const detail =
        document.getElementById(
            "transactionDetail"
        );


    detail.innerHTML = `

        <div class="transaction-info">

            <div class="transaction-info-item">

                <small>ID TRANSAKSI</small>

                <strong>
                    ${escapeHTML(trx.id)}
                </strong>

            </div>


            <div class="transaction-info-item">

                <small>MEMBER</small>

                <strong>
                    ${escapeHTML(trx.memberNama)}
                </strong>

            </div>


            <div class="transaction-info-item">

                <small>KASIR</small>

                <strong>
                    ${escapeHTML(trx.kasir)}
                </strong>

            </div>


            <div class="transaction-info-item">

                <small>STATUS PEMBAYARAN</small>

                <strong>
                    ${paymentBadge(trx.pembayaran)}
                </strong>

            </div>

        </div>


        <table class="detail-table">

            <thead>

                <tr>
                    <th>Barang</th>
                    <th>Qty</th>
                    <th>Harga</th>
                    <th>Subtotal</th>
                </tr>

            </thead>

            <tbody>

                ${trx.detail.map(item => `

                    <tr>

                        <td>
                            ${escapeHTML(item.nama)}
                        </td>

                        <td>
                            ${item.qty}
                        </td>

                        <td>
                            ${rupiah(item.harga)}
                        </td>

                        <td>
                            ${rupiah(item.subtotal)}
                        </td>

                    </tr>

                `).join("")}

            </tbody>

        </table>


        <div class="transaction-info">

            <div class="transaction-info-item">

                <small>UANG DIBAYAR</small>

                <strong>
                    ${rupiah(trx.uangDibayar)}
                </strong>

            </div>


            <div class="transaction-info-item">

                <small>KEMBALIAN</small>

                <strong>
                    ${rupiah(trx.kembalian)}
                </strong>

            </div>

        </div>


        <div class="transaction-total">

            <span>TOTAL</span>

            <strong>
                ${rupiah(trx.total)}
            </strong>

        </div>

    `;


    openModal("transactionModal");
}


/* =====================================================
   PRINT TRANSACTION
===================================================== */

function printTransaction() {

    if (!currentTransactionId)
        return;


    const trx =
        transaksi.find(
            item =>
                item.id ===
                currentTransactionId
        );


    if (!trx) return;


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=500,height=700"
        );


    const items =
        trx.detail.map(item => `

            <tr>

                <td>
                    ${escapeHTML(item.nama)}
                </td>

                <td>
                    ${item.qty}
                </td>

                <td>
                    ${rupiah(item.harga)}
                </td>

                <td>
                    ${rupiah(item.subtotal)}
                </td>

            </tr>

        `).join("");


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Struk ${trx.id}
            </title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 25px;
                    max-width: 450px;
                    margin: auto;
                }

                h2 {
                    text-align: center;
                    margin-bottom: 5px;
                }

                .center {
                    text-align: center;
                }

                hr {
                    border: none;
                    border-top: 1px dashed #999;
                    margin: 15px 0;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                }

                th,
                td {
                    padding: 7px 2px;
                    border-bottom: 1px solid #ddd;
                    text-align: left;
                }

                .total {
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                    margin-top: 15px;
                }

                .footer {
                    text-align: center;
                    margin-top: 25px;
                    font-size: 12px;
                }

            </style>

        </head>

        <body>

            <h2>TOKOTOKOAND</h2>

            <div class="center">
                Sistem Penjualan
            </div>

            <hr>

            <div>
                ID: ${escapeHTML(trx.id)}
            </div>

            <div>
                Tanggal: ${formatDate(trx.tanggal)}
            </div>

            <div>
                Member: ${escapeHTML(trx.memberNama)}
            </div>

            <div>
                Kasir: ${escapeHTML(trx.kasir)}
            </div>

            <hr>

            <table>

                <thead>

                    <tr>
                        <th>Barang</th>
                        <th>Qty</th>
                        <th>Harga</th>
                        <th>Subtotal</th>
                    </tr>

                </thead>

                <tbody>

                    ${items}

                </tbody>

            </table>


            <div class="total">
                <span>Total</span>
                <span>${rupiah(trx.total)}</span>
            </div>


            <div class="total">
                <span>Pembayaran</span>
                <span>${escapeHTML(trx.pembayaran)}</span>
            </div>


            <div class="total">
                <span>Dibayar</span>
                <span>${rupiah(trx.uangDibayar)}</span>
            </div>


            <div class="total">
                <span>Kembalian</span>
                <span>${rupiah(trx.kembalian)}</span>
            </div>


            <div class="footer">

                <hr>

                Terima kasih telah berbelanja
                di TOKOTOKOAND ❤️

            </div>


            <script>

                window.onload = function() {
                    window.print();
                };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();
}


/* =====================================================
   MODAL
===================================================== */

function openModal(id) {

    document
        .getElementById(id)
        .classList.add("show");
}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove("show");
}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(date) {

    if (!date)
        return "-";


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
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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


    setTimeout(() => {

        toast.remove();

    }, 3000);
}


/* =====================================================
   THEME
===================================================== */

function loadTheme() {

    const theme =
        localStorage.getItem(
            "tokotokand_theme"
        );


    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

        updateThemeButton();

    } else {

        document.body.classList.remove(
            "dark"
        );

        updateThemeButton();
    }
}


function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const isDark =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "tokotokand_theme",
        isDark
            ? "dark"
            : "light"
    );


    updateThemeButton();
}


function updateThemeButton() {

    const button =
        document.getElementById(
            "themeButton"
        );


    if (!button) return;


    const isDark =
        document.body.classList.contains(
            "dark"
        );


    button.textContent =
        isDark
            ? "☀️ Mode Terang"
            : "🌙 Mode Gelap";
}


/* =====================================================
   SIDEBAR MOBILE
===================================================== */

function toggleSidebar() {

    document
        .querySelector(".sidebar")
        .classList.toggle("open");
}


/* =====================================================
   CLICK OUTSIDE MODAL
===================================================== */

document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.remove(
                "show"
            );
        }

    }
);