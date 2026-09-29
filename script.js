/* =====================================================
   ANSTORE
   Sistem Manajemen Toko
   ===================================================== */


/* =====================================================
   DATA LOCAL STORAGE
   ===================================================== */

// AKUN
let akun = JSON.parse(
    localStorage.getItem("anstore_akun")
) || [];

// BARANG
let barang = JSON.parse(
    localStorage.getItem("anstore_barang")
) || [];

// MEMBER TOKO
let member = JSON.parse(
    localStorage.getItem("anstore_member")
) || [];

// TRANSAKSI
let transaksi = JSON.parse(
    localStorage.getItem("anstore_transaksi")
) || [];

// KERANJANG
let cart = [];

// USER YANG SEDANG LOGIN
let currentUser = JSON.parse(
    localStorage.getItem("anstore_current_user")
) || null;


/* =====================================================
   AKUN ADMIN DEFAULT
   ===================================================== */

if (akun.length === 0) {

    akun.push({
        id: "USR001",
        nama: "Administrator",
        username: "admin",
        password: "admin123",
        role: "Admin"
    });

    saveData();
}


/* =====================================================
   DOM READY
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    setupNavigation();

    if (currentUser) {
        showApp();
    }

    updateAll();

});


/* =====================================================
   LOCAL STORAGE
   ===================================================== */

function saveData() {

    localStorage.setItem(
        "anstore_akun",
        JSON.stringify(akun)
    );

    localStorage.setItem(
        "anstore_barang",
        JSON.stringify(barang)
    );

    localStorage.setItem(
        "anstore_member",
        JSON.stringify(member)
    );

    localStorage.setItem(
        "anstore_transaksi",
        JSON.stringify(transaksi)
    );
}


/* =====================================================
   LOGIN
   ===================================================== */

function login() {

    const username =
        document.getElementById("loginUsername").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    if (!username || !password) {

        showToast("Username dan password wajib diisi.");

        return;
    }


    const user = akun.find(function (item) {

        return (
            item.username.toLowerCase() === username.toLowerCase() &&
            item.password === password
        );

    });


    if (!user) {

        showToast("Username atau password salah.");

        return;
    }


    currentUser = user;

    localStorage.setItem(
        "anstore_current_user",
        JSON.stringify(currentUser)
    );


    document.getElementById("loginUsername").value = "";
    document.getElementById("loginPassword").value = "";


    showApp();

    showToast(
        "Selamat datang, " + currentUser.nama + "!"
    );

}


/* =====================================================
   REGISTER
   ===================================================== */

function registerAccount() {

    const nama =
        document.getElementById("registerName").value.trim();

    const username =
        document.getElementById("registerUsername").value.trim();

    const password =
        document.getElementById("registerPassword").value;

    const confirm =
        document.getElementById("registerConfirm").value;

    const role =
        document.getElementById("registerRole").value;


    if (!nama || !username || !password || !confirm) {

        showToast("Semua data wajib diisi.");

        return;
    }


    if (password !== confirm) {

        showToast("Konfirmasi password tidak sama.");

        return;
    }


    if (password.length < 6) {

        showToast(
            "Password minimal 6 karakter."
        );

        return;
    }


    const usernameExists = akun.some(function (item) {

        return item.username.toLowerCase() ===
            username.toLowerCase();

    });


    if (usernameExists) {

        showToast("Username sudah digunakan.");

        return;
    }


    const newAccount = {

        id: generateId("USR", akun),

        nama: nama,

        username: username,

        password: password,

        role: role

    };


    akun.push(newAccount);

    saveData();


    document.getElementById("registerName").value = "";
    document.getElementById("registerUsername").value = "";
    document.getElementById("registerPassword").value = "";
    document.getElementById("registerConfirm").value = "";
    document.getElementById("registerRole").value = "Member";


    showLogin();

    showToast(
        "Akun berhasil dibuat. Silakan login."
    );

}


