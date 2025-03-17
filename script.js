// Constants
const EXPENSE_CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Education',
    'Personal Care',
    'Travel',
    'Gifts & Donations',
    'Other'
];

const INCOME_CATEGORIES = [
    'Salary',
    'Freelance',
    'Business',
    'Investments',
    'Rental',
    'Gifts',
    'Other'
];

// DOM Elements
const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const forWhomInput = document.getElementById('for-whom');
const personNameGroup = document.getElementById('person-name-group');
const personNameInput = document.getElementById('person-name');
const currentDateEl = document.getElementById('current-date');
const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const transactionsContainer = document.getElementById('transactions-container');
const emptyState = document.getElementById('empty-state');
const transactionsTable = document.getElementById('transactions-table');
const transactionsList = document.getElementById('transactions-list');
const addSampleDataBtn = document.getElementById('add-sample-data');
const searchInput = document.getElementById('search-transactions');
const filterTypeSelect = document.getElementById('filter-type');
const filterCategorySelect = document.getElementById('filter-category');
const filterForWhomSelect = document.getElementById('filter-for-whom');
const toastContainer = document.getElementById('toast-container');
const expenseChartCanvas = document.getElementById('expense-chart');
const summaryTimeRange = document.getElementById('summary-time-range');
const summaryDate = document.getElementById('summary-date');
const periodIncome = document.getElementById('period-income');
const periodExpenses = document.getElementById('period-expenses');
const periodOthers = document.getElementById('period-others');
const periodSelf = document.getElementById('period-self');
const emptyPeriod = document.getElementById('empty-period');
const periodTransactionsTable = document.getElementById('period-transactions-table');
const periodTransactionsList = document.getElementById('period-transactions-list');
const generateBillBtn = document.getElementById('generate-bill');

// Application state
let transactions = [];
let expenseChart = null;
let editingTransactionId = null;

// Initialize the application
function initApp() {
    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);

    // Set today's date as default in the form
    dateInput.valueAsDate = new Date();

    // Set current time as default (rounded to nearest 15 minutes)
    const now = new Date();
    now.setMinutes(Math.round(now.getMinutes() / 15) * 15);
    timeInput.value = now.toTimeString().slice(0, 5);

    // Create and add moneyReturnedGroup after personNameGroup
    const moneyReturnedGroup = document.createElement('div');
    moneyReturnedGroup.id = 'money-returned-group';
    moneyReturnedGroup.className = 'form-group';
    moneyReturnedGroup.style.display = 'none';

    moneyReturnedGroup.innerHTML = `
        <div class="checkbox-container">
            <input type="checkbox" id="money-returned" name="money-returned">
            <label for="money-returned">Money has been returned</label>
        </div>
    `;

    // Insert after personNameGroup
    personNameGroup.parentNode.insertBefore(moneyReturnedGroup, personNameGroup.nextSibling);

    // Reference the new element
    const moneyReturnedInput = document.getElementById('money-returned');

    // Populate category dropdown based on transaction type
    populateCategoryDropdown();

    // Load transactions from localStorage
    loadTransactions();

    // Setup event listeners
    setupEventListeners();

    // Update summary
    updateSummary();

    // Render transactions
    renderTransactions();

    // Render chart
    renderExpenseChart();

    // Set current date as default for summary date
    summaryDate.valueAsDate = new Date();

    // Setup event listeners for transaction summary
    setupSummaryEventListeners();

    // Render transaction summary
    renderTransactionSummary();
}

// Populate category dropdown based on transaction type
function populateCategoryDropdown() {
    const type = typeInput.value;
    categoryInput.innerHTML = '<option value="">Select a category</option>';

    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryInput.appendChild(option);
    });

    // Also populate filter category dropdown
    populateFilterCategoryDropdown();
}

// Populate filter category dropdown
function populateFilterCategoryDropdown() {
    const filterType = filterTypeSelect.value;
    filterCategorySelect.innerHTML = '<option value="all">All Categories</option>';

    let categories;
    if (filterType === 'all') {
        categories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
    } else if (filterType === 'expense') {
        categories = EXPENSE_CATEGORIES;
    } else {
        categories = INCOME_CATEGORIES;
    }

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategorySelect.appendChild(option);
    });
}

