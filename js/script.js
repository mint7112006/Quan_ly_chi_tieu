const financeForm = document.getElementById('finance-form');
const transactionList = document.getElementById('transaction-list');
const incomeDisplay = document.getElementById('total-income');
const expenseDisplay = document.getElementById('total-expense');
const balanceDisplay = document.getElementById('balance');

// Khởi tạo danh sách giao dịch (Mục 5.2.2 & 5.2.4)
// Lấy dữ liệu từ LocalStorage, nếu rỗng thì tạo mảng mới []
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

let totalIncome = 0;
let totalExpense = 0;

// 1. Hàm lưu dữ liệu vào LocalStorage (Mục 5.2.1)
function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// 2. Hàm tính toán và cập nhật Dashboard (Mục 5.1)
function updateDashboard() {
    totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpense;

    incomeDisplay.innerText = totalIncome.toLocaleString();
    expenseDisplay.innerText = totalExpense.toLocaleString();
    balanceDisplay.innerText = totalBalance.toLocaleString();
}

// 3. Hàm hiển thị danh sách ra màn hình (Mục 4.1)
function renderTransactions() {
    transactionList.innerHTML = ''; // Xóa bảng cũ để vẽ lại

    transactions.forEach((t) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.description}</td>
            <td style="color: ${t.type === 'expense' ? 'red' : 'green'}" class="fw-bold">
                ${t.type === 'expense' ? '-' : '+'}${t.amount.toLocaleString()}
            </td>
            <td><span class="badge bg-secondary">${t.category}</span></td>
            <td class="text-center">
                <button class="btn btn-danger btn-sm" onclick="deleteTransaction(${t.id})">Xóa</button>
            </td>
        `;
        transactionList.appendChild(row);
    });
}

// 4. Hàm thêm giao dịch mới (Mục 3.3)
financeForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const newTransaction = {
        id: Date.now(), // Tạo ID duy nhất (Mục 3.2.1)
        type: document.getElementById('type').value,
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value
    };

    if (!newTransaction.description || isNaN(newTransaction.amount) || newTransaction.amount <= 0) {
        alert("Vui lòng nhập đúng dữ liệu!");
        return;
    }

    transactions.push(newTransaction);
    saveToLocalStorage(); // Lưu vào bộ nhớ (Mục 5.2.1)
    updateDashboard();    // Cập nhật số liệu
    renderTransactions(); // Vẽ lại bảng
    financeForm.reset();
});

// 5. Hàm xóa giao dịch (Mục 4.2 & 5.2.3)
function deleteTransaction(id) {
    // Lọc bỏ giao dịch có ID này (Đồng bộ lại mảng)
    transactions = transactions.filter(t => t.id !== id);
    saveToLocalStorage(); // Cập nhật lại bộ nhớ (Mục 5.2.3)
    updateDashboard();
    renderTransactions();
}

// 6. Chạy ngay khi mở web (Mục 5.2.2)
updateDashboard();
renderTransactions();