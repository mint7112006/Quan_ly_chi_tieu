const financeForm = document.getElementById('finance-form');
const transactionList = document.getElementById('transaction-list');
const incomeDisplay = document.getElementById('total-income');
const expenseDisplay = document.getElementById('total-expense');
const balanceDisplay = document.getElementById('balance');

// GĐ 5.2.2: Load dữ liệu từ LocalStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// GĐ 5.1: Hàm tính toán số liệu Dashboard
function updateDashboard() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpense;

    // GĐ 4.1.2: Format tiền VNĐ (thêm ký tự đ)
    incomeDisplay.innerText = totalIncome.toLocaleString() + 'đ';
    expenseDisplay.innerText = totalExpense.toLocaleString() + 'đ';
    balanceDisplay.innerText = totalBalance.toLocaleString() + 'đ';
}

// GĐ 4.1.3: Hàm trả về màu sắc badge theo danh mục
function getCategoryBadge(category) {
    const colors = {
        food: 'bg-warning text-dark',   // Ăn uống - Vàng
        transport: 'bg-info text-white', // Di chuyển - Xanh nhạt
        study: 'bg-primary text-white',  // Học tập - Xanh đậm
        entertainment: 'bg-purple',      // Giải trí - Tím (tùy chỉnh thêm CSS)
        other: 'bg-secondary text-white' // Khác - Xám
    };
    return colors[category] || 'bg-secondary';
}

// GĐ 4.1 & 4.3: Render danh sách & Xử lý Empty State
function renderTransactions() {
    transactionList.innerHTML = ''; 

    // GĐ 4.3.1: Nếu mảng rỗng thì hiển thị thông báo
    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    🎬 Chưa có giao dịch nào. Hãy bắt đầu nhập nhé!
                </td>
            </tr>
        `;
        return;
    }

    transactions.forEach((t) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.description}</td>
            <td class="fw-bold ${t.type === 'expense' ? 'text-danger' : 'text-success'}">
                ${t.type === 'expense' ? '-' : '+'}${t.amount.toLocaleString()}đ
            </td>
            <td><span class="badge ${getCategoryBadge(t.category)}">${t.category.toUpperCase()}</span></td>
            <td class="text-center">
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
        id: Date.now(), // GĐ 3.2.1: Tạo ID duy nhất
        type: document.getElementById('type').value,
        description: descInput.value.trim(),
        amount: parseFloat(amountInput.value),
        category: document.getElementById('category').value
    };

    // GĐ 3.1.2 & 3.1.3: Validation
    if (newTransaction.description === "") {
        alert("🛑 Nội dung không được để trống.");
        return;
    }
    if (isNaN(newTransaction.amount) || newTransaction.amount <= 0) {
        alert("🛑 Số tiền phải là số dương lớn hơn 0 nha.");
        return;
    }

    transactions.push(newTransaction);
    
    // GĐ 5.2.1: Save vào LocalStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    updateDashboard();
    renderTransactions();
    financeForm.reset();
});

// GĐ 4.2 & 5.2.3: Xóa và Sync dữ liệu
function deleteTransaction(id) {
    if (confirm("Bạn có chắc chắn muốn xóa giao dịch này không?")) {
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateDashboard();
        renderTransactions();
    }
}

// Khởi chạy lần đầu
updateDashboard();
renderTransactions();