// Modify setup event listeners to handle the money returned checkbox
function setupEventListeners() {
    // Form submission
    transactionForm.addEventListener('submit', handleFormSubmit);

    // Transaction type change
    typeInput.addEventListener('change', populateCategoryDropdown);

    // For whom change - show/hide person name field and money returned checkbox
    forWhomInput.addEventListener('change', function () {
        const moneyReturnedGroup = document.getElementById('money-returned-group');

        if (this.value === 'others') {
            personNameGroup.style.display = 'block';
            personNameInput.required = true;

            // Only show money returned checkbox for expenses
            if (typeInput.value === 'expense') {
                moneyReturnedGroup.style.display = 'block';
            } else {
                moneyReturnedGroup.style.display = 'none';
            }
        } else {
            personNameGroup.style.display = 'none';
            personNameInput.required = false;
            personNameInput.value = '';
            moneyReturnedGroup.style.display = 'none';
        }
    });

    // Transaction type change - update money returned visibility
    typeInput.addEventListener('change', function () {
        const moneyReturnedGroup = document.getElementById('money-returned-group');

        // Only show money returned for expenses that are for others
        if (this.value === 'expense' && forWhomInput.value === 'others') {
            moneyReturnedGroup.style.display = 'block';
        } else {
            moneyReturnedGroup.style.display = 'none';
        }
    });

    // Add sample data button
    addSampleDataBtn.addEventListener('click', addSampleData);

    // Search and filter
    searchInput.addEventListener('input', renderTransactions);
    filterTypeSelect.addEventListener('change', () => {
        populateFilterCategoryDropdown();
        renderTransactions();
    });
    filterCategorySelect.addEventListener('change', renderTransactions);
    filterForWhomSelect.addEventListener('change', renderTransactions);
    generateBillBtn.addEventListener('click', generateBill);
}
// Handle form submission
// Update the form submission handler
function handleFormSubmit(e) {
    e.preventDefault();

    const description = descriptionInput.value;
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;
    const time = timeInput.value || '00:00';
    const forWhom = forWhomInput.value;
    const personName = forWhom === 'others' ? personNameInput.value : '';

    // Get the status of money returned checkbox
    const moneyReturnedInput = document.getElementById('money-returned');
    const moneyReturned = (forWhom === 'others' && type === 'expense' && moneyReturnedInput && moneyReturnedInput.checked) || false;

    if (!description || isNaN(amount) || amount <= 0 || !category || !date) {
        showToast('Please fill in all fields with valid values', 'error');
        return;
    }

    if (forWhom === 'others' && !personName) {
        showToast('Please enter the person\'s name', 'error');
        return;
    }

    if (editingTransactionId) {
        // Update existing transaction
        const index = transactions.findIndex(t => t.id === editingTransactionId);
        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                description,
                amount,
                type,
                category,
                date,
                time,
                forWhom,
                personName,
                moneyReturned // Add the new field
            };
            showToast('Transaction updated successfully', 'success');
        }
        editingTransactionId = null;
    } else {
        // Add new transaction
        const newTransaction = {
            id: generateId(),
            description,
            amount,
            type,
            category,
            date,
            time,
            forWhom,
            personName,
            moneyReturned, // Add the new field
            timestamp: new Date().getTime()
        };

        transactions.push(newTransaction);
        showToast('Transaction added successfully', 'success');
    }

    // Save transactions
    saveTransactions();

    // Reset form
    transactionForm.reset();
    dateInput.valueAsDate = new Date();
    const now = new Date();
    now.setMinutes(Math.round(now.getMinutes() / 15) * 15);
    timeInput.value = now.toTimeString().slice(0, 5);
    personNameGroup.style.display = 'none';
    document.getElementById('money-returned-group').style.display = 'none';

    // Update UI
    updateSummary();
    renderTransactions();
    renderExpenseChart();
    renderTransactionSummary();
}

// Generate a unique ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Load transactions from localStorage
function loadTransactions() {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    }
}

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update summary
function updateSummary() {
    const { totalIncome, totalExpenses, balance } = calculateSummary();

    totalBalanceEl.textContent = formatCurrency(balance);
    totalIncomeEl.textContent = formatCurrency(totalIncome);
    totalExpensesEl.textContent = formatCurrency(totalExpenses);
}

// Modify the calculateSummary function to exclude returned money
function calculateSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(transaction => {
        // Skip transactions where money has been returned
        if (transaction.moneyReturned) {
            return;
        }

        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpenses += transaction.amount;
        }
    });

    const balance = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, balance };
}

function setupSummaryEventListeners() {
    summaryTimeRange.addEventListener('change', renderTransactionSummary);
    summaryDate.addEventListener('change', renderTransactionSummary);
}

