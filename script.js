/* =====================================================
   TOKOTOKOAND
   Sistem Manajemen Toko
   ===================================================== */


/* ================= STORAGE ================= */

let akun = JSON.parse(localStorage.getItem("tokotokand_akun")) || [];
let barang = JSON.parse(localStorage.getItem("tokotokand_barang")) || [];
let transaksi = JSON.parse(localStorage.getItem("tokotokand_transaksi")) || [];

let currentUser =
    JSON.parse(localStorage.getItem("tokotokand_current_user")) || null;

let theme =
    localStorage.getItem("tokotokand_theme") || "light";

let cart = [];


/* ================= INITIALIZATION ================= */

document.addEventListener("DOMContentLoaded", () => {

    ensureDefaultAdmin();

    setupForms();
    setupNavigation();
    applyTheme();

    if (currentUser) {
        showApp();
    } else {
        showLogin();
    }

    updateAll();
});


/* ================= DEFAULT ADMIN ================= */

function ensureDefaultAdmin() {

    const adminExists = akun.some(
        user => user.username === "admin"
    );

    if (!adminExists) {

        akun.push({
            id: "USR001",
            nama: "Administrator",
            username: "admin",
            password: "admin303030",
            role: "Admin",
            tanggalDaftar: new Date().toISOString()
        });

        saveData();
    }
}


/* ================= STORAGE ================= */

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

    localStorage.setItem(
        "tokotokand_current_user",
        JSON.stringify(currentUser)
    );
}


/* ================= AUTH ================= */

function setupForms() {

    document.getElementById("loginForm")
        .addEventListener("submit", login);

    document.getElementById("registerForm")
        .addEventListener("submit", registerAccount);

    document.getElementById("barangForm")
        .addEventListener("submit", saveBarang);

    document.getElementById("stokForm")
        .addEventListener("submit", tambahStok);

    document.getElementById("akunForm")
        .addEventListener("submit", saveAkun);
}


function showLogin() {

    document.getElementById("loginPage")
        .classList.remove("hidden");

    document.getElementById("registerPage")
        .classList.add("hidden");

    document.getElementById("appPage")
        .classList.add("hidden");
}


function showRegister() {

    document.getElementById("loginPage")
        .classList.add("hidden");

    document.getElementById("registerPage")
        .classList.remove("hidden");

    document.getElementById("appPage")
        .classList.add("hidden");
}


function login(event) {

    event.preventDefault();

    const username =
        document.getElementById("loginUsername").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    const user = akun.find(
        item =>
            item.username.toLowerCase() === username.toLowerCase() &&
            item.password === password
    );

    if (!user) {
        showToast("Username atau password salah.");
        return;
    }

    currentUser = user;

    localStorage.setItem(
        "tokotokand_current_user",
        JSON.stringify(currentUser)
    );

    document.getElementById("loginForm").reset();

    showApp();

    showToast("Login berhasil. Selamat datang!");
}


function registerAccount(event) {

    event.preventDefault();

    const nama =
        document.getElementById("registerNama").value.trim();

    const username =
        document.getElementById("registerUsername").value.trim();

    const password =
        document.getElementById("registerPassword").value;

    const confirm =
        document.getElementById("registerConfirm").value;

    if (password !== confirm) {
        showToast("Konfirmasi password tidak sama.");
        return;
    }

    const usernameExists = akun.some(
        user =>
            user.username.toLowerCase() === username.toLowerCase()
    );

    if (usernameExists) {
        showToast("Username sudah digunakan.");
        return;
    }

    const newUser = {

        id: generateId("USR"),

        nama,

        username,

        password,

        role: "Member",

        tanggalDaftar: new Date().toISOString()
    };

    akun.push(newUser);

    saveData();

    document.getElementById("registerForm").reset();

    showLogin();

    showToast(
        "Akun berhasil dibuat. Silakan login."
    );
}


function logout() {

    currentUser = null;
    cart = [];

    localStorage.removeItem(
        "tokotokand_current_user"
    );

    showLogin();

    showToast("Anda telah logout.");
}


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


/* ================= APP ================= */

