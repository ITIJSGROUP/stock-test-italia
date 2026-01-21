let stockData = [];
let currentPage = 1;
let rowsPerPage = 25;

const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search');
const rowsSelect = document.querySelector('select.form-select');
const paginationContainer = document.querySelector('.flex.items-center.gap-1');

function normalize(str) {
    return str.toLowerCase().replace(/[\s\-\.,]/g, '');
}

// 🔥 ACTUALIZA ESTA URL CON TU NUEVA URL DE NGROK
const API_URL = 'https://melonie-intersociety-unfaintly.ngrok-free.dev/api/stock';

async function fetchInitialStock() {
    try {
        console.log('🔄 Cargando datos desde:', API_URL);

        const res = await fetch(API_URL, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        stockData = await res.json();
        console.log('✅ Datos cargados:', stockData.length, 'productos');

        renderTable();
        setupSearch();
        setupRowsPerPage();
    } catch (err) {
        console.error('❌ Error al cargar stock:', err);
        alert('Error al cargar datos del servidor. Revisa la consola (F12) para más detalles.');
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="p-8 text-center text-red-600">
                    <span class="material-symbols-outlined text-5xl mb-2">error</span>
                    <p class="font-semibold">Error al cargar los datos</p>
                    <p class="text-sm text-gray-500 mt-2">${err.message}</p>
                </td>
            </tr>
        `;
    }
}

function renderTable(filteredData = null) {
    const data = filteredData || stockData;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = data.slice(start, end);

    let html = '';

    pageData.forEach(item => {
        let bgColor, dotColor, textColor, label, borderColor;

        if (item.stock > 50) {
            label = 'Disponibilità';
            bgColor = 'bg-green-50 dark:bg-green-900/30';
            dotColor = 'bg-green-500';
            textColor = 'text-green-700 dark:text-green-300';
            borderColor = 'border-green-500 dark:border-green-500';
        } else if (item.stock > 0) {
            label = 'Scorte basse';
            bgColor = 'bg-yellow-50 dark:bg-yellow-900/30';
            dotColor = 'bg-yellow-500';
            textColor = 'text-yellow-700 dark:text-yellow-300';
            borderColor = 'border-yellow-500 dark:border-yellow-500';
        } else {
            label = 'Esaurito';
            bgColor = 'bg-red-50 dark:bg-red-900/30';
            dotColor = 'bg-red-500';
            textColor = 'text-red-700 dark:text-red-300';
            borderColor = 'border-red-500 dark:border-red-500';
        }

        html += `
        <tr class="hover:bg-gray-50 dark:hover:bg-[#202e3b] group/row transition-colors">
        <td class="p-4 align-middle">
            <input class="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" type="checkbox" />
        </td>
        <td class="p-4 align-middle">
            <div class="flex flex-col">
            <span class="text-[#111418] dark:text-white font-semibold text-sm">${item.product}</span>
            <span class="text-[#617589] dark:text-[#9ca3af] text-xs">SKU: ${item.sku}</span>
            
            ${item.oems?.length ? `
            <span class="text-[11px] text-[#9ca3af] mt-0.5">
                OEM: ${item.oems[0]}
                ${item.oems.length > 1 ? ` <span class="opacity-60">(+${item.oems.length - 1})</span>` : ''}
            </span>
` : ''}

            </div>
        </td>
        <td class="p-4 align-middle">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border ${bgColor} ${borderColor}">
            <div class="w-1.5 h-1.5 rounded-full ${dotColor}"></div>
            <span class="text-xs font-medium ${textColor}">${label}</span>
            </div>
        </td>
        <td class="p-4 align-middle text-right">
            <button class="text-gray-400 hover:text-primary transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <span class="material-symbols-outlined">more_vert</span>
            </button>
        </td>
        </tr>
        `;
    });

    tableBody.innerHTML = html;
    renderPagination(data.length);
}

function setupSearch() {
    searchInput.addEventListener('input', e => {
        currentPage = 1;
        const value = e.target.value.toLowerCase();
        const filtered = stockData.filter(item =>
            normalize(item.sku).includes(normalize(value)) ||
            item.oems.some(o => normalize(o).includes(normalize(value))) ||
            item._cross.some(c => normalize(c).includes(normalize(value)))
        );
        renderTable(filtered);
    });
}

function setupRowsPerPage() {
    rowsSelect.addEventListener('change', e => {
        rowsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderTable();
    });
}

function renderPagination(totalRows) {
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const container = paginationContainer;
    container.innerHTML = '';

    container.innerHTML += `
    <button class="h-8 w-8 flex items-center justify-center rounded text-[#617589] dark:text-[#9ca3af] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      ${currentPage === 1 ? 'disabled' : ''}
      onclick="changePage(${currentPage - 1})">
      <span class="material-symbols-outlined text-lg">chevron_left</span>
    </button>
  `;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
        container.innerHTML += `
      <button onclick="changePage(${i})"
        class="h-8 w-8 flex items-center justify-center rounded text-sm font-medium
        ${i === currentPage ? 'bg-primary text-white' : 'text-[#111418] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}">
        ${i}
      </button>
    `;
    }

    container.innerHTML += `
    <button class="h-8 w-8 flex items-center justify-center rounded text-[#617589] dark:text-[#9ca3af] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      ${currentPage === totalPages ? 'disabled' : ''}
      onclick="changePage(${currentPage + 1})">
      <span class="material-symbols-outlined text-lg">chevron_right</span>
    </button>
  `;
}

function changePage(page) {
    currentPage = page;
    renderTable();
}

// Iniciar
fetchInitialStock();