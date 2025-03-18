// DOM elements for authentication
const whenSignedIn = document.getElementById('when-signed-in');
const whenSignedOut = document.getElementById('when-signed-out');
const userDetails = document.getElementById('user-details');
const signInBtn = document.getElementById('sign-in');
const signOutBtn = document.getElementById('sign-out');

// Global auth variable
let currentUser = null;

// Sign in event handlers
signInBtn.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => auth.signOut();

// Auth state observer
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in
    currentUser = user;
    whenSignedIn.style.display = 'block';
    whenSignedOut.style.display = 'none';
    userDetails.innerHTML = `<p>Hello, ${user.displayName}!</p>`;
    
    // Initialize the app with user's transactions
    init();
  } else {
    // User is signed out
    currentUser = null;
    whenSignedIn.style.display = 'none';
    whenSignedOut.style.display = 'block';
    userDetails.innerHTML = '';
    
    // Show message that user needs to sign in
    list.innerHTML = '<p class="no-transactions">Please sign in to view your transactions</p>';
    balance.innerText = '$0.00';
    money_plus.innerText = '$0.00';
    money_minus.innerText = '$0.00';
  }
});