// Modify renderTransactionSummary to exclude returned money
function renderTransactionSummary() {
    const selectedDate = new Date(summaryDate.value);
    const timeRange = summaryTimeRange.value;

    // Get start and end dates based on selected time range
    const { startDate, endDate } = getDateRange(selectedDate, timeRange);

    // Filter transactions for the selected period
    const periodTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
    });

    // Calculate summary values
    let totalIncome = 0;
    let totalExpenses = 0;
    let spentForOthers = 0;
    let spentForSelf = 0;

    periodTransactions.forEach(transaction => {
        // Skip transactions where money has been returned
        if (transaction.moneyReturned) {
            return;
        }

        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpenses += transaction.amount;

            if (transaction.forWhom === 'others') {
                spentForOthers += transaction.amount;
            } else {
                spentForSelf += transaction.amount;
            }
        }
    });

    // Calculate transactions to display (including returned money, but marked)
    let displayTransactions = periodTransactions.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateB - dateA;
    });

    // Update summary elements
    periodIncome.textContent = formatCurrency(totalIncome);
    periodExpenses.textContent = formatCurrency(totalExpenses);
    periodOthers.textContent = formatCurrency(spentForOthers);
    periodSelf.textContent = formatCurrency(spentForSelf);

    // Display transactions or empty state
    if (displayTransactions.length === 0) {
        emptyPeriod.style.display = 'block';
        periodTransactionsTable.style.display = 'none';
    } else {
        emptyPeriod.style.display = 'none';
        periodTransactionsTable.style.display = 'table';

        // Clear transactions list
        periodTransactionsList.innerHTML = '';

        // Render each transaction
        displayTransactions.forEach(transaction => {
            const row = document.createElement('tr');

            // Add class for returned money
            if (transaction.moneyReturned) {
                row.classList.add('money-returned');
            }

            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = transaction.description;

            // Add indicator for returned money
            if (transaction.moneyReturned) {
                const returnedTag = document.createElement('span');
                returnedTag.textContent = " (Returned)";
                returnedTag.className = 'returned-tag';
                returnedTag.style.color = "green";
                returnedTag.style.fontStyle = "italic";
                returnedTag.style.fontSize = "0.85em";
                descriptionCell.appendChild(returnedTag);
            }

            const categoryCell = document.createElement('td');
            const categoryTag = document.createElement('span');
            categoryTag.textContent = transaction.category;
            categoryTag.className = 'transaction-category';
            categoryCell.appendChild(categoryTag);

            const dateCell = document.createElement('td');
            const timeStr = transaction.time ? ` ${formatTime(transaction.time)}` : '';
            dateCell.textContent = `${formatDate(transaction.date)}${timeStr}`;
            dateCell.className = 'transaction-date';

            const forWhomCell = document.createElement('td');
            if (transaction.forWhom === 'others' && transaction.personName) {
                forWhomCell.textContent = transaction.personName;
            } else {
                forWhomCell.textContent = 'Myself';
            }

            const amountCell = document.createElement('td');
            amountCell.textContent = formatCurrency(transaction.amount);
            amountCell.className = `transaction-amount ${transaction.type}`;

            // Gray out the amount if money was returned
            if (transaction.moneyReturned) {
                amountCell.style.textDecoration = 'line-through';
                amountCell.style.opacity = '0.7';
            }

            row.appendChild(descriptionCell);
            row.appendChild(categoryCell);
            row.appendChild(dateCell);
            row.appendChild(forWhomCell);
            row.appendChild(amountCell);

            periodTransactionsList.appendChild(row);
        });
    }
}

function getDateRange(date, timeRange) {
    const startDate = new Date(date);
    const endDate = new Date(date);

    // Reset hours, minutes, seconds, and milliseconds
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (timeRange === 'day') {
        // Current day (already set)
    } else if (timeRange === 'week') {
        // Start of week (Sunday)
        const day = startDate.getDay();
        startDate.setDate(startDate.getDate() - day);

        // End of week (Saturday)
        endDate.setDate(startDate.getDate() + 6);
    } else if (timeRange === 'month') {
        // Start of month
        startDate.setDate(1);

        // End of month
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
    } else if (timeRange === 'year') {
        // Start of year
        startDate.setMonth(0, 1);

        // End of year
        endDate.setMonth(11, 31);
    }

    return { startDate, endDate };
}

