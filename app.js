// Select the form, input, and list elements from the HTML
const form = document.querySelector('form');
const input = document.querySelector('#new-item');
const priorityInput = document.querySelector('#priority');
const sortBtn = document.querySelector('#sort-btn');
const itemsList = document.querySelector('#items');

// Load items from local storage, or create an empty array if there are none
let items = JSON.parse(localStorage.getItem('items')) || [];

// Display the items in the list
function displayItems() {
  if (items.length === 0) {
    itemsList.innerHTML = '<p class="empty-msg">No tasks yet — add one above!</p>';
    return;
  }

  const itemsHTML = items.map((item, index) => {
    const priority = item.priority;
    const done = item.done;

    // Colour based on priority and done status:
    // done = green, priority 5 = red ... priority 1 = light blue
    const hue = done ? 120 : 60 + 48 * (5 - priority);
    const background = `hsl(${hue}, 70%, 85%)`;

    return `
      <li style="background-color: ${background}" draggable="true" data-index="${index}">
        <input type="checkbox" class="item-done" ${done ? 'checked' : ''}>
        <span class="item-text ${done ? 'done' : ''}">${item.text}</span>
        <span class="item-priority">${priority}</span>
        <button class="delete-btn">Delete</button>
      </li>
    `;
  });

  itemsList.innerHTML = itemsHTML.join('');

  // Attach drag & drop listeners to each list item
  const listItems = itemsList.querySelectorAll('li');
  listItems.forEach((li) => {
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);
  });
}

// Add a new item to the list
function addItem(e) {
  e.preventDefault();

  const text = input.value.trim();
  const priority = Number(priorityInput.value.trim());
  const done = false;

  if (text.length && priority >= 1 && priority <= 5) {
    items.push({ text, priority, done });
    localStorage.setItem('items', JSON.stringify(items));

    input.value = '';
    priorityInput.value = '';
    input.focus();

    displayItems();
  }
}

// Sort items by priority (highest priority first)
function sortItems() {
  items.sort((a, b) => a.priority - b.priority);
  displayItems();
}

// Drag & drop handlers
function handleDragStart(e) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', e.target.dataset.index);
  e.target.classList.add('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const target = e.target.closest('li');
  const dragging = itemsList.querySelector('.dragging');

  if (target && target !== dragging) {
    const targetRect = target.getBoundingClientRect();

    if (e.clientY - targetRect.top < targetRect.height / 2) {
      itemsList.insertBefore(dragging, target);
    } else {
      itemsList.insertBefore(dragging, target.nextSibling);
    }

    // Rebuild the items array to match the new DOM order
    const newItems = Array.from(itemsList.querySelectorAll('li')).map((li) => ({
      text: li.querySelector('.item-text').textContent,
      priority: Number(li.querySelector('.item-priority').textContent),
      done: li.querySelector('.item-done').checked
    }));

    items = newItems;
    localStorage.setItem('items', JSON.stringify(items));
  }
}

function handleDrop(e) {
  e.preventDefault();
  itemsList.querySelectorAll('.dragging').forEach((el) => el.classList.remove('dragging'));
  displayItems();
}

// Event listeners
form.addEventListener('submit', addItem);
sortBtn.addEventListener('click', sortItems);

// Delete button click (delegated)
itemsList.addEventListener('click', (e) => {
  if (e.target.matches('.delete-btn')) {
    const index = e.target.parentElement.dataset.index;
    items.splice(index, 1);
    localStorage.setItem('items', JSON.stringify(items));
    displayItems();
  }
});

// Checkbox change (delegated)
itemsList.addEventListener('change', (e) => {
  if (e.target.matches('.item-done')) {
    const index = e.target.parentElement.dataset.index;
    items[index].done = e.target.checked;
    localStorage.setItem('items', JSON.stringify(items));
    displayItems();
  }
});

// Display the items on page load
displayItems();
