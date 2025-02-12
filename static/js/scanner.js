/* global jsQR, Quagga */
$(document).ready(function() {
    let videoStream = null;
    let videoElement = document.getElementById('camera-preview');
    let canvasElement = document.createElement('canvas');
    let canvas = canvasElement.getContext('2d');
    let scanning = false;
    let quaggaInitialized = false;

    // 延迟初始化 Quagga，确保库已加载
    function initQuagga() {
        if (typeof Quagga === 'undefined') {
            console.error('Quagga library not loaded');
            return false;
        }

        try {
            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: videoElement,
                    constraints: {
                        facingMode: "environment"
                    },
                },
                decoder: {
                    readers: [
                        "code_128_reader",
                        "ean_reader",
                        "ean_8_reader",
                        "code_39_reader",
                        "upc_reader"
                    ]
                }
            }, function(err) {
                if (err) {
                    console.error("Quagga initialization failed:", err);
                    return false;
                }
                quaggaInitialized = true;
                return true;
            });
        } catch (e) {
            console.error('Error initializing Quagga:', e);
            return false;
        }
    }

    // Tab switching
    $('.tab-btn').click(function() {
        const tab = $(this).data('tab');
        // Update button styles
        $('.tab-btn').removeClass('border-blue-500 text-blue-500').addClass('border-transparent text-gray-500');
        $(this).addClass('border-blue-500 text-blue-500').removeClass('border-transparent text-gray-500');
        // Show/hide content
        $('.tab-content').addClass('hidden');
        $(`#${tab}-tab`).removeClass('hidden');
        // Stop camera if switching away from camera tab
        if (tab !== 'camera' && videoStream) {
            stopCamera();
        }
    });

    // Camera handling
    $('#start-camera').click(function() {
        if (videoStream) {
            stopCamera();
            $(this).text('Start Camera');
        } else {
            startCamera();
            $(this).text('Stop Camera');
        }
    });

    async function startCamera() {
        try {
            const constraints = {
                video: { facingMode: 'environment' }
            };
            videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = videoStream;
            videoElement.play();
            scanning = true;
            $('#switch-camera').prop('disabled', false);
            scan();
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Error accessing camera. Please ensure camera permissions are granted.');
        }
    }

    function stopCamera() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
            scanning = false;
            $('#switch-camera').prop('disabled', true);
        }
    }

    // QR Code scanning
function scan() {
        if (!scanning) return;

        if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            canvasElement.height = videoElement.videoHeight;
            canvasElement.width = videoElement.videoWidth;
            canvas.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
            const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);

            // Try QR code first
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
            if (qrCode) {
                scanning = false;
                handleResult(qrCode.data);
                return;
            }

            // If no QR code found, try barcode
            if (typeof Quagga !== 'undefined') {
                try {
                    if (!quaggaInitialized && !initQuagga()) {
                        console.error("Failed to initialize Quagga");
                        return;
                    }

                    Quagga.decodeSingle({
                        decoder: {
                            readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "upc_reader"]
                        },
                        locate: true,
                        src: canvasElement.toDataURL()
                    }, function(result) {
                        if (result && result.codeResult) {
                            scanning = false;
                            handleResult(result.codeResult.code);
                        }
                    });
                } catch (e) {
                    console.error("Barcode scanning error:", e);
                }
            }
        }

        if (scanning) {
            requestAnimationFrame(scan);
        }
    }

    // File upload handling
    $('#file-input').change(function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                canvasElement.height = img.height;
                canvasElement.width = img.width;
                canvas.drawImage(img, 0, 0, img.width, img.height);
                const imageData = canvas.getImageData(0, 0, img.width, img.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    handleResult(code.data);
                } else {
                    alert('No QR code found in image');
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Result handling
    function handleResult(result) {
        $('#result-text').text(result);
        $('#result-container').removeClass('hidden');
        if (videoStream) {
            stopCamera();
            $('#start-camera').text('Start Camera');
        }
    }

    // Copy result
    $('#copy-result').click(function() {
        const result = $('#result-text').text();
        navigator.clipboard.writeText(result).then(function() {
            alert('Result copied to clipboard');
        }).catch(function() {
            alert('Failed to copy result');
        });
    });

    // Save result
    $('#save-result').click(function() {
        const content = $('#result-text').text();
        try {
            // Get existing QR codes from localStorage
            const existingCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');

            // Add new QR code
            const newCode = {
                id: Date.now(),
                content: content,
                type: 'scanned',
                created_at: new Date().toISOString(),
                is_favorite: false
            };

            // Add to beginning of array
            existingCodes.unshift(newCode);

            // Save back to localStorage
            localStorage.setItem('qrCodes', JSON.stringify(existingCodes));

            alert('Result saved successfully');
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            alert('Failed to save result');
        }
    });

    // Drag and drop handling
    const dropZone = document.querySelector('.border-dashed');
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-blue-500');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-blue-500');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-blue-500');
        const file = e.dataTransfer.files[0];
        if (file) {
            const input = document.getElementById('file-input');
            input.files = e.dataTransfer.files;
            $(input).change();
        }
    });
});