function generateBill() {
    const selectedDate = new Date(summaryDate.value);
    const timeRange = summaryTimeRange.value;

    // Get start and end dates based on selected time range
    const { startDate, endDate } = getDateRange(selectedDate, timeRange);

    // Format date range for display
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    let dateRangeText;

    if (timeRange === 'day') {
        dateRangeText = `${formattedStartDate}`;
    } else {
        dateRangeText = `${formattedStartDate} - ${formattedEndDate}`;
    }

    // Filter transactions for the selected period
    const periodTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
    });

    // Sort transactions by date (newest first)
    periodTransactions.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA - dateB;  // Ascending order for the bill
    });

    // Calculate summary values - MODIFIED to exclude returned money
    let totalIncome = 0;
    let totalExpenses = 0;
    let spentForOthers = 0;
    let spentForSelf = 0;

    periodTransactions.forEach(transaction => {
        // Skip transactions where money has been returned
        if (transaction.moneyReturned) {
            return;
        }

        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpenses += transaction.amount;

            if (transaction.forWhom === 'others') {
                spentForOthers += transaction.amount;
            } else {
                spentForSelf += transaction.amount;
            }
        }
    });

    // Calculate net balance
    const netBalance = totalIncome - totalExpenses;

    // Generate bill reference number
    const billRef = 'BILL-' + new Date().getTime().toString().slice(-6);

    // Create modal for bill
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';

    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create the bill content structure with improved A4 formatting
    const billContentHTML = `
        <div class="bill-container">
            <div class="bill-header">
                <div class="bill-logo">
                    <h1>Smart Budget</h1>
                </div>
                <div class="bill-company-info">
                    <p>Smart Budget Inc.</p>
                    <p>123 Financial Street, Money City</p>
                    <p>contact@smartbudget.com | +1 (555) 123-4567</p>
                </div>
            </div>
            
            <div class="bill-document-title">
                <h2>Financial Statement</h2>
            </div>
            
            <div class="bill-meta">
                <div class="bill-meta-item">
                    <span class="meta-label">Bill Reference:</span>
                    <span class="meta-value">${billRef}</span>
                </div>
                <div class="bill-meta-item">
                    <span class="meta-label">Period:</span>
                    <span class="meta-value">${dateRangeText}</span>
                </div>
                <div class="bill-meta-item">
                    <span class="meta-label">Generated On:</span>
                    <span class="meta-value">${formattedCurrentDate}</span>
                </div>
                <div class="bill-meta-item">
                    <span class="meta-label">Generated By:</span>
                    <span class="meta-value">Smart Budget System</span>
                </div>
            </div>
            
            <div class="bill-section">
                <h3>Transaction Details</h3>
                <div class="table-responsive">
                    <table class="bill-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>For</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${periodTransactions.length > 0 ?
            periodTransactions.map(transaction => `
                                <tr class="${transaction.moneyReturned ? 'money-returned-row' : ''}">
                                    <td>${formatDate(transaction.date)} ${transaction.time ? formatTime(transaction.time) : ''}</td>
                                    <td>${transaction.description}</td>
                                    <td>${transaction.category}</td>
                                    <td>${transaction.forWhom === 'others' ? transaction.personName : 'Myself'}</td>
                                    <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
                                    <td class="${transaction.type} ${transaction.moneyReturned ? 'returned-amount' : ''}">${formatCurrency(transaction.amount)}</td>
                                    <td>${transaction.moneyReturned ? '<span class="returned-status">Returned</span>' : ''}</td>
                                </tr>
                            `).join('') :
            `<tr><td colspan="7" class="no-data">No transactions found for this period</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="bill-summary-section">
                <h3>Financial Summary</h3>
                <div class="bill-summary">
                    <div class="bill-summary-item">
                        <span class="summary-label">Total Income:</span>
                        <span class="summary-value income">${formatCurrency(totalIncome)}</span>
                    </div>
                    <div class="bill-summary-item">
                        <span class="summary-label">Total Expenses:</span>
                        <span class="summary-value expense">${formatCurrency(totalExpenses)}</span>
                    </div>
                    <div class="bill-summary-item">
                        <span class="summary-label">Spent for Others:</span>
                        <span class="summary-value">${formatCurrency(spentForOthers)}</span>
                    </div>
                    <div class="bill-summary-item">
                        <span class="summary-label">Spent for Self:</span>
                        <span class="summary-value">${formatCurrency(spentForSelf)}</span>
                    </div>
                    <div class="bill-total">
                        <span class="total-label">Net Balance:</span>
                        <span class="total-value ${netBalance >= 0 ? 'income' : 'expense'}">${formatCurrency(netBalance)}</span>
                    </div>
                </div>
            </div>
            
            <div class="bill-footer">
                <p>This is a system-generated bill. No signature is required.</p>
                <p>Thank you for using Smart Budget to manage your finances!</p>
                <p><strong>Note:</strong> Returned money transactions are marked and excluded from totals.</p>
            </div>
        </div>
    `;

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Transaction Bill</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="bill-content" id="bill-content-for-pdf">
                ${billContentHTML}
            </div>
            <div class="bill-actions">
                <button id="print-bill" class="btn btn-primary">Print Bill</button>
                <button id="close-bill" class="btn">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners for the modal
    const closeBtn = modal.querySelector('.modal-close');
    const printBtn = modal.querySelector('#print-bill');
    const closeBillBtn = modal.querySelector('#close-bill');

    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    closeBillBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    printBtn.addEventListener('click', () => {
        // Set the document title to the bill reference before printing
        const originalTitle = document.title;
        document.title = billRef;

        // Create a new window specifically for printing
        const printWindow = window.open('', '_blank');

        // Create complete HTML with all necessary styles for the print window
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${billRef}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: 'Arial', sans-serif;
                        color: #333;
                        background-color: #ffffff;
                    }
                    .bill-container {
                        width: 210mm;
                        min-height: 297mm;
                        padding: 15mm;
                        box-sizing: border-box;
                        margin: 0 auto;
                        background-color: #fff;
                    }
                    .bill-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding: 0 0 20px 0;
                        border-bottom: 2px solid #3498db;
                        margin-bottom: 20px;
                    }
                    .bill-logo h1 {
                        color: #3498db;
                        font-size: 32px;
                        margin: 0;
                        font-weight: bold;
                    }
                    .bill-company-info {
                        text-align: right;
                        line-height: 1.5;
                    }
                    .bill-company-info p {
                        margin: 5px 0;
                        color: #666;
                    }
                    .bill-document-title {
                        text-align: center;
                        margin: 20px 0;
                    }
                    .bill-document-title h2 {
                        font-size: 24px;
                        color: #2c3e50;
                        margin: 0;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .bill-meta {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                        padding: 20px;
                        background-color: #f2f7fc;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .bill-meta-item {
                        display: flex;
                        align-items: center;
                    }
                    .meta-label {
                        font-weight: bold;
                        margin-right: 10px;
                        color: #555;
                        min-width: 120px;
                    }
                    .meta-value {
                        color: #333;
                    }
                    .bill-section {
                        margin: 20px 0;
                    }
                    .bill-section h3 {
                        color: #3498db;
                        border-bottom: 1px solid #e0e0e0;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                        font-size: 18px;
                    }
                    .table-responsive {
                        width: 100%;
                    }
                    .bill-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    .bill-table th {
                        background-color: #3498db;
                        color: white;
                        padding: 12px 8px;
                        text-align: left;
                        font-weight: 600;
                    }
                    .bill-table td {
                        padding: 10px 8px;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    .bill-table tbody tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    .bill-table .income {
                        color: #27ae60;
                        font-weight: 600;
                    }
                    .bill-table .expense {
                        color: #e74c3c;
                        font-weight: 600;
                    }
                    .bill-table .no-data {
                        text-align: center;
                        padding: 30px;
                        color: #999;
                        font-style: italic;
                    }
                    .bill-summary-section {
                        margin: 20px 0;
                    }
                    .bill-summary {
                        background-color: #f9f9f9;
                        border-radius: 5px;
                        padding: 20px;
                        border: 1px solid #e0e0e0;
                    }
                    .bill-summary-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px 0;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    .summary-label {
                        font-weight: 600;
                        color: #555;
                    }
                    .summary-value {
                        font-weight: 600;
                    }
                    .bill-total {
                        display: flex;
                        justify-content: space-between;
                        padding: 15px 0 5px;
                        margin-top: 10px;
                        border-top: 2px solid #3498db;
                    }
                    .total-label {
                        font-weight: 700;
                        font-size: 18px;
                        color: #2c3e50;
                    }
                    .total-value {
                        font-weight: 700;
                        font-size: 18px;
                    }
                    .income {
                        color: #27ae60;
                    }
                    .expense {
                        color: #e74c3c;
                    }
                    .money-returned-row {
                        background-color: #f0fff0 !important;
                        color: #666;
                    }
                    .returned-amount {
                        text-decoration: line-through;
                        opacity: 0.7;
                    }
                    .returned-status {
                        color: #2ecc71;
                        font-weight: 600;
                        font-style: italic;
                    }
                    .bill-footer {
                        margin-top: 40px;
                        padding: 20px 0;
                        text-align: center;
                        border-top: 1px solid #e0e0e0;
                        color: #666;
                        font-size: 14px;
                    }
                    .bill-footer p {
                        margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                ${billContentHTML}
            </body>
            </html>
        `);

        // After a short delay to ensure content is loaded, trigger print
        setTimeout(() => {
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.onafterprint = function () {
                printWindow.close();
                document.title = originalTitle;
            };
        }, 500);
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Modify renderTransactions to show only last 10 transactions with a 'See More' button
function renderTransactions() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterType = filterTypeSelect.value;
    const filterCategory = filterCategorySelect.value;
    const filterForWhom = filterForWhomSelect.value;

    // Filter transactions
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm) ||
            (transaction.personName && transaction.personName.toLowerCase().includes(searchTerm));
        const matchesType = filterType === 'all' || transaction.type === filterType;
        const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
        const matchesForWhom = filterForWhom === 'all' ||
            (filterForWhom === transaction.forWhom) ||
            (filterForWhom === 'myself' && !transaction.forWhom); // Handle older entries

        return matchesSearch && matchesType && matchesCategory && matchesForWhom;
    });

    // Sort transactions by date and time (newest first)
    filteredTransactions.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateB - dateA;
    });

    // Show or hide empty state
    if (transactions.length === 0) {
        emptyState.style.display = 'block';
        transactionsTable.style.display = 'none';
        return;
    } else {
        emptyState.style.display = 'none';
        transactionsTable.style.display = 'table';
    }

    // Clear transaction list
    transactionsList.innerHTML = '';

    // Store the page state in the DOM
    transactionsList.dataset.page = transactionsList.dataset.page || '0';
    const currentPage = parseInt(transactionsList.dataset.page);
    const transactionsPerPage = 10;

    // Calculate how many transactions to show
    const startIndex = currentPage * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const displayTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Remove existing "See More" button if it exists
    const existingSeeMoreRow = document.getElementById('see-more-row');
    if (existingSeeMoreRow) {
        existingSeeMoreRow.remove();
    }

    // Render visible transactions
    renderTransactionRows(displayTransactions);

    // Add "See More" button if there are more transactions
    if (endIndex < filteredTransactions.length) {
        addSeeMoreButton(filteredTransactions, currentPage);
    }
    // Add "See Less" button if not on first page
    else if (currentPage > 0) {
        addSeeLessButton(filteredTransactions, currentPage);
    }
}

