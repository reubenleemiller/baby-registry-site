const total = 346.49;
let current = 0;

function updateProgress() {
  const percent = Math.min((current / total) * 100, 100);
  document.getElementById('progressBar').style.width = percent + '%';
  document.getElementById('amountText').textContent = `$${current.toFixed(2)} of $${total} goal`;
}

function handleDonate(method) {
  const input = document.getElementById('donationAmount');
  const contribution = parseFloat(input.value);
  if (isNaN(contribution) || contribution <= 0) {
    alert('Please enter a valid donation amount.');
    return;
  }

  setTimeout(() => {
    current += contribution;
    updateProgress();
    alert(`Thank you for contributing $${contribution.toFixed(2)} via ${method.charAt(0).toUpperCase() + method.slice(1)}!`);
    input.value = '';
  }, 1000);
}

updateProgress();
