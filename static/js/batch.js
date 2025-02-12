$(document).ready(function() {
    let csvData = null;
    let generatedResults = null;

    // File upload handling
    $('#csv-input').change(function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            alert('Please upload a CSV file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        $.ajax({
            url: '/batch/upload',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                csvData = response;
                showPreview(response);
                $('#options-section, #generate-btn').removeClass('hidden');
            },
            error: function(xhr) {
                alert(xhr.responseJSON?.error || 'Failed to upload file');
            }
        });
    });

    // Show preview of CSV data
    function showPreview(data) {
        $('#preview-section').removeClass('hidden');
        $('#total-rows').text(data.count);

        // Headers
        const $headers = $('#preview-headers');
        $headers.empty();
        Object.keys(data.preview[0]).forEach(key => {
            $headers.append(`<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${key}</th>`);
        });

        // Preview data
        const $previewData = $('#preview-data');
        $previewData.empty();
        data.preview.forEach(row => {
            const $tr = $('<tr class="hover:bg-gray-50">');
            Object.values(row).forEach(value => {
                $tr.append(`<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${value}</td>`);
            });
            $previewData.append($tr);
        });
    }

    // Generate QR codes
    $('#generate-btn').click(function() {
        if (!csvData) return;

        $('#progress-section').removeClass('hidden');
        $('#generate-btn').prop('disabled', true);

        const batchSize = 10;
        const totalBatches = Math.ceil(csvData.count / batchSize);
        let currentBatch = 0;
        generatedResults = [];

        function processBatch() {
            const start = currentBatch * batchSize;
            const end = Math.min(start + batchSize, csvData.count);
            const progress = (currentBatch / totalBatches) * 100;

            updateProgress(progress);

            if (start >= csvData.count) {
                // All batches processed
                $('#generate-btn').prop('disabled', false);
                $('#download-btn').removeClass('hidden');
                showResults(generatedResults);
                return;
            }

            $.ajax({
                url: '/batch/generate',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    data: csvData.preview.slice(start, end)
                }),
                success: function(response) {
                    generatedResults = generatedResults.concat(response.results);
                    currentBatch++;
                    processBatch();
                },
                error: function(xhr) {
                    alert(xhr.responseJSON?.error || 'Generation failed');
                    $('#generate-btn').prop('disabled', false);
                }
            });
        }

        processBatch();
    });

    // Update progress bar
    function updateProgress(percentage) {
        const progress = Math.round(percentage);
        $('#progress-bar').css('width', `${progress}%`);
        $('#progress-text').text(`${progress}%`);
    }

    // Show generated results
    function showResults(results) {
        $('#results-section').removeClass('hidden');
        const $grid = $('#results-grid');
        $grid.empty();

        results.forEach((result, index) => {
            $grid.append(`
                <div class="bg-white p-4 rounded-lg shadow">
                    <img src="${result.image}" alt="QR Code ${index + 1}" class="w-full">
                    <p class="mt-2 text-sm text-gray-600 truncate" title="${result.content}">
                        ${result.content}
                    </p>
                </div>
            `);
        });
    }

    // Download all QR codes
    $('#download-btn').click(function() {
        if (!generatedResults) return;

        $.ajax({
            url: '/batch/download',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ data: generatedResults }),
            xhrFields: {
                responseType: 'blob'
            },
            success: function(blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'qrcodes.zip';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            },
            error: function() {
                alert('Failed to download QR codes');
            }
        });
    });

    // Drag and drop handling
    const dropZone = document.querySelector('.border-dashed');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-orange-500');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-orange-500');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-orange-500');

        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            const input = document.getElementById('csv-input');
            input.files = e.dataTransfer.files;
            $(input).change();
        } else {
            alert('Please upload a CSV file');
        }
    });
});