// Then fix the renderTransactionRows function:
function renderTransactionRows(transactionsToRender) {
    transactionsToRender.forEach(transaction => {
        const row = document.createElement('tr');
        row.dataset.id = transaction.id;

        // Add class for returned money
        if (transaction.moneyReturned) {
            row.classList.add('money-returned');
        }

        // 1. Description column
        const descriptionCell = document.createElement('td');
        descriptionCell.className = 'transaction-description';

        const descriptionText = document.createElement('span');
        descriptionText.textContent = transaction.description;
        descriptionCell.appendChild(descriptionText);

        if (transaction.moneyReturned) {
            const returnedTag = document.createElement('span');
            returnedTag.textContent = " (Returned)";
            returnedTag.className = 'returned-tag';
            returnedTag.style.color = "green";
            returnedTag.style.fontStyle = "italic";
            returnedTag.style.fontSize = "0.85em";
            descriptionCell.appendChild(returnedTag);
        }

        // 2. Category column
        const categoryCell = document.createElement('td');
        categoryCell.className = 'transaction-category-cell';
        const categoryTag = document.createElement('span');
        categoryTag.textContent = transaction.category;
        categoryTag.className = `transaction-category category-${transaction.category.toLowerCase().replace(/\s+/g, '-')}`;
        categoryCell.appendChild(categoryTag);

        // 3. Date column
        const dateCell = document.createElement('td');
        dateCell.className = 'transaction-date';
        const formattedDate = formatDate(transaction.date);
        const formattedTime = transaction.time ? ` ${formatTime(transaction.time)}` : '';
        dateCell.textContent = `${formattedDate}${formattedTime}`;

        // 4. Person column
        const personCell = document.createElement('td');
        personCell.className = 'transaction-person';
        const isOtherPerson = transaction.forWhom === 'others' && transaction.personName;
        personCell.textContent = isOtherPerson ? transaction.personName : 'Myself';

        // 5. Amount column
        const amountCell = document.createElement('td');
        amountCell.className = 'transaction-amount';
        if (transaction.type) {
            amountCell.classList.add(transaction.type);
        }
        amountCell.textContent = formatCurrency(transaction.amount);

        if (transaction.moneyReturned) {
            amountCell.style.textDecoration = 'line-through';
            amountCell.style.opacity = '0.7';
        }

        // 6. Actions column
        const actionsCell = document.createElement('td');
        actionsCell.className = 'transaction-actions';

        const editButton = document.createElement('button');
        // For the edit button
        editButton.className = 'edit-btn';
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.setAttribute('aria-label', 'Edit transaction');
        editButton.style.backgroundColor = 'transparent';
        editButton.style.border = 'none';
        editButton.style.color = '#4a90e2'; // Blue color
        editButton.style.padding = '5px 8px';
        editButton.style.borderRadius = '3px';
        editButton.style.cursor = 'pointer';
        editButton.style.marginRight = '8px';
        editButton.addEventListener('mouseover', () => {
            editButton.style.color = '#2a70c2'; // Darker blue on hover
            editButton.style.backgroundColor = '#f0f0f0';
        });
        editButton.addEventListener('mouseout', () => {
            editButton.style.color = '#4a90e2';
            editButton.style.backgroundColor = 'transparent';
        });
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            editTransaction(transaction.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.setAttribute('aria-label', 'Delete transaction');
        deleteButton.style.backgroundColor = 'transparent';
        deleteButton.style.border = 'none';
        deleteButton.style.color = '#e74c3c'; // Red color
        deleteButton.style.padding = '5px 8px';
        deleteButton.style.borderRadius = '3px';
        deleteButton.style.cursor = 'pointer';
        deleteButton.addEventListener('mouseover', () => {
            deleteButton.style.color = '#c0392b'; // Darker red on hover
            deleteButton.style.backgroundColor = '#f0f0f0';
        });
        deleteButton.addEventListener('mouseout', () => {
            deleteButton.style.color = '#e74c3c';
            deleteButton.style.backgroundColor = 'transparent';
        });
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTransaction(transaction.id);
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        // Append all cells to the row in the correct order
        row.appendChild(descriptionCell);
        row.appendChild(categoryCell);
        row.appendChild(dateCell);
        row.appendChild(personCell);
        row.appendChild(amountCell);
        row.appendChild(actionsCell);

        // Append the row to the transactions list
        transactionsList.appendChild(row);
    });
}

// Add "See More" button to load more transactions
function addSeeMoreButton(filteredTransactions, currentPage) {
    const seeMoreRow = document.createElement('tr');
    seeMoreRow.id = 'see-more-row';

    const seeMoreCell = document.createElement('td');
    seeMoreCell.colSpan = 6; // Exactly 6 columns
    seeMoreCell.className = 'see-more-cell';

    const seeMoreButton = document.createElement('button');
    seeMoreButton.textContent = 'See More';
    seeMoreButton.className = 'see-more-btn';
    seeMoreButton.addEventListener('click', () => {
        // Increment page and re-render
        transactionsList.dataset.page = currentPage + 1;
        renderTransactions();
    });

    seeMoreCell.appendChild(seeMoreButton);
    seeMoreRow.appendChild(seeMoreCell);
    transactionsList.appendChild(seeMoreRow);
}

// Add "See Less" button to go back to previous page
function addSeeLessButton(filteredTransactions, currentPage) {
    const seeLessRow = document.createElement('tr');
    seeLessRow.id = 'see-more-row';

    const seeLessCell = document.createElement('td');
    seeLessCell.colSpan = 6; // Exactly 6 columns
    seeLessCell.className = 'see-more-cell';

    const seeLessButton = document.createElement('button');
    seeLessButton.textContent = 'See Less';
    seeLessButton.className = 'see-more-btn';
    seeLessButton.addEventListener('click', () => {
        // Decrement page and re-render
        transactionsList.dataset.page = currentPage - 1;
        renderTransactions();
    });

    seeLessCell.appendChild(seeLessButton);
    seeLessRow.appendChild(seeLessCell);
    transactionsList.appendChild(seeLessRow);
}

// Format time (HH:MM) to 12-hour format
function formatTime(timeString) {
    if (!timeString) return '';

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minutes} ${period}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Edit transaction
// Modify editTransaction function to handle the money returned checkbox
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    editingTransactionId = id;

    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    typeInput.value = transaction.type;

    // Populate categories based on type
    populateCategoryDropdown();

    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;
    timeInput.value = transaction.time || '';
    forWhomInput.value = transaction.forWhom || 'myself';

    // Handle person name field
    if (transaction.forWhom === 'others') {
        personNameGroup.style.display = 'block';
        personNameInput.value = transaction.personName || '';
        personNameInput.required = true;

        // Show money returned checkbox for expenses
        if (transaction.type === 'expense') {
            const moneyReturnedGroup = document.getElementById('money-returned-group');
            moneyReturnedGroup.style.display = 'block';

            // Set the checkbox state
            const moneyReturnedInput = document.getElementById('money-returned');
            moneyReturnedInput.checked = transaction.moneyReturned || false;
        }
    } else {
        personNameGroup.style.display = 'none';
        personNameInput.required = false;

        // Hide money returned checkbox
        const moneyReturnedGroup = document.getElementById('money-returned-group');
        moneyReturnedGroup.style.display = 'none';
    }

    // Scroll to the form
    transactionForm.scrollIntoView({ behavior: 'smooth' });

    // Change button text
    submitBtn.textContent = 'Update Transaction';
    cancelBtn.style.display = 'inline-block';
}

