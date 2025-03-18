// DOM Elements
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');

// Get transactions from Firebase
async function getTransactions() {
  if (!currentUser) return [];
  
  const transactions = [];
  try {
    // Query transactions for current user
    const snapshot = await db.collection('transactions')
                            .where('userId', '==', currentUser.uid)
                            .orderBy('timestamp', 'desc')
                            .get();
    
    snapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        text: doc.data().text,
        amount: doc.data().amount
      });
    });
    return transactions;
  } catch (error) {
    console.error("Error getting transactions: ", error);
    return [];
  }
}

// Add transaction to Firebase
async function addTransaction(transaction) {
  if (!currentUser) {
    alert("Please sign in to add transactions");
    return;
  }
  
  try {
    // Add document to Firestore
    await db.collection('transactions').add({
      text: transaction.text,
      amount: transaction.amount,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userId: currentUser.uid
    });
    
    // Refresh the UI
    init();
  } catch (error) {
    console.error("Error adding transaction: ", error);
    alert("Error adding transaction. Please try again.");
  }
}

// Remove transaction from Firebase
async function removeTransaction(id) {
  if (!currentUser) return;
  
  try {
    // Delete document from Firestore
    await db.collection('transactions').doc(id).delete();
    
    // Refresh the UI
    init();
  } catch (error) {
    console.error("Error removing transaction: ", error);
    alert("Error removing transaction. Please try again.");
  }
}

// Add transaction to DOM
function addTransactionDOM(transaction) {
  // Create list item
  const item = document.createElement('li');
  
  // Add class based on value
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  
  item.innerHTML = `
    ${transaction.text} <span>${transaction.amount < 0 ? '-' : '+'}$${Math.abs(
    transaction.amount
  ).toFixed(2)}</span>
    <button class="delete-btn" onclick="removeTransaction('${transaction.id}')">x</button>
  `;
  
  list.appendChild(item);
}

// Update the values
function updateValues(transactions) {
  const amounts = transactions.map(transaction => transaction.amount);
  
  const total = amounts.length > 0 
    ? amounts.reduce((acc, item) => (acc += item), 0).toFixed(2)
    : '0.00';
  
  const income = amounts.length > 0
    ? amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2)
    : '0.00';
  
  const expense = amounts.length > 0
    ? (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2)
    : '0.00';
  
  balance.innerText = `$${total}`;
  money_plus.innerText = `$${income}`;
  money_minus.innerText = `$${expense}`;
}

// Initialize app
async function init() {
  if (!currentUser) return;
  
  list.innerHTML = '';
  
  try {
    const transactions = await getTransactions();
    
    if (transactions.length === 0) {
      // If no transactions, show a message
      list.innerHTML = '<p class="no-transactions">No transactions yet. Add one!</p>';
    } else {
      transactions.forEach(addTransactionDOM);
    }
    
    updateValues(transactions);
  } catch (error) {
    console.error("Error initializing: ", error);
    list.innerHTML = '<p class="error">Error loading transactions</p>';
  }
}

// Event listeners
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  if (!currentUser) {
    alert("Please sign in to add transactions");
    return;
  }
  
  if(text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a text and amount');
    return;
  }
  
  const transaction = {
    text: text.value,
    amount: +amount.value
  };
  
  await addTransaction(transaction);
  
  text.value = '';
  amount.value = '';
});