/* =====================================================
   LOGIN / REGISTER PAGE
   ===================================================== */

function showRegister() {

    document
        .getElementById("loginForm")
        .classList.add("hidden");

    document
        .getElementById("registerForm")
        .classList.remove("hidden");

}


function showLogin() {

    document
        .getElementById("registerForm")
        .classList.add("hidden");

    document
        .getElementById("loginForm")
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
        .getElementById("app")
        .classList.remove("hidden");


    updateUserInterface();

    updateAll();

}


/* =====================================================
   USER INTERFACE
   ===================================================== */

function updateUserInterface() {

    if (!currentUser) return;


    const firstLetter =
        currentUser.nama
            .charAt(0)
            .toUpperCase();


    document.getElementById("sidebarAvatar")
        .textContent = firstLetter;

    document.getElementById("topAvatar")
        .textContent = firstLetter;


    document.getElementById("sidebarName")
        .textContent = currentUser.nama;

    document.getElementById("sidebarRole")
        .textContent = currentUser.role;


    document.getElementById("topName")
        .textContent = currentUser.nama;

    document.getElementById("topRole")
        .textContent = currentUser.role;


    // MENU ADMIN
    const adminMenus =
        document.querySelectorAll(".admin-only");


    adminMenus.forEach(function (menu) {

        if (currentUser.role === "Admin") {

            menu.style.display = "flex";

        } else {

            menu.style.display = "none";

        }

    });

}


/* =====================================================
   LOGOUT
   ===================================================== */

function logout() {

    const confirmLogout =
        confirm("Apakah Anda yakin ingin logout?");

    if (!confirmLogout) return;


    currentUser = null;

    localStorage.removeItem(
        "anstore_current_user"
    );


    document
        .getElementById("app")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");


    showLogin();

    showToast("Anda telah logout.");

}


/* =====================================================
   NAVIGATION
   ===================================================== */

function setupNavigation() {

    const menuItems =
        document.querySelectorAll(".menu-item");


    menuItems.forEach(function (item) {

        item.addEventListener("click", function () {

            const page =
                this.dataset.page;

            // MEMBER tidak boleh membuka menu admin
            if (
                page === "akun" &&
                currentUser &&
                currentUser.role !== "Admin"
            ) {

                showToast(
                    "Menu ini hanya dapat diakses Admin."
                );

                return;
            }


            menuItems.forEach(function (menu) {

                menu.classList.remove("active");

            });


            this.classList.add("active");


            document
                .querySelectorAll(".page")
                .forEach(function (section) {

                    section.classList.remove(
                        "active-page"
                    );

                });


            const target =
                document.getElementById(
                    page + "Page"
                );


            if (target) {

                target.classList.add(
                    "active-page"
                );

            }


            updatePageTitle(page);

        });

    });

}


/* =====================================================
   PAGE TITLE
   ===================================================== */

function updatePageTitle(page) {

    const titles = {

        dashboard: [
            "Dashboard",
            "Ringkasan toko hari ini"
        ],

        barang: [
            "Data Barang",
            "Kelola data barang toko"
        ],

        stok: [
            "Barang Masuk",
            "Kelola stok barang masuk"
        ],

        penjualan: [
            "Penjualan",
            "Kelola transaksi penjualan"
        ],

        riwayat: [
            "Riwayat",
            "Riwayat transaksi toko"
        ],

        member: [
            "Data Member",
            "Kelola data member toko"
        ],

        akun: [
            "Kelola Akun",
            "Kelola akun pengguna ANSTORE"
        ]

    };


    if (!titles[page]) return;


    document.getElementById("pageTitle")
        .textContent = titles[page][0];


    document.getElementById("pageSubtitle")
        .textContent = titles[page][1];

}


/* =====================================================
   UPDATE SEMUA DATA
   ===================================================== */