// Delete transaction
function deleteTransaction(id) {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions.splice(index, 1);
        saveTransactions();
        updateSummary();
        renderTransactions();
        renderExpenseChart();
        renderTransactionSummary();
        showToast('Transaction deleted successfully', 'success');
    }
}

// Format date for input field
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Add sample data
function addSampleData() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const fourDaysAgo = new Date(today);
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    const sampleTransactions = [
        {
            id: generateId(),
            description: 'Salary',
            amount: 3000,
            type: 'income',
            category: 'Salary',
            date: formatDateForInput(today),
            time: '09:00',
            forWhom: 'myself',
            personName: '',
            timestamp: today.getTime()
        },
        {
            id: generateId(),
            description: 'Groceries',
            amount: 120.50,
            type: 'expense',
            category: 'Food & Dining',
            date: formatDateForInput(yesterday),
            time: '14:30',
            forWhom: 'myself',
            personName: '',
            timestamp: yesterday.getTime()
        },
        {
            id: generateId(),
            description: 'Rent',
            amount: 1200,
            type: 'expense',
            category: 'Housing',
            date: formatDateForInput(yesterday),
            time: '10:00',
            forWhom: 'myself',
            personName: '',
            timestamp: yesterday.getTime()
        },
        {
            id: generateId(),
            description: 'Electricity Bill',
            amount: 85.75,
            type: 'expense',
            category: 'Utilities',
            date: formatDateForInput(twoDaysAgo),
            time: '16:45',
            forWhom: 'myself',
            personName: '',
            timestamp: twoDaysAgo.getTime()
        },
        {
            id: generateId(),
            description: 'Freelance Work',
            amount: 650,
            type: 'income',
            category: 'Freelance',
            date: formatDateForInput(twoDaysAgo),
            time: '11:15',
            forWhom: 'myself',
            personName: '',
            timestamp: twoDaysAgo.getTime()
        },
        {
            id: generateId(),
            description: 'Birthday Gift',
            amount: 50,
            type: 'expense',
            category: 'Gifts & Donations',
            date: formatDateForInput(threeDaysAgo),
            time: '13:00',
            forWhom: 'others',
            personName: 'Sarah',
            timestamp: threeDaysAgo.getTime()
        },
        {
            id: generateId(),
            description: 'Dinner',
            amount: 78.50,
            type: 'expense',
            category: 'Food & Dining',
            date: formatDateForInput(threeDaysAgo),
            time: '19:30',
            forWhom: 'others',
            personName: 'Family',
            timestamp: threeDaysAgo.getTime()
        },
        {
            id: generateId(),
            description: 'Gas',
            amount: 45.20,
            type: 'expense',
            category: 'Transportation',
            date: formatDateForInput(fourDaysAgo),
            time: '12:00',
            forWhom: 'myself',
            personName: '',
            timestamp: fourDaysAgo.getTime()
        },
        {
            id: generateId(),
            description: 'Phone Bill',
            amount: 65,
            type: 'expense',
            category: 'Utilities',
            date: formatDateForInput(fourDaysAgo),
            time: '10:30',
            forWhom: 'myself',
            personName: '',
            timestamp: fourDaysAgo.getTime()
        }
    ];

    transactions = [...transactions, ...sampleTransactions];
    saveTransactions();
    updateSummary();
    renderTransactions();
    renderExpenseChart();
    renderTransactionSummary();
    showToast('Sample data added successfully', 'success');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon;
    if (type === 'success') {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="toast-icon" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>';
    } else {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="toast-icon" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/></svg>';
    }

    toast.innerHTML = `
        ${icon}
        <div class="toast-message">${message}</div>
        <button class="toast-close">×</button>
    `;

    toastContainer.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Add function to modify renderExpenseChart to exclude returned money
