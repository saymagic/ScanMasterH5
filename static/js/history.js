$(document).ready(function() {
    let currentPage = 1;
    let currentSearch = '';
    let currentType = '';
    let currentFavorite = '';
    let currentPerPage = 10;

    // Initialize the page
    loadQRCodes();

    // Search input handling with debounce
    $('#search-input').on('input', _.debounce(function() {
        currentSearch = $(this).val();
        currentPage = 1;
        loadQRCodes();
    }, 300));

    // Filter handling
    $('#type-filter, #favorite-filter, #per-page').change(function() {
        currentType = $('#type-filter').val();
        currentFavorite = $('#favorite-filter').val();
        currentPerPage = $('#per-page').val();
        currentPage = 1;
        loadQRCodes();
    });

    // Pagination handling
    $('#prev-page').click(function() {
        if ($(this).prop('disabled')) return;
        currentPage--;
        loadQRCodes();
    });

    $('#next-page').click(function() {
        if ($(this).prop('disabled')) return;
        currentPage++;
        loadQRCodes();
    });

    function loadQRCodes() {
        showLoading();

        try {
            // Get QR codes from localStorage
            let items = JSON.parse(localStorage.getItem('qrCodes') || '[]');

            // Apply filters
            if (currentSearch) {
                items = items.filter(item =>
                    item.content.toLowerCase().includes(currentSearch.toLowerCase()) ||
                    item.type.toLowerCase().includes(currentSearch.toLowerCase())
                );
            }

            if (currentType) {
                items = items.filter(item => item.type === currentType);
            }

            if (currentFavorite !== '') {
                items = items.filter(item => item.is_favorite === (currentFavorite === 'true'));
            }

            // Calculate pagination
            const total = items.length;
            const totalPages = Math.ceil(total / currentPerPage);
            const start = (currentPage - 1) * currentPerPage;
            const end = start + currentPerPage;
            const pageItems = items.slice(start, end);

            updateTable(pageItems);
            updatePagination({
                items: pageItems,
                total: total,
                pages: totalPages,
                current_page: currentPage
            });
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            alert('Failed to load QR codes');
        }

        hideLoading();
    }

    function updateTable(items) {
        const $list = $('#qr-list');
        $list.empty();

        if (items.length === 0) {
            $('#empty-state').removeClass('hidden');
            $('#pagination').addClass('hidden');
            return;
        }

        $('#empty-state').addClass('hidden');
        $('#pagination').removeClass('hidden');

        items.forEach(function(item) {
            const row = $(`
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="text-sm text-gray-900 truncate max-w-md" title="${item.content}">
                                ${item.content}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${item.type === 'scanned' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                            ${item.type}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${new Date(item.created_at).toLocaleString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex items-center space-x-3">
                            <button class="favorite-btn text-gray-400 hover:text-yellow-500 transition-colors"
                                    data-id="${item.id}" data-favorite="${item.is_favorite}">
                                <svg class="w-5 h-5 ${item.is_favorite ? 'text-yellow-500' : ''}" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                </svg>
                            </button>
                            <button class="delete-btn text-gray-400 hover:text-red-500 transition-colors" data-id="${item.id}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `);
            $list.append(row);
        });

        // Bind action buttons
        bindActionButtons();
    }

    function updatePagination(response) {
        const start = (currentPage - 1) * currentPerPage + 1;
        const end = Math.min(start + currentPerPage - 1, response.total);

        $('#showing-start').text(start);
        $('#showing-end').text(end);
        $('#total-items').text(response.total);

        $('#prev-page').prop('disabled', currentPage === 1);
        $('#next-page').prop('disabled', currentPage === response.pages);
    }

    function bindActionButtons() {
    // Favorite button
    $('.favorite-btn').click(function() {
        const $btn = $(this);
        const id = $btn.data('id');

        try {
            // Get QR codes from localStorage
            const codes = JSON.parse(localStorage.getItem('qrCodes') || '[]');

            // Find and update the specific code
            const codeIndex = codes.findIndex(code => code.id === id);
            if (codeIndex !== -1) {
                codes[codeIndex].is_favorite = !codes[codeIndex].is_favorite;

                // Update localStorage
                localStorage.setItem('qrCodes', JSON.stringify(codes));

                // Update UI
                const $icon = $btn.find('svg');
                if (codes[codeIndex].is_favorite) {
                    $icon.addClass('text-yellow-500');
                } else {
                    $icon.removeClass('text-yellow-500');
                }
                $btn.data('favorite', codes[codeIndex].is_favorite);
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
            alert('Failed to update favorite status');
        }
    });

    // Delete button
    $('.delete-btn').click(function() {
        const id = $(this).data('id');
        if (confirm('Are you sure you want to delete this QR code?')) {
            try {
                // Get QR codes from localStorage
                const codes = JSON.parse(localStorage.getItem('qrCodes') || '[]');

                // Filter out the deleted code
                const updatedCodes = codes.filter(code => code.id !== id);

                // Update localStorage
                localStorage.setItem('qrCodes', JSON.stringify(updatedCodes));

                // Reload the table
                loadQRCodes();
            } catch (error) {
                console.error('Error deleting code:', error);
                alert('Failed to delete QR code');
            }
        }
    });
    }

    function showLoading() {
        $('#loading-indicator').removeClass('hidden');
        $('#qr-list').addClass('opacity-50');
    }

    function hideLoading() {
        $('#loading-indicator').addClass('hidden');
        $('#qr-list').removeClass('opacity-50');
    }
});
