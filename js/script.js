const financeForm = document.getElementById('finance-form');
const transactionList = document.getElementById('transaction-list');
const incomeDisplay = document.getElementById('total-income');
const expenseDisplay = document.getElementById('total-expense');
const balanceDisplay = document.getElementById('balance');

// Các phần tử của thanh Progress Bar
const progressBar = document.getElementById('budget-progress');
const percentText = document.getElementById('percent-text');
const alertMsg = document.getElementById('alert-msg');

// --- CHÈN BƯỚC 1 VÀO ĐÂY ---
const monthFilter = document.getElementById('month-filter');
let myChart; // Biến dùng để lưu trữ và quản lý biểu đồ Chart.js

// GĐ 5.2.2: Load dữ liệu từ LocalStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// GĐ 5.1: Hàm tính toán số liệu Dashboard & Thanh tiến độ
function updateDashboard() {
    const selectedMonth = monthFilter.value;
    
    // THÊM: Lọc dữ liệu theo tháng trước khi tính toán
    const displayData = selectedMonth === 'all' 
        ? transactions 
        : transactions.filter(t => t.date && new Date(t.date).getMonth() === parseInt(selectedMonth));

    // SỬA: Đổi transactions thành displayData để số liệu Dashboard nhảy theo tháng
    const totalIncome = displayData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = displayData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpense;

    // 1. Cập nhật các con số Dashboard
    incomeDisplay.innerText = totalIncome.toLocaleString() + 'đ';
    expenseDisplay.innerText = totalExpense.toLocaleString() + 'đ';
    balanceDisplay.innerText = totalBalance.toLocaleString() + 'đ';

    // 2. Tính phần trăm chi tiêu
    let percent = 0;
    if (totalIncome > 0) {
        percent = (totalExpense / totalIncome) * 100;
    }

    // 3. Cập nhật thanh Progress Bar và Thông báo
    if (percentText && progressBar && alertMsg) {
        percentText.innerText = Math.round(percent) + '%';
        progressBar.style.width = Math.min(percent, 100) + '%';

        if (percent >= 100) {
            progressBar.className = "progress-bar progress-bar-striped progress-bar-animated bg-danger"; 
            alertMsg.innerText = "🛑 Cảnh báo: Bạn đã tiêu hết tiền kiếm được rồi!";
            alertMsg.className = "mt-2 fw-medium text-danger text-center d-block";
        } else if (percent >= 80) {
            progressBar.className = "progress-bar progress-bar-striped progress-bar-animated bg-warning text-dark";
            alertMsg.innerText = "⚠️ Chú ý: Bạn đã tiêu quá 80% thu nhập tháng này.";
            alertMsg.className = "mt-2 fw-medium text-warning text-center d-block";
        } else {
            progressBar.className = "progress-bar progress-bar-striped progress-bar-animated bg-info";
            alertMsg.innerText = "✅ Bạn vẫn đang kiểm soát tốt chi tiêu.";
            alertMsg.className = "mt-2 fw-medium text-success text-center d-block";
        }
    }
}

// GĐ 4.1.3: Hàm màu sắc badge theo danh mục
function getCategoryBadge(category) {
    const colors = {
        food: 'bg-warning text-dark',
        transport: 'bg-info text-white',
        study: 'bg-primary text-white',
        entertainment: 'bg-danger text-white',
        other: 'bg-secondary text-white'
    };
    return colors[category] || 'bg-secondary';
}

// GĐ 4.1 & 4.3: Render danh sách & Empty State
function renderTransactions() {
    const selectedMonth = monthFilter.value;
    
    // THÊM: Lọc dữ liệu theo tháng trước khi hiện danh sách
    const displayData = selectedMonth === 'all' 
        ? transactions 
        : transactions.filter(t => t.date && new Date(t.date).getMonth() === parseInt(selectedMonth));

    transactionList.innerHTML = ''; 

    // SỬA: Kiểm tra displayData thay vì transactions
    if (displayData.length === 0) {
        transactionList.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    🎬 Không có giao dịch nào trong tháng này.
                </td>
            </tr>
        `;
        return;
    }

    // SỬA: Duyệt qua displayData
    displayData.forEach((t) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="ps-4">${t.description}</td>
            <td class="fw-bold ${t.type === 'expense' ? 'text-danger' : 'text-success'}">
                ${t.type === 'expense' ? '-' : '+'}${t.amount.toLocaleString()}đ
            </td>
            <td>
                <span class="badge ${getCategoryBadge(t.category)}">
                ${t.category === 'food' ? 'Ăn uống' : 
                t.category === 'transport' ? 'Di chuyển' : 
                t.category === 'study' ? 'Học tập' : 
                t.category === 'entertainment' ? 'Giải trí' : 'Khác'}
                </span>
            </td>
            <td class="text-center pe-4">
                <button class="btn btn-outline-danger btn-sm" onclick="deleteTransaction(${t.id})">
                    <i class="bi bi-trash"></i> Xóa
                </button>
            </td>
        `;
        transactionList.appendChild(row);
    });
}

// GĐ 3: Xử lý thêm giao dịch
financeForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const amountInput = document.getElementById('amount');
    const descInput = document.getElementById('description');

    const newTransaction = {
        id: Date.now(),
        type: document.getElementById('type').value,
        description: descInput.value.trim(),
        amount: parseFloat(amountInput.value),
        category: document.getElementById('category').value,
        date: new Date().toISOString() // QUAN TRỌNG: Thêm ngày tháng thực tế
    };

    // --- VALIDATION GIỮ NGUYÊN ---
    if (newTransaction.description === "") {
        alert("🛑 Nội dung không được để trống.");
        return;
    }
    if (isNaN(newTransaction.amount)) {
        alert("🛑 Bạn chưa nhập số tiền.");
        return;
    }
    if (newTransaction.amount <= 0) {
        alert("🛑 Số tiền phải lớn hơn 0.");
        return;
    }

    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    updateDashboard();
    renderTransactions();
    drawChart(); // Cập nhật biểu đồ khi thêm mới
    financeForm.reset();
});

// GĐ 4.2: Xóa dữ liệu
function deleteTransaction(id) {
    if (confirm("Bạn có chắc chắn muốn xóa giao dịch này không?")) {
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateDashboard();
        renderTransactions();
        drawChart(); // Cập nhật biểu đồ khi xóa
    }
}

// Hàm vẽ biểu đồ xu hướng chi tiêu
function drawChart() {
    const ctx = document.getElementById('myChart');
    if (!ctx) return;

    if (myChart) { myChart.destroy(); }

    const monthlyExpenses = Array(12).fill(0);
    transactions.forEach(t => {
        if (t.type === 'expense' && t.date) {
            const month = new Date(t.date).getMonth();
            monthlyExpenses[month] += t.amount;
        }
    });

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
            datasets: [{
                label: 'Chi tiêu (VNĐ)',
                data: monthlyExpenses,
                backgroundColor: '#fb923c',
                borderRadius: 8
            }]
        },
        options: { responsive: true }
    });
}

// Lắng nghe sự kiện lọc tháng
if (monthFilter) {
    monthFilter.addEventListener('change', () => {
        updateDashboard();
        renderTransactions();
    });
}

// KHỞI CHẠY LẦN ĐẦU
updateDashboard();
renderTransactions();
drawChart(); // Đảm bảo biểu đồ vẽ ngay khi load trang