function renderExpenseChart() {
    const ctx = document.getElementById('expense-chart').getContext('2d');

    // Calculate expenses by category
    const expensesByCategory = {};

    transactions.forEach(transaction => {
        // Skip transactions where money has been returned
        if (transaction.moneyReturned) {
            return;
        }

        if (transaction.type === 'expense') {
            if (!expensesByCategory[transaction.category]) {
                expensesByCategory[transaction.category] = 0;
            }
            expensesByCategory[transaction.category] += transaction.amount;
        }
    });

    // Create data for the chart
    const labels = Object.keys(expensesByCategory);
    const data = Object.values(expensesByCategory);

    // Generate colors
    const colors = labels.map((_, index) => {
        const hue = (index * 137.5) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    });

    // Destroy previous chart if it exists
    if (window.expenseChart) {
        window.expenseChart.destroy();
    }

    // Create new chart
    window.expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });
}

// Get expense data for chart
function getExpenseChartData() {
    const expensesByCategory = {};

    // Group expenses by category
    transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            if (!expensesByCategory[transaction.category]) {
                expensesByCategory[transaction.category] = 0;
            }
            expensesByCategory[transaction.category] += transaction.amount;
        }
    });

    // Convert to arrays for chart
    const labels = Object.keys(expensesByCategory);
    const values = Object.values(expensesByCategory);

    return { labels, values };
}

// Initialize the app
document.addEventListener('DOMContentLoaded', initApp);