function showApp() {

    document.getElementById("loginPage")
        .classList.add("hidden");

    document.getElementById("registerPage")
        .classList.add("hidden");

    document.getElementById("appPage")
        .classList.remove("hidden");

    updateUserInterface();

    updateAll();

    showPage("dashboard");
}


function updateUserInterface() {

    if (!currentUser) return;

    document.getElementById("currentUserName").textContent =
        currentUser.nama;

    document.getElementById("currentUserRole").textContent =
        currentUser.role;

    document.getElementById("welcomeName").textContent =
        currentUser.nama;

    document.getElementById("userAvatar").textContent =
        currentUser.nama.charAt(0).toUpperCase();

    document.querySelectorAll(".admin-only")
        .forEach(element => {

            if (currentUser.role === "Admin") {
                element.style.display = "";
            } else {
                element.style.display = "none";
            }
        });
}


/* ================= NAVIGATION ================= */

function setupNavigation() {

    document.querySelectorAll(".nav-item[data-page]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const page =
                    button.dataset.page;

                if (
                    button.classList.contains("admin-only") &&
                    currentUser?.role !== "Admin"
                ) {
                    showToast("Menu ini hanya untuk Admin.");
                    return;
                }

                showPage(page);
            });
        });
}


function showPage(page) {

    if (!currentUser) return;

    if (
        ["barang", "stok", "pembayaran", "member", "akun"].includes(page) &&
        currentUser.role !== "Admin"
    ) {
        showToast("Anda tidak memiliki akses.");
        return;
    }

    document.querySelectorAll(".page")
        .forEach(section => {
            section.classList.remove("active-page");
        });

    const target =
        document.getElementById(`page-${page}`);

    if (!target) return;

    target.classList.add("active-page");

    document.querySelectorAll(".nav-item[data-page]")
        .forEach(button => {
            button.classList.remove("active");

            if (button.dataset.page === page) {
                button.classList.add("active");
            }
        });

    updatePageTitle(page);

    updateAll();
}


function updatePageTitle(page) {

    const titles = {

        dashboard: [
            "Dashboard",
            "Ringkasan aktivitas toko"
        ],

        barang: [
            "Data Barang",
            "Kelola barang dan stok toko"
        ],

        stok: [
            "Barang Masuk",
            "Kelola stok barang masuk"
        ],

        penjualan: [
            "Penjualan",
            "Buat transaksi penjualan"
        ],

        pembayaran: [
            "Pengecekan Pembayaran",
            "Konfirmasi pembayaran Member"
        ],

        riwayat: [
            "Riwayat",
            "Riwayat transaksi toko"
        ],

        member: [
            "Data Member",
            "Data pengguna yang terdaftar"
        ],

        akun: [
            "Kelola Akun",
            "Kelola akun dan role pengguna"
        ]
    };

    const data = titles[page];

    if (!data) return;

    document.getElementById("pageTitle").textContent =
        data[0];

    document.getElementById("pageSubtitle").textContent =
        data[1];
}


/* ================= UPDATE ALL ================= */

function updateAll() {

    if (!currentUser) return;

    renderDashboard();
    renderBarang();
    renderStok();
    renderSaleOptions();
    renderCart();
    renderPembayaran();
    renderRiwayat();
    renderMember();
    renderAkun();
}


/* ================= DASHBOARD ================= */

function renderDashboard() {

    const totalBarang = barang.length;

    const totalStok =
        barang.reduce(
            (total, item) =>
                total + Number(item.stok || 0),
            0
        );

    const today =
        new Date().toDateString();

    const penjualanHariIni =
        transaksi
            .filter(item =>
                new Date(item.tanggal).toDateString() === today
            )
            .reduce(
                (total, item) =>
                    total + Number(item.total || 0),
                0
            );

    document.getElementById("dashTotalBarang").textContent =
        totalBarang;

    document.getElementById("dashTotalStok").textContent =
        totalStok;

    document.getElementById("dashPenjualanHariIni").textContent =
        rupiah(penjualanHariIni);

    renderLowStock();
    renderRecentTransactions();
}


