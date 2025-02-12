$(document).ready(function() {
    let currentStyle = {
        fgColor: '#000000',
        bgColor: '#FFFFFF',
        pattern: 'square',
        logo: null,
        logoSize: 20
    };

    // Preview update function
    const updatePreview = _.debounce(function() {
        // In a real implementation, this would generate a QR code with the current style
        // For now, we'll just show a placeholder
        $('#qr-preview').html(`
            <div class="w-full h-full" style="background-color: ${currentStyle.bgColor}">
                <div class="w-full h-full flex items-center justify-center" style="color: ${currentStyle.fgColor}">
                    <svg class="w-3/4 h-3/4" viewBox="0 0 100 100">
                        <rect x="10" y="10" width="80" height="80" fill="currentColor"/>
                    </svg>
                </div>
            </div>
        `);
    }, 200);

    // Color pickers
    $('#fg-color, #bg-color').on('input', function() {
        currentStyle.fgColor = $('#fg-color').val();
        currentStyle.bgColor = $('#bg-color').val();
        updatePreview();
    });

    // Pattern selection
    $('.pattern-btn').click(function() {
        $('.pattern-btn').removeClass('border-purple-500').addClass('border-transparent');
        $(this).removeClass('border-transparent').addClass('border-purple-500');
        currentStyle.pattern = $(this).data('pattern');
        updatePreview();
    });

    // Logo upload
    $('#logo-input').change(function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentStyle.logo = event.target.result;
                $('#logo-preview').html(`<img src="${event.target.result}" class="w-full h-full object-contain">`);
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });

    // Logo size
    $('#logo-size').on('input', function() {
        currentStyle.logoSize = $(this).val();
        updatePreview();
    });

    // Save template
    $('#save-template').click(function() {
        $.ajax({
            url: '/style/save',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ style_config: currentStyle }),
            success: function() {
                alert('Template saved successfully');
                location.reload();
            },
            error: function() {
                alert('Failed to save template');
            }
        });
    });

    // Load template
    $('.template-btn').click(function() {
        const templateId = $(this).data('template');
        $.ajax({
            url: `/style/templates/${templateId}`,
            method: 'GET',
            success: function(template) {
                currentStyle = template.style_config;
                $('#fg-color').val(currentStyle.fgColor);
                $('#bg-color').val(currentStyle.bgColor);
                $('#logo-size').val(currentStyle.logoSize);
                if (currentStyle.logo) {
                    $('#logo-preview').html(`<img src="${currentStyle.logo}" class="w-full h-full object-contain">`);
                }
                updatePreview();
            },
            error: function(xhr) {
                if (xhr.status === 404) {
                    alert('Template not found');
                } else {
                    alert('Failed to load template');
                }
            }
        });
    });

    // Apply style
    $('#apply-style').click(function() {
        // This would be implemented based on how the style should be applied
        // to the actual QR code generation
        alert('Style applied successfully');
    });

    // Initialize preview
    updatePreview();
});
