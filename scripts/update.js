function loadRegistryItems() {
  fetch('https://opensheet.elk.sh/1UWfSXlzDZIm6w55ADkyL7byiTJo8LhDAmh9oFLMTi70/Sheet1')
    .then(res => res.json())
    .then(data => {
      const categories = {
  "Activity and Gear": document.querySelectorAll('.registry')[0],
  "Baby Clothing": document.querySelectorAll('.registry')[1],
  "Bathing": document.querySelectorAll('.registry')[2],
  "Diapering": document.querySelectorAll('.registry')[3],
  "Feeding": document.querySelectorAll('.registry')[4],
  "Gifts": document.querySelectorAll('.registry')[5],
  "Health & Baby Care": document.querySelectorAll('.registry')[6],
  "Nursery Bedding & Essentials": document.querySelectorAll('.registry')[7],
  "Nursery Furniture": document.querySelectorAll('.registry')[8],
  "Nursing": document.querySelectorAll('.registry')[9],
  "Toys and Books": document.querySelectorAll('.registry')[10],
  "Other": document.querySelectorAll('.registry')[11]
};

      // Clear all registry sections
      Object.values(categories).forEach(section => section.innerHTML = '');

      data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item';
        const isPurchased = item.Purchased.toLowerCase() === 'true';

        card.innerHTML = `
          <img src="${item.Image}" alt="${item['Item Name']}">
          <p>${item['Item Name']}</p>
          <p>${item.Price}</p>
          ${
            isPurchased
              ? '<span class="badge">✔️ Purchased</span>'
              : `<a href="${item.Link}" target="_blank">View & Buy via Amazon</a>`
          }
        `;

        const category = item.Category;
        if (category && categories[category]) {
          categories[category].appendChild(card);
        }
      });
    });
}

document.addEventListener('DOMContentLoaded', loadRegistryItems);