function renderLowStock() {

    const container =
        document.getElementById("lowStockContainer");

    const lowStock =
        barang.filter(item => Number(item.stok) <= 10);

    if (lowStock.length === 0) {

        container.innerHTML =
            `<div class="empty-state">Semua stok masih aman 👍</div>`;

        return;
    }

    container.innerHTML = `
        <div class="stock-list">
            ${lowStock.slice(0, 6).map(item => `
                <div class="stock-row">
                    <div>
                        <div class="stock-name">
                            ${escapeHTML(item.nama)}
                        </div>
                        <div class="stock-detail">
                            ${escapeHTML(item.kategori)}
                        </div>
                    </div>

                    ${getStatusBadge(item.stok)}
                </div>
            `).join("")}
        </div>
    `;
}


function renderRecentTransactions() {

    const container =
        document.getElementById(
            "recentTransactionContainer"
        );

    let data = [...transaksi];

    if (currentUser.role !== "Admin") {

        data = data.filter(
            item =>
                item.memberId === currentUser.id
        );
    }

    data.sort(
        (a, b) =>
            new Date(b.tanggal) -
            new Date(a.tanggal)
    );

    data = data.slice(0, 5);

    if (data.length === 0) {

        container.innerHTML =
            `<div class="empty-state">Belum ada transaksi.</div>`;

        return;
    }

    container.innerHTML = `
        <div class="transaction-list">

            ${data.map(item => `

                <div class="transaction-row">

                    <div>
                        <div class="transaction-name">
                            ${escapeHTML(item.memberNama)}
                        </div>

                        <div class="transaction-detail">
                            ${item.id} • ${formatDate(item.tanggal)}
                        </div>
                    </div>

                    <strong>
                        ${rupiah(item.total)}
                    </strong>

                </div>

            `).join("")}

        </div>
    `;
}


/* ================= BARANG ================= */

