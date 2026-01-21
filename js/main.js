let stockData = [];
let currentPage = 1;
let rowsPerPage = 25;

const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search');
const rowsSelect = document.querySelector('select.form-select');
const paginationContainer = document.querySelector('.flex.items-center.gap-1');

function normalize(str = '') {
    return str.toLowerCase().replace(/[\s\-\.,]/g, '');
}

const API_URL = 'https://melonie-intersociety-unfaintly.ngrok-free.dev/api/stock';

async function fetchInitialStock() {
    try {
        console.log('🔄 Cargando datos desde:', API_URL);

        const res = await fetch(API_URL, {
            credentials: 'include' // ✅ correcto (si usas cookies / auth)
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

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="p-8 text-center text-red-600">
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

        if (item.stock > 2) {
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
        <tr class="hover:bg-gray-50 dark:hover:bg-[#202e3b] transition-colors">
            <td class="p-4"><input type="checkbox" /></td>

            <td class="p-4">
                <div class="flex flex-col">
                    <span class="font-semibold text-sm">${item.product}</span>
                    <span class="text-xs text-gray-500">SKU: ${item.sku}</span>
                    ${item.oems?.length ? `
                        <span class="text-[11px] text-gray-400">
                            OEM: ${item.oems[0]}
                            ${item.oems.length > 1 ? `(+${item.oems.length - 1})` : ''}
                        </span>
                    ` : ''}
                </div>
            </td>

            <td class="p-4">
                <div class="inline-flex items-center gap-2 px-2 py-1 rounded-full border ${bgColor} ${borderColor}">
                    <div class="w-1.5 h-1.5 rounded-full ${dotColor}"></div>
                    <span class="text-xs ${textColor}">${label}</span>
                </div>
            </td>

            <td class="p-4">
                <div class="inline-flex items-center gap-2 px-2 py-1 rounded-full border ${item.stock_es > 2 ? 'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-500' : item.stock_es > 0 ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500 dark:border-yellow-500' : 'bg-red-50 dark:bg-red-900/30 border-red-500 dark:border-red-500'}">
                    <div class="w-1.5 h-1.5 rounded-full ${item.stock_es > 2 ? 'bg-green-500' : item.stock_es > 0 ? 'bg-yellow-500' : 'bg-red-500'}"></div>
                    <span class="text-xs ${item.stock_es > 2 ? 'text-green-700 dark:text-green-300' : item.stock_es > 0 ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300'}">${item.stock_es > 2 ? 'Disponibilità' : item.stock_es > 0 ? 'Scorte basse' : 'Esaurito'}</span>
                </div>
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
        const value = normalize(e.target.value);

        const filtered = stockData.filter(item =>
            normalize(item.sku).includes(value) ||
            (item.oems || []).some(o => normalize(o).includes(value)) ||
            (item._cross || []).some(c => normalize(c).includes(value))
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
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        paginationContainer.innerHTML += `
            <button onclick="changePage(${i})"
              class="${i === currentPage ? 'bg-primary text-white' : ''}">
              ${i}
            </button>
        `;
    }
}

function changePage(page) {
    currentPage = page;
    renderTable();
}

// 🚀 Iniciar
fetchInitialStock();
