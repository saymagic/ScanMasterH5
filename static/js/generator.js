$(document).ready(function() {
    let currentType = 'text';
    let previewDebounce = _.debounce(updatePreview, 500);

    // Content type switching
    $('.content-type-btn').click(function() {
        const type = $(this).data('type');
        switchContentType(type);
    });

    function switchContentType(type) {
        currentType = type;
        $('.content-type-btn').removeClass('bg-green-500 text-white').addClass('bg-gray-200 text-gray-700');
        $(`.content-type-btn[data-type="${type}"]`).removeClass('bg-gray-200 text-gray-700').addClass('bg-green-500 text-white');
        $('.content-form').addClass('hidden');
        $(`#${type}-form`).removeClass('hidden');
        clearPreview();
    }

    // Form input handling
    $('.content-form input, .content-form textarea').on('input', function() {
        previewDebounce();
    });

    // Size slider
    $('#size-slider').on('input', function() {
        updatePreview();
    });

    function getFormContent() {
        let content = '';
        let name, phone, email, org, ssid, password, security;

        switch (currentType) {
            case 'text':
                content = $('#text-form textarea').val();
                break;
            case 'url':
                content = $('#url-form input').val();
                break;
            case 'contact':
                name = $('#contact-form input[placeholder="John Doe"]').val();
                phone = $('#contact-form input[type="tel"]').val();
                email = $('#contact-form input[type="email"]').val();
                org = $('#contact-form input[placeholder="Company Name"]').val();
                content = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nORG:${org}\nEND:VCARD`;
                break;
            case 'wifi':
                ssid = $('#wifi-form input[placeholder="WiFi Network"]').val();
                password = $('#wifi-form input[type="password"]').val();
                security = $('#wifi-form select').val();
                content = `WIFI:S:${ssid};T:${security};P:${password};;`;
                break;
        }
        return content;
    }

    let currentStyle = {
        fgColor: '#000000',
        bgColor: '#FFFFFF',
        pattern: 'square',
        logo: null,
        logoSize: 20
    };

    function updatePreview() {
        const content = getFormContent();
        if (!content) {
            clearPreview();
            return;
        }

        const size = parseInt($('#size-slider').val());
        const $preview = $('#qr-preview');
        $preview.empty();

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        $preview.append(canvas);

        const qr = window.qrcode(0, 'H');
        qr.addData(content);
        qr.make();

        const context = canvas.getContext('2d');
        const moduleCount = qr.getModuleCount();
        const cellSize = size / moduleCount;

        // 创建一个二维数组来存储QR码的模块数据
        const modules = [];
        for (let row = 0; row < moduleCount; row++) {
            modules[row] = [];
            for (let col = 0; col < moduleCount; col++) {
                modules[row][col] = qr.isDark(row, col);
            }
        }

        // 如果没有选择特殊图案，使用普通的颜色填充
        if (!currentStyle.pattern || currentStyle.pattern === 'square') {
            // 填充背景
            context.fillStyle = currentStyle.bgColor;
            context.fillRect(0, 0, size, size);

            // 绘制QR码模块
            context.fillStyle = currentStyle.fgColor;
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (modules[row][col]) {
                        context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    }
                }
            }
        } else {
            // 使用特殊图案时，使用固定的黑白色以确保可读性
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, size, size);

            context.fillStyle = '#000000';
            switch (currentStyle.pattern) {
                case 'dots':
                    for (let row = 0; row < moduleCount; row++) {
                        for (let col = 0; col < moduleCount; col++) {
                            if (modules[row][col]) {
                                context.beginPath();
                                context.arc(
                                    col * cellSize + cellSize / 2,
                                    row * cellSize + cellSize / 2,
                                    cellSize / 3,
                                    0,
                                    Math.PI * 2
                                );
                                context.fill();
                            }
                        }
                    }
                    break;
                case 'rounded':
                    for (let row = 0; row < moduleCount; row++) {
                        for (let col = 0; col < moduleCount; col++) {
                            if (modules[row][col]) {
                                context.beginPath();
                                context.roundRect(
                                    col * cellSize,
                                    row * cellSize,
                                    cellSize - 1,
                                    cellSize - 1,
                                    cellSize / 4
                                );
                                context.fill();
                            }
                        }
                    }
                    break;
                case 'vertical':
                    for (let row = 0; row < moduleCount; row++) {
                        for (let col = 0; col < moduleCount; col++) {
                            if (modules[row][col]) {
                                context.fillRect(
                                    col * cellSize,
                                    row * cellSize,
                                    cellSize - 2,
                                    cellSize
                                );
                            }
                        }
                    }
                    break;
                case 'horizontal':
                    for (let row = 0; row < moduleCount; row++) {
                        for (let col = 0; col < moduleCount; col++) {
                            if (modules[row][col]) {
                                context.fillRect(
                                    col * cellSize,
                                    row * cellSize,
                                    cellSize,
                                    cellSize - 2
                                );
                            }
                        }
                    }
                    break;
            }
        }

        // 添加Logo
        if (currentStyle.logo) {
            const logoImg = new Image();
            logoImg.onload = function() {
                const logoSize = (currentStyle.logoSize / 100) * size;
                const x = (size - logoSize) / 2;
                const y = (size - logoSize) / 2;
                context.drawImage(logoImg, x, y, logoSize, logoSize);
            };
            logoImg.src = currentStyle.logo;
        }
    }

    function applyDotsPattern(context, data, size) {
        const pixelSize = size / 25;
        context.fillStyle = currentStyle.bgColor;
        context.fillRect(0, 0, size, size);
        context.fillStyle = currentStyle.fgColor;

        for (let y = 0; y < size; y += pixelSize) {
            for (let x = 0; x < size; x += pixelSize) {
                const i = (y * size + x) * 4;
                if (data[i] === 0) {
                    context.beginPath();
                    context.arc(x + pixelSize/2, y + pixelSize/2, pixelSize/3, 0, Math.PI * 2);
                    context.fill();
                }
            }
        }
    }

    function applyRoundedPattern(context, data, size) {
        const pixelSize = size / 25;
        context.fillStyle = currentStyle.bgColor;
        context.fillRect(0, 0, size, size);
        context.fillStyle = currentStyle.fgColor;

        for (let y = 0; y < size; y += pixelSize) {
            for (let x = 0; x < size; x += pixelSize) {
                const i = (y * size + x) * 4;
                if (data[i] === 0) {
                    context.beginPath();
                    context.roundRect(x, y, pixelSize - 1, pixelSize - 1, pixelSize/4);
                    context.fill();
                }
            }
        }
    }

    function applyVerticalPattern(context, data, size) {
        const pixelSize = size / 25;
        context.fillStyle = currentStyle.bgColor;
        context.fillRect(0, 0, size, size);
        context.fillStyle = currentStyle.fgColor;

        for (let y = 0; y < size; y += pixelSize) {
            for (let x = 0; x < size; x += pixelSize) {
                const i = (y * size + x) * 4;
                if (data[i] === 0) {
                    context.fillRect(x, y, pixelSize - 2, pixelSize);
                }
            }
        }
    }

    function applyHorizontalPattern(context, data, size) {
        const pixelSize = size / 25;
        context.fillStyle = currentStyle.bgColor;
        context.fillRect(0, 0, size, size);
        context.fillStyle = currentStyle.fgColor;

        for (let y = 0; y < size; y += pixelSize) {
            for (let x = 0; x < size; x += pixelSize) {
                const i = (y * size + x) * 4;
                if (data[i] === 0) {
                    context.fillRect(x, y, pixelSize, pixelSize - 2);
                }
            }
        }
    }

    function clearPreview() {
        $('#qr-preview').html('<p class="text-gray-500 text-center">QR code preview will appear here</p>');
    }

    // Style customization
    $('#fg-color, #bg-color').on('input', function() {
        const id = $(this).attr('id');
        if (id === 'fg-color') {
            currentStyle.fgColor = $(this).val();
        } else if (id === 'bg-color') {
            currentStyle.bgColor = $(this).val();
        }
        updatePreview();
    });

    $('.pattern-btn').click(function() {
        $('.pattern-btn').removeClass('border-purple-500').addClass('border-transparent');
        $(this).removeClass('border-transparent').addClass('border-purple-500');
        currentStyle.pattern = $(this).data('pattern');
        previewDebounce();
    });

    $('#logo-input').change(function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentStyle.logo = event.target.result;
                $('#logo-preview').html(`<img src="${event.target.result}" class="w-full h-full object-contain">`);
                previewDebounce();
                $('#logo-input').val('');
            };
            reader.readAsDataURL(file);
        }
    });

    $('#logo-size').on('input', function() {
        currentStyle.logoSize = $(this).val();
        previewDebounce();
    });

    // Save button
    $('#save-btn').click(function() {
        const content = getFormContent();
        if (!content) {
            alert('Please enter content for the QR code');
            return;
        }

        try {
            // Get existing QR codes from localStorage
            const existingCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');

            // Add new QR code
            const newCode = {
                id: Date.now(),
                content: content,
                type: 'generated',
                created_at: new Date().toISOString(),
                is_favorite: false
            };

            // Add to beginning of array
            existingCodes.unshift(newCode);

            // Save back to localStorage
            localStorage.setItem('qrCodes', JSON.stringify(existingCodes));

            alert('QR code saved successfully');
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            alert('Failed to save QR code');
        }
    });

    // Download button
    $('#download-btn').click(function() {
        const canvas = $('#qr-preview canvas')[0];
        if (!canvas) {
            alert('Please generate a QR code first');
            return;
        }

        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `qrcode_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});