function updateAll() {

    renderDashboard();

    renderBarang();

    renderStok();

    renderMember();

    renderAkun();

    renderSaleOptions();

    renderCart();

    renderRiwayat();

}


/* =====================================================
   FORMAT RUPIAH
   ===================================================== */

function rupiah(number) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(number || 0);

}


/* =====================================================
   GENERATE ID
   ===================================================== */

function generateId(prefix, array) {

    let maxNumber = 0;


    array.forEach(function (item) {

        const id =
            item.id ||
            item.idBarang ||
            item.idMember;


        if (!id) return;


        const number =
            parseInt(
                String(id).replace(/\D/g, "")
            ) || 0;


        if (number > maxNumber) {

            maxNumber = number;

        }

    });


    return prefix +
        String(maxNumber + 1)
            .padStart(3, "0");

}


/* =====================================================
   DASHBOARD
   ===================================================== */

function renderDashboard() {

    const totalBarang =
        barang.length;


    const totalStok =
        barang.reduce(function (total, item) {

            return total + Number(item.stok);

        }, 0);


    document.getElementById("statBarang")
        .textContent = totalBarang;


    document.getElementById("statStok")
        .textContent = totalStok;


    document.getElementById("statMember")
        .textContent = member.length;


    const today =
        new Date().toLocaleDateString("id-ID");


    const todaySales =
        transaksi
            .filter(function (item) {

                return item.tanggal.startsWith(
                    new Date().toISOString().slice(0, 10)
                );

            })
            .reduce(function (total, item) {

                return total + Number(item.total);

            }, 0);


    document.getElementById("statPenjualan")
        .textContent = rupiah(todaySales);


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
            .filter(function (item) {

                return Number(item.stok) <= 10;

            })
            .slice(0, 10);


    if (lowStock.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        <div class="empty-icon">📦</div>
                        Belum ada barang dengan stok menipis.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        lowStock.map(function (item) {

            return `
                <tr>

                    <td>${item.id}</td>

                    <td>${escapeHTML(item.nama)}</td>

                    <td>
                        <strong>${item.stok}</strong>
                    </td>

                    <td>
                        ${getStatusBadge(item.stok)}
                    </td>

                </tr>
            `;

        }).join("");

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
            .reverse()
            .slice(0, 5);


    if (recent.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    <div class="empty-state">
                        <div class="empty-icon">🧾</div>
                        Belum ada transaksi.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        recent.map(function (item) {

            return `
                <tr>

                    <td>${item.id}</td>

                    <td>
                        ${escapeHTML(item.memberNama)}
                    </td>

                    <td>
                        <strong>
                            ${rupiah(item.total)}
                        </strong>
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
        barang.filter(function (item) {

            return (
                item.nama.toLowerCase().includes(search) ||
                item.kategori.toLowerCase().includes(search) ||
                item.id.toLowerCase().includes(search)
            );

        });


    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="empty-state">
                        <div class="empty-icon">📦</div>
                        Belum ada data barang.
                        <br>
                        Klik <b>+ Tambah Barang</b> untuk menambahkan.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        filtered.map(function (item) {

            return `
                <tr>

                    <td>${item.id}</td>

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
                        <strong>${item.stok}</strong>
                    </td>

                    <td>
                        ${item.satuan}
                    </td>

                    <td>
                        ${getStatusBadge(item.stok)}
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                class="action-button action-edit"
                                onclick="editBarang('${item.id}')"
                                title="Edit"
                            >
                                ✏️
                            </button>

                            <button
                                class="action-button action-delete"
                                onclick="deleteBarang('${item.id}')"
                                title="Hapus"
                            >
                                🗑️
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");

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
   MODAL BARANG
   ===================================================== */

function openBarangModal() {

    document.getElementById(
        "barangModalTitle"
    ).textContent = "Tambah Barang";


    document.getElementById(
        "barangEditId"
    ).value = "";


    document.getElementById(
        "barangNama"
    ).value = "";

    document.getElementById(
        "barangKategori"
    ).value = "";

    document.getElementById(
        "barangBeli"
    ).value = "";

    document.getElementById(
        "barangJual"
    ).value = "";

    document.getElementById(
        "barangStok"
    ).value = "0";

    document.getElementById(
        "barangSatuan"
    ).value = "pcs";


    openModal("barangModal");

}


/* =====================================================
   SAVE BARANG
   ===================================================== */

function saveBarang() {

    const editId =
        document.getElementById(
            "barangEditId"
        ).value;


    const nama =
        document.getElementById(
            "barangNama"
        ).value.trim();


    const kategori =
        document.getElementById(
            "barangKategori"
        ).value.trim();


    const hargaBeli =
        Number(
            document.getElementById(
                "barangBeli"
            ).value
        );


    const hargaJual =
        Number(
            document.getElementById(
                "barangJual"
            ).value
        );


    const stok =
        Number(
            document.getElementById(
                "barangStok"
            ).value
        );


    const satuan =
        document.getElementById(
            "barangSatuan"
        ).value;


    if (!nama || !kategori) {

        showToast(
            "Nama dan kategori wajib diisi."
        );

        return;
    }


    if (hargaBeli < 0 || hargaJual < 0 || stok < 0) {

        showToast(
            "Nilai harga dan stok tidak valid."
        );

        return;
    }


    if (editId) {

        const item =
            barang.find(function (item) {

                return item.id === editId;

            });


        if (item) {

            item.nama = nama;
            item.kategori = kategori;
            item.hargaBeli = hargaBeli;
            item.hargaJual = hargaJual;
            item.stok = stok;
            item.satuan = satuan;

        }


        showToast(
            "Barang berhasil diperbarui."
        );

    } else {

        barang.push({

            id: generateId("BRG", barang),

            nama: nama,

            kategori: kategori,

            hargaBeli: hargaBeli,

            hargaJual: hargaJual,

            stok: stok,

            satuan: satuan

        });


        showToast(
            "Barang berhasil ditambahkan."
        );

    }


    saveData();

    closeModal("barangModal");

    updateAll();

}


/* =====================================================
   EDIT BARANG
   ===================================================== */

function editBarang(id) {

    const item =
        barang.find(function (item) {

            return item.id === id;

        });


    if (!item) return;


    document.getElementById(
        "barangModalTitle"
    ).textContent = "Edit Barang";


    document.getElementById(
        "barangEditId"
    ).value = item.id;


    document.getElementById(
        "barangNama"
    ).value = item.nama;


    document.getElementById(
        "barangKategori"
    ).value = item.kategori;


    document.getElementById(
        "barangBeli"
    ).value = item.hargaBeli;


    document.getElementById(
        "barangJual"
    ).value = item.hargaJual;


    document.getElementById(
        "barangStok"
    ).value = item.stok;


    document.getElementById(
        "barangSatuan"
    ).value = item.satuan;


    openModal("barangModal");

}


/* =====================================================
   DELETE BARANG
   ===================================================== */

function deleteBarang(id) {

    const item =
        barang.find(function (item) {

            return item.id === id;

        });


    if (!item) return;


    const confirmed =
        confirm(
            `Hapus barang "${item.nama}"?`
        );


    if (!confirmed) return;


    barang =
        barang.filter(function (item) {

            return item.id !== id;

        });


    saveData();

    updateAll();

    showToast(
        "Barang berhasil dihapus."
    );

}


/* =====================================================
   STOK
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
                        <div class="empty-icon">📥</div>
                        Belum ada barang.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        barang.map(function (item) {

            return `
                <tr>

                    <td>${item.id}</td>

                    <td>
                        <strong>
                            ${escapeHTML(item.nama)}
                        </strong>
                    </td>

                    <td>
                        ${item.stok}
                    </td>

                    <td>
                        ${item.satuan}
                    </td>

                    <td>
                        ${getStatusBadge(item.stok)}
                    </td>

                </tr>
            `;

        }).join("");

}


/* =====================================================
   STOK MODAL
   ===================================================== */

function openStokModal() {

    const select =
        document.getElementById(
            "stokBarang"
        );


    select.innerHTML = `
        <option value="">
            Pilih barang
        </option>
    `;


    barang.forEach(function (item) {

        select.innerHTML += `
            <option value="${item.id}">
                ${escapeHTML(item.nama)}
                - stok ${item.stok}
            </option>
        `;

    });


    document.getElementById(
        "stokJumlah"
    ).value = "";


    openModal("stokModal");

}


/* =====================================================
   TAMBAH STOK
   ===================================================== */

function tambahStok() {

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


    if (!id) {

        showToast(
            "Pilih barang terlebih dahulu."
        );

        return;
    }


    if (!jumlah || jumlah <= 0) {

        showToast(
            "Jumlah stok harus lebih dari 0."
        );

        return;
    }


    const item =
        barang.find(function (item) {

            return item.id === id;

        });


    if (!item) return;


    item.stok += jumlah;


    saveData();

    closeModal("stokModal");

    updateAll();


    showToast(
        `Stok ${item.nama} bertambah ${jumlah}.`
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


    const search =
        (
            document.getElementById(
                "searchMember"
            )?.value || ""
        )
        .toLowerCase();


    const filtered =
        member.filter(function (item) {

            return (
                item.nama.toLowerCase().includes(search) ||
                item.id.toLowerCase().includes(search) ||
                item.telepon.toLowerCase().includes(search)
            );

        });


    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-icon">👥</div>
                        Belum ada data member.
                        <br>
                        Klik <b>+ Tambah Member</b> untuk menambahkan.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        filtered.map(function (item) {

            return `
                <tr>

                    <td>${item.id}</td>

                    <td>
                        <strong>
                            ${escapeHTML(item.nama)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(item.telepon)}
                    </td>

                    <td>
                        ${escapeHTML(item.email)}
                    </td>

                    <td>
                        ${escapeHTML(item.alamat)}
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                class="action-button action-edit"
                                onclick="editMember('${item.id}')"
                            >
                                ✏️
                            </button>

                            <button
                                class="action-button action-delete"
                                onclick="deleteMember('${item.id}')"
                            >
                                🗑️
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");

}


/* =====================================================
   MEMBER MODAL
   ===================================================== */

function openMemberModal() {

    document.getElementById(
        "memberModalTitle"
    ).textContent = "Tambah Member";


    document.getElementById(
        "memberEditId"
    ).value = "";


    document.getElementById(
        "memberNama"
    ).value = "";

    document.getElementById(
        "memberTelepon"
    ).value = "";

    document.getElementById(
        "memberEmail"
    ).value = "";

    document.getElementById(
        "memberAlamat"
    ).value = "";


    openModal("memberModal");

}


/* =====================================================
   SAVE MEMBER
   ===================================================== */

function saveMember() {

    const editId =
        document.getElementById(
            "memberEditId"
        ).value;


    const nama =
        document.getElementById(
            "memberNama"
        ).value.trim();


    const telepon =
        document.getElementById(
            "memberTelepon"
        ).value.trim();


    const email =
        document.getElementById(
            "memberEmail"
        ).value.trim();


    const alamat =
        document.getElementById(
            "memberAlamat"
        ).value.trim();


    if (!nama) {

        showToast(
            "Nama member wajib diisi."
        );

        return;
    }


    if (editId) {

        const item =
            member.find(function (item) {

                return item.id === editId;

            });


        if (item) {

            item.nama = nama;
            item.telepon = telepon;
            item.email = email;
            item.alamat = alamat;

        }


        showToast(
            "Member berhasil diperbarui."
        );

    } else {

        member.push({

            id: generateId("MBR", member),

            nama: nama,

            telepon: telepon,

            email: email,

            alamat: alamat

        });


        showToast(
            "Member berhasil ditambahkan."
        );

    }


    saveData();

    closeModal("memberModal");

    updateAll();

}


/* =====================================================
   EDIT MEMBER
   ===================================================== */

function editMember(id) {

    const item =
        member.find(function (item) {

            return item.id === id;

        });


    if (!item) return;


    document.getElementById(
        "memberModalTitle"
    ).textContent = "Edit Member";


    document.getElementById(
        "memberEditId"
    ).value = item.id;


    document.getElementById(
        "memberNama"
    ).value = item.nama;


    document.getElementById(
        "memberTelepon"
    ).value = item.telepon;


    document.getElementById(
        "memberEmail"
    ).value = item.email;


    document.getElementById(
        "memberAlamat"
    ).value = item.alamat;


    openModal("memberModal");

}


/* =====================================================
   DELETE MEMBER
   ===================================================== */

function deleteMember(id) {

    const item =
        member.find(function (item) {

            return item.id === id;

        });


    if (!item) return;


    if (
        !confirm(
            `Hapus member "${item.nama}"?`
        )
    ) return;


    member =
        member.filter(function (item) {

            return item.id !== id;

        });


    saveData();

    updateAll();

    showToast(
        "Member berhasil dihapus."
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


    const selectedMember =
        memberSelect.value;


    memberSelect.innerHTML = `
        <option value="">
            Umum
        </option>
    `;


    member.forEach(function (item) {

        memberSelect.innerHTML += `
            <option value="${item.id}">
                ${escapeHTML(item.nama)}
            </option>
        `;

    });


    if (
        member.some(function (item) {
            return item.id === selectedMember;
        })
    ) {

        memberSelect.value = selectedMember;

    }


    const selectedBarang =
        barangSelect.value;


    barangSelect.innerHTML = `
        <option value="">
            Pilih barang
        </option>
    `;


    barang.forEach(function (item) {

        barangSelect.innerHTML += `
            <option value="${item.id}">
                ${escapeHTML(item.nama)}
                - ${rupiah(item.hargaJual)}
                - Stok ${item.stok}
            </option>
        `;

    });


    if (
        barang.some(function (item) {
            return item.id === selectedBarang;
        })
    ) {

        barangSelect.value = selectedBarang;

    }


    updateSalePrice();

}


/* =====================================================
   UPDATE SALE PRICE
   ===================================================== */

function updateSalePrice() {

    const id =
        document.getElementById(
            "saleBarang"
        ).value;


    const info =
        document.getElementById(
            "salePriceInfo"
        );


    if (!id) {

        info.textContent =
            "Pilih barang untuk melihat harga.";

        return;
    }


    const item =
        barang.find(function (item) {

            return item.id === id;

        });


    if (!item) return;


    info.innerHTML = `
        Harga jual:
        <strong>${rupiah(item.hargaJual)}</strong>
        &nbsp; | &nbsp;
        Stok tersedia:
        <strong>${item.stok}</strong>
    `;

}


/* =====================================================
   ADD TO CART
   ===================================================== */

function addToCart() {

    const id =
        document.getElementById(
            "saleBarang"
        ).value;


    const qty =
        Number(
            document.getElementById(
                "saleQty"
            ).value
        );


    if (!id) {

        showToast(
            "Pilih barang terlebih dahulu."
        );

        return;
    }


    if (!qty || qty <= 0) {

        showToast(
            "Jumlah barang tidak valid."
        );

        return;
    }


    const item =
        barang.find(function (item) {

            return item.id === id;

        });


    if (!item) return;


    const existing =
        cart.find(function (item) {

            return item.id === id;

        });


    const currentQty =
        existing ? existing.qty : 0;


    if (currentQty + qty > item.stok) {

        showToast(
            "Jumlah melebihi stok yang tersedia."
        );

        return;
    }


    if (existing) {

        existing.qty += qty;

    } else {

        cart.push({

            id: item.id,

            nama: item.nama,

            harga: item.hargaJual,

            qty: qty

        });

    }


    document.getElementById(
        "saleQty"
    ).value = 1;


    renderCart();

    showToast(
        "Barang ditambahkan ke keranjang."
    );

}


/* =====================================================
   CART
   ===================================================== */

function renderCart() {

    const tbody =
        document.getElementById(
            "cartTable"
        );


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    if (cart.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <div class="empty-icon">🛒</div>
                        Keranjang masih kosong.
                    </div>
                </td>
            </tr>
        `;


        cartCount.textContent =
            "0 item";


        cartTotal.textContent =
            "Rp 0";


        return;
    }


    let total = 0;

    let totalQty = 0;


    tbody.innerHTML =
        cart.map(function (item, index) {

            const subtotal =
                item.harga * item.qty;


            total += subtotal;

            totalQty += item.qty;


            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(item.nama)}
                        </strong>
                    </td>

                    <td>
                        ${rupiah(item.harga)}
                    </td>

                    <td>
                        ${item.qty}
                    </td>

                    <td>
                        <strong>
                            ${rupiah(subtotal)}
                        </strong>
                    </td>

                    <td>

                        <button
                            class="action-button action-delete"
                            onclick="removeFromCart(${index})"
                        >
                            🗑️
                        </button>

                    </td>

                </tr>
            `;

        }).join("");


    cartCount.textContent =
        totalQty + " item";


    cartTotal.textContent =
        rupiah(total);

}


/* =====================================================
   REMOVE CART
   ===================================================== */

function removeFromCart(index) {

    cart.splice(index, 1);

    renderCart();

}


/* =====================================================
   CHECKOUT
   ===================================================== */

function checkout() {

    if (cart.length === 0) {

        showToast(
            "Keranjang masih kosong."
        );

        return;
    }


    const memberId =
        document.getElementById(
            "saleMember"
        ).value;


    const memberData =
        member.find(function (item) {

            return item.id === memberId;

        });


    const memberNama =
        memberData
            ? memberData.nama
            : "Umum";


    let total = 0;

    let totalQty = 0;


    // Validasi stok sekali lagi
    for (const cartItem of cart) {

        const item =
            barang.find(function (item) {

                return item.id === cartItem.id;

            });


        if (!item) {

            showToast(
                "Ada barang yang sudah tidak tersedia."
            );

            return;
        }


        if (cartItem.qty > item.stok) {

            showToast(
                `Stok ${item.nama} tidak mencukupi.`
            );

            return;
        }


        total +=
            cartItem.harga *
            cartItem.qty;


        totalQty += cartItem.qty;

    }


    // Kurangi stok
    cart.forEach(function (cartItem) {

        const item =
            barang.find(function (item) {

                return item.id === cartItem.id;

            });


        item.stok -= cartItem.qty;

    });


    const now =
        new Date();


    const transaction = {

        id: generateId(
            "TRX",
            transaksi
        ),

        tanggal:
            now.toISOString(),

        memberId:
            memberId || "",

        memberNama:
            memberNama,

        jumlahItem:
            totalQty,

        total:
            total,

        kasir:
            currentUser
                ? currentUser.nama
                : "-",

        detail:
            cart.map(function (item) {

                return {

                    id: item.id,

                    nama: item.nama,

                    harga: item.harga,

                    qty: item.qty,

                    subtotal:
                        item.harga *
                        item.qty

                };

            })

    };


    transaksi.push(transaction);


    cart = [];


    saveData();

    updateAll();


    document.getElementById(
        "saleMember"
    ).value = "";


    document.getElementById(
        "saleBarang"
    ).value = "";


    updateSalePrice();


    showToast(
        "Transaksi berhasil disimpan."
    );

}


/* =====================================================
   RIWAYAT
   ===================================================== */

function renderRiwayat() {

    const tbody =
        document.getElementById(
            "riwayatTable"
        );


    if (transaksi.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-icon">📜</div>
                        Belum ada riwayat transaksi.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    const data =
        [...transaksi].reverse();


    tbody.innerHTML =
        data.map(function (item) {

            const date =
                new Date(item.tanggal);


            return `
                <tr>

                    <td>
                        <strong>
                            ${item.id}
                        </strong>
                    </td>

                    <td>
                        ${formatDate(date)}
                    </td>

                    <td>
                        ${escapeHTML(item.memberNama)}
                    </td>

                    <td>
                        ${item.jumlahItem}
                    </td>

                    <td>
                        <strong>
                            ${rupiah(item.total)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(item.kasir)}
                    </td>

                </tr>
            `;

        }).join("");

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


    if (akun.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        Belum ada akun.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        akun.map(function (item) {

            return `
                <tr>

                    <td>
                        ${item.id}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(item.nama)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(item.username)}
                    </td>

                    <td>

                        ${
                            item.role === "Admin"

                            ? `
                                <span class="badge badge-primary">
                                    Admin
                                </span>
                            `

                            : `
                                <span class="badge badge-purple">
                                    Member
                                </span>
                            `
                        }

                    </td>

                    <td>

                        <div class="action-buttons">

                            ${
                                item.username !== "admin"

                                ? `
                                    <button
                                        class="action-button action-delete"
                                        onclick="deleteAkun('${item.id}')"
                                        title="Hapus"
                                    >
                                        🗑️
                                    </button>
                                `

                                : `
                                    <span style="font-size:12px;color:#64748b;">
                                        Akun utama
                                    </span>
                                `
                            }

                        </div>

                    </td>

                </tr>
            `;

        }).join("");

}


/* =====================================================
   MODAL AKUN
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

function saveAkun() {

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


    if (!nama || !username || !password) {

        showToast(
            "Semua data wajib diisi."
        );

        return;
    }


    if (password.length < 6) {

        showToast(
            "Password minimal 6 karakter."
        );

        return;
    }


    const exists =
        akun.some(function (item) {

            return item.username.toLowerCase() ===
                username.toLowerCase();

        });


    if (exists) {

        showToast(
            "Username sudah digunakan."
        );

        return;
    }


    akun.push({

        id: generateId("USR", akun),

        nama: nama,

        username: username,

        password: password,

        role: role

    });


    saveData();

    closeModal("akunModal");

    renderAkun();


    showToast(
        "Akun berhasil ditambahkan."
    );

}


/* =====================================================
   DELETE AKUN
   ===================================================== */

function deleteAkun(id) {

    const item =
        akun.find(function (item) {

            return item.id === id;

        });


    if (!item) return;


    if (item.username === "admin") {

        showToast(
            "Akun utama tidak dapat dihapus."
        );

        return;
    }


    if (
        currentUser &&
        currentUser.id === item.id
    ) {

        showToast(
            "Akun yang sedang digunakan tidak dapat dihapus."
        );

        return;
    }


    if (
        !confirm(
            `Hapus akun "${item.username}"?`
        )
    ) return;


    akun =
        akun.filter(function (item) {

            return item.id !== id;

        });


    saveData();

    renderAkun();


    showToast(
        "Akun berhasil dihapus."
    );

}


/* =====================================================
   MODAL HELPER
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

    return date.toLocaleString(
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
   TOAST
   ===================================================== */

let toastTimeout;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    const text =
        document.getElementById(
            "toastMessage"
        );


    text.textContent = message;


    toast.classList.add("show");


    clearTimeout(toastTimeout);


    toastTimeout =
        setTimeout(function () {

            toast.classList.remove(
                "show"
            );

        }, 3000);

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
   CLOSE MODAL WHEN CLICK OUTSIDE
   ===================================================== */

document.addEventListener(
    "click",
    function (event) {

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