function renderBarang() {

    const table =
        document.getElementById("barangTable");

    if (!table) return;

    if (barang.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="10" class="empty-cell">
                    Belum ada data barang.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = barang.map(item => `

        <tr>

            <td>
                ${
                    item.gambar
                    ?
                    `<img src="${item.gambar}" class="item-image">`
                    :
                    `<div class="no-image">📦</div>`
                }
            </td>

            <td>${escapeHTML(item.id)}</td>

            <td>
                <strong>${escapeHTML(item.nama)}</strong>
            </td>

            <td>${escapeHTML(item.kategori)}</td>

            <td>${rupiah(item.hargaBeli)}</td>

            <td>${rupiah(item.hargaJual)}</td>

            <td>${item.stok}</td>

            <td>${escapeHTML(item.satuan)}</td>

            <td>${getStatusBadge(item.stok)}</td>

            <td>

                <div class="action-buttons">

                    <button
                        class="btn-small btn-edit"
                        onclick="editBarang('${item.id}')">
                        Edit
                    </button>

                    <button
                        class="btn-small btn-delete"
                        onclick="deleteBarang('${item.id}')">
                        Hapus
                    </button>

                </div>

            </td>

        </tr>

    `).join("");
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


/* ================= BARANG MODAL ================= */

function openBarangModal(id = null) {

    if (currentUser?.role !== "Admin") return;

    document.getElementById("barangForm").reset();

    document.getElementById("barangId").value = "";

    document.getElementById("imagePreview").innerHTML = "";

    document.getElementById("barangModalTitle").textContent =
        id ? "Edit Barang" : "Tambah Barang";

    if (id) {

        const item =
            barang.find(x => x.id === id);

        if (!item) return;

        document.getElementById("barangId").value =
            item.id;

        document.getElementById("barangNama").value =
            item.nama;

        document.getElementById("barangKategori").value =
            item.kategori;

        document.getElementById("barangHargaBeli").value =
            item.hargaBeli;

        document.getElementById("barangHargaJual").value =
            item.hargaJual;

        document.getElementById("barangStok").value =
            item.stok;

        document.getElementById("barangSatuan").value =
            item.satuan;

        if (item.gambar) {

            document.getElementById("imagePreview").innerHTML =
                `<img src="${item.gambar}">`;
        }
    }

    openModal("barangModal");
}


function previewImage(input) {

    const file = input.files[0];

    const preview =
        document.getElementById("imagePreview");

    preview.innerHTML = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        showToast("File harus berupa gambar.");
        input.value = "";
        return;
    }

    if (file.size > 1024 * 1024) {

        showToast("Ukuran gambar maksimal 1 MB.");
        input.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = event => {

        preview.innerHTML =
            `<img src="${event.target.result}">`;
    };

    reader.readAsDataURL(file);
}


function saveBarang(event) {

    event.preventDefault();

    if (currentUser?.role !== "Admin") return;

    const id =
        document.getElementById("barangId").value;

    const nama =
        document.getElementById("barangNama").value.trim();

    const kategori =
        document.getElementById("barangKategori").value.trim();

    const hargaBeli =
        Number(document.getElementById("barangHargaBeli").value);

    const hargaJual =
        Number(document.getElementById("barangHargaJual").value);

    const stok =
        Number(document.getElementById("barangStok").value);

    const satuan =
        document.getElementById("barangSatuan").value.trim();

    const file =
        document.getElementById("barangGambar").files[0];

    if (file) {

        if (!file.type.startsWith("image/")) {

            showToast("File gambar tidak valid.");
            return;
        }

        if (file.size > 1024 * 1024) {

            showToast("Ukuran gambar maksimal 1 MB.");
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {

            saveBarangData(
                id,
                nama,
                kategori,
                hargaBeli,
                hargaJual,
                stok,
                satuan,
                reader.result
            );
        };

        reader.readAsDataURL(file);

    } else {

        const old =
            barang.find(x => x.id === id);

        saveBarangData(
            id,
            nama,
            kategori,
            hargaBeli,
            hargaJual,
            stok,
            satuan,
            old ? old.gambar : ""
        );
    }
}


function saveBarangData(
    id,
    nama,
    kategori,
    hargaBeli,
    hargaJual,
    stok,
    satuan,
    gambar
) {

    if (id) {

        const index =
            barang.findIndex(item => item.id === id);

        if (index !== -1) {

            barang[index] = {
                ...barang[index],
                nama,
                kategori,
                hargaBeli,
                hargaJual,
                stok,
                satuan,
                gambar
            };
        }

        showToast("Barang berhasil diperbarui.");

    } else {

        barang.push({

            id: generateId("BRG"),

            nama,
            kategori,
            hargaBeli,
            hargaJual,
            stok,
            satuan,
            gambar
        });

        showToast("Barang berhasil ditambahkan.");
    }

    saveData();

    closeModal("barangModal");

    updateAll();
}


function editBarang(id) {

    openBarangModal(id);
}


function deleteBarang(id) {

    if (currentUser?.role !== "Admin") return;

    const item =
        barang.find(x => x.id === id);

    if (!item) return;

    const yakin =
        confirm(
            `Hapus barang "${item.nama}"?`
        );

    if (!yakin) return;

    barang =
        barang.filter(x => x.id !== id);

    saveData();

    updateAll();

    showToast("Barang berhasil dihapus.");
}


/* ================= STOK ================= */

function renderStok() {

    const table =
        document.getElementById("stokTable");

    if (!table) return;

    if (barang.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Belum ada data barang.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML =
        barang.map(item => `

            <tr>

                <td>${item.id}</td>

                <td>
                    <strong>
                        ${escapeHTML(item.nama)}
                    </strong>
                </td>

                <td>${item.stok}</td>

                <td>${escapeHTML(item.satuan)}</td>

                <td>${getStatusBadge(item.stok)}</td>

            </tr>

        `).join("");
}


function openStokModal() {

    if (currentUser?.role !== "Admin") return;

    renderStokOptions();

    document.getElementById("stokForm").reset();

    openModal("stokModal");
}


function renderStokOptions() {

    const select =
        document.getElementById("stokBarang");

    select.innerHTML =
        `<option value="">-- Pilih Barang --</option>`;

    barang.forEach(item => {

        select.innerHTML += `
            <option value="${item.id}">
                ${escapeHTML(item.nama)}
                (stok: ${item.stok})
            </option>
        `;
    });
}


function tambahStok(event) {

    event.preventDefault();

    if (currentUser?.role !== "Admin") return;

    const id =
        document.getElementById("stokBarang").value;

    const jumlah =
        Number(document.getElementById("stokJumlah").value);

    const item =
        barang.find(x => x.id === id);

    if (!item) {

        showToast("Pilih barang terlebih dahulu.");
        return;
    }

    if (jumlah <= 0) {

        showToast("Jumlah harus lebih dari 0.");
        return;
    }

    item.stok += jumlah;

    saveData();

    closeModal("stokModal");

    updateAll();

    showToast("Stok berhasil ditambahkan.");
}


/* ================= PENJUALAN ================= */

function renderSaleOptions() {

    const memberSelect =
        document.getElementById("saleMember");

    const barangSelect =
        document.getElementById("saleBarang");

    if (!memberSelect || !barangSelect) return;

    memberSelect.innerHTML =
        `<option value="">-- Pilih Pembeli --</option>`;

    barangSelect.innerHTML =
        `<option value="">-- Pilih Barang --</option>`;

    if (currentUser.role === "Member") {

        memberSelect.innerHTML = `
            <option value="${currentUser.id}">
                ${escapeHTML(currentUser.nama)}
            </option>
        `;

        memberSelect.value =
            currentUser.id;

    } else {

        akun.forEach(user => {

            memberSelect.innerHTML += `
                <option value="${user.id}">
                    ${escapeHTML(user.nama)}
                    (${escapeHTML(user.role)})
                </option>
            `;
        });
    }

    barang.forEach(item => {

        if (Number(item.stok) > 0) {

            barangSelect.innerHTML += `
                <option value="${item.id}">
                    ${escapeHTML(item.nama)}
                    - ${rupiah(item.hargaJual)}
                    (stok ${item.stok})
                </option>
            `;
        }
    });
}


function updateSalePrice() {

    const id =
        document.getElementById("saleBarang").value;

    const item =
        barang.find(x => x.id === id);

    document.getElementById("salePrice").textContent =
        item ? rupiah(item.hargaJual) : "Rp0";
}


function addToCart() {

    const barangId =
        document.getElementById("saleBarang").value;

    const qty =
        Number(document.getElementById("saleQty").value);

    if (!barangId) {

        showToast("Pilih barang terlebih dahulu.");
        return;
    }

    if (qty <= 0) {

        showToast("Jumlah harus lebih dari 0.");
        return;
    }

    const item =
        barang.find(x => x.id === barangId);

    if (!item) return;

    const existing =
        cart.find(x => x.barangId === barangId);

    const totalQty =
        existing
        ? existing.qty + qty
        : qty;

    if (totalQty > Number(item.stok)) {

        showToast(
            `Stok ${item.nama} hanya ${item.stok}.`
        );

        return;
    }

    if (existing) {

        existing.qty += qty;

    } else {

        cart.push({

            barangId: item.id,

            nama: item.nama,

            harga: Number(item.hargaJual),

            qty
        });
    }

    renderCart();

    document.getElementById("saleQty").value = 1;

    showToast("Barang ditambahkan ke keranjang.");
}


function renderCart() {

    const container =
        document.getElementById("cartContainer");

    const count =
        document.getElementById("cartCount");

    const totalElement =
        document.getElementById("cartTotal");

    if (!container) return;

    const totalItems =
        cart.reduce(
            (sum, item) =>
                sum + item.qty,
            0
        );

    const total =
        cart.reduce(
            (sum, item) =>
                sum + item.qty * item.harga,
            0
        );

    count.textContent =
        `${totalItems} item`;

    totalElement.textContent =
        rupiah(total);

    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                Keranjang masih kosong.
            </div>
        `;

        return;
    }

    container.innerHTML =
        cart.map((item, index) => `

            <div class="cart-item">

                <div class="cart-item-info">

                    <strong>
                        ${escapeHTML(item.nama)}
                    </strong>

                    <span>
                        ${item.qty} × ${rupiah(item.harga)}
                    </span>

                </div>

                <div class="cart-item-right">

                    <strong>
                        ${rupiah(item.qty * item.harga)}
                    </strong>

                    <button
                        class="remove-cart"
                        onclick="removeFromCart(${index})">
                        ×
                    </button>

                </div>

            </div>

        `).join("");
}


function removeFromCart(index) {

    cart.splice(index, 1);

    renderCart();
}


function checkout() {

    if (cart.length === 0) {

        showToast("Keranjang masih kosong.");
        return;
    }

    const memberId =
        document.getElementById("saleMember").value;

    if (!memberId) {

        showToast("Pilih Member terlebih dahulu.");
        return;
    }

    const member =
        akun.find(x => x.id === memberId);

    if (!member) {

        showToast("Data Member tidak ditemukan.");
        return;
    }

    for (const cartItem of cart) {

        const item =
            barang.find(x => x.id === cartItem.barangId);

        if (!item || item.stok < cartItem.qty) {

            showToast(
                `Stok ${cartItem.nama} tidak mencukupi.`
            );

            return;
        }
    }

    const total =
        cart.reduce(
            (sum, item) =>
                sum + item.qty * item.harga,
            0
        );

    const trx = {

        id: generateId("TRX"),

        tanggal: new Date().toISOString(),

        memberId: member.id,

        memberNama: member.nama,

        jumlahItem:
            cart.reduce(
                (sum, item) =>
                    sum + item.qty,
                0
            ),

        total,

        kasir: currentUser.nama,

        paymentStatus: "Menunggu Pembayaran",

        paymentConfirmedBy: null,

        paymentConfirmedAt: null,

        detail: cart.map(item => ({

            barangId: item.barangId,

            nama: item.nama,

            harga: item.harga,

            qty: item.qty,

            subtotal: item.harga * item.qty
        }))
    };


    /* KURANGI STOK */

    cart.forEach(cartItem => {

        const item =
            barang.find(
                x => x.id === cartItem.barangId
            );

        if (item) {

            item.stok -= cartItem.qty;
        }
    });


    transaksi.push(trx);

    cart = [];

    saveData();

    updateAll();

    document.getElementById("saleMember").value =
        currentUser.role === "Member"
        ? currentUser.id
        : "";

    document.getElementById("saleBarang").value = "";

    document.getElementById("salePrice").textContent =
        "Rp0";

    document.getElementById("saleQty").value = 1;

    showToast(
        `Checkout berhasil. ${trx.id} menunggu konfirmasi pembayaran Admin.`
    );
}


/* ================= PEMBAYARAN ================= */

function renderPembayaran() {

    const table =
        document.getElementById("paymentTable");

    if (!table) return;

    let data =
        [...transaksi];

    data.sort(
        (a, b) =>
            new Date(b.tanggal) -
            new Date(a.tanggal)
    );

    if (data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    Belum ada transaksi.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML =
        data.map(trx => {

            let action = "";

            if (
                trx.paymentStatus ===
                "Menunggu Pembayaran"
            ) {

                action = `
                    <button
                        class="btn-small btn-pay"
                        onclick="confirmPayment('${trx.id}')">
                        ✅ Sudah Bayar
                    </button>
                `;

            } else {

                action = `
                    <span class="badge badge-success">
                        Pembayaran Selesai
                    </span>
                `;
            }

            return `

                <tr>

                    <td>
                        <strong>${trx.id}</strong>
                    </td>

                    <td>
                        ${escapeHTML(trx.memberNama)}
                    </td>

                    <td>
                        ${formatDate(trx.tanggal)}
                    </td>

                    <td>
                        ${trx.jumlahItem}
                    </td>

                    <td>
                        <strong>
                            ${rupiah(trx.total)}
                        </strong>
                    </td>

                    <td>
                        ${getPaymentBadge(trx.paymentStatus)}
                    </td>

                    <td>
                        ${action}
                    </td>

                </tr>

            `;
        }).join("");
}


function confirmPayment(transactionId) {

    if (currentUser?.role !== "Admin") {

        showToast(
            "Hanya Admin yang dapat mengonfirmasi pembayaran."
        );

        return;
    }

    const trx =
        transaksi.find(
            item => item.id === transactionId
        );

    if (!trx) return;

    if (trx.paymentStatus === "Lunas") {

        showToast("Pembayaran sudah dikonfirmasi.");
        return;
    }

    const yakin =
        confirm(
            `Konfirmasi bahwa transaksi ${trx.id} sudah dibayar?`
        );

    if (!yakin) return;

    trx.paymentStatus = "Lunas";

    trx.paymentConfirmedBy =
        currentUser.nama;

    trx.paymentConfirmedAt =
        new Date().toISOString();

    saveData();

    updateAll();

    showToast(
        `Pembayaran ${trx.id} berhasil dikonfirmasi.`
    );
}


function getPaymentBadge(status) {

    if (status === "Lunas") {

        return `
            <span class="badge badge-success">
                Lunas
            </span>
        `;
    }

    return `
        <span class="badge badge-warning">
            Menunggu Pembayaran
        </span>
    `;
}


/* ================= RIWAYAT ================= */

function renderRiwayat() {

    const table =
        document.getElementById("riwayatTable");

    if (!table) return;

    let data =
        [...transaksi];

    if (currentUser.role !== "Admin") {

        data =
            data.filter(
                item =>
                    item.memberId === currentUser.id
            );
    }

    data.sort(
        (a, b) =>
            new Date(b.tanggal) -
            new Date(a.tanggal)
    );

    if (data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    Belum ada transaksi.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML =
        data.map(trx => `

            <tr>

                <td>
                    <strong>${trx.id}</strong>
                </td>

                <td>
                    ${escapeHTML(trx.memberNama)}
                </td>

                <td>
                    ${formatDate(trx.tanggal)}
                </td>

                <td>
                    ${trx.jumlahItem}
                </td>

                <td>
                    <strong>
                        ${rupiah(trx.total)}
                    </strong>
                </td>

                <td>
                    ${getPaymentBadge(trx.paymentStatus)}
                </td>

            </tr>

        `).join("");
}


/* ================= DATA MEMBER ================= */

function renderMember() {

    const table =
        document.getElementById("memberTable");

    const head =
        document.getElementById("memberTableHead");

    const total =
        document.getElementById("totalMember");

    if (!table || !head || !total) return;


    const memberCount =
        akun.filter(
            user => user.role === "Member"
        ).length;

    total.textContent =
        memberCount;


    let data =
        [...akun];

    const search =
        document.getElementById("memberSearch")
        ?.value
        .trim()
        .toLowerCase() || "";


    if (search) {

        data =
            data.filter(user =>

                user.id.toLowerCase().includes(search) ||

                user.nama.toLowerCase().includes(search) ||

                user.username.toLowerCase().includes(search) ||

                user.role.toLowerCase().includes(search)
            );
    }


    /*
       Password hanya ditampilkan kepada Admin.
    */

    if (currentUser.role === "Admin") {

        head.innerHTML = `
            <tr>
                <th>ID Member</th>
                <th>Nama</th>
                <th>Username</th>
                <th>Role</th>
                <th>Password</th>
                <th>Tanggal Daftar</th>
            </tr>
        `;

        table.innerHTML =
            data.map(user => `

                <tr>

                    <td>${user.id}</td>

                    <td>
                        <strong>
                            ${escapeHTML(user.nama)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(user.username)}
                    </td>

                    <td>
                        ${getRoleBadge(user.role)}
                    </td>

                    <td>
                        ${escapeHTML(user.password)}
                    </td>

                    <td>
                        ${formatDate(user.tanggalDaftar)}
                    </td>

                </tr>

            `).join("");

    } else {

        head.innerHTML = `
            <tr>
                <th>ID Member</th>
                <th>Nama</th>
                <th>Username</th>
                <th>Role</th>
                <th>Tanggal Daftar</th>
            </tr>
        `;

        table.innerHTML =
            data.map(user => `

                <tr>

                    <td>${user.id}</td>

                    <td>
                        <strong>
                            ${escapeHTML(user.nama)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(user.username)}
                    </td>

                    <td>
                        ${getRoleBadge(user.role)}
                    </td>

                    <td>
                        ${formatDate(user.tanggalDaftar)}
                    </td>

                </tr>

            `).join("");
    }


    if (data.length === 0) {

        const colspan =
            currentUser.role === "Admin" ? 6 : 5;

        table.innerHTML = `
            <tr>
                <td colspan="${colspan}">
                    Data tidak ditemukan.
                </td>
            </tr>
        `;
    }
}


function getRoleBadge(role) {

    if (role === "Admin") {

        return `
            <span class="badge badge-blue">
                Admin
            </span>
        `;
    }

    return `
        <span class="badge badge-success">
            Member
        </span>
    `;
}


/* ================= KELOLA AKUN ================= */

function renderAkun() {

    const table =
        document.getElementById("akunTable");

    if (!table) return;

    table.innerHTML =
        akun.map(user => `

            <tr>

                <td>${user.id}</td>

                <td>
                    <strong>
                        ${escapeHTML(user.nama)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(user.username)}
                </td>

                <td>
                    ${getRoleBadge(user.role)}
                </td>

                <td>
                    ${formatDate(user.tanggalDaftar)}
                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            class="btn-small btn-edit"
                            onclick="changeRole('${user.id}')">
                            Ubah Role
                        </button>

                        ${
                            user.username !== "admin"
                            ?
                            `
                            <button
                                class="btn-small btn-delete"
                                onclick="deleteAkun('${user.id}')">
                                Hapus
                            </button>
                            `
                            :
                            ""
                        }

                    </div>

                </td>

            </tr>

        `).join("");
}


function openAkunModal() {

    if (currentUser?.role !== "Admin") return;

    document.getElementById("akunForm").reset();

    openModal("akunModal");
}


function saveAkun(event) {

    event.preventDefault();

    if (currentUser?.role !== "Admin") return;

    const nama =
        document.getElementById("akunNama").value.trim();

    const username =
        document.getElementById("akunUsername").value.trim();

    const password =
        document.getElementById("akunPassword").value;

    if (
        akun.some(
            user =>
                user.username.toLowerCase() ===
                username.toLowerCase()
        )
    ) {

        showToast("Username sudah digunakan.");
        return;
    }

    akun.push({

        id: generateId("USR"),

        nama,

        username,

        password,

        role: "Member",

        tanggalDaftar:
            new Date().toISOString()
    });

    saveData();

    closeModal("akunModal");

    updateAll();

    showToast("Akun Member berhasil dibuat.");
}


function changeRole(id) {

    if (currentUser?.role !== "Admin") return;

    const user =
        akun.find(item => item.id === id);

    if (!user) return;

    if (user.id === currentUser.id) {

        showToast(
            "Anda tidak dapat mengubah role akun sendiri."
        );

        return;
    }

    const newRole =
        user.role === "Admin"
        ? "Member"
        : "Admin";

    const yakin =
        confirm(
            `Ubah role ${user.nama} menjadi ${newRole}?`
        );

    if (!yakin) return;

    /*
       Jangan sampai semua Admin dihapus.
    */

    if (
        user.role === "Admin" &&
        akun.filter(x => x.role === "Admin").length <= 1
    ) {

        showToast(
            "Minimal harus ada satu Admin."
        );

        return;
    }

    user.role = newRole;

    saveData();

    updateAll();

    showToast(
        `Role ${user.nama} menjadi ${newRole}.`
    );
}


function deleteAkun(id) {

    if (currentUser?.role !== "Admin") return;

    const user =
        akun.find(item => item.id === id);

    if (!user) return;

    if (user.username === "admin") {

        showToast(
            "Akun Admin utama tidak dapat dihapus."
        );

        return;
    }

    if (user.id === currentUser.id) {

        showToast(
            "Anda tidak dapat menghapus akun sendiri."
        );

        return;
    }

    const yakin =
        confirm(
            `Hapus akun ${user.nama}?`
        );

    if (!yakin) return;

    akun =
        akun.filter(item => item.id !== id);

    saveData();

    updateAll();

    showToast("Akun berhasil dihapus.");
}


/* ================= MODAL ================= */

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


window.addEventListener("click", event => {

    if (event.target.classList.contains("modal")) {

        event.target.classList.remove("show");
    }
});


/* ================= THEME ================= */

function applyTheme() {

    document.body.classList.toggle(
        "dark",
        theme === "dark"
    );

    document.getElementById("themeToggle").textContent =
        theme === "dark" ? "☀️" : "🌙";

    localStorage.setItem(
        "tokotokand_theme",
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


/* ================= UTILITIES ================= */

function generateId(prefix) {

    return (
        prefix +
        Date.now().toString().slice(-6) +
        Math.floor(Math.random() * 100)
    );
}


function rupiah(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(Number(value) || 0);
}


function formatDate(date) {

    if (!date) return "-";

    return new Intl.DateTimeFormat(
        "id-ID",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(new Date